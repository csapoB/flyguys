// DOMContentLoaded
$(async function () {

    ///////// INIT /////////

    /* 
    Tömb elemei:
        0 - Beviteli mező (jquery_obj)
        1 - Popover objektum
    */
    // Repülőtér popoverek
    let origin = await popoverInit("origin_input", "origin_popover");
    popoverManualTrigger(origin[0].get(0) /*vissza alakítja hagyományos dOM elemmé*/, origin[1]);
    let destination = await popoverInit("destination_input", "destination_popover");
    popoverManualTrigger(destination[0].get(0), destination[1]);
    // Datepickerek
    let $departure = $("#departure_input");
    let available_departure_dates = (await (await fetch("/api/availabledeparturedatesfiltered", { method: "GET" })).json()).departuredates
    let $departure_datepicker = $departure.datepicker({
        minDate: 0,
        dateFormat: "yy-mm-dd",
        beforeShowDay: function (d) {
            let year = d.getFullYear(),
                month = ("0" + (d.getMonth() + 1)).slice(-2),
                day = ("0" + (d.getDate())).slice(-2);

            let formatted = year + '-' + month + '-' + day;

            return [(available_departure_dates.includes(formatted)), "", ""]

        },
        onSelect: async function (dateText, inst) {

            let $input_field = $(this);
            console.log($input_field)
            if ($input_field.prev().length != 0) {
                $input_field.prev().remove();
                console.log($input_field)
            }

            let $delete_button = $("<span>", {
                "class": "text-danger d-flex align-items-center pe-1",
                "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-x-circle\" viewBox=\"0 0 16 16\"><path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/><path d=\"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708\"/></svg>",
                on: {
                    "click": async function () {

                        let $this_button = $(this);
                        $this_button.remove();

                        $input_field.val("");
                        console.log($input_field)

                        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

                        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}`}`, { method: "GET" })).json())) });

                        destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator("destination_input", "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}`}`, { method: "GET" })).json())) });

                        returnEnabler(available_return_dates);

                    }
                }

            });
            $input_field.parent().prepend($delete_button);

            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateText}`}`, { method: "GET" })).json())) });

            destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator("destination_input", "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&departureDate=${dateText}`}`, { method: "GET" })).json())) });

            returnEnabler(available_return_dates);
        }
    });

    let $return = $("#return_input");
    let available_return_dates = [];
    let $return_datepicker = $return.datepicker({
        minDate: $departure.datepicker("getDate"),
        dateFormat: "yy-mm-dd",
        beforeShowDay: function (d) {
            let year = d.getFullYear(),
                month = ("0" + (d.getMonth() + 1)).slice(-2),
                day = ("0" + (d.getDate())).slice(-2);

            let formatted = year + '-' + month + '-' + day;


            return [(available_return_dates.includes(formatted)), "", ""]

        },
        onSelect: async function (dateText, inst) {

            let $input_field = $(this);
            if ($input_field.prev().length != 0) {
                $input_field.prev().remove();
            }

            let $delete_button = $("<span>", {
                "class": "text-danger d-flex align-items-center pe-1",
                "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-x-circle\" viewBox=\"0 0 16 16\"><path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/><path d=\"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708\"/></svg>",
                on: {
                    "click": async function () {

                        let $this_button = $(this);
                        $this_button.remove();
                        console.log($input_field)
                        $input_field.val("");

                    }
                }

            });
            $input_field.parent().prepend($delete_button);

            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${$return.val()}`}`, { method: "GET" })).json())) });
        }
    });

    inputSwitcher($return)
    $.datepicker.setDefaults($.datepicker.regional["hu"]);
    // Egyirányú, vagy oda-vissza gomb
    let $switcher_div_departure_return = $("#switcher_div_departure_return");
    turnOff($switcher_div_departure_return)
    $switcher_div_departure_return.on("click", async function () {
        if (!$return.prop("disabled")) {

            $switcher_div_departure_return.html("<button type=\"button\" class=\"d-flex align-items-center btn btn-outline-danger\" tabindex=\"5\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg></button>");

            inputSwitcher($return);
            if ($return.prev().length != 0) {
                console.log("aaa")
                $return.prev().trigger("click");
            }

            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}`}`, { method: "GET" })).json())) });
            


        } else {

            $switcher_div_departure_return.html("<button type=\"button\" class=\"d-flex align-items-center btn btn-outline-danger\" tabindex=\"5\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-left-right\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5\" /></svg></button>");

            inputSwitcher($return);


        }




    });

    // Repülőtér csere gomb
    let $switcher_div_origin_destination = $("#switcher_div_origin_destination");
    turnOff($switcher_div_origin_destination);

    // Utasok popover
    let passengers = passengers_popoverInit("passengers_input", "passengers_popover");
    popoverManualTrigger(passengers[0].get(0), passengers[1]);


    ///////// ON CHANGE /////////

    // A passengers_input kivvételével mindenhez eseménykezlőt írni !!!
    origin[0].on("change", async function () {

        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${$departure.val()}`}`, { method: "GET" })).json())) });

        destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator("destination_input", "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&departureDate=${$departure.val()}`}`, { method: "GET" })).json())) });

        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

        returnEnabler(available_return_dates);

    });

    destination[0].on("change", async function () {

        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${$departure.val()}`}`, { method: "GET" })).json())) });

        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

        returnEnabler(available_return_dates);

    });
});


