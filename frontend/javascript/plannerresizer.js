$(function () {
    
    let x = window.matchMedia("(max-width: 992px)");
    resizer(x);
    x.addEventListener("change", function() {
        resizer(x);
    });

});

function resizer(x) {
    
    let $origin_and_destination_div = $("#origin_and_destination_div");
    let $departure_and_return_div = $("#departure_and_return_div");
    let $passengers_and_search_div = $("#passengers_and_search_div");
    
    let $origin_div = $("#origin_div");
    let $destination_div = $("#departure_div");
    let $passengers_div = $("#passengers_div");

    let $switcher_div_origin_destination = $("#switcher_div_origin_destination");
    let $switcher_div_departure_return = $("#switcher_div_departure_return");
    
    if (x.matches) { // If media query matches
        
        $origin_div.addClass("mb-2");
        $destination_div.addClass("mb-3");
        $passengers_div.addClass("mb-3");

        $switcher_div_origin_destination.addClass("mb-2");
        $switcher_div_departure_return.addClass("mb-2");
        
        $origin_and_destination_div.children().first().addClass("border-bottom");
        $departure_and_return_div.children().first().addClass("border-bottom");
        $origin_and_destination_div.removeClass("border-end pe-0");
        $departure_and_return_div.removeClass("border-end pe-0 ps-0");
        $passengers_and_search_div.removeClass("pe-0 ps-0");

  } else {

    $origin_div.removeClass("mb-2");
    $destination_div.removeClass("mb-3");
    $passengers_div.removeClass("mb-3");
    
    $switcher_div_origin_destination.removeClass("mb-2");
    $switcher_div_departure_return.removeClass("mb-2");
    
    $origin_and_destination_div.addClass("border-end pe-0");
    $departure_and_return_div.addClass("border-end pe-0 ps-0");
    $passengers_and_search_div.addClass("pe-0 ps-0");
    $origin_and_destination_div.children().first().removeClass("border-bottom");
    $departure_and_return_div.children().first().removeClass("border-bottom");

  }
}