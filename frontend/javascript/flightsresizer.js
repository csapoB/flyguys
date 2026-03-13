$(function () {
    
    let x = window.matchMedia("(max-width: 1200px)");
    resizer(x);
    x.addEventListener("change", function() {
        resizer(x);
    });

});

function resizer(x) {
    
    let $city_and_airport = $(".city_and_airport");
    if (x.matches) { // If media query matches
        
        $city_and_airport.removeClass("flex-column");
        $city_and_airport.addClass("flex-row");

  } else {

        $city_and_airport.removeClass("flex-row");
        $city_and_airport.addClass("flex-column");
  }
}