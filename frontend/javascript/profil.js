import { getProfile } from "./locale.js";
import { initI18n, errorPageGenerator, initProfile } from "./toolbox.js";
$(async function () {


    let language; 
    let getprofile;

    try {
        language = await initI18n("profil"); 
        getprofile = await getProfile(language);
        $(document).prop('title', `${getprofile.title}`);
        await initProfile(language, getprofile);

    } catch (error) {
        let $cont = $("#cont");
        $cont.html("");
        console.error(error);
        errorPageGenerator($cont, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }
    
});


