import { getNavbar } from "./locale.js";
import { getFooter } from "./locale.js";
import { getLocale } from "./locale.js";
import { getIndex } from "./locale.js";
import { getPlannerPassengersPopover } from "./locale.js";
import { plannerInit } from "./planner.js";
import { login_modal, modalInit } from "./modal.js";
import { plannerResizer } from "./plannerresizer.js";
import { dateDeFormatter } from "./toolbox.js";
import { indexResizer } from "./indexresizer.js";


$(async function () {

    let getlocale = await getLocale(); // megadja, hogy a böngésző nyelve magyar vagy angol (default) 

    let language;

    let url_splitted = window.location.href.split("/");
    if (url_splitted[3] == "") {

        history.pushState({}, "", `/${getlocale}`);
        language = getlocale;


    } else {

        language = url_splitted[3];
    }


    $("html").prop("lang", language);

    await getNavbar(language, url_splitted);
    await modalInit(language);

    let getindex = await getIndex(language);

    await getFooter(language);

    await plannerInit(language);

    plannerResizer();

    $("#keret").append(await initCheapestFlights((await (await fetch("/api/cheapestflights", { method: "GET", headers: { "Accept-Language": language } })).json()).results, language, getindex));
    $("#keret_cim").text(getindex.body.cheapest_flights.title);

    indexResizer();

});

