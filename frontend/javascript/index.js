import { getNavbar, getFooter, getLocale, getIndex, getPlannerPassengersPopover } from "./locale.js";
import { plannerInit } from "./planner.js";
import { modalInit } from "./modal.js";
import { plannerResizer } from "./plannerresizer.js";
import { initCheapestFlights } from "./toolbox.js";
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
    await modalInit(language, "index");

    let getindex = await getIndex(language);

    $(document).prop('title', `${getindex.title}`);

    await getFooter(language);

    await plannerInit(language);

    plannerResizer();

    let $keret = $("#keret");
    $("#keret_cim").text(getindex.body.cheapest_flights.title);
    await initCheapestFlights((await (await fetch("/api/cheapestflights", { method: "GET", headers: { "Accept-Language": language } })).json()).results, language, getindex);

    indexResizer();

});






