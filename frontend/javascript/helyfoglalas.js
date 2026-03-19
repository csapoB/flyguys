import { getNavbar } from "./locale.js";
import { getLocale } from "./locale.js";
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

    let params = new URLSearchParams(document.location.search);
    let flight_id_to = params.get("flight_id_to");
    let flight_id_back = params.get("flight_id_back");
    childrens = parseInt(params.get("children")) || 0;
    maxPassengers = (parseInt(params.get("adults")) || 1) + childrens;
    isRoundTrip = flight_id_back != null;

    // Odaut
    let odaAdatok = await getHelyek(flight_id_to);
    if (odaAdatok && odaAdatok.length > 0) {
        ulesek_general($('#helyek'), odaAdatok, 'oda');
    }

    // Visszaut
    if (isRoundTrip) {
        $('#visszaut_section').show();
        $('#visszaut_card').show();
        let visszaAdatok = await getHelyek(flight_id_back);
        if (visszaAdatok && visszaAdatok.length > 0) {
            ulesek_general($('#helyekvissza'), visszaAdatok, 'vissza');
        }
    } else {
        $('#visszaut_section').hide();
        $('#visszaut_card').hide();
    }

    $('#lefoglal').prop('disabled', true);
    frissitAllapot();

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
    })
})

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

async function getHelyek(id) {
    if (!id) {
        console.error("Nincs flight_id megadva");
        return null;
    }
    try {
        let vissza = await fetch("/api/helyfoglalas?id=" + id, { method: "GET" });
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
function ulesek_general(hova, adatok, irany) {
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
            let ulesAra = ulesAdat.Price;

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
                    frissitAllapot();
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
function frissitAllapot() {
    megjelenitKijeloltek($('#kivalasztottak_oda'), kivalaszottUlesekOda);
    if (isRoundTrip) {
        megjelenitKijeloltek($('#kivalasztottak_vissza'), kivalaszottUlesekVissza);
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

function megjelenitKijeloltek($lista, ulesek) {
    $lista.empty();
    if (ulesek.length == 0) {
        $lista.append('<li class="list-group-item italic">Nincs kiválasztott hely!</li>');
    }
    else {
        for (let i = 0; i < ulesek.length; i++) {
            let fc = fareClassNames[ulesek[i].tipus];
            $lista.append(
                '<li class="list-group-item d-flex justify-content-between align-items-center">' +
                '<span>' + ulesek[i].hely + ' ülés <span class="' + fc.badge + '">' + fc.nev + '</span></span>' +
                '<span class="fw-bold">' + ulesek[i].ar + ' Ft</span>' +
                '</li>'
            );
        }
    }
}
