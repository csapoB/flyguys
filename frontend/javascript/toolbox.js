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