///////// FÜGGVÉNYEK /////////

// Popover létrehozója
async function popoverInit(input_field_id, content_div_id) {

    let $input_field = $("#" + input_field_id);
    $input_field.data("code_of_selected_airport", "");

    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: "body",
        content: " ", // helyfoglaló, mivel az "airports_popover_contentGenerator()" függvény egy attribútuma a popover objektum, ami csak inicializálás után addható át argumentumként 
        placement: "bottom",
        trigger: "manual" // A popover mikor jelenjen meg. "manual": a fejlesztő írja meg hozzá a szabályrendszert
    });
    popover.setContent({ ".popover-body": await airports_popover_contentGenerator(input_field_id, content_div_id, popover, (await (await fetch(`/api/${(input_field_id == "origin_input") ? "availabledepartureairportsfiltered" : "availablearrivalairportsfiltered"}`, { method: "GET" })).json())) }); // általános eljárás a két repülőteres popoverhez

    return [$input_field, popover];
}

function passengers_popoverInit(input_field_id, content_div_id) {

    let $input_field = $("#" + input_field_id);
    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: "body",
        content: passengers_popover_contentTemplate(content_div_id),
        placement: "bottom",
        trigger: "manual" // A popover mikor jelenjen meg. "manual": a fejlesztő írja meg hozzá a szabályrendszert
    });

    return [$input_field, popover];
}

// Eseménykezelő a beviteli mezőhöz, valamint a popoverhez
function popoverManualTrigger(input_field, popover_obj) {
    let popover_div;
    input_field.addEventListener("click", function () {

        if (popover_obj.tip == null) {

            popover_obj.show();

            popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
            popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
            popover_div.addEventListener("blur", (event) => {

                if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                    popover_obj.hide();
                } else {
                    if (event.relatedTarget.id != input_field.id) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                        popover_obj.hide();
                    }
                }
            });
        }
    });

    input_field.addEventListener("focus", function () {

        if (popover_obj.tip == null) {

            popover_obj.show();

            popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
            popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
            popover_div.addEventListener("blur", (event) => {

                if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                    popover_obj.hide();
                } else {
                    if (event.relatedTarget.id != input_field.id) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                        popover_obj.hide();
                    }
                }
            });
        }
    });

    input_field.addEventListener("blur", (event) => {

        if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
            popover_obj.hide();
        } else {
            if (event.relatedTarget.id != popover_div.id) { // Ha nem a popover_divbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                popover_obj.hide();
            }
        }
    });
}

