export async function getNavbar(lang, url_splitted) {
    let getnavbar = (await (await fetch("/api/getnavbar", { method: "GET", headers: { "Accept-Language": lang } })).json()).navbar;
    $("#back_to_main_page").prop("href", `/${lang}`);
    let $about_us_nav = $("#about_us_nav");
    $about_us_nav.text(getnavbar.about_us);
    $about_us_nav.prop("href", `/${lang}/rolunk`)
    let $planner_nav = $("#planner_nav")
    $planner_nav.text(getnavbar.planner);
    $planner_nav.prop("href", `/${lang}/map`);
    let $loyalty_program_nav = $("#loyalty_program_nav");
    $loyalty_program_nav.text(getnavbar.loyalty_program);
    $loyalty_program_nav.prop("href", `/${lang}/husegprogram`);
    let $language_nav = $("#language_nav");
    $language_nav.children().first().html(getnavbar.language);
    url_splitted = url_splitted.filter(x => url_splitted.indexOf(x) > 3);
    let url = ((url_splitted.length > 0) ? "/" : "") + url_splitted.join("/");
    $language_nav.prop("href", lang == "hu" ? "/en" + url : "/hu" + url);
    document.getElementById("language_nav").dataset.langCode = lang;
    $("#login_button").text(getnavbar.login);
    let $admin_button = $("#admin_button");
    $admin_button.text(getnavbar.admin);
    $admin_button.prop("href", `/${lang}/admin`);
    let $profile_button = $("#profile_button");
    $profile_button.prop("href", `/${lang}/profil`);
    $profile_button.text(getnavbar.my_profile);
    $("#logout_button").text(getnavbar.logout);
    $.datepicker.setDefaults($.datepicker.regional[(lang) == "hu" ? "hu" : "en-GB"]);

}

export async function getIndex(lang) {
    return (await (await fetch("/api/getindex", { method: "GET", headers: { "Accept-Language": lang } })).json()).index;
}

export async function getPlanner(lang) {
    let getplanner =  (await (await fetch("/api/getplanner", { method: "GET", headers: { "Accept-Language": lang } })).json()).planner;
    $("#origin_label").text(getplanner.origin_label);
    $("#destination_label").text(getplanner.destination_label);
    $("#departure_label").text(getplanner.departure_label);
    $("#return_label").text(getplanner.return_label);
    $("#passengers_label").text(getplanner.passengers_label);
    $("#search_flights").text(getplanner.search_flights_button);
    $("#passengers_input").prop("value", getplanner.passengers_input);

    $(window).on("unload", function () {
        $("#origin_input").prop("value", "");
        $("#destination_input").prop("value", "");
        $("#departure_input").prop("value", "");
        $("#return_input").prop("value", "");
        
    });

}

export async function getFooter(lang) {
    let getfooter = (await (await fetch("/api/getfooter", { method: "GET", headers: { "Accept-Language": lang } })).json()).footer;
    $("#title_about_us_footer").text(getfooter.title_about_us);
    let $company_infos_footer = $("#company_infos_footer");
    $company_infos_footer.text(getfooter.company_infos);
    $company_infos_footer.prop("href", `/${lang}/rolunk`);
    $("#magazine_footer").text(getfooter.magazine);
    $("#title_services_footer").text(getfooter.title_services);
    let $loyalty_program_footer = $("#loyalty_program_footer");
    $loyalty_program_footer.text(getfooter.loyalty_program);
    $loyalty_program_footer.prop("href", `/${lang}/husegprogram`);
    let $my_flights_footer = $("#my_flights_footer");
    $my_flights_footer.text(getfooter.my_flights);
    $my_flights_footer.prop("href", `/${lang}/profil`);
    let $travel_planner_footer = $("#travel_planner_footer");
    $travel_planner_footer.text(getfooter.travel_planner);
    $travel_planner_footer.prop("href", `/${lang}/map`);
    $("#title_contact_footer").text(getfooter.title_contact);
    $("#all_rights_reserved_footer").text(getfooter.all_rights_reserved);

}

