export function flightsResizer() {

    let xl = window.matchMedia("(max-width: 1400px)");
    let md = window.matchMedia("(max-width: 992px)");
    let sm = window.matchMedia("(max-width: 767px)");
    resizerlg(xl);
    xl.addEventListener("change", function () {
        resizerlg(xl);
    });

    resizermd(md);
    md.addEventListener("change", function () {
        resizermd(md);
    });

    resizersm(sm)
    sm.addEventListener("change", function () {
        resizersm(sm);
    });

}

function resizerlg(x) {

    let $display_resizer = $(".display_resizer");
    if (x.matches) { // If media query matches

        $display_resizer.removeClass("display-4");
        $display_resizer.addClass("display-6");

    } else {

        $display_resizer.removeClass("display-6");
        $display_resizer.addClass("display-4");
    }
}

function resizermd(x) {


    let $svg_resizer_48 = $(".svg_resizer_48");
    let $svg_resizer_32 = $(".svg_resizer_32");

    if (x.matches) { // If media query matches

    

        $svg_resizer_48.width("24");
        $svg_resizer_48.height("24");
        $svg_resizer_32.width("16");
        $svg_resizer_32.height("16");



    } else {

        $svg_resizer_48.width("32");
        $svg_resizer_48.height("32");
        $svg_resizer_32.width("24");
        $svg_resizer_32.height("24");

    }

}

function resizersm(x) {


    let $svg_resizer_48 = $(".svg_resizer_48");
    let $svg_resizer_32 = $(".svg_resizer_32");

    if (x.matches) {

        $(".destination").removeClass("flex-column");
        $(".destination").addClass("flex-row my-3");
        $svg_resizer_48.width("18");
        $svg_resizer_48.height("18");
        $svg_resizer_32.width("12");
        $svg_resizer_32.height("12");

    } else {
        $(".destination").removeClass("flex-row my-3");
        $(".destination").addClass("flex-column");
    }

}




