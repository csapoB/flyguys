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





/* Angol szöveg
About Us

At FlyGuys, we believe that air travel should be more than simply getting from point A to point B — it should be comfortable, reliable, and genuinely enjoyable. Founded in Hungary and proudly based in the heart of Europe, FlyGuys is a new-generation commercial airline built on modern values, innovative thinking, and a commitment to exceptional passenger experience.

Our Story

FlyGuys was created with a clear mission: to make air travel accessible, efficient, and comfortable. From our home base in Hungary, we’ve expanded rapidly to connect travelers to key destinations across Europe and the Middle East, offering a growing network of routes designed for both business and leisure passengers.

As a startup airline, we embrace flexibility and forward-thinking solutions. This allows us to continually refine our services, adopt the latest aviation technologies, and ensure our aircraft meet the highest standards of safety, comfort, and environmental responsibility.

Destinations

Our expanding route network links Hungary with major cities and gateway hubs throughout:

Western, Central & Eastern Europe
The Balkans
The Mediterranean region
The Middle East’s most dynamic destinations

Whether traveling for work, relaxation, or adventure, FlyGuys offers smooth connections, convenient schedules, and thoughtfully curated services to make each journey effortless.

Our Commitment

At FlyGuys, we prioritize:

Passenger Comfort – Modern cabins, friendly service, and a customer-first mindset
Efficient Travel – Streamlined operations for punctual, stress-free flights
Safety & Reliability – Aircraft maintained to world-class standards
Innovation – Smart technology that enhances every stage of the travel experience
Sustainability – A focus on fuel-efficient operations and responsible growth

The FlyGuys Experience

We’re more than an airline — we’re your travel partners. Every member of our team, from check-in to cockpit, is dedicated to providing warm service with a personal touch. At FlyGuys, you’re not just a passenger; you’re part of our journey as we redefine what a modern European airline can be.

Join Us in the Sky

As we continue to expand our destinations and services, we invite you to fly with us and experience a new standard of travel.
FlyGuys — Your journey starts with us.
*/