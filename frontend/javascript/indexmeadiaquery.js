document.addEventListener("DOMContentLoaded", function (){
    
    let x = window.matchMedia("(max-width: 992px)");
    myFunction(x);
    x.addEventListener("change", function() {
        myFunction(x);
    });
});

function myFunction(x) {
    let origin_and_destination_div = document.getElementById("origin_and_destination_div");
    let departure_and_return_div = document.getElementById("departure_and_return_div");
    if (x.matches) { // If media query matches
        document.getElementById("origin_div").classList.add("mb-2");
        document.getElementById("switcher_div").classList.add("mb-2");
        document.getElementById("departure_div").classList.add("mb-3");
        document.getElementById("passengers_div").classList.add("mb-3");
        origin_and_destination_div.children[0].classList.add("border-bottom");
        departure_and_return_div.children[0].classList.add("border-bottom");
        origin_and_destination_div.classList.remove("border-end");
        departure_and_return_div.classList.remove("border-end");

        
      

  } else {

    document.getElementById("origin_div").classList.remove("mb-2");
    document.getElementById("switcher_div").classList.remove("mb-2");
    document.getElementById("departure_div").classList.remove("mb-3");
    document.getElementById("passengers_div").classList.remove("mb-3");
    origin_and_destination_div.classList.add("border-end");
    departure_and_return_div.classList.add("border-end");
    origin_and_destination_div.children[0].classList.remove("border-bottom");
    departure_and_return_div.children[0].classList.remove("border-bottom");

  }
}