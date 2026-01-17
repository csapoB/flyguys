$(function () {
    
    let x = window.matchMedia("(max-width: 992px)");
    myFunction(x);
    x.addEventListener("change", function() {
        myFunction(x);
    });
});

function myFunction(x) {
    let $origin_and_destination_div = $("#origin_and_destination_div");
    let $departure_and_return_div = $("#departure_and_return_div");
    let $passengers_and_search_div = $("#passengers_and_search_div");
    if (x.matches) { // If media query matches
        $("#origin_div").addClass("mb-2");
        $("#switcher_div").addClass("mb-2");
        $("#departure_div").addClass("mb-3");
        $("#passengers_div").addClass("mb-3");
        $origin_and_destination_div.children().first().addClass("border-bottom");
        $departure_and_return_div.children().first().addClass("border-bottom");
        $origin_and_destination_div.removeClass("border-end pe-0");
        $departure_and_return_div.removeClass("border-end pe-0 ps-0");
        $passengers_and_search_div.removeClass("pe-0 ps-0");

        
      

  } else {

    $("#origin_div").removeClass("mb-2");
    $("#switcher_div").removeClass("mb-2");
    $("#departure_div").removeClass("mb-3");
    $("#passengers_div").removeClass("mb-3");
    $origin_and_destination_div.addClass("border-end pe-0");
    $departure_and_return_div.addClass("border-end pe-0 ps-0");
    $passengers_and_search_div.addClass("pe-0 ps-0");
    $origin_and_destination_div.children().first().removeClass("border-bottom");
    $departure_and_return_div.children().first().removeClass("border-bottom");

  }
}