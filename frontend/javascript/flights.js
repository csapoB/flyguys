
import { getFlights, getFooter } from "./locale.js";
import { login_modal } from "./modal.js";
import { dateDeFormatter, initI18n } from "./toolbox.js";
import { popoverManualTrigger, infoPageGenerator, errorPageGenerator } from "./toolbox.js";
import { flightsResizer } from "./flightsresizer.js";

$(async function () {

    let language = await initI18n("flights");
    
    await getFooter(language);

    let getflights = await getFlights(language);

    $(document).prop('title', `${getflights.title}`);

    let $flights_frame = $("#flights_frame");
    let $flights_to = $("#flights_to");

    const params = new URLSearchParams(window.location.search);

    const origin = params.get("origin");
    const destination = params.get("destination");
    const departure = params.get("departure");
    const return_ = params.get("return");
    const adults = params.get("adults");
    const children = params.get("children");

    if (origin == null || destination == null || departure == null || return_ == null || adults == null || children == null) {

        errorPageGenerator($flights_to, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.bad_url_parameter);

    } else {

        try {

            let flights_to = await fetch(`/api/${language}/flights?departureAirport=${origin}&arrivalAirport=${destination}&departureDate=${departure}&numOfAdults=${adults}&numOfChildren=${children}`, { method: "GET" });

            switch (flights_to.status) {

                case 200:

                    flights_to = (await flights_to.json()).flights;

                    if (flights_to.length == 0) {

                        infoPageGenerator($flights_to, getflights.errors.no_flights_by_parameters);

                    } else {

                        if (return_ != "") {

                            let flights_back = await fetch(`/api/${language}/flights?departureAirport=${destination}&arrivalAirport=${origin}&departureDate=${return_}&numOfAdults=${adults}&numOfChildren=${children}`, { method: "GET" });

                            switch (flights_back.status) {

                                case 200:

                                    flights_back = (await flights_back.json()).flights;

                                    if (flights_back.length != 0) {

                                        await flightSelector(flights_to, $flights_to, language, getflights);

                                        let $flights_back = $("<div>", {
                                            "id": "flights_back",
                                            "class": "row"
                                        });
                                        $flights_frame.append($flights_back);
                                        await flightSelector(flights_back, $flights_back, language, getflights);
                                        await seatBookingButtonGenerator($flights_frame, adults, children, getflights, language);

                                        flightsResizer();

                                    } else {
                                        infoPageGenerator($flights_to, getflights.errors.no_flights_by_parameters);
                                    }
                                    break;

                                default:
                                    throw new Error("ERROR")
                            }

                        } else {
                            await flightSelector(flights_to, $flights_to, language, getflights);
                            flightsResizer();
                            await seatBookingButtonGenerator($flights_frame, adults, children, getflights, language);
                        }
                    }
                    break;
                case 400:
                    console.log((await flights_to.json()).error);
                    break;
                default:
                    throw new Error("ERROR")

            }



        } catch (error) {
            console.log(error)
            errorPageGenerator($flights_to, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.server_error)
        }


    }


});

