import { getNavbar, getLocale, getSeatChooser } from "./locale.js";
import { infoPageGenerator, errorPageGenerator, showLogin } from "./toolbox.js";
import { modalInit } from "./modal.js";

let kivalaszottUlesekOda = [];
let kivalaszottUlesekVissza = [];
let maxPassengers = 1;
let childrens = 0
let isRoundTrip = false;

const fareClassNames = {
    1: { nev: 'First Class', badge: 'class-badge-first' },
    2: { nev: 'Business Class', badge: 'class-badge-business' },
    3: { nev: 'Economy Class', badge: 'class-badge-economy' }
};

$(document).ready(async function () {


    let getlocale = await getLocale();

    let language;

    let old_url = window.location.href.split("/")
    if (old_url[3].includes("helyfoglalas")) {
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


    let getseatchooser = await getSeatChooser(language);

    let params = new URLSearchParams(document.location.search);
    let flight_id_to = params.get("flight_id_to");
    let flight_id_back = params.get("flight_id_back");
    childrens = parseInt(params.get("children")) || 0;
    maxPassengers = (parseInt(params.get("adults")) || 1) + childrens;
    isRoundTrip = flight_id_back != null;

    // Odaut
    let odaAdatok = await getHelyek(flight_id_to, language);
    if (odaAdatok && odaAdatok.length > 0) {

        try {
            let $helyek = $('#helyek');

            $("#trip_to_title").text(`${getseatchooser.trip_to} - ${getseatchooser.page_title}`);
            $("#trip_to_selected_seats_title").text(`${getseatchooser.trip_to} - ${getseatchooser.selected_seats}`);
            $("#trip_to_no_seats_selected").text(getseatchooser.no_seats_selected);

            ulesek_general($helyek, odaAdatok, 'oda', getseatchooser);

            // Visszaut
            if (isRoundTrip) {
                $('#visszaut_section').show();
                $('#visszaut_card').show();
                let visszaAdatok = await getHelyek(flight_id_back, language);
                if (visszaAdatok && visszaAdatok.length > 0) {
                    let $helyekvissza = $('#helyekvissza');
                    $("#trip_back_title").text(`${getseatchooser.trip_back} - ${getseatchooser.page_title}`);
                    $("#trip_back_selected_seats_title").text(`${getseatchooser.trip_back} - ${getseatchooser.selected_seats}`);
                    $("#trip_back_no_seats_selected").text(getseatchooser.no_seats_selected);
                    ulesek_general($helyekvissza, visszaAdatok, 'vissza', getseatchooser);
                }
            } else {
                $('#visszaut_section').hide();
                $('#visszaut_card').hide();
            }

            $('#lefoglal').prop('disabled', true);
            frissitAllapot(getseatchooser);

            $('#lefoglal').click(function () {
                let flight_id_to = params.get("flight_id_to");
                let childleft = childrens;
                kivalaszottUlesekOda.forEach(async function (u) {
                    let isAdult;
                    if (childleft > 0) {
                        isAdult = 0;
                        childleft = childleft - 1;
                    }
                    else {
                        isAdult = 1;
                    }
                    if (u.hely.length > 2) {
                        await helyFoglal(flight_id_to, u.hely[0] + u.hely[1], u.hely[2], isAdult);
                    }
                    else {
                        await helyFoglal(flight_id_to, u.hely[0], u.hely[1], isAdult);
                    }
                    childleft--;
                });
                if (isRoundTrip) {
                    let flight_id_back = params.get("flight_id_back");
                    childleft = childrens;
                    kivalaszottUlesekVissza.forEach(async function (u) {
                        let isAdult;
                        if (childleft > 0) {
                            isAdult = 0;
                            childleft = childleft - 1;
                        }
                        else {
                            isAdult = 1;
                        }
                        if (u.hely.length > 2) {
                            await helyFoglal(flight_id_back, u.hely[0] + u.hely[1], u.hely[2], isAdult);
                        }
                        else {
                            await helyFoglal(flight_id_back, u.hely[0], u.hely[1], isAdult);
                        }
                    });
                }
                let osszesen = 0;
                kivalaszottUlesekOda.forEach(u => osszesen += u.ar);
                kivalaszottUlesekVissza.forEach(u => osszesen += u.ar);
                alert("Sikeres foglalás! 5 másodperc múlva átirányítunk.");
                setTimeout(function () {
                    window.location.replace(`/${language}`);
                }, 5000);
            });

            $("#sum_currency").html(getseatchooser.currency);
            $("#title_sum").text(getseatchooser.sum);

            $("#trips_frame").css("display", "");
        } catch (error) {
            errorHandler(error.message);
        }

    } else {
        let $frame = $("#frame");
        $frame.html("");
        let $error_div = $("<div>", {
            "class": "container min-vh-100 d-flex flex-column justify-content-evenly"
        });

        infoPageGenerator($error_div, getseatchooser.errors.not_logged_in);
        $frame.append($error_div);


        showLogin(language);

    }



});

async function helyFoglal(flightID, rowID, columnID, isAdult) {
    try {
        let vissza = await fetch("/api/helyfoglalas", {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ flightID, rowID, columnID, isAdult })
        });
        let json = await vissza.json();
        if (!json.siker) {
            throw new Error("Hiba a feltöltésben");
        }
        return json.siker;
    } catch (error) {
        console.log(error.message);
        return false;
    }
}

