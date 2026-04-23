import { getFlights, getIndex, getLoyaltyProgram, getModal, getProfile } from "./locale.js";
import { dateDeFormatter, dateFormatter, generateToast, initCheapestFlights, initFlights, initHusegprogram, initProfile, nameDeFormatter } from "./toolbox.js";

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function modalInit(current_language, end_point) {


    let getmodal = await getModal(current_language);
    let getindex = await getIndex(current_language);
    let getflights = await getFlights(current_language);
    let getloyaltyprogram = await getLoyaltyProgram(current_language);
    let getprofile = await getProfile(current_language);
    await checkLoginStatus();
    $("#login_button").on("click", async function () {
        await login_modal(current_language);
    });
    $(document).on("click", ".submit-login", async function () {
        //event.preventDefault();


        const email = $("#usr_email").val().trim();
        const password = $("#usr_passw").val().trim();

        if (!email || !password) {
            generateToast(getmodal.error.missing_email_and_password_fields, "danger");
        }
        else {
            if (!isValidEmail(email)) {
                generateToast(getmodal.error.invalid_email, "danger");
            }
            else {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': current_language
                    },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();
                switch (response.status) {
                    case 201:

                        if (data.admin) {
                            $("#admin_button").show();
                        } else {
                            $("#profile_button").show();
                            let response = await fetch("/api/unreadmessages", { method: "GET" });

                            switch (response.status) {
                                case 200:
                                    let messages = (await response.json()).messages;
                                    if (messages.length > 0) {
                                        await initFlightCancelledModal(current_language, { "text": ((current_language == "hu") ? messages[0].MessageHungarian : messages[0].MessageEnglish), "id": messages[0].MessageID }, messages);
                                    }
                                    break;

                                default:
                                    generateToast((await response.json()).error, "danger")
                                    break;
                            }

                        }
                        $("#login_button").hide();
                        $("#logout_button").show();

                        const modal = bootstrap.Modal.getInstance(document.getElementById('monadModal'));
                        if (modal) {
                            modal.hide();
                        }

                        switch (end_point) {
                            case "index":
                                await initCheapestFlights(current_language, getindex);
                                break;
                            case "flights":
                                await initFlights(current_language, getflights);
                                break;
                            case "husegprogram":
                                await initHusegprogram(current_language, getloyaltyprogram);
                                break;
                            case "profil":
                                await initProfile(current_language, getprofile);
                                break;
                            default:
                                break;
                        }

                        generateToast(getmodal.success.login_successful, "success");
                        break;

                    default:
                        generateToast(getmodal.error.login_unsuccessful, "danger");
                        console.error(data.error);
                        break;
                }
            }
        }
    }
    );
    $(document).on("click", ".submit-register", async function (event) {
        event.preventDefault();

        let userName;
        if (current_language == "hu") {
            userName = $("#last_name").val().trim() + "&" + $("#first_name").val().trim();
        } else {
            userName = $("#first_name").val().trim() + "&" + $("#last_name").val().trim();
        }


        const email = $("#new_usr_email").val().trim();
        const password = $("#new_usr_passw").val().trim();

        // Születési dátum konvertálása mm/dd/yyyy formátumból YYYY-MM-DD formátumba
        const birthDateInput = $("#birth_date").val().trim();
        let birthDate = null;

        if (birthDateInput) {
            birthDate = dateFormatter(birthDateInput, current_language);
        }

        if (!userName.trim() || !email || !password || !birthDate) {
            generateToast(getmodal.error.missing_fields, "danger");
        } else if (password.length < 6) {
            generateToast(getmodal.error.password_char_limit, "danger");
        } else if (!isValidEmail(email)) {
            generateToast(getmodal.error.invalid_email, "danger");
        } else {
            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept-Language': current_language
                    },
                    body: JSON.stringify({
                        nev: userName.trim(),
                        email,
                        jelszo: password,
                        szuldatum: birthDate || null
                    })
                });
                const data = await response.json();

                if (response.ok) {
                    const childModal = bootstrap.Modal.getInstance(document.getElementById('childModal'));
                    const parentModal = bootstrap.Modal.getInstance(document.getElementById('monadModal'));

                    if (childModal) {
                        childModal.hide();
                    }
                    if (parentModal) {
                        parentModal.hide();
                    }

                    generateToast(getmodal.success.registration_successful, "success");

                } else {
                    console.error(data.error);
                    generateToast(getmodal.error.registration_unsuccessful, "danger");
                }
            } catch (error) {
                console.error('ERROR: ', error);
                generateToast(getmodal.error.server_error_during_registration, "danger");
            }
        }
    });
    $("#logout_button").on("click", async function () {
        //event.preventDefault();
        try {
            let response = await fetch('/api/logout', {
                method: 'POST'
            });

            let data = await response.json();

            if (response.ok) {
                // Navbar frissítése

                $("#login_button").show();
                $("#profile_button").hide();
                $("#logout_button").hide();
                $("#admin_button").hide();

                switch (end_point) {
                    case "index":
                        await initCheapestFlights(current_language, getindex);
                        break;
                    case "flights":
                        await initFlights(current_language, getflights);
                        break;
                    case "husegprogram":
                        await initHusegprogram(current_language, getloyaltyprogram)
                        break;
                    case "profil":
                        await initProfile(current_language, getprofile);
                        break;
                    default:
                        break;
                }

                generateToast(getmodal.success.logout_successful, "success");

            } else {
                console.error(data.error);
                generateToast(getmodal.error.logout_unsuccessful + " " + data.error, "danger");
            }

        } catch (error) {
            console.error(error);
            generateToast(getmodal.error.server_error_during_logout, "danger");
        }


    });
};

