$(async function () {

    let $flights_frame = $("#flights_frame");
    let $flights_to = $("#flights_to");

    const params = new URLSearchParams(window.location.search);

    const origin = params.get("origin");
    const destination = params.get("destination");
    const departure = params.get("departure");
    const return_ = params.get("return");
    const passengers = params.get("passengers");

    if (origin == null || destination == null || departure == null || return_ == null || passengers == null) {

        errorPageGenerator($flights_to, "HIBA : Az URL paraméterek közül valamelyik hibás.");

    } else {

        try {

            let flights_to = await fetch(`/api/flights?departureAirport=${origin}&arrivalAirport=${destination}&departureDate=${departure}&numOfPassengers=${passengers}`);

            switch (flights_to.status) {

                case 200:

                    flights_to = (await flights_to.json()).flights;

                    break;
                case 400:
                    console.log((await flights_to.json()).error);
                    break;
                default:
                    throw new Error("Hiba")

            }

            if (flights_to.length == 0) {

                infoPageGenerator($flights_to, "Sajnos, nincs a feltételeknek megfelelő járat.");

            } else {

                if (return_ != "") {

                    let flights_back = await fetch(`/api/flights?departureAirport=${destination}&arrivalAirport=${origin}&departureDate=${return_}&numOfPassengers=${passengers}`);

                    switch (flights_back.status) {

                        case 200:

                            flights_back = (await flights_back.json()).flights;

                            if (flights_back.length != 0) {

                                flightSelector(flights_to, $flights_to);

                                let $flights_back = $("<div>", {
                                    "id": "flights_back",
                                    "class": "row"
                                });
                                $flights_frame.append($flights_back);
                                flightSelector(flights_back, $flights_back);
                                seatBookingButtonGenerator($flights_frame, passengers);

                            } else {
                                infoPageGenerator($flights_to, "Sajnos, nincs a feltételeknek megfelelő járat.");
                            }
                            break;

                        default:
                            throw new Error("Hiba")
                    }
                } else {
                    flightSelector(flights_to, $flights_to);
                    seatBookingButtonGenerator($flights_frame, passengers);
                }
            }

        } catch {
            errorPageGenerator($flights_to, "Sajnos hiba történt a szerverben. Kérjük, próbálja meg újra később!")
        }


    }


});

function flightSelector(flights, $frame) {
    let $title = $("<h1>", {
        "class": "display-3",
        "html": `${flights[0].DepartureCity} (${flights[0].DepartureAirport})<span class="ps-4 pe-4"><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"48\" height=\"48\" fill=\"currentColor\" class=\"bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg></span>${flights[0].ArrivalCity} (${flights[0].ArrivalAirport})`
    });
    $frame.prepend($title);

    let $flights_button = $("<button>", {
        "class": "btn btn-danger col-md-12 col-lg-12 flight",
        "text": "Válasszon járatot!",
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
    popoverManualTrigger($flights_button.get(0), flights_popover);
    flights_popover.setContent({ ".popover-body": flights_popover_contentGenerator($flights_button, flights_popover, flights) })

    $frame.append($flights_button);

}


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

function flights_popover_contentGenerator($input_field, popover_obj, flights_data_from_api) {

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
                    if (($flight.length == 2 && (($.map($flight, function(x){return $(x).data("flight_id")})).length == 2)) || $flight.length == 1) { // azt vizsgálja, hogy mindegyik járatválasztó kivan-e töltve. Ha igen, akkor lehessen ülőhelyet foglalni, különben nem
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
                    <div class="d-flex align-items-center justify-content-around col-md-12 col-lg-12 col-xl-6">
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
                    <div class="d-flex align-items-center justify-content-center col-md-12 col-lg-12 col-xl-4">
                        <span class="fs-3">${flights_data_from_api[i].BasePrice} HUF</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-center col-md-12 col-lg-12 col-xl-2">
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

function errorPageGenerator($frame, message) {

    let $plane_div = $("<div>", {
        "class": "col-md-12 col-lg-12",
        "html": "<img class=\"img-fluid\" src=../css/images/plane.png>"
    });
    let $error_div = $("<div>", {
        "class": "alert alert-danger col-md-12 col-lg-12",
        "html": `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-triangle-fill" viewBox="0 0 16 16"><path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/></svg><span class=\"ps-2\">${message}</span>`,
        "role": "alert"
    });

    $frame.append($plane_div);
    $frame.append($error_div);

}

function infoPageGenerator($frame, message) {
    let $plane_div = $("<div>", {
        "class": "col-md-12 col-lg-12",
        "html": "<img class=\"img-fluid\" src=../css/images/plane.png>"
    });
    let $no_flights_div = $("<div>", {
        "class": "alert alert-primary col-md-12 col-lg-12",
        "html": `<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-info-circle-fill\" viewBox=\"0 0 16 16\"> <path d=\"M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m.93-9.412-1 4.705c-.07.34.029.533.304.533.194 0 .487-.07.686-.246l-.088.416c-.287.346-.92.598-1.465.598-.703 0-1.002-.422-.808-1.319l.738-3.468c.064-.293.006-.399-.287-.47l-.451-.081.082-.381 2.29-.287zM8 5.5a1 1 0 1 1 0-2 1 1 0 0 1 0 2\"/></svg><span class=\"ps-2\">${message}</span>`,
        "role": "alert"
    });
    $frame.append($plane_div);
    $frame.append($no_flights_div);
}

function seatBookingButtonGenerator($frame, passengers) {

    let $seat_booking_button_frame = $("<div>", {
        "class": "row d-flex justify-content-center"
    });

    let $seat_booking_button = $("<button>", {
        "id" : "seat_booking_button",
        "class": "btn btn-outline-danger col-md-5 col-lg-5",
        "text": "Válasszon ülőhelyet!",
        "type": "submit",
        on: {
            "click": function (e) {
                e.preventDefault();

                let flight_ids = $.map($(".flight"), function (x) { return $(x).data("flight_id") }); // a kiválasztott járatok azonosítóját beleteszi egy tömbbe 

                const fd = new FormData(document.getElementById("flights_form"));

                console.log(flight_ids);
                console.log(passengers);

                fd.set("flight_id_to", flight_ids[0]);
                if (flight_ids.length == 2) {
                    fd.set("flight_id_back", flight_ids[1]);
                }
                fd.set("num_of_passengers", passengers);

                const searchParams = new URLSearchParams(fd);
                const queryString = searchParams.toString();

                window.location.href = `/helyfoglalas?${queryString}`;

            }
        }
    });
    $seat_booking_button.prop("disabled", true);

    $seat_booking_button_frame.append($seat_booking_button);
    $frame.append($seat_booking_button_frame);

}