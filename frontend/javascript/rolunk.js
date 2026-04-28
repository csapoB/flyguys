import { getFooter, getAboutUs } from "./locale.js";
import { initI18n } from "./toolbox.js";

$(async function () {

    let language;

    try {
        language = await initI18n("rolunk");
        await getFooter(language);
        let getaboutus = await getAboutUs(language);
        $(document).prop('title', `${getaboutus.title}`);
        contentFeltolt(getaboutus);
    } catch (error) {
        let $content = $("#content");
        $content.html("");
        errorPageGenerator($content, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }
});

function contentFeltolt(i18n_values) {
    let $rolunkDiv = $('<div class="col-sm-8 card"></div>');
    $rolunkDiv.append(`<h2 class="cim">${i18n_values.about_us_section.title}</h2>`);
    $rolunkDiv.append(i18n_values.about_us_section.content);

    $('#rolunk').append($rolunkDiv);

    let $tortenetDiv = $('<div class="col-sm-8 card"></div>');
    $tortenetDiv.append(`<h2 class="cim">${i18n_values.our_story_section.title}</h2>`);
    $tortenetDiv.append(i18n_values.our_story_section.content);

    $('#tortenet').append($tortenetDiv);

    let $uticelokDiv = $('<div class="col-sm-8 card"></div>');
    $uticelokDiv.append(`<h2 class="cim">${i18n_values.destinations_section.title}</h2>`);
    $uticelokDiv.append(i18n_values.destinations_section.content);

    $('#uticelok').append($uticelokDiv);


    let $elkotelezetsegunkDiv = $('<div class="col-sm-8 card"></div>');
    $elkotelezetsegunkDiv.append(`<h2 class="cim">${i18n_values.our_commitment_section.title}</h2>`);
    $elkotelezetsegunkDiv.append(i18n_values.our_commitment_section.content);

    $('#elkotelezetsegunk').append($elkotelezetsegunkDiv);

    let $elmenyDiv = $('<div class="col-sm-8 card"></div>');
    $elmenyDiv.append(`<h2 class="cim">${i18n_values.the_experience_section.title}</h2>`);
    $elmenyDiv.append(i18n_values.the_experience_section.content);

    $('#elmeny').append($elmenyDiv);

    let $csatlakozzDiv = $('<div class="col-sm-8 card"></div>');
    $csatlakozzDiv.append(`<h2 class="cim">${i18n_values.join_us_section.title}</h2>`);
    $csatlakozzDiv.append(i18n_values.join_us_section.content);

    $('#csatlakozz').append($csatlakozzDiv);
}