//Ajánlott járatok megjelenítése
async function initCheapestFlights(flights, language, i18n_values) {



    let $frame = $("<div>", {
        "class": "row justify-content-center g-3",
    });

    for (let i = 0; i < flights.one_way.length; i++) {



        let $card_frame = $("<div>", {
            "class": "col-12 col-sm-12 col-md-6 col-lg-4 col-xl-4 col-xxl-3"
        });

        let $card = $("<div>", {
            "class": "card h-100 shadow-sm bg-light",
            "html": `<div class=\"w-100 h-75 overflow-hidden\"><img class=\"card-img-top object-fit-cover h-100 w-100\" src=\"../css/images/${flights.one_way[i].ArrivalAirport}.png\"></div>`
        });
        $card.data("flight_id", flights.one_way[i].FlightID)

        let $form = $("<form>");

        let $card_body = $("<div>", {
            "class": "card-body row d-flex justify-content-center align-items-center"
        });

        let $location = $("<div>", {
            "class": "col-12 row border-bottom pb-2 mb-2 d-flex justify-content-center",
            "html": `<span class=\"col-5 d-flex flex-column justify-content-center align-items-center\"><span class=\"brick_color fs-3\">${flights.one_way[i].DepartureCity}</span><span class=\"brick_color\">(${flights.one_way[i].DepartureAirport})</span></span><span class=\"d-flex justify-content-center align-items-center col-2 ps-0 pe-0\"><span><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"svg_resizer_48 bi bi-arrow-right\" viewBox=\"0 0 16 16\"><path fill-rule=\"evenodd\" d=\"M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8\"/></svg></span></span><span class=\"col-5 d-flex flex-column justify-content-center align-items-center\"><span class=\"brick_color fs-3\">${flights.one_way[i].ArrivalCity}</span><span class=\"brick_color\">(${flights.one_way[i].ArrivalAirport})</span></span>`
        });

        let $departure_date = $("<div>", {
            "class": "col-12 row border-bottom pb-2 mb-2",
            "html": `<div class=\"d-flex justify-content-center\"><span class=\"d-flex justify-content-center align-items-center pe-2\"><svg fill=\"#dc3545\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" viewBox=\"0 0 371.656 371.656\" xml:space=\"preserve\"><g><g><g><path d=\"M37.833,212.348c-0.01,0.006-0.021,0.01-0.032,0.017c-4.027,2.093-5.776,6.929-4.015,11.114     c1.766,4.199,6.465,6.33,10.787,4.892l121.85-40.541l-22.784,37.207c-1.655,2.703-1.305,6.178,0.856,8.497     c2.161,2.318,5.603,2.912,8.417,1.449l23.894-12.416c0.686-0.356,1.309-0.823,1.844-1.383l70.785-73.941l87.358-45.582     c33.085-17.835,29.252-31.545,27.29-35.321c-1.521-2.928-4.922-6.854-12.479-8.93c-7.665-2.106-18.021-1.938-31.653,0.514     c-4.551,0.818-7.063,0.749-9.723,0.676c-9.351-0.256-15.694,0.371-47.188,16.736L90.788,164.851l-66.8-34.668     c-2.519-1.307-5.516-1.306-8.035,0.004l-11.256,5.85c-2.317,1.204-3.972,3.383-4.51,5.938c-0.538,2.556,0.098,5.218,1.732,7.253     l46.364,57.749L37.833,212.348z\"/><path d=\"M355.052,282.501H28.948c-9.17,0-16.604,7.436-16.604,16.604s7.434,16.604,16.604,16.604h326.104     c9.17,0,16.604-7.434,16.604-16.604C371.655,289.934,364.222,282.501,355.052,282.501z\"/></g></g></g></svg></span><span class=\"fs-3\">${dateDeFormatter(flights.one_way[i].DepartureDate, language)}</span></div>`
        })
        let $departure_and_arrival_time = $("<div>", {
            "class": "col-12 row border-bottom d-flex justify-content-center pb-2 mb-2",
            "html": `<div class=\"d-flex align-items-center justify-content-around col-sm-12 col-md-12 col-lg-12\"><span class=\"fs-4\">${flights.one_way[i].DepartureTime}</span><span><svg fill=\"currentColor\" width=\"24\" height=\"24\" viewBox=\"0 0 32 32\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M30.65 16.353c0.063-0.1 0.1-0.222 0.1-0.353s-0.037-0.252-0.102-0.356l0.002 0.003c-0.018-0.031-0.036-0.057-0.055-0.082l0.001 0.002c-0.059-0.081-0.132-0.149-0.217-0.199l-0.003-0.002c-0.016-0.010-0.023-0.028-0.040-0.036l-28.001-14c-0.098-0.050-0.213-0.079-0.335-0.079-0.414 0-0.75 0.336-0.75 0.75 0 0.107 0.022 0.209 0.063 0.301l-0.002-0.005 5.873 13.704-5.873 13.705c-0.038 0.087-0.060 0.188-0.060 0.294 0 0.414 0.336 0.75 0.75 0.75h0c0.001 0 0.002 0 0.003 0 0.121 0 0.236-0.030 0.336-0.082l-0.004 0.002 28.001-13.999c0.017-0.008 0.024-0.027 0.040-0.036 0.088-0.053 0.161-0.12 0.219-0.199l0.001-0.002c0.018-0.023 0.036-0.050 0.052-0.077l0.002-0.003zM3.496 3.587l23.326 11.663h-18.327zM8.495 16.75h18.328l-23.326 11.664z\"></path></svg></span><span class=\"fs-4\">${flights.one_way[i].ArrivalTime}</span></div>`
        });

        let $price = $("<div>", {
            "class": "col-12 row border-bottom d-flex justify-content-center pb-2 mb-2",
            "html": `<div class=\"d-flex justify-content-center align-items-center\"><span class=\"fs-2 fw-bold text-danger\">${flights.one_way[i].PriceInHUF}${i18n_values.body.cheapest_flights.currency}</span><span class=\"fs-3\">${i18n_values.body.cheapest_flights.per_person}</span></div>`
        });

        let $available_seats = $("<div>", {
            "class": "col-12 row border-bottom d-flex justify-content-center pb-2 mb-2",
            "html": `<div class=\"d-flex align-items-center justify-content-center col-sm-12 col-md-12 col-lg-12\"><span class=\"fs-4\">${flights.one_way[i].NumOfAvailableSeats}</span><span><svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"bi bi-person-arms-up\" viewBox=\"0 0 16 16\"> <path d=\"M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3\"/><path d=\"m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z\"/></svg></span></div>`
        });

        let $passengers_div = $("<div>", {
            "class": "col-12 row border-bottom d-flex justify-content-center align-items-center pb-2 mb-2"
        });
        $passengers_div.append(passengers_row_contentGenerator(`cheapest_flight_${i}`, flights.one_way[i].NumOfAvailableSeats, await getPlannerPassengersPopover(language)));

        let $seat_booking_button_div = $("<div>", {
            "class": "col-12 row d-flex justify-content-center align-items-center"
        })

        let $seat_booking_button = $("<button>", {
            "id": "seat_booking_button",
            "class": "btn btn-outline-danger",
            "text": i18n_values.body.cheapest_flights.choose_seats,
            "type": "submit",
            on: {
                "click": async function (e) {
                    e.preventDefault();

                    if ((await (await fetch("/api/checklogin", { method: "GET" })).json()).logged_in) {
                        const fd = new FormData($form.get(0));

                        fd.set("flight_id_to", $card.data("flight_id"));
                        fd.set("adults", $(`#cheapest_flight_${i}_c_adults`).text());
                        fd.set("children", $(`#cheapest_flight_${i}_c_children`).text());

                        const searchParams = new URLSearchParams(fd);
                        const queryString = searchParams.toString();

                        window.location.href = `/${language}/helyfoglalas?${queryString}`;
                        
                    } else {
                        
                        await login_modal(language);
                        $("#monadModal").modal("show");
                    }
                   

                }
            }
        });

        $seat_booking_button_div.append($seat_booking_button);

        $card_body.append($location);
        $card_body.append($departure_date);
        $card_body.append($departure_and_arrival_time);
        $card_body.append($price);
        $card_body.append($available_seats);
        $card_body.append($passengers_div);
        $card_body.append($seat_booking_button_div);

        $form.append($card_body);

        $card.append($form);

        $card_frame.append($card);

        $frame.append($card_frame);

    }
    return $frame;
}

