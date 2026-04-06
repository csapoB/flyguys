import { getPlanner } from "./locale.js";
import { popoverManualTrigger, dateFormatter} from "./toolbox.js";
import { inputDisabler, passengers_popoverInit, inputSwitcher, airportSelector, returnEnabler, turnOff, airportSwapperEnabler } from "./planner.js";


export async function plannerMapInit(current_language) {

    await getPlanner(current_language);

    ///////// INIT /////////

    /* 
    Tömb elemei:
        0 - Beviteli mező (jquery_obj)
        1 - Popover objektum
    */
    // Repülőtér popoverek
    let origin = [$("#origin_input"), null];
    let destination = [$("#destination_input"), null];

    // Datepickerek
    let $departure = $("#departure_input");
    let available_departure_dates = (await (await fetch("/api/availabledeparturedatesfiltered", { method: "GET" })).json()).departuredates
    let $departure_datepicker = $departure.datepicker({
        beforeShowDay: function (d) {
            let year = d.getFullYear(),
                month = ("0" + (d.getMonth() + 1)).slice(-2),
                day = ("0" + (d.getDate())).slice(-2);

            let formatted = year + '-' + month + '-' + day;

            return [(available_departure_dates.includes(formatted)), "", ""]

        },
        onSelect: async function (dateText, inst) {

            dateText = dateFormatter(dateText, current_language);

            let $input_field = $(this);

            if ($input_field.prev().length != 0) {
                $input_field.prev().remove();

            }

            let $map = $("#map");
            $map.trigger("map:departure-changed", [dateText, origin[0].data("code_of_selected_airport"), destination[0].data("code_of_selected_airport")]);

            let $delete_button = $("<span>", {
                "class": "text-danger d-flex align-items-center pe-1",
                "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"12\" height=\"12\" fill=\"currentColor\" class=\"bi bi-x-circle\" viewBox=\"0 0 16 16\"><path d=\"M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16\"/><path d=\"M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708\"/></svg>",
                on: {
                    "click": async function () {

                        let $this_button = $(this);
                        $this_button.remove();

                        $input_field.val("");

                        $map.trigger("map:departure-changed", ["", origin[0].data("code_of_selected_airport"), destination[0].data("code_of_selected_airport")]);

                        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

                        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

                        destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator(destination[0], "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

                        returnEnabler(available_return_dates, current_language);

                        airportSwapperEnabler(origin[0], destination[0], "", "");

                    }
                }

            });
            $input_field.parent().prepend($delete_button);

            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateText}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

            destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator(destination[0], "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&departureDate=${dateText}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

            returnEnabler(available_return_dates, current_language);

            airportSwapperEnabler(origin[0], destination[0], dateFormatter($departure.val(), current_language), dateFormatter($return.val(), current_language));
        }
    });

    let $return = $("#return_input");
    let available_return_dates = [];
    let $return_datepicker = $return.datepicker({
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

                        $input_field.val("");

                        airportSwapperEnabler(origin[0], destination[0], dateFormatter($departure.val(), current_language), dateFormatter($return.val(), current_language));

                    }
                }

            });
            $input_field.parent().prepend($delete_button);

            /*origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateText}`}`, { method: "GET", headers : {"Accept-Language" : current_language} })).json())) });*/

            airportSwapperEnabler(origin[0], destination[0], dateFormatter($departure.val(), current_language), dateFormatter($return.val(), current_language));
        }
    });

    inputSwitcher($return);
    // Egyirányú, vagy oda-vissza gomb
    let $switcher_departure_return = $("#switcher_departure_return");
    turnOff($switcher_departure_return)
    $switcher_departure_return.on("click", async function () {
        if (!$return.prop("disabled")) {

            $switcher_departure_return.html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg>");

            inputSwitcher($return);
            if ($return.prev().length != 0) {

                $return.prev().trigger("click");
            }

            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });



        } else {

            $switcher_departure_return.html("<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-arrow-left-right\" viewBox=\"0 0 16 16\"> <path fill-rule=\"evenodd\" d=\"M1 11.5a.5.5 0 0 0 .5.5h11.793l-3.147 3.146a.5.5 0 0 0 .708.708l4-4a.5.5 0 0 0 0-.708l-4-4a.5.5 0 0 0-.708.708L13.293 11H1.5a.5.5 0 0 0-.5.5m14-7a.5.5 0 0 1-.5.5H2.707l3.147 3.146a.5.5 0 1 1-.708.708l-4-4a.5.5 0 0 1 0-.708l4-4a.5.5 0 1 1 .708.708L2.707 4H14.5a.5.5 0 0 1 .5.5\" /></svg>");

            inputSwitcher($return);


            origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${destination[0].data("code_of_selected_airport")}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

        }

    });

    // Repülőtér csere gomb
    let $swapper_origin_destination = $("#swapper_origin_destination");
    turnOff($swapper_origin_destination);
    $swapper_origin_destination.on("click", async function () {

        let saver_of_origin_code = origin[0].data("code_of_selected_airport");
        let saver_of_origin_val = origin[0].val();
        origin[0].data("code_of_selected_airport", destination[0].data("code_of_selected_airport"));
        origin[0].val(destination[0].val());
        destination[0].data("code_of_selected_airport", saver_of_origin_code);
        destination[0].val(saver_of_origin_val);

        $("#map").trigger("map:swapper-clicked", [origin[0].data("code_of_selected_airport"), destination[0].data("code_of_selected_airport")])

        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateFormatter($departure.val(), current_language)}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

        destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator(destination[0], "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&departureDate=${dateFormatter($departure.val(), current_language)}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

        returnEnabler(available_return_dates, current_language);

    });

    // Utasok popover
    let passengers = await passengers_popoverInit("passengers_input", "passengers_popover");
    popoverManualTrigger(passengers[0], passengers[1]);


    $("#search_flights").on("click", function (e) {
        e.preventDefault();

        const fd = new FormData(document.getElementById("planner_form"));

        fd.set("origin", origin[0].data("code_of_selected_airport"));
        fd.set("destination", destination[0].data("code_of_selected_airport"));
        fd.set("departure", dateFormatter($departure.val(), current_language));
        fd.set("return", dateFormatter($return.val(), current_language));
        fd.set("adults", passengers[0].data("num_of_adults"));
        fd.set("children", passengers[0].data("num_of_children"));

        const searchParams = new URLSearchParams(fd);
        const queryString = searchParams.toString();

        window.location.href = `/${current_language}/flights?${queryString}`;


    });

    ///////// EVENT LISTENERS /////////

    // A passengers_input kivvételével mindenhez eseménykezlőt írni !!!
    origin[0].on("change", async function () {


        /*origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator("origin_input", "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateFormatter($departure.val(), current_language)}`}`, { method: "GET", headers : {"Accept-Language" : current_language} })).json())) });*/

        destination[1].setContent({ ".popover-body": await airports_popover_contentGenerator(destination[0], "destination_popover", destination[1], (await (await fetch(`/api/${`availablearrivalairportsfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&departureDate=${dateFormatter($departure.val(), current_language)}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

        returnEnabler(available_return_dates, current_language);

        airportSwapperEnabler(origin[0], destination[0], dateFormatter($departure.val(), current_language), dateFormatter($return.val(), current_language));

    });

    destination[0].on("change", async function () {

        origin[1].setContent({ ".popover-body": await airports_popover_contentGenerator(origin[0], "origin_popover", origin[1], (await (await fetch(`/api/${`availabledepartureairportsfiltered?arrivalAirport=${destination[0].data("code_of_selected_airport")}&departureDate=${dateFormatter($departure.val(), current_language)}`}`, { method: "GET", headers: { "Accept-Language": current_language } })).json())) });

        available_departure_dates = (await (await fetch(`/api/availabledeparturedatesfiltered?departureAirport=${origin[0].data("code_of_selected_airport")}&arrivalAirport=${destination[0].data("code_of_selected_airport")}`, { method: "GET" })).json()).departuredates;

        returnEnabler(available_return_dates, current_language);

        airportSwapperEnabler(origin[0], destination[0], dateFormatter($departure.val(), current_language), dateFormatter($return.val(), current_language));

    });


    origin[1] = await popoverInit(origin[0], "origin_popover", "body", "", "");
    origin[0].on("marker:click", async function (event, code) {
        origin[0].off(".popover");
        origin[1] = null;
        origin[1] = await popoverInit(origin[0], "origin_popover", "#hidden_container", "", dateFormatter($departure.val(), current_language));
        origin[1].show();
        let i = 0;
        while ($("#origin_popover").children().eq(i).children().eq(1).data("code") != code) {
            i++;
        }
        $("#origin_popover").children().eq(i).children().eq(1).trigger("click");

        $("#hidden_container").html("");

        origin[0].off(".popover");
        origin[1] = null;
        origin[1] = await popoverInit(origin[0], "origin_popover", "body", code, dateFormatter($departure.val(), current_language));

    });

    destination[1] = await popoverInit(destination[0], "destination_popover", "body", "", "", "");
    destination[0].on("marker:click", async function (event, code) {
        destination[0].off(".popover");
        destination[1] = null;
        destination[1] = await popoverInit(destination[0], "destination_popover", "#hidden_container", "", dateFormatter($departure.val(), current_language), origin[0].data("code_of_selected_airport"));
        destination[1].show();
        let i = 0;
        while ($("#destination_popover").children().eq(i).children().eq(1).data("code") != code) {
            i++;
        }
        $("#destination_popover").children().eq(i).children().eq(1).trigger("click");

        $("#hidden_container").html("");

        destination[0].off(".popover");
        destination[1] = null;
        destination[1] = await popoverInit(destination[0], "destination_popover", "body", code, dateFormatter($departure.val(), current_language), origin[0].data("code_of_selected_airport"));
    });
    inputDisabler(destination[0]);
}

///////// FÜGGVÉNYEK /////////

async function popoverInit($input_field, content_div_id, container_id, code_of_selected_airport, departureDate, departureAirport) {

    $input_field.data("code_of_selected_airport", code_of_selected_airport);

    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: container_id,
        content: " ", // helyfoglaló, mivel az "airports_popover_contentGenerator()" függvény egy attribútuma a popover objektum, ami csak inicializálás után addható át argumentumként 
        placement: "bottom",
        trigger: "manual" // A popover mikor jelenjen meg. "manual": a fejlesztő írja meg hozzá a szabályrendszert
    });
    popover.setContent({ ".popover-body": airports_popover_contentGenerator($input_field, content_div_id, popover, (await (await fetch(`/api/${($input_field.prop("id") == "origin_input") ? `availabledepartureairportsfiltered?departureDate=${departureDate}` : `availablearrivalairportsfiltered?departureAirport=${departureAirport}&departureDate=${departureDate}`}`, { method: "GET", headers: { "Accept-Language": document.getElementById("language_nav").dataset.langCode } })).json())) }); // általános eljárás a két repülőteres popoverhez

    popoverManualTrigger($input_field, popover);

    return popover;
}


function airports_popover_contentGenerator($input_field, content_div_id, popover_obj, airports_data_from_api) {


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

        let $airports_frame;

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
                let $map = $("#map");
                let $departure_input = $("#departure_input");

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

                                if ($input_field.prop("id") == "origin_input") {

                                    let $destination_input = $("#destination_input");
                                    inputDisabler($destination_input);
                                    if ($destination_input.prev().length != 0) {
                                        $map.trigger("map:factory-reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), true]);
                                        $destination_input.prev().trigger("click");

                                    } else {
                                        $map.trigger("map:factory-reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), false]);
                                    }

                                } else {
                                    $map.trigger("map:reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), $("#origin_input").data("code_of_selected_airport")]);
                                }

                            }
                        }
                    });
                    $input_field.parent().prepend($delete_button);

                }

                let $destination_input = $("#destination_input");

                if (flag_for_airport != undefined) {

                    if (($this_div.parent().index() != flag_for_airport[0] || $this_div.index() != flag_for_airport[1])) {

                        $this_div.parent().parent().children().eq(flag_for_airport[0]).children().eq(flag_for_airport[1]).children().first().removeClass("rounded-pill bg-danger text-light");

                        flag_for_airport = [$this_div.parent().index(), $this_div.index()];

                        $this_div.children().first().addClass("rounded-pill bg-danger text-light");

                        $input_field.val($this_div.children().first().text()); // beilleszti a kiválasztott repülőtér szövegét az inputba

                        popover_obj.hide();

                        if ($input_field.prop("id") == "origin_input") {
                            $map.trigger("map:origin-selected", [dateFormatter($departure_input.val(), $("html").prop("lang")), $this_div.data("code"), $("#destination_input").data("code_of_selected_airport")]);
                            inputEnabler($destination_input);

                        } else {
                            $map.trigger("map:destination-selected", [$this_div.data("code"), $("#origin_input").data("code_of_selected_airport")]);
                        }

                        $input_field.data("code_of_selected_airport", $this_div.data("code"));
                        $input_field.trigger("change");

                    }

                } else {

                    flag_for_airport = [$this_div.parent().index(), $this_div.index()];

                    $this_div.children().first().addClass("rounded-pill bg-danger text-light");

                    $input_field.val($this_div.children().first().text()); // beilleszti a kiválasztott repülőtér szövegét az inputba

                    popover_obj.hide();

                    if ($input_field.prop("id") == "origin_input") {
                        $map.trigger("map:origin-selected", [dateFormatter($departure_input.val(), $("html").prop("lang")), $this_div.data("code"), $("#destination_input").data("code_of_selected_airport")]);
                        inputEnabler($destination_input);

                    } else {
                        $map.trigger("map:destination-selected", [$this_div.data("code"), $("#origin_input").data("code_of_selected_airport")]);
                    }

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

                    let $map = $("#map");
                    let $departure_input = $("#departure_input");

                    if ($input_field.prop("id") == "origin_input") {

                        let $destination_input = $("#destination_input");
                        inputDisabler($destination_input);
                        if ($destination_input.prev().length != 0) {
                            $map.trigger("map:factory-reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), true]);
                            $destination_input.prev().trigger("click");

                        } else {
                            $map.trigger("map:factory-reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), false]);
                        }

                    } else {
                        $map.trigger("map:reset", [dateFormatter($departure_input.val(), $("html").prop("lang")), $("#origin_input").data("code_of_selected_airport")]);
                    }

                }
            }

        });

        $input_field.parent().prepend($delete_button);

    }

    return $popover_content;
}

function inputEnabler($input) {
    if ($input.prop("disabled")) {

        $input.prop("disabled", false);
        $input.parent().prev("label").removeClass("text-secondary");
    }
}