export async function getAboutUs(lang) {
    return (await (await fetch("/api/getaboutus", { method: "GET", headers: { "Accept-Language": lang } })).json()).about_us;
}

export async function getPlannerPassengersPopover(lang) {

    return (await (await fetch("/api/getplannerpassengerspopover", { method: "GET", headers: { "Accept-Language": lang } })).json()).planner_passengers_popover;

}

export async function getLocale() {
    return (await (await fetch("/api/getlocale", { method: "GET" })).json()).locale;
}

export async function getFlights(lang) {
    return (await (await fetch("/api/getflights", { method: "GET", headers: { "Accept-Language": lang } })).json()).flights;
}

export async function getModal(lang) {
    return (await (await fetch("/api/getmodal", { method: "GET", headers: { "Accept-Language": lang } })).json()).modal;
}

export async function getMap(lang) {
    return (await (await fetch("/api/getmap", { method: "GET", headers: { "Accept-Language": lang } })).json()).map;
}

export async function getSeatChooser(lang) {
    let getseat_chooser = (await (await fetch("/api/getseatchooser", { method: "GET", headers: { "Accept-Language": lang } })).json()).seat_chooser;
    $("#lefoglal").val(getseat_chooser.booking);
    return getseat_chooser;
}
export async function getProfile(lang) {
    return (await (await fetch("/api/getprofile", { method: "GET", headers: { "Accept-Language": lang } })).json()).profile;
}
export async function getLoyaltyProgram(lang) {
    return (await (await fetch("/api/getloyaltyprogram", { method: "GET", headers: { "Accept-Language": lang } })).json()).loyalty_program;
}
export async function getAdmin(lang) {
    let getadmin = (await (await fetch("/api/getadmin", { method: "GET", headers: { "Accept-Language": lang } })).json()).admin;
    $("#mode_users").text(getadmin.title.users);
    $("#mode_flights").text(getadmin.title.flights);

    $("#admin_mode_users .admin-title").text(getadmin.title.users);
    $("#admin_mode_users .users-card .admin-subtitle").text(getadmin.caption.select_line_to_see_bookings);
    $("#user_email_search_clear").text(getadmin.button.delete);
    $("#admin_mode_users .admin-title-sm").text(getadmin.title.bookings);
    $("#admin_mode_users .reservations-card .admin-subtitle").text(getadmin.caption.select_user_from_tabel);
    $("#reservation_area .empty-state").text(getadmin.caption.select_user_from_tabel);
    $("#user_email_search").prop("placeholder", getadmin.caption.search_by_email);

    $("#admin_mode_flights .admin-title").text(getadmin.title.flight_control);
    $("#admin_mode_flights .flights-card .admin-subtitle").text(getadmin.caption.flight_control);
    $("#refresh_admin_flights").text(getadmin.button.update);
    $("#admin_flights_table .loading-state").text(getadmin.loading_flights);
    $("#admin_mode_flights .flight-create-card .admin-title-sm").text(getadmin.title.create_new_flight);
    $("#admin_mode_flights .flight-create-card .admin-subtitle").text(getadmin.caption.create_flight);
    $("#create_aircraft_id_label").text(getadmin.title.aircraft);
    $("#create_aircraft_id option").text(getadmin.caption.choose_aircraft);
    $("#create_departure_airport").text(getadmin.caption.choose_origin_airport);
    $("#create_departure_airport_label").text(getadmin.title.origin_airport);
    $("#create_arrival_airport_label").text(getadmin.title.destination_airport);
    $("#create_arrival_airport").text(getadmin.caption.choose_destination_airport);
    $("#create_departure_datetime_label").text(getadmin.title.departure_date);
    $("#create_arrival_datetime_label").text(getadmin.title.arrival_date);
    $("#create_base_price_label").text(getadmin.title.base_price);
    $("#create_flight_button").text(getadmin.button.create_flight);
    $("#create_flight_reset").text(getadmin.button.delete_form)

    return getadmin;
}