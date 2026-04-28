import { getProfile } from "./locale.js";
import { initI18n, errorPageGenerator, initProfile } from "./toolbox.js";
$(async function () {


    let language; 

    try {
        language = await initI18n("profil"); 
        let getprofile = await getProfile(language);
        $(document).prop('title', `${getprofile.title}`);
        await initProfile(language, getprofile);

    } catch (error) {
        let $cont = $("#cont");
        $cont.html("");
        console.error(error);
        errorPageGenerator($cont, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }
    
});