async function airports_popover_contentGenerator(input_field_id, content_div_id, popover_obj, airports_data_from_api) {


    let $input_field = $("#" + input_field_id);

    let $popover_content = $("<div>", {
        "id": content_div_id
    });

    let $delete_button;

    let flag_for_airport; // változó, ami tárolja az előzőleg kiválasztott reptér helyét 

    let available_airports_of_countries = []; // a reptereket tárolja országonként csoportosítva. Egy eleme felépítése: {ország : "ország neve", repterek : [{város : "város", kód : "kód"}] }


    available_airports_of_countries.push({ country: airports_data_from_api.results[0].Country, airports: [{ city: airports_data_from_api.results[0].City, code: airports_data_from_api.results[0].AirportCode }] });
    for (let i = 1; i < airports_data_from_api.results.length; i++) {

        if (available_airports_of_countries[available_airports_of_countries.length - 1].country != airports_data_from_api.results[i].Country) {
            available_airports_of_countries.push({ country: airports_data_from_api.results[i].Country, airports: [{ city: airports_data_from_api.results[i].City, code: airports_data_from_api.results[i].AirportCode }] });
        } else {
            available_airports_of_countries[available_airports_of_countries.length - 1].airports.push({ city: airports_data_from_api.results[i].City, code: airports_data_from_api.results[i].AirportCode });

        }
    }

    for (let i = 0; i < available_airports_of_countries.length; i++) {

        let $airports_frame = [];

        if (i == available_airports_of_countries.length - 1) {

            $airports_frame = $("<div>", {
                "class": "mt-2"
            });

        } else {

            if (i == 0) {

                $airports_frame = $("<div>", {
                    "class": "pb-3 mb-2 border-bottom"
                });

            } else {

                $airports_frame = $("<div>", {
                    "class": "mt-2 pb-3 mb-2 border-bottom"
                });
            }

        }

        let $span = $("<span>", {
            "class": "text-danger",
            "text": available_airports_of_countries[i].country
        });
        $span.css({ userSelect: "none" }); // nem lehet kimásolni a szöveget

        $airports_frame.append($span);

        for (let j = 0; j < available_airports_of_countries[i].airports.length; j++) {

            let $airport_div = $("<div>", {
                "class": "pt-2"
            });
            $airport_div.data("code", available_airports_of_countries[i].airports[j].code);

            let $airport_span = $("<span>", {
                "class": "fs-6 p-2",
                "text": `${available_airports_of_countries[i].airports[j].city} (${available_airports_of_countries[i].airports[j].code})`
            });

            // ha nem indul járat (origin_inputnál oda, destination_inputnál vissza), akkor ne lehessen kiválasztani
            $airport_span.css({ userSelect: "none" }); // nem lehet kimásolni a szöveget

            $airport_div.append($airport_span);

            $airport_div.on("click", function () {

                let $this_div = $(this);

                if ($input_field.prev().length == 0) {

                    $delete_button = $("<span>", {
                        "class": "text-danger d-flex align-items-center pe-1",
                        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-x-circle\" viewBox=\"0 0 16 16\"><path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/><path d=\"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708\"/></svg>",
                        on: {
                            "click": function () {

                                let $this_button = $(this);
                                $this_button.remove();

                                $popover_content.children().eq(flag_for_airport[0]).children().eq(flag_for_airport[1]).children().first().removeClass("rounded-pill bg-danger text-light");

                                flag_for_airport = undefined;

                                $input_field.val("");
                                $input_field.data("code_of_selected_airport", "");
                                $input_field.trigger("change");

                            }
                        }
                    });
                    $input_field.parent().prepend($delete_button);

                }


                if (flag_for_airport != undefined) {

                    if (($this_div.parent().index() != flag_for_airport[0] || $this_div.index() != flag_for_airport[1])) {

                        $this_div.parent().parent().children().eq(flag_for_airport[0]).children().eq(flag_for_airport[1]).children().first().removeClass("rounded-pill bg-danger text-light");

                        flag_for_airport = [$this_div.parent().index(), $this_div.index()];

                        $this_div.children().first().addClass("rounded-pill bg-danger text-light");

                        $input_field.val($this_div.children().first().text()); // beilleszti a kiválasztott repülőtér szövegét az inputba

                        popover_obj.hide();

                        $input_field.data("code_of_selected_airport", $this_div.data("code"));
                        $input_field.trigger("change");


                    }

                } else {

                    flag_for_airport = [$this_div.parent().index(), $this_div.index()];

                    $this_div.children().first().addClass("rounded-pill bg-danger text-light");

                    $input_field.val($this_div.children().first().text()); // beilleszti a kiválasztott repülőtér szövegét az inputba

                    popover_obj.hide();

                    $input_field.data("code_of_selected_airport", $this_div.data("code"));
                    $input_field.trigger("change");

                }


            });


            $airports_frame.append($airport_div);
        }

        $popover_content.append($airports_frame);

    }

    flag_for_airport = airportSelector($popover_content.children(), $input_field.data("code_of_selected_airport"));
    if (flag_for_airport != undefined) {
        $popover_content.children().eq(flag_for_airport[0]).children().eq(flag_for_airport[1]).children().first().addClass("rounded-pill bg-danger text-light");
    }
    if ($input_field.prev().length != 0) {
        $input_field.prev().remove();

        $delete_button = $("<span>", {
            "class": "text-danger d-flex align-items-center pe-1",
            "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-x-circle\" viewBox=\"0 0 16 16\"><path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/><path d=\"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708\"/></svg>",
            on: {
                "click": function () {

                    let $this_button = $(this);
                    $this_button.remove();

                    $popover_content.children().eq(flag_for_airport[0]).children().eq(flag_for_airport[1]).children().first().removeClass("rounded-pill bg-danger text-light");

                    flag_for_airport = undefined;

                    $input_field.val("");
                    $input_field.data("code_of_selected_airport", "");
                    $input_field.trigger("change");

                }
            }

        });

        $input_field.parent().prepend($delete_button);

    }

    return $popover_content;
}

