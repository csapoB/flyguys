export function indexResizer() {

    let x = window.matchMedia("(max-width: 767px)");
    resizer(x);
    x.addEventListener("change", function () {
        resizer(x);
    });

}

function resizer(x) {

    let cheapest_flight_price_divs = $(".cheapest_flight_price_div");
    let cheapest_flight_departure_date_divs = $(".cheapest_flight_departure_date_div");

    if (x.matches) { // If media query matches

        for (let i = 0; i < cheapest_flight_price_divs.length; i++) {
            let $cheapest_flight_price_div = $(cheapest_flight_price_divs[i]);
            let $cheapest_flight_departure_date_div = $(cheapest_flight_departure_date_divs[i]);
            $cheapest_flight_price_div.removeClass("justify-content-end");
            $cheapest_flight_price_div.addClass("justify-content-center");
            $cheapest_flight_departure_date_div.removeClass("justify-content-start");
            $cheapest_flight_departure_date_div.addClass("justify-content-center");
        }
    } else {

        for (let i = 0; i < cheapest_flight_price_divs.length; i++) {
            let $cheapest_flight_price_div = $(cheapest_flight_price_divs[i]);
            let $cheapest_flight_departure_date_div = $(cheapest_flight_departure_date_divs[i]);
            $cheapest_flight_price_div.removeClass("justify-content-center");
            $cheapest_flight_price_div.addClass("justify-content-end");
            $cheapest_flight_departure_date_div.removeClass("justify-content-center");
            $cheapest_flight_departure_date_div.addClass("justify-content-start");
        }

    }
}