async function checkLoginStatus() {
    try {
        const response = await fetch('/api/LoginCheck', {
            method: 'GET',
        });

        const data = await response.json();
        if (!data.allapot) {
            $("#login_button").show();
            $("#profile_button").hide();
            $("#logout_button").hide();
            $("#admin_button").hide();
        }
        else {
            if (data.admin) {
                $("#admin_button").show();
            }
            else {
                $("#profile_button").show();
            }
            $("#login_button").hide();
            $("#logout_button").show();
        }
    }
    catch (error) {
    }
}


function init_child_modal(id, content_id, frame_id) {

    let $modal_frame = $(`#${frame_id}`);

    let $childModal = $("<div>", {
        "id": id,
        "class": "modal fade",
        "tabindex": -1,
        "aria-hidden": true,
        "aria-labelledby": "childModalLabel"
    });

    let $childModal_dialog = $("<div>", {
        "class": "modal-dialog modal-dialog-centered"
    });

    let $childModal_content = $("<form>", {
        "id": content_id,
        "class": "modal-content"
    });

    $childModal_dialog.append($childModal_content);
    $childModal.append($childModal_dialog);
    $modal_frame.append($childModal);

}


function init_modal_content_template(id, type) {
    let $modal_content = $("#" + id);
    $modal_content.text("");

    let $modal_header = $("<div>", {
        "id": type + "Modal_header",
        "class": "modal-header"
    });

    let $modal_body = $("<div>", {
        "id": type + "Modal_body",
        "class": "modal-body d-flex flex-column align-items-center"
    });

    let $modal_footer = $("<div>", {
        "id": type + "Modal_footer",
        "class": "modal-footer d-flex flex-column align-items-center"
    });


    $modal_content.append($modal_header);
    $modal_content.append($modal_body);
    $modal_content.append($modal_footer);

}