function passengers_popover_contentTemplate(content_div_id) {

    let $popover_content = $("<div>", {
        "id": content_div_id
    });

    passengersTemp($popover_content);

    return $popover_content;
}

// A passenger popover tartalmának kialakításáért felel
function passengersTemp(content_div) {

    let $adults_div = $("<div>", {
        "class": "mt-2 pb-3 pt-2 mb-2 border-bottom"
    });

    let $label_adults = $("<span>", {
        "class": "me-2",
        "text": "Felnőttek:"
    });

    let $minus_adult = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
        on: {
            "click": function () {
                // A felnőttek számát csökkenti egyel, ha nagyobb, mint 0
                let serv = parseInt($("#counter_adults").text());
                if (serv > 0) {
                    serv--;
                    $("#counter_adults").text(serv);
                    $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");

                }
            }
        }
    });

    let $counter_adults = $("<span>", {
        "id": "counter_adults",
        "class": "ms-1 me-1",
        "text": "0"
    });

    let $plus_adult = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
        on: {
            "click": function () {
                // A felnőttek számát növeli egyel, ha kisebb vagy egyenlő, mint 16
                let serv = parseInt($("#counter_adults").text());
                if (serv <= 16) {
                    serv++;
                    $("#counter_adults").text(serv);
                    $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                }

            }
        }
    });

    $adults_div.append($label_adults);
    $adults_div.append($minus_adult);
    $adults_div.append($counter_adults);
    $adults_div.append($plus_adult);


    let $children_div = $("<div>", {
        "class": "mt-2 pb-3 pt-2 mb-2"
    });

    let $label_children = $("<span>", {
        "class": "me-2",
        "text": "Gyerekek:"
    });

    let $minus_child = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
        on: {
            "click": function () {
                // a gyerekek számát csökkenti egyel, ha nagyobb, mint 0
                let serv = parseInt($("#counter_children").text());
                if (serv > 0) {
                    serv--;
                    $("#counter_children").text(serv);
                    $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                }
            }
        }
    });

    let $counter_children = $("<span>", {
        "id": "counter_children",
        "class": "ms-1 me-1",
        "text": "0"
    });

    let $plus_child = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
        on: {
            "click": function () {
                // a gyerekek számát növeli egyel, ha kisebb vagy egyenlő, mint 16
                let serv = parseInt($("#counter_children").text());
                if (serv <= 16) {
                    serv++;
                    $("#counter_children").text(serv);
                    $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                }
            }
        }
    });

    $children_div.append($label_children);
    $children_div.append($minus_child);
    $children_div.append($counter_children);
    $children_div.append($plus_child);

    content_div.append($adults_div);
    content_div.append($children_div);

}

// Segédfüggvények

function switchFunc($element) {

    if ($element.css("pointer-events") == "auto") {

        $element.css({
            "pointer-events": "none",
            "opacity": 0.5
        });

    } else {

        $element.css({
            "pointer-events": "auto",
            "opacity": 1.0
        });
    }
}

