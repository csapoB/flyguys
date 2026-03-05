export async function getNavbar(lang){
    let getnavbar = (await (await fetch("/api/getnavbar", { method: "GET", headers : {"Accept-Language" : lang} })).json()).navbar;
    $("#about_us_nav").text(getnavbar.about_us);
    $("#planner_nav").text(getnavbar.planner);
    $("#loyalty_program_nav").text(getnavbar.loyalty_program);
    $("#language_nav").prop(getnavbar.language_code);
    $("#language_nav").children().first().html(getnavbar.language);
    $("#login_button").text(getnavbar.log_in);
    $("#admin_button").text(getnavbar.admin);
    $("#profile_button").text(getnavbar.my_profile);
    $("#logout_button").text(getnavbar.log_out);
}

export async function getPlanner(lang) {
    return (await (await fetch("/api/getplanner", { method: "GET", headers : {"Accept-Language" : lang} })).json()).planner;
 
} 

export async function getIndex(lang) {
    let getindex = (await (await fetch("/api/getindex", { method: "GET", headers : {"Accept-Language" : lang} })).json()).index;
    $("#title_about_us_footer").text(getindex.footer.title_about_us);
    $("#company_infos_footer").text(getindex.footer.company_infos);
    $("#news_footer").text(getindex.footer.news);
    $("#title_services_footer").text(getindex.footer.title_services);
    $("#loyalty_program_footer").text(getindex.footer.loyalty_program);
    $("#flight_search_footer").text(getindex.footer.flight_search);
    $("#my_flights_footer").text(getindex.footer.my_flights);
    $("#travel_planner_footer").text(getindex.footer.travel_planner);
    $("#title_contact_footer").text(getindex.footer.title_contact);
    $("#all_rights_reserved_footer").text(getindex.footer.all_rights_reserved);

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