import { getAdmin } from "./locale.js";
import { initI18n, generateToast, errorPageGenerator, toBool, formatDateTime, formatPrice, toLocalDateTimeInputValue, addMinutesToInputValue, validateCreateFlightForm, validateAircraftConstraint, getFlightStatus, adminCheck } from "./toolbox.js";

$(async function () {

    let language;
    try {
        language = await initI18n("admin");
        let getadmin = await getAdmin(language);
        await adminCheck(language, getadmin);

    } catch (error) {
        let $frame = $("#frame");
        $frame.html("");
        console.error(error);
        errorPageGenerator($frame, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }

});