async function flightSelector(flights, $frame, language, i18n_values) {

    let $date = $("<h1>", {
        "class": "display_resizer display-4 mb-4 d-flex justify-content-center",
        "html": `<span class=\"pe-4\"><svg class=\"svg_resizer_48\" fill="#dc3545" version=\"1.1" xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 371.656 371.656\" xml:space=\"preserve\"><g><g><g><path d=\"M37.833,212.348c-0.01,0.006-0.021,0.01-0.032,0.017c-4.027,2.093-5.776,6.929-4.015,11.114     c1.766,4.199,6.465,6.33,10.787,4.892l121.85-40.541l-22.784,37.207c-1.655,2.703-1.305,6.178,0.856,8.497     c2.161,2.318,5.603,2.912,8.417,1.449l23.894-12.416c0.686-0.356,1.309-0.823,1.844-1.383l70.785-73.941l87.358-45.582     c33.085-17.835,29.252-31.545,27.29-35.321c-1.521-2.928-4.922-6.854-12.479-8.93c-7.665-2.106-18.021-1.938-31.653,0.514     c-4.551,0.818-7.063,0.749-9.723,0.676c-9.351-0.256-15.694,0.371-47.188,16.736L90.788,164.851l-66.8-34.668     c-2.519-1.307-5.516-1.306-8.035,0.004l-11.256,5.85c-2.317,1.204-3.972,3.383-4.51,5.938c-0.538,2.556,0.098,5.218,1.732,7.253     l46.364,57.749L37.833,212.348z"/><path d="M355.052,282.501H28.948c-9.17,0-16.604,7.436-16.604,16.604s7.434,16.604,16.604,16.604h326.104     c9.17,0,16.604-7.434,16.604-16.604C371.655,289.934,364.222,282.501,355.052,282.501z\"/></g></g></g></svg></span>${dateDeFormatter(flights[0].DepartureDate, language)}`
    });

    $frame.prepend($date);

    let $title = $("<div>", {
        "class": "display_resizer display-4 d-flex justify-content-center align-items-center",
        "html": `<div class=\"row w-100\"><span class=\"col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 d-flex flex-column justify-content-center align-items-center\"><span>${flights[0].DepartureCity}</span><span>(${flights[0].DepartureAirport})</span></span><span class=\"d-flex justify-content-center align-items-center col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 ps-0 pe-0\"><span><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" fill=\"currentColor\" class=\"svg_resizer_48 bi bi-dash\" viewBox=\"0 0 16 16\"><path d=\"M4 8a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 0 1h-7A.5.5 0 0 1 4 8\"/></svg> (<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"32\" height=\"32\" fill=\"#dc3545\" class=\"svg_resizer_32 bi bi-clock\" viewBox=\"0 0 16 16\"><path d=\"M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z\"/><path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0\"/></svg> ${flights[0].FlightTime}) <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" fill=\"currentColor\" class=\"svg_resizer_48 bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg></span></span><span class=\"col-4 col-sm-4 col-md-4 col-lg-4 col-xl-4 d-flex flex-column justify-content-center align-items-center\"><span>${flights[0].ArrivalCity}</span><span>(${flights[0].ArrivalAirport})</span></span></div>`
    });

    $frame.prepend($title);


    let $flights_button = $("<button>", {
        "class": "btn btn-danger col-md-12 col-lg-12 flight",
        "text": i18n_values.choose_flight,
        "type": "button"
    });
    // gomb megnyomása után megjelenik egy poopover, amiben felvannak sorolva a választható járatok (hasonló design, mint az indulási/érkezési hely popover-nél)
    let flights_popover = new bootstrap.Popover($flights_button, {
        html: true,
        container: "body",
        content: " ",
        placement: "bottom",
        trigger: "manual"
    });
    popoverManualTrigger($flights_button, flights_popover);
    flights_popover.setContent({ ".popover-body": flights_popover_contentGenerator($flights_button, flights_popover, flights, i18n_values) })

    $frame.append($flights_button);

}

