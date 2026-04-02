import { login_modal } from "./modal.js";

export function dateFormatter(dateText, language) {
    let dateText_array;
    if (language == "en") {
        dateText_array = dateText.split("/");
        dateText_array.reverse();

    } else {
        dateText_array = dateText.split(".");
        dateText_array.pop();
    }
    return dateText_array.join("-");
}

export function dateDeFormatter(dateText, language) {
    let dateText_array = dateText.split("-");
    let dateText_string;
    if (language == "en") {
        dateText_array.reverse();
        dateText_string = dateText_array.join("/");
    } else {
        dateText_string = dateText_array.join(".") + ".";
    }
    return dateText_string;
}

// Eseménykezelő a beviteli mezőhöz, valamint a popoverhez
export function popoverManualTrigger($input_field, popover_obj) {
    let popover_div;
    $input_field.on("click.popover", function () {

        if (popover_obj.tip == null) {

            popover_obj.show();

            popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
            popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
            popover_div.addEventListener("blur", (event) => {

                if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                    popover_obj.hide();
                } else {
                    if (event.relatedTarget.id != $input_field.prop("id")) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                        popover_obj.hide();
                    }
                }
            });
        }
    });

    $input_field.on("focus.popover", function () {

        if (popover_obj.tip == null) {

            popover_obj.show();

            popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
            popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
            popover_div.addEventListener("blur", (event) => {

                if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                    popover_obj.hide();
                } else {
                    if (event.relatedTarget.id != $input_field.prop("id")) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                        popover_obj.hide();
                    }
                }
            });
        }
    });

    $input_field.on("blur.popover", function (event) {


        if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
            popover_obj.hide();
        } else {
            if (event.relatedTarget.id != popover_div.id) { // Ha nem a popover_divbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                popover_obj.hide();
            }
        }
    });
}

export function errorPageGenerator($frame, message) {

    let $plane_div = $("<div>", {
        "class": "col-md-12 col-lg-12",
        "html": "<img class=\"img-fluid\" src=../css/images/error_page_illustration.png>"
    });
    let $error_div = $("<div>", {
        "class": "alert alert-danger col-md-12 col-lg-12",
        "html": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg><span class=\"ps-2\">${message}</span>`,
        "role": "alert"
    });

    $frame.append($error_div);
    $frame.append($plane_div);


}

export function infoPageGenerator($frame, message) {
    let $plane_div = $("<div>", {
        "class": "col-md-12 col-lg-12",
        "html": "<img class=\"img-fluid\" src=../css/images/error_page_illustration.png>"
    });
    let $info_div = $("<div>", {
        "class": "alert alert-primary col-md-12 col-lg-12",
        "html": `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-info-circle-fill\" viewBox=\"0 0 16 16\"> <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2\"/></svg><span class=\"ps-2\">${message}</span>`,
        "role": "alert"
    });

    $frame.append($info_div);
    $frame.append($plane_div);
}

export async function showLogin(language) {
    await login_modal(language);
    $("#monadModal").modal("show");
}