function inputSwitcher($input) {

    if ($input.prop("disabled")) {

        $input.prop("disabled", false);
        $input.parent().prev("label").removeClass("text-secondary");

    } else {

        $input.prop("disabled", true);
        $input.parent().prev("label").addClass("text-secondary");

    }

}

// az adott repteret választja kí, ha frissül a popover tartalma. Ha üres az input, akkor undefinedal tér vissza
function airportSelector($popover_content_children, $selected_airport_code) {

    let indexes;

    let i = 0;
    let j;
    while (i < $popover_content_children.length && j == undefined) {
        j = 1;
        while (j < $popover_content_children.eq(i).children().length && $popover_content_children.eq(i).children().eq(j).data("code") != $selected_airport_code) {
            j++;
        }

        if (j == $popover_content_children.eq(i).children().length) {
            j = undefined;
            i++;
        }
    }

    if (j != undefined) {
        //console.log($popover_content_children.eq(i).children().eq(j).first())

        indexes = [i, j];

    }

    return indexes;
}

function airportDeSelector($popover_content_children) {

    for (let i = 0; i < $popover_content_children.length; i++) {
        for (let j = 1; j < $popover_content_children.eq(i).children().length; j++) {
            $popover_content_children.eq(i).children().eq(j).children().first().removeClass("rounded-pill bg-danger text-light");

        }

    }
}

async function returnEnabler(available_return_dates) {

    let $origin_input = $("#origin_input");
    let $destination_input = $("#destination_input");
    let $departure_input = $("#departure_input");

    if ($origin_input.val() != "" && $destination_input.val() != "" && $departure_input.val() != "") {

        let arrival_dates = (await (await fetch(`/api/availablearrivaldatesfiltered?departureAirport=${$origin_input.data("code_of_selected_airport")}&arrivalAirport=${$destination_input.data("code_of_selected_airport")}&departureDate=${$departure_input.val()}`, { method: "GET" })).json()).arrivaldates;
        if (arrival_dates.length > 0) {

            let return_dates = [];
            for (let i = 0; i < arrival_dates.length; i++) {
                let res = (await (await fetch(`/api/availablereturndates?departureAirport=${$destination_input.data("code_of_selected_airport")}&arrivalAirport=${$origin_input.data("code_of_selected_airport")}&destinationArrivalDate=${arrival_dates[i]}`, { method: "GET" })).json()).returndates;

                for (let j = 0; j < res.length; j++) {
                    if (!return_dates.includes(res[j])) {
                        return_dates.push(res[j]);
                    }
                }
            }
            
            let $switcher_div_departure_return = $("#switcher_div_departure_return");
            if (return_dates.length > 0) {
                switchFunc($switcher_div_departure_return);
                available_return_dates.length = 0;
                available_return_dates.push(...return_dates);
                //console.log(available_return_dates);

            } else {
                turnOff($switcher_div_departure_return);
            }
        }
    } else {
        let $return_input = $("#return_input");
        if ($return_input.prev().length != 0) {
            $return_input.prev().trigger("click");
        }
        inputDisabler($return_input);
        turnOff($("#switcher_div_departure_return"));
    }
}

function inputDisabler($input) {

    if (!$input.prop("disabled")) {

        $input.prop("disabled", true);
        $input.parent().prev("label").addClass("text-secondary");
    }

}

function turnOff($element) {
    if ($element.css("pointer-events") == "auto") {

        $element.css({
            "pointer-events": "none",
            "opacity": 0.5
        });

        if ($element.prop("id") == "switcher_div_departure_return") {

            $element.html("<button type=\"button\" class=\"d-flex align-items-center btn btn-outline-danger\" tabindex=\"5\"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg></button>");
        }
    }
}
// Ha a departure is megvan adva, akkor aszerint is szűrni kell (külön sql query...)
/*async function airportSwapperEnabler($origin_input, $destination_input, $departure, $return) {
    let swappable_airports = (await (await fetch("/api/swappableairportswithsamedeparturedates", {method : "GET"})).json()).airports;

    if (swappable_airports.includes($origin_input.data("code_of_selected_airport")) && swappable_airports.includes($destination_input.data("code_of_selected_airport"))) {
        
    }


}*/