function flights_popover_contentGenerator($input_field, popover_obj, flights_data_from_api, i18n_values) {

    let $popover_content = $("<div>");

    let flag_for_flight; // változó, ami tárolja az előzőleg kiválasztott járat helyét 

    for (let i = 0; i < flights_data_from_api.length; i++) {

        let $flight_frame = $("<div>", {

            on: {
                "click": function () {

                    console.log(flag_for_flight)
                    let $this_div = $(this);
                    console.log($this_div.index())
                    if (flag_for_flight != undefined) {

                        if (flag_for_flight != $this_div.index()) {
                            console.log($this_div.parent().children().eq(flag_for_flight).first())

                            $this_div.parent().children().eq(flag_for_flight).first().children().first().removeClass("rounded border border-danger text-danger");
                            $this_div.children().first().addClass("rounded border border-danger text-danger");

                            let copy = $this_div.children().first().clone();
                            copy.removeClass("rounded border border-danger text-danger");
                            copy.children().first().removeClass("border rounded-1");

                            $input_field.html(copy);
                            $input_field.data("flight_id", $this_div.data("flight_id"));

                            popover_obj.hide();

                            flag_for_flight = $this_div.index();
                        }

                    } else {
                        $this_div.children().first().addClass("rounded border border-danger text-danger");

                        let copy = $this_div.children().first().clone();
                        copy.removeClass("rounded border border-danger text-danger");
                        copy.children().first().removeClass("border rounded-1");

                        $input_field.html(copy);
                        $input_field.data("flight_id", $this_div.data("flight_id"));

                        popover_obj.hide();

                        flag_for_flight = $this_div.index();
                    }

                    let $flight = $(".flight");
                    if (($flight.length == 2 && (($.map($flight, function (x) { return $(x).data("flight_id") })).length == 2)) || $flight.length == 1) { // azt vizsgálja, hogy mindegyik járatválasztó kivan-e töltve. Ha igen, akkor lehessen ülőhelyet foglalni, különben nem
                        $("#seat_booking_button").prop("disabled", false);
                    }

                }
            }

        });


        if (flights_data_from_api.length != 1 && i != flights_data_from_api.length - 1) {

            $flight_frame.addClass("pb-3");

        }

        let $flight_div = $("<div>", {
            "class": "d-flex justify-content-center",
            "html": `<div class="w-100 row pe-0 ps-0 mw-100 border rounded-1">
                    <div class="d-flex align-items-center justify-content-around col-sm-12 col-md-12 col-lg-12 col-xl-6">
                        <span class="fs-3">${flights_data_from_api[i].DepartureTime}</span>
                        <hr class="w-25">
                        <span>
                            <svg fill="currentColor" width="24" height="24" viewBox="0 0 32 32" version="1.1"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M30.65 16.353c0.063-0.1 0.1-0.222 0.1-0.353s-0.037-0.252-0.102-0.356l0.002 0.003c-0.018-0.031-0.036-0.057-0.055-0.082l0.001 0.002c-0.059-0.081-0.132-0.149-0.217-0.199l-0.003-0.002c-0.016-0.010-0.023-0.028-0.040-0.036l-28.001-14c-0.098-0.050-0.213-0.079-0.335-0.079-0.414 0-0.75 0.336-0.75 0.75 0 0.107 0.022 0.209 0.063 0.301l-0.002-0.005 5.873 13.704-5.873 13.705c-0.038 0.087-0.060 0.188-0.060 0.294 0 0.414 0.336 0.75 0.75 0.75h0c0.001 0 0.002 0 0.003 0 0.121 0 0.236-0.030 0.336-0.082l-0.004 0.002 28.001-13.999c0.017-0.008 0.024-0.027 0.040-0.036 0.088-0.053 0.161-0.12 0.219-0.199l0.001-0.002c0.018-0.023 0.036-0.050 0.052-0.077l0.002-0.003zM3.496 3.587l23.326 11.663h-18.327zM8.495 16.75h18.328l-23.326 11.664z">
                                </path>
                            </svg>
                        </span>
                        <hr class="w-25">
                        <span class="fs-3">${flights_data_from_api[i].ArrivalTime}</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-center col-sm-12 col-md-12 col-lg-12 col-xl-4">
                        <span class="fs-3">${flights_data_from_api[i].PriceInHUF}${i18n_values.currency}${i18n_values.per_person}</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-center col-sm-12 col-md-12 col-lg-12 col-xl-2">
                        <span class="fs-3">${flights_data_from_api[i].NumOfAvailableSeats}</span>
                        <span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-person-arms-up" viewBox="0 0 16 16"> <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/><path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
                            </svg>
                        </span>
                    </div>
                </div>`
        });

        $flight_frame.append($flight_div);
        $flight_frame.data("flight_id", flights_data_from_api[i].FlightID);

        $popover_content.append($flight_frame);

    }

    return $popover_content;
}

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


async function seatBookingButtonGenerator($frame, adults, children, i18n_values, lang) {

    let $seat_booking_button_frame = $("<div>", {
        "class": "row d-flex justify-content-center"
    });

    let $seat_booking_button = $("<button>", {
        "id": "seat_booking_button",
        "class": "btn btn-outline-danger col-md-5 col-lg-5",
        "text": i18n_values.choose_seats,
        "type": "submit",
        on: {
            "click": async function (e) {
                e.preventDefault();

                if ((await (await fetch("/api/checklogin", { method: "GET" })).json()).logged_in) {
                    let flight_ids = $.map($(".flight"), function (x) { return $(x).data("flight_id") }); // a kiválasztott járatok azonosítóját beleteszi egy tömbbe 

                    const fd = new FormData(document.getElementById("flights_form"));

                    fd.set("flight_id_to", flight_ids[0]);
                    if (flight_ids.length == 2) {
                        fd.set("flight_id_back", flight_ids[1]);
                    }
                    fd.set("adults", adults);
                    fd.set("children", children)

                    const searchParams = new URLSearchParams(fd);
                    const queryString = searchParams.toString();

                    window.location.href = `/${lang}/helyfoglalas?${queryString}`;
                } else {
                    await login_modal(lang);
                    $("#monadModal").modal("show");
                }

            }
        }
    });
    $seat_booking_button.prop("disabled", true);

    $seat_booking_button_frame.append($seat_booking_button);
    $frame.append($seat_booking_button_frame);

}
