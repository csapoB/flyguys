import { getSeatChooser } from "./locale.js";
import { errorPageGenerator, initI18n, initHelyfoglalas } from "./toolbox.js";

$(document).ready(async function () {

    let language
    try {
        language = await initI18n("helyfoglalas");
        let getseatchooser = await getSeatChooser(language);
        $(document).prop('title', `${getseatchooser.title}`);
        await initHelyfoglalas(language, getseatchooser);
    } catch (error) {
        let $frame = $("#frame");
        $frame.html("");
        console.error(error);
        errorPageGenerator($cont, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }



});