function passengers_row_contentGenerator(counter_id, num_of_max_passengers, i18n_values) {
    let $frame = $("<div>", {
        "class": "col-12 row d-flex justify-content-center"
    });

    let $adults_div = $("<div>", {
        "class": "d-flex align-items-center justify-content-center col-12"
    });

    let $label_adults = $("<span>", {
        "class": "fs-5 me-2",
        "text": `${i18n_values.adults_inc_dec}:`
    });

    let $minus_adult = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
        on: {
            "click": function () {
                // A felnőttek számát csökkenti egyel, ha nagyobb, mint 0
                let serv = parseInt($(`#${counter_id}_c_adults`).text());
                if (serv > 1) {
                    serv--;
                    $(`#${counter_id}_c_adults`).text(serv);
                }
            }
        }
    });

    let $counter_adults = $("<span>", {
        "id": `${counter_id}_c_adults`,
        "class": "fs-5 ms-1 me-1",
        "text": "1"
    });

    let $plus_adult = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
        on: {
            "click": function () {
                // A felnőttek számát növeli egyel, ha kisebb vagy egyenlő, mint 16 és kisebb vagy egyenlő mint a járathoz tartozó szabad székek
                let serv = parseInt($(`#${counter_id}_c_adults`).text());
                if (serv < 16 && (serv + parseInt($(`#${counter_id}_c_children`).text())) < num_of_max_passengers) {
                    serv++;
                    $(`#${counter_id}_c_adults`).text(serv);
                }

            }
        }
    });

    $adults_div.append($label_adults);
    $adults_div.append($minus_adult);
    $adults_div.append($counter_adults);
    $adults_div.append($plus_adult);


    let $children_div = $("<div>", {
        "class": "d-flex align-items-center justify-content-center col-12"
    });

    let $label_children = $("<span>", {
        "class": "fs-5 me-2",
        "text": `${i18n_values.children_inc_dec}:`
    });

    let $minus_child = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
        on: {
            "click": function () {
                // a gyerekek számát csökkenti egyel, ha nagyobb, mint 0
                let serv = parseInt($(`#${counter_id}_c_children`).text());
                if (serv > 0) {
                    serv--;
                    $(`#${counter_id}_c_children`).text(serv);
                }
            }
        }
    });

    let $counter_children = $("<span>", {
        "id": `${counter_id}_c_children`,
        "class": "fs-5 ms-1 me-1",
        "text": "0"
    });

    let $plus_child = $("<span>", {
        "class": "text-danger",
        "html": "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
        on: {
            "click": function () {
                // a gyerekek számát növeli egyel, ha kisebb vagy egyenlő, mint 16
                let serv = parseInt($(`#${counter_id}_c_children`).text());
                if (serv < 16 && serv + parseInt($(`#${counter_id}_c_adults`).text()) < num_of_max_passengers) {
                    serv++;
                    $(`#${counter_id}_c_children`).text(serv);

                }
            }
        }
    });

    $children_div.append($label_children);
    $children_div.append($minus_child);
    $children_div.append($counter_children);
    $children_div.append($plus_child);

    $frame.append($adults_div);
    $frame.append($children_div);

    return $frame;
}

