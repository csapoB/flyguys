
import { getFlights, getFooter } from "./locale.js";
import { errorPageGenerator, initI18n, initFlights } from "./toolbox.js";

$(async function () {

    let $flights_frame = $("#flights_frame");
    let $flights_to = $("#flights_to");
    let language;
    let geterrors;
    try {

        language = await initI18n("flights");

        await getFooter(language);

        let getflights = await getFlights(language);

        geterrors = (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors;
        $(document).prop('title', `${getflights.title}`);

        const params = new URLSearchParams(window.location.search);

        const origin = params.get("origin");
        const destination = params.get("destination");
        const departure = params.get("departure");
        const return_ = params.get("return");
        const adults = params.get("adults");
        const children = params.get("children");
        
        if (origin == null || destination == null || departure == null || return_ == null || adults == null || children == null) {

            errorPageGenerator($flights_to, geterrors.bad_url_parameter);

        } else {

            await initFlights(language, getflights);
        }

    } catch (error) {
        if ($flights_frame.children().length > 1) {
            $flights_frame.children().eq(1).remove();
            $flights_frame.children().eq(1).remove();
        }
        $flights_to.html("");
        console.error(error);
        errorPageGenerator($flights_to, geterrors.client_error);
    }

});