export async function login_modal(current_language) {

    let getmodal = await getModal(current_language);

    if ($("#monadModal").next().length != 0) {
        $("#modal_frame").children().last().remove();
    }
    init_modal_content_template("monadModal_content", "monad");

    let $modal_header = $("#monadModal_header");
    let $modal_body = $("#monadModal_body");
    let $modal_footer = $("#monadModal_footer");

    let $title = $("<h1>", {
        "id": "modalMonadLabel",
        "class": "text-danger modal-title fs-2",
        "text": `${getmodal.title.login}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $e_mail = $("<input/>", {
        "id": "usr_email",
        "class": "form-control modal_input w-75 mb-4 mt-2",
        "type": "email",
        "placeholder": `${getmodal.field.email}`
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75 mb-4"
    });

    let $passw = $("<input>", {
        "id": "usr_passw",
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": `${getmodal.field.password}`
    });

    let $see_passw_button = $("<button>", {
        "type": "button",
        "id": "passw_button",
        "class": "btn btn-outline-secondary",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>",
        on: {
            "click": seePassw
        }
    });

    $input_group_for_passw.append($passw);
    $input_group_for_passw.append($see_passw_button);

    let $login_button = $("<button>", {
        "class": "btn btn-danger w-75 mb-2 submit-login",
        "type": "button",
        "text": `${getmodal.title.login}`
    });

    let $p = $("<p>", {
        "class": "mt-2",
        "text": `${getmodal.caption.no_account}`
    });

    let $regis_button = $("<button>", {
        "class": "btn btn-outline-danger w-75 mb-2",
        "type": "button",
        "text": `${getmodal.title.registration}`,
        "data-bs-target": "#childModal",
        "data-bs-toggle": "modal"
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($e_mail);
    $modal_body.append($input_group_for_passw);
    $modal_body.append($login_button);

    $modal_footer.append($p);
    $modal_footer.append($regis_button);

    init_child_modal("childModal", "childModal_content", "modal_frame");
    init_modal_content_template("childModal_content", "child");
    regis_modal(getmodal);

}

function regis_modal(i18n_values) {

    let $modal_header = $("#childModal_header");
    let $modal_body = $("#childModal_body");
    let $modal_footer = $("#childModal_footer");


    let $title = $("<h1>", {
        "id": "modalChildLabel",
        "class": "text-danger modal-title fs-2",
        "text": `${i18n_values.title.registration}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $input_group_for_name = $("<div>", {
        "class": "input-group w-75 mb-4 mt-2"
    });

    let $first_name = $("<input/>", {
        "id": "first_name",
        "class": "modal_input form-control",
        "type": "text",
        "placeholder": `${i18n_values.field.first_name}`
    });

    let $last_name = $("<input/>", {
        "id": "last_name",
        "class": "modal_input form-control",
        "type": "text",
        "placeholder": `${i18n_values.field.last_name}`
    });

    $input_group_for_name.append($last_name);
    $input_group_for_name.append($first_name);

    let $birth_date = $("<input/>", {
        "id": "birth_date",
        "class": "form-control modal_input mb-4 w-75",
        "type": "text",
        "placeholder": `${i18n_values.field.birth_date}`
    });
    $birth_date.datepicker({ changeYear: true, changeMonth: true, yearRange: "-120:-18", minDate: "-120y", maxDate: "-18y" });

    let $e_mail = $("<input/>", {
        "id": "new_usr_email",
        "class": "form-control modal_input w-75 mb-4",
        "type": "email",
        "placeholder": `${i18n_values.field.email}`
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75 mb-4"
    });

    let $passw = $("<input/>", {
        "id": "new_usr_passw",
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": `${i18n_values.field.password}`
    });

    let $see_passw_button = $("<button>", {
        "type": "button",
        "id": "passw_button",
        "class": "btn btn-outline-secondary",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>",
        on: {
            "click": seePassw
        }
    });

    $input_group_for_passw.append($passw);
    $input_group_for_passw.append($see_passw_button);

    let $regis_button = $("<button>", {
        "class": "btn btn-danger w-75 mb-2 mt-2 submit-register",
        "type": "submit",
        "text": `${i18n_values.title.registration}`
    });

    $modal_header.append($title);
    $modal_header.append($close_button);


    $modal_body.append($input_group_for_name);
    $modal_body.append($birth_date);
    $modal_body.append($("#ui-datepicker-div"));
    $modal_body.append($e_mail);
    $modal_body.append($input_group_for_passw);

    $modal_footer.append($regis_button);

}

function seePassw() {

    let $passw_input = $(this).prev();
    if ($passw_input.attr("type") === "password") {
        $passw_input.attr("type", "text");
        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-slash-fill\" viewBox=\"0 0 16 16\"><path d=\"m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7 7 0 0 0 2.79-.588M5.21 3.088A7 7 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474z\"/><path d=\"M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12z\"/></svg>");

    } else {
        $passw_input.attr("type", "password");
        $(this).html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>");

    }
}

export async function initReservationCancellationModal(current_language, i18n_values) {

    let getmodal = await getModal(current_language);

    initPasswordVerificationModal("2", getmodal);
    $("#verification_button2").on("click", async function (event) {
        event.preventDefault();
        let password = $("#usr_passw2").val().trim();
        let response = await fetch("/api/verifypassword", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": current_language }, body: JSON.stringify({ password }) });
        switch (response.status) {
            case 200:
                generateToast((await response.json()).message, "success");

                let $to_be_cancelled_reservations_frame = $("#to_be_cancelled_reservations_frame");
                $to_be_cancelled_reservations_frame.html("");

                let $active_reservations_clone = $("#active_reservations").clone();
                $active_reservations_clone.removeClass("table-hover");
                let $inputs = $active_reservations_clone.find("tbody tr td input.cancel_active_reservation");

                for (let i = 0; i < $inputs.length; i++) {
                    if (!$inputs.eq(i).prop("checked")) {
                        $inputs.eq(i).parent().parent().remove()
                    }
                }

                $active_reservations_clone.find("#i_cancel_column_th").remove();
                $active_reservations_clone.find(".i_cancel_column_td").remove();

                let $last_td_s = $active_reservations_clone.find("tbody tr").last().find("td");
                $last_td_s.first().addClass("rounded-bottom border-bottom-0");
                $last_td_s.last().addClass("rounded-bottom border-bottom-0");

                $to_be_cancelled_reservations_frame.append($active_reservations_clone);

                bootstrap.Modal.getOrCreateInstance($("#monadModal2")).hide();
                bootstrap.Modal.getOrCreateInstance($("#childModal2")).show();
                break;

            default:
                generateToast((await response.json()).error, "danger");
                break;
        }

    });

    init_child_modal("childModal2", "childModal2_content", "modal_frame2");
    init_modal_content_template("childModal2_content", "child2");

    let $modal_header = $("#child2Modal_header");
    let $modal_body = $("#child2Modal_body");
    let $modal_footer = $("#child2Modal_footer");


    let $title = $("<h1>", {
        "id": "modalChildLabe2",
        "class": "text-danger modal-title fs-2",
        "text": `${getmodal.title.cancel_bookings}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $p = $("<p>", {
        "class": "mt-2",
        "text": `${getmodal.caption.cancel_selected_reservations}`
    });

    let $frame_for_tabel = $("<div>", {
        "id": "to_be_cancelled_reservations_frame",
        "class": "input-group w-75 mb-4 border border-danger rounded"
    });

    let $cancel_reservations_button = $("<button>", {
        "class": "btn btn-danger w-75 mb-2 mt-2",
        "type": "submit",
        "text": `${getmodal.title.cancel_bookings}`,
        on: {
            "click": async function (event) {
                event.preventDefault();

                let reservationSelector = () => {
                    let array = [];
                    let rows = $(".cancel_active_reservation");
                    for (let i = 0; i < rows.length; i++) {
                        let $row = $(rows[i]);
                        if ($row.prop("checked")) {
                            array.push($row.parent().parent().data("reservation_id"));
                        }

                    }
                    return array;
                }
                let reservations = reservationSelector();

                let response = await fetch("/api/cancelreservations", { method: "PUT", headers: { "Content-Type": "application/json", "Accept-Language": current_language }, body: JSON.stringify({ reservations }) });

                switch (response.status) {
                    case 200:
                        const childModal = bootstrap.Modal.getInstance(document.getElementById('childModal2'));
                        const parentModal = bootstrap.Modal.getInstance(document.getElementById('monadModal2'));

                        if (childModal) {
                            childModal.hide();
                        }
                        if (parentModal) {
                            parentModal.hide();
                        }

                        generateToast((await response.json()).message, "success");
                        await initProfile(current_language, i18n_values);
                        break;

                    default:
                        generateToast((await response.json()).error, "danger");
                        break;
                }
            }
        }
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($p);
    $modal_body.append($frame_for_tabel);

    $modal_footer.append($cancel_reservations_button);

}

export async function initEditProfileModal(profile_data, current_language, i18n_values) {

    let getmodal = await getModal(current_language);

    initPasswordVerificationModal("3", getmodal);
    $("#verification_button3").on("click", async function (event) {
        event.preventDefault();
        let password = $("#usr_passw3").val().trim();
        let response = await fetch("/api/verifypassword", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": current_language }, body: JSON.stringify({ password }) });
        switch (response.status) {
            case 200:
                generateToast((await response.json()).message, "success");

                let name_obj = nameDeFormatter(profile_data.UserName, current_language);

                $("#edit_first_name").val(name_obj.last_name);
                $("#edit_last_name").val(name_obj.first_name);

                $("#edit_birth_date").val(dateDeFormatter(profile_data.UserBirthDate, current_language));
                $("#edit_usr_email").val(profile_data.UserEmail);
                $("#edit_usr_passw").val(password);

                bootstrap.Modal.getOrCreateInstance($("#monadModal3")).hide();
                bootstrap.Modal.getOrCreateInstance($("#childModal3")).show();
                break;

            default:
                generateToast((await response.json()).error, "danger");
                break;
        }

    });

    init_child_modal("childModal3", "childModal3_content", "modal_frame3");
    init_modal_content_template("childModal3_content", "child3");

    let $modal_header = $("#child3Modal_header");
    let $modal_body = $("#child3Modal_body");
    let $modal_footer = $("#child3Modal_footer");


    let $title = $("<h1>", {
        "id": "modalChildLabel",
        "class": "text-danger modal-title fs-2",
        "text": `${getmodal.title.edit_profile}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $input_group_for_name = $("<div>", {
        "class": "input-group w-75 mb-4 mt-2"
    });

    let $first_name = $("<input/>", {
        "id": "edit_first_name",
        "class": "modal_input form-control",
        "type": "text",
        "placeholder": `${getmodal.field.first_name}`
    });

    let $last_name = $("<input/>", {
        "id": "edit_last_name",
        "class": "modal_input form-control",
        "type": "text",
        "placeholder": `${getmodal.field.last_name}`
    });

    $input_group_for_name.append($last_name);
    $input_group_for_name.append($first_name);

    let $birth_date = $("<input/>", {
        "id": "edit_birth_date",
        "class": "form-control modal_input mb-4 w-75",
        "type": "text",
        "placeholder": `${getmodal.field.birth_date}`
    });
    $birth_date.datepicker({ changeYear: true, changeMonth: true, yearRange: "-120:-18", minDate: "-120y", maxDate: "-18y" });

    let $e_mail = $("<input/>", {
        "id": "edit_usr_email",
        "class": "form-control modal_input w-75 mb-4",
        "type": "email",
        "placeholder": `${getmodal.field.email}`,
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75 mb-4"
    });

    let $passw = $("<input/>", {
        "id": "edit_usr_passw",
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": `${getmodal.field.password}`
    });

    let $see_passw_button = $("<button>", {
        "type": "button",
        "id": "passw_button",
        "class": "btn btn-outline-secondary",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>",
        on: {
            "click": seePassw
        }
    });

    $input_group_for_passw.append($passw);
    $input_group_for_passw.append($see_passw_button);

    let $save_changes_button = $("<button>", {
        "id": "confirm_edit_button",
        "class": "btn btn-danger w-75 mb-2 mt-2",
        "type": "submit",
        "text": `${getmodal.button.save}`,
        on: {
            "click": async function (event) {
                event.preventDefault();

                const userName = $("#edit_first_name").val().trim() + "&" + $("#edit_last_name").val().trim();
                const email = $("#edit_usr_email").val().trim();
                const password = $("#edit_usr_passw").val().trim();

                // Születési dátum konvertálása mm/dd/yyyy formátumból YYYY-MM-DD formátumba
                const birthDateInput = $("#edit_birth_date").val().trim();

                let birthDate = null;

                if (birthDateInput) {

                    birthDate = dateFormatter(birthDateInput, current_language)
                }

                if (!userName.trim() || !email || !password) {
                    generateToast(getmodal.error.missing_fields, "danger");
                    return;
                }

                if (password.length < 6) {
                    generateToast(getmodal.error.password_char_limit, "danger");
                    return;
                }
                try {

                    const response = await fetch('/api/updateprofile', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Accept-Language': current_language
                        },
                        body: JSON.stringify({
                            nev: userName.trim(),
                            email: email,
                            jelszo: password,
                            szuldatum: birthDate || null
                        })
                    });
                    const data = await response.json();

                    if (response.ok) {

                        // Modal bezárása
                        const childModal = bootstrap.Modal.getInstance(document.getElementById('childModal3'));
                        const parentModal = bootstrap.Modal.getInstance(document.getElementById('monadModal3'));

                        if (childModal) {
                            childModal.hide();
                        }
                        if (parentModal) {
                            parentModal.hide();
                        }

                        generateToast(getmodal.success.profile_updated_successfully, "success");
                        await initProfile(current_language, i18n_values);

                    } else {

                        console.error(data.error);
                        generateToast(getmodal.error.profile_update_failed + "" + data.error, "danger");

                    }
                } catch (error) {
                    console.error('ERROR: ', error);
                    generateToast(getmodal.error.server_error_during_profile_update, "danger");
                }
            }
        }
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($input_group_for_name);
    $modal_body.append($birth_date);
    $modal_body.append($("#ui-datepicker-div"));
    $modal_body.append($e_mail);
    $modal_body.append($input_group_for_passw);

    $modal_footer.append($save_changes_button);

}

export async function initDeleteProfileModal(current_language) {

    let getmodal = await getModal(current_language);

    initPasswordVerificationModal("4", getmodal);
    $("#verification_button4").on("click", async function (event) {
        event.preventDefault();
        let password = $("#usr_passw4").val().trim();
        let response = await fetch("/api/verifypassword", { method: "POST", headers: { "Content-Type": "application/json", "Accept-Language": current_language }, body: JSON.stringify({ password }) });
        switch (response.status) {
            case 200:
                generateToast((await response.json()).message, "success");

                bootstrap.Modal.getOrCreateInstance($("#monadModal4")).hide();
                bootstrap.Modal.getOrCreateInstance($("#childModal4")).show();
                break;

            default:
                generateToast((await response.json()).error, "danger");
                break;
        }

    });

    init_child_modal("childModal4", "childModal4_content", "modal_frame4");
    init_modal_content_template("childModal4_content", "child4");

    let $modal_header = $("#child4Modal_header");
    let $modal_body = $("#child4Modal_body");
    let $modal_footer = $("#child4Modal_footer");


    let $title = $("<h1>", {
        "id": "modalChildLabe4",
        "class": "text-danger modal-title fs-2",
        "text": `${getmodal.title.delete_profile}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $p = $("<p>", {
        "class": "mb-0",
        "text": `${getmodal.caption.delete_profile}`
    });

    let $buttons_frame = $("<div>", {
        "class": "w-50 row justify-content-around",
    });

    let $yes_button = $("<button>", {
        "class": "col-3 btn btn-danger",
        "text": getmodal.button.yes,
        on: {
            "click": async function () {
                let response = await fetch("/api/deleteprofile", { method: "PUT", headers: { "Content-Type": "application/json", "Accept-Language": current_language } });

                switch (response.status) {
                    case 200:
                        $(".profile_button").off();
                        bootstrap.Modal.getOrCreateInstance($("#childModal4")).hide();
                        generateToast((await response.json()).message, "success");
                        setTimeout(function () {
                            window.location.replace(`/${current_language}`);
                        }, 5000);
                        break;

                    default:
                        generateToast((await response.json()).error, "danger");
                        break;
                }
            }
        }
    });

    let $no_button = $("<button>", {
        "class": "col-3 btn btn-danger",
        "text": getmodal.button.no,
        on: {
            "click": function () {
                bootstrap.Modal.getOrCreateInstance($("#childModal4")).hide();
            }
        }
    });

    $buttons_frame.append($yes_button);
    $buttons_frame.append($no_button);

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($p);

    $modal_footer.append($buttons_frame);

}

function initPasswordVerificationModal(id_num, i18n_values) {
    if ($("#monadModal" + id_num).next().length != 0) {
        $("#modal_frame" + id_num).children().last().remove();
    }
    init_modal_content_template("monadModal" + id_num + "_content", "monad" + id_num);

    let $modal_header = $("#monad" + id_num + "Modal_header");
    let $modal_body = $("#monad" + id_num + "Modal_body");
    let $modal_footer = $("#monad" + id_num + "Modal_footer");

    let $title = $("<h1>", {
        "id": "modalMonadLabel" + id_num,
        "class": "text-danger modal-title fs-2",
        "text": `${i18n_values.title.verify_password}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75"
    });

    let $passw = $("<input>", {
        "id": "usr_passw" + id_num,
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": `${i18n_values.field.password}`
    });

    let $see_passw_button = $("<button>", {
        "type": "button",
        "id": "passw_button",
        "class": "btn btn-outline-secondary",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-eye-fill\" viewBox=\"0 0 16 16\"> <path d=\"M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0\"/><path d=\"M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8m8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7\"/></svg>",
        on: {
            "click": seePassw
        }
    });

    $input_group_for_passw.append($passw);
    $input_group_for_passw.append($see_passw_button);

    let $verification_button = $("<button>", {
        "id": "verification_button" + id_num,
        "class": "btn btn-danger w-75 mb-2",
        "type": "submit",
        "text": `${i18n_values.button.verification}`,
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($input_group_for_passw);

    $modal_footer.append($verification_button);
}

async function initFlightCancelledModal(current_language, message, upcoming_messages) {

    let modal_element = document.getElementById("omenModal");
    let modal = bootstrap.Modal.getOrCreateInstance(modal_element);

    let getmodal = await getModal(current_language);

    init_modal_content_template("omenModal_content", "omen");

    let $modal_header = $("#omenModal_header");
    let $modal_body = $("#omenModal_body");
    let $modal_footer = $("#omenModal_footer");

    let $title = $("<h1>", {
        "id": "omenMonadLabel",
        "class": "text-danger modal-title fs-2",
        "text": `${getmodal.title.flight_cancelled}`
    });

    let $close_button = $("<button>", {
        "class": "btn-close",
        "type": "button",
        "aria-label": "Close",
        "data-bs-dismiss": "modal"
    });

    let message_spliced = message.text.split("&")

    let $div = $("<div>", {
        "class": "mb-0",
        "html": `<p class="fs-4"><span>${message_spliced[0]} </span><span class="text-danger">${message_spliced[1]} </span><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-arrow-right" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8"/></svg><span class="text-danger"> ${message_spliced[2]} </span><span>( <span><svg fill="#dc3545" version=\"1.1" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 371.656 371.656\" xml:space=\"preserve\"><g><g><g><path d=\"M37.833,212.348c-0.01,0.006-0.021,0.01-0.032,0.017c-4.027,2.093-5.776,6.929-4.015,11.114     c1.766,4.199,6.465,6.33,10.787,4.892l121.85-40.541l-22.784,37.207c-1.655,2.703-1.305,6.178,0.856,8.497     c2.161,2.318,5.603,2.912,8.417,1.449l23.894-12.416c0.686-0.356,1.309-0.823,1.844-1.383l70.785-73.941l87.358-45.582     c33.085-17.835,29.252-31.545,27.29-35.321c-1.521-2.928-4.922-6.854-12.479-8.93c-7.665-2.106-18.021-1.938-31.653,0.514     c-4.551,0.818-7.063,0.749-9.723,0.676c-9.351-0.256-15.694,0.371-47.188,16.736L90.788,164.851l-66.8-34.668     c-2.519-1.307-5.516-1.306-8.035,0.004l-11.256,5.85c-2.317,1.204-3.972,3.383-4.51,5.938c-0.538,2.556,0.098,5.218,1.732,7.253     l46.364,57.749L37.833,212.348z"/><path d="M355.052,282.501H28.948c-9.17,0-16.604,7.436-16.604,16.604s7.434,16.604,16.604,16.604h326.104     c9.17,0,16.604-7.434,16.604-16.604C371.655,289.934,364.222,282.501,355.052,282.501z\"/></g></g></g></svg> </span>${message_spliced[3]} ) </span><span>${message_spliced[4]} </span></p><p class="fs-4">${message_spliced[5]}</p>`
    });

    let $ok_button = $("<button>", {
        "class": "btn btn-danger w-50 mb-2",
        "type": "button",
        "text": `${getmodal.button.ok}`,
        on: {
            "click": async function () {
                let response = await fetch("/api/messageread", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message_id: message.id }) });

                if (response.status == 200) {

                    modal.hide();
                    await waitForModalHide(modal_element);
                    if (upcoming_messages.length > 1) {
                        let upcoming_messages_ = upcoming_messages.slice(1)
                        await initFlightCancelledModal(current_language, { "text": ((current_language == "hu") ? upcoming_messages_[0].MessageHungarian : upcoming_messages_[0].MessageEnglish), "id": upcoming_messages_[0].MessageID }, upcoming_messages_);
                    }

                } else {
                    generateToast((await response.json()).error, "danger")
                }
            }
        }
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($div);

    $modal_footer.append($ok_button);

    modal.show();

}

function waitForModalHide(modalElement) {
    return new Promise((resolve) => {
        modalElement.addEventListener('hidden.bs.modal', function handler() {
            // Remove the listener so it doesn't fire multiple times later
            modalElement.removeEventListener('hidden.bs.modal', handler);
            resolve();
        }, { once: true });
    });
}