import { getNavbar, getFooter, getLocale, getIndex} from "./locale.js";
import { plannerInit } from "./planner.js";
import { modalInit } from "./modal.js";
import { plannerResizer } from "./plannerresizer.js";
import { initCheapestFlights, errorPageGenerator } from "./toolbox.js";


$(async function () {


    let language;

    try {
        
        let getlocale = await getLocale(); // megadja, hogy a böngésző nyelve magyar vagy angol (default) 

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

        $("#keret_cim").text(getindex.body.cheapest_flights.title);
        await initCheapestFlights(language, getindex);

    } catch (error) {
        let $keret = $("#keret");
        $keret.addClass("d-flex flex-column w-75 justify-content-center");
        if ($keret.children().length == 2) {
            $keret.children().eq(1).remove();
        }
        console.error(error);
        errorPageGenerator($keret, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);

    }

});






