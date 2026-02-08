$(function () {
    checkLoginStatus();
    $("#login_button").on("click", login_modal);
    $(document).on("click", ".submit-login", handleLogin);
    $(document).on("click", ".submit-register", handleRegister);
    $("#logout_button").on("click", handleLogout);
});

async function checkLoginStatus() {
    try {
        const response = await fetch('api/LoginCheck', {
            method: 'GET',
        });

        const data = await response.json();
        if (!data.allapot) {
            $("#login_button").parent().show();
            $("#profile_button").parent().hide();
            $("#logout_button").parent().hide();
            $("#admin_button").parent().hide();
        }
        else {
            if (data.admin) {
                $("#admin_button").parent().show();
            }
            else{
                $("#profile_button").parent().show();
            }
            $("#login_button").parent().hide();
            $("#logout_button").parent().show();
        }
    }
    catch(error){
    }
}

async function handleLogout(event) {
    event.preventDefault();
    try {
        await fetch('/api/logout', {
            method: 'POST'
        });

    } catch (error) {
        console.error('Kijelentkezési hiba:', error);
        alert('Szerver hiba a kijelentkezés során');
    }

    // Navbar frissítése
    $("#login_button").parent().show();
    $("#profile_button").parent().hide();
    $("#logout_button").parent().hide();
    $("#admin_button").parent().hide();

    alert('Sikeres kijelentkezés!');
}

function init_child_modal() {

    let $modal_frame = $("#modal_frame");

    let $childModal = $("<div>", {
        "id": "childModal",
        "class": "modal fade",
        "tabindex": -1,
        "aria-hidden": true,
        "aria-labelledby": "childModalLabel"
    });

    let $childModal_dialog = $("<div>", {
        "class": "modal-dialog modal-dialog-centered"
    });

    let $childModal_content = $("<div>", {
        "id": "childModal_content",
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


function login_modal() {

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
        "text": "Bejelentkezés"
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
        "placeholder": "E-mail"
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75 mb-4"
    });

    let $passw = $("<input>", {
        "id": "usr_passw",
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": "Jelszó"
    });

    let $see_passw_button = $("<button>", {
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
        "text": "Bejelentkezés"
    });

    let $p = $("<p>", {
        "class": "mt-2",
        "text": "Nincs még fiókod? Hozz létre egyet!"
    });

    let $regis_button = $("<button>", {
        "class": "btn btn-outline-danger w-75 mb-2",
        "type": "button",
        "text": "Regisztráció",
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

    init_child_modal();
    init_modal_content_template("childModal_content", "child");
    regis_modal();

}

function regis_modal() {

    let $modal_header = $("#childModal_header");
    let $modal_body = $("#childModal_body");
    let $modal_footer = $("#childModal_footer");


    let $title = $("<h1>", {
        "id": "modalChildLabel",
        "class": "text-danger modal-title fs-2",
        "text": "Regisztráció"
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
        "placeholder": "Keresztnév"
    });

    let $last_name = $("<input/>", {
        "id": "last_name",
        "class": "modal_input form-control",
        "type": "text",
        "placeholder": "Vezetéknév"
    });

    $input_group_for_name.append($last_name);
    $input_group_for_name.append($first_name);

    let $birth_date = $("<input/>", {
        "id": "birth_date",
        "class": "form-control modal_input mb-4 w-75",
        "type": "text",
        "placeholder": "Születési dátum"
    });
    $birth_date.datepicker()

    let $e_mail = $("<input/>", {
        "id": "new_usr_email",
        "class": "form-control modal_input w-75 mb-4",
        "type": "email",
        "placeholder": "E-mail",
    });

    let $input_group_for_passw = $("<div>", {
        "class": "input-group w-75 mb-4"
    });

    let $passw = $("<input/>", {
        "id": "new_usr_passw",
        "class": "form-control modal_input",
        "type": "password",
        "placeholder": "Jelszó"
    });

    let $see_passw_button = $("<button>", {
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
        "type": "button",
        "text": "Regisztráció"
    });

    $modal_header.append($title);
    $modal_header.append($close_button);

    $modal_body.append($input_group_for_name);
    $modal_body.append($birth_date);
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

// LOGIN 
async function handleLogin(event) {
    event.preventDefault();

    const email = $("#usr_email").val().trim();
    const password = $("#usr_passw").val().trim();

    if (!email || !password) {
        alert("Kérlek, töltsd ki az email és jelszó mezőket!");
        return;
    }

    try {
        const response = await fetch('api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();
        if (!response.ok) {
            console.log(data.message, data.error)
        }

        if (response.ok) {
            alert('Sikeres bejelentkezés!');

            // Navbar frissítése - Bejelentkezés gomb elrejtése, Profilom gomb megjelenítése

            if (data.admin) {
                $("#admin_button").parent().show();
            }
            $("#login_button").parent().hide();
            $("#profile_button").parent().show();
            $("#logout_button").parent().show();


            // Modal bezárása
            const modal = bootstrap.Modal.getInstance(document.getElementById('monadModal'));
            if (modal) {
                modal.hide();
            }
        } else {
            alert('Hiba: ' + (data.message || 'Bejelentkezés sikertelen'));
        }
    } catch (error) {
        console.error('Szerver hiba bejelentkezéskor:', error);
    }
}

// REGISTRATION HANDLER
async function handleRegister(event) {
    event.preventDefault();

    const userName = $("#first_name").val().trim() + " " + $("#last_name").val().trim();
    const email = $("#new_usr_email").val().trim();
    const password = $("#new_usr_passw").val().trim();

    // Születési dátum konvertálása mm/dd/yyyy formátumból YYYY-MM-DD formátumba
    const birthDateInput = $("#birth_date").val().trim();
    let birthDate = null;

    if (birthDateInput) {
        const parts = birthDateInput.split('/');
        if (parts.length === 3) {
            const mm = parts[0];
            const dd = parts[1];
            const yyyy = parts[2];
            birthDate = `${yyyy}-${mm}-${dd}`;
        }
    }

    if (!userName.trim() || !email || !password) {
        alert("Kérlek, töltsd ki az összes kötelező mezőt!");
        return;
    }

    if (password.length < 6) {
        alert("A jelszó legalább 6 karakter hosszú kell legyen!");
        return;
    }
    try {
        const response = await fetch('/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nev: userName.trim(),
                email,
                jelszo: password,
                szuldatum: birthDate || null
            })
        });
        const data = await response.json();
        if (!response.ok) {
            console.log("Regisztráció hiba: " + data.message, data.error)
        }


        else {

            alert('Sikeres regisztráció! Bejelentkezve vagy.');

            // Modal bezárása
            const childModal = bootstrap.Modal.getInstance(document.getElementById('childModal'));
            const parentModal = bootstrap.Modal.getInstance(document.getElementById('monadModal'));

            if (childModal) {
                childModal.hide();
            }
            if (parentModal) {
                parentModal.hide();
            }

            // Oldal frissítése vagy átirányítás
            location.reload();
        }
    } catch (error) {
        console.error('Regisztráció hiba:', error);
        alert('Szerver hiba a regisztráció során');
    }
}