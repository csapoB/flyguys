export async function getNavbar(lang, url_splitted){
    let getnavbar = (await (await fetch("/api/getnavbar", { method: "GET", headers : {"Accept-Language" : lang} })).json()).navbar;
    $("#about_us_nav").text(getnavbar.about_us);
    $("#planner_nav").text(getnavbar.planner);
    $("#loyalty_program_nav").text(getnavbar.loyalty_program);
    let $language_nav = $("#language_nav");
    $language_nav.children().first().html(getnavbar.language);
    url_splitted = url_splitted.filter(x => url_splitted.indexOf(x) > 3);
    let url = ((url_splitted.length > 0) ? "/" : "") + url_splitted.join("/");
    $language_nav.prop("href", lang == "hu" ? "/en" + url : "/hu" + url);
    document.getElementById("language_nav").dataset.langCode = lang;
    $("#login_button").text(getnavbar.log_in);
    $("#admin_button").text(getnavbar.admin);
    $("#profile_button").text(getnavbar.my_profile);
    $("#logout_button").text(getnavbar.log_out);
    $.datepicker.setDefaults($.datepicker.regional[(lang) == "hu" ? "hu" : "en-GB"]);

}

export async function getPlanner(lang) {
    return (await (await fetch("/api/getplanner", { method: "GET", headers : {"Accept-Language" : lang} })).json()).planner;
 
} 

export async function getIndex(lang) {
    return (await (await fetch("/api/getindex", { method: "GET", headers : {"Accept-Language" : lang} })).json()).index;
    
}

export async function getPlannerPassengersPopover(lang) {
    
    return (await (await fetch("/api/getplannerpassengerspopover", { method: "GET", headers : {"Accept-Language" : lang} })).json()).planner_passengers_popover;

}

export async function getLocale() {
    return (await (await fetch("/api/getlocale", { method: "GET" })).json()).locale;
}

export async function getFlights(lang) {
    return (await (await fetch("/api/getflights", { method: "GET", headers : {"Accept-Language" : lang} })).json()).flights;
}

export async function getModal(lang) {
    return (await (await fetch("/api/getmodal", { method: "GET", headers : {"Accept-Language" : lang} })).json()).modal;
}