async function getHelyek(id, lang) {
    if (!id) {
        console.error("Nincs flight_id megadva");
        return null;
    }
    try {
        let vissza = await fetch("/api/helyfoglalas?id=" + id, { method: "GET", headers: { "Accept-Language": lang } });
        let json = await vissza.json();
        if (!json.helyek) {
            console.error(json.message || "Ismeretlen hiba");
            return null;
        }
        return json.helyek;
    } catch (error) {
        console.error(error.message);
        return null;
    }
}

// Ulesek legeneralasa
function ulesek_general(hova, adatok, irany, i18n_values) {
    if (!adatok || adatok.length === 0) {
        hova.append('<div class="alert alert-danger">Nem sikerült betölteni az ülőhelyeket.</div>');
        return;
    }
    let sorokszama = adatok[adatok.length - 1].RowID;
    for (let i = 0; i < sorokszama; i++) {
        let $sorDiv = $('<div class="d-flex justify-content-center mb-1"></div>');
        $sorDiv.append('<div class=sorszama>' + (i + 1) + '</div>');

        let x = i * 6;
        while (x < i * 6 + 6) {
            let ulesAdat = adatok[x];
            let ulesHelye = ulesAdat.RowID + ulesAdat.ColumnID;
            let ulesAra = ulesAdat.PriceInHUF;
            console.log(ulesAra)

            let $hely = $('<div class="ules tipus' + ulesAdat.FareClassID + '">' + ulesAdat.ColumnID + '</div>');
            if (ulesAdat.IsOccupied == 0) {
                $hely.click(function () {
                    let tomb = irany === 'oda' ? kivalaszottUlesekOda : kivalaszottUlesekVissza;

                    if ($hely.hasClass('kivalasztott')) {
                        $hely.removeClass('kivalasztott');
                        if (irany === 'oda') {
                            kivalaszottUlesekOda = kivalaszottUlesekOda.filter(u => u.hely != ulesHelye);
                        } else {
                            kivalaszottUlesekVissza = kivalaszottUlesekVissza.filter(u => u.hely != ulesHelye);
                        }
                    }
                    else {
                        if (tomb.length < maxPassengers) {
                            $hely.addClass('kivalasztott');
                            if (irany === 'oda') {
                                kivalaszottUlesekOda.push({ "hely": ulesHelye, "ar": ulesAra, "tipus": ulesAdat.FareClassID });
                            } else {
                                kivalaszottUlesekVissza.push({ "hely": ulesHelye, "ar": ulesAra, "tipus": ulesAdat.FareClassID });
                            }
                        }
                    }
                    frissitAllapot(i18n_values);
                })
            }
            else {
                $hely.removeClass('tipus1 tipus2 tipus3');
                $hely.addClass('lefoglalt')
                $hely.text('X');
            }

            $sorDiv.append($hely);
            if (ulesAdat.ColumnID == "C") {
                $sorDiv.append('<div class="folyoso"></div>')
            }
            x++;
        }
        hova.append($sorDiv);
    }
}

// Allapot frissitese
function frissitAllapot(i18n_values) {
    megjelenitKijeloltek($('#kivalasztottak_oda'), kivalaszottUlesekOda, i18n_values);
    if (isRoundTrip) {
        megjelenitKijeloltek($('#kivalasztottak_vissza'), kivalaszottUlesekVissza, i18n_values);
    }

    // Osszes ar
    let osszesen = 0;
    kivalaszottUlesekOda.forEach(u => osszesen += u.ar);
    kivalaszottUlesekVissza.forEach(u => osszesen += u.ar);
    $('#ar').text(osszesen);

    // Szamlalo
    $('#oda_szamlalo').text(kivalaszottUlesekOda.length + ' / ' + maxPassengers);
    if (isRoundTrip) {
        $('#vissza_szamlalo').text(kivalaszottUlesekVissza.length + ' / ' + maxPassengers);
    }

    // Lefoglalas gomb: pontosan num_of_passengers kell mindket iranyban
    let odaOk = kivalaszottUlesekOda.length === maxPassengers;
    let visszaOk = !isRoundTrip || kivalaszottUlesekVissza.length === maxPassengers;
    $('#lefoglal').prop('disabled', !(odaOk && visszaOk));
}

function megjelenitKijeloltek($lista, ulesek, i18n_values) {
    $lista.empty();
    if (ulesek.length == 0) {
        $lista.append(`<li class="list-group-item italic">${i18n_values.no_seats_selected}</li>`);
    }
    else {
        for (let i = 0; i < ulesek.length; i++) {
            let fc = fareClassNames[ulesek[i].tipus];
            $lista.append(
                '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                '<span>' + ulesek[i].hely + ` ${i18n_values.seat} <span class="` + fc.badge + '">' + fc.nev + '</span></span>' +
                '<span class="fw-bold">' + ulesek[i].ar + `${i18n_values.currency}</span>` +
                '</li>'
            );
        }
    }
}

function errorHandler(message, lang) {
    let $frame = $("#frame");
    $frame.html("");
    let $error_div = $("<div>", {
        "class": "container min-vh-100 d-flex flex-column justify-content-evenly"
    });

    errorPageGenerator($error_div, message);
    $frame.append($error_div);


    showLogin(lang);
}
