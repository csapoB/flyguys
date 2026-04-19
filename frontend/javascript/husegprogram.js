import { getFooter, getLoyaltyProgram } from "./locale.js";
import { initHusegprogram, initI18n, errorPageGenerator } from "./toolbox.js";

$(async function () {

    let language = await initI18n("husegprogram");

    await getFooter(language);

    let getloyaltyprogram = await getLoyaltyProgram(language);
    $(document).prop('title', `${getloyaltyprogram.title}`);

    
    try {
        await initHusegprogram(language, getloyaltyprogram);
    } catch (error) {
        let $frame = $("#frame")
        $frame.html("");
        console.error(error);
        errorPageGenerator($frame, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }

});

