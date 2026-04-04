import { getNavbar, getProfile, getLocale } from "./locale.js";
import { modalInit } from "./modal.js";
$(async function () {

    let getlocale = await getLocale();

    let language;

    let old_url = window.location.href.split("/")
    if (old_url[3].includes("profil")) {
        old_url.splice(3, 0, getlocale);
        let new_url = old_url.join("/")
        history.pushState({}, "", new_url);
        language = getlocale;

    } else {
        language = old_url[3];
    }

    $("html").prop("lang", language);

    await getNavbar(language, old_url);
    await modalInit(language);

    try {
        const response = await fetch('/api/LoginCheck', {
            method: 'GET',
        });

        const data = await response.json();
        if (!data.allapot) {
            window.location.href = "/"
        }
        else {
            alert("Be vagy jeletnkezve")
        }
    } catch (error) {
        console.log("hiba: " + error)
    }
    let getprofile = await getProfile(language);

    let {active_reservations, previous_reservations} = (await (await fetch("/api/reservations", { method: "GET", headers: { "Accept-Language": language } })).json()).reservations;


    let $active_reservations_table =  initTableActiveReservations(active_reservations, getprofile)
    let $previous_reservations_table =  initTablePreviousReservations(previous_reservations, getprofile)

    $('#aktivFoglalasok').append($active_reservations_table);
    $('#korabbiFoglalasok').append($previous_reservations_table);
});

// vissza ad egy tábla jquery objektumot 
function initTableActiveReservations(active_reservations, i18n_values) {

    let $table = $("<table>", {
        "id": "active_reservations"
    });
    let $thead = $("<thead>");
    $thead.append(`<tr><th>${i18n_values.flights_tabel.row_column}</th><th>${i18n_values.flights_tabel.column_column}</th><th>${i18n_values.flights_tabel.fare_class_column}</th></tr>`)
    let $tbody = $("<tbody>");

    for (let i = 0; i < active_reservations.length; i++) {
        let $tr = $("<tr>");
        $tr.append(`<td>${active_reservations[i].RowID}</td><td>${active_reservations[i].ColumnID}</td><td>${active_reservations[i].FareClassName}</td>`);
        $tbody.append($tr);
    }

    $table.append($thead);
    $table.append($tbody);

    return $table;
}

// vissza ad egy tábla jquery objektumot 
function initTablePreviousReservations(previous_reservations, i18n_values) {

    let $table = $("<table>", {
        "id": "previous_reservations"
    });
    let $thead = $("<thead>");
    $thead.append(`<tr><th>${i18n_values.flights_tabel.row_column}</th><th>${i18n_values.flights_tabel.column_column}</th><th>${i18n_values.flights_tabel.fare_class_column}</th></tr>`)
    let $tbody = $("<tbody>");

    for (let i = 0; i < previous_reservations.length; i++) {
        let $tr = $("<tr>");
        $tr.append(`<td>${previous_reservations[i].RowID}</td><td>${previous_reservations[i].ColumnID}</td><td>${previous_reservations[i].FareClassName}</td>`);
        $tbody.append($tr);
    }

    $table.append($thead);
    $table.append($tbody);

    return $table;
}

/*
aktív foglásaim
korábbi foglásaim

*/