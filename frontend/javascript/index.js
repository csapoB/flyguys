import { getNavbar } from "./locale.js";
import { getFooter } from "./locale.js";
import { getLocale } from "./locale.js";
import { plannerInit } from "./planner.js";
import { modalInit } from "./modal.js";

$(async function () {
 
    let getlocale = await getLocale(); // megadja, hogy a böngésző nyelve magyar vagy angol (default) 

    let language;

    let url_splitted = window.location.href.split("/");
    if (url_splitted[3] == "") {
        
        history.pushState({}, "", `/${getlocale}`);
        language = getlocale;
        
                
    } else {

        language = url_splitted[3];
    }


    $("html").prop("lang", language);

    await getNavbar(language, url_splitted);
    await modalInit(language);

    await getFooter(language);
    
    await plannerInit(language);

    $("#keret").append(initCheapestFlights((await (await fetch("/api/cheapestflights", {method : "GET", headers: {"Accept-Language": language}})).json()).results));
});

//Ajánlott járatok megjelenítése
function initCheapestFlights(flights) {
    let $sor = $("<div>", {
        "class" : "row justify-content-center g-3"
    });
    
    for (let i = 0; i < flights.one_way.length; i++) {
        let $col = $("<div>", {
            "class" : "col-6 col-md-4 col-lg-3"
        });

        let $card = $("<div>", {
            "class" : "card h-100 shadow-sm bg-light"
        });

        let $kepkeret = $("<div>", {
            "class" : "w-100 h-75 overflow-hidden"
        });

        let $img = $("<img/>", {
            "class" : "card-img-top object-fit-cover h-100 w-100",
            "src" : `../css/images/${flights.one_way[i].ArrivalAirport}.png`
        });
        $kepkeret.append($img);
        $card.append($kepkeret);

        let $cardbody = $("<div>", {
            "class" : "card-body d-flex flex-column"
        });

        let $varosnev = $('<h3>', {
            "text" : `${flights.one_way[i].ArrivalCity}`
        });
        
        $cardbody.append($varosnev);

        let $div = $("<div>", {
            "class" : "row justify-content-around mt-auto pt-2"
        });

        let $col7div = $('<div>', {
            "class" : "col-sm-7"
        });
        

        let $belsosor = $("<div>", {
            "class" : "row"
        });

        let $divcol1 = $("<div>", {
            "class" : "col-sm-10 col-md-6 col-lg-6 d-flex align-items-center justify-content-center"
        });

        let $mikor = $("<p>", {
            "text" : ""
        });
        mikor.innerText = adatok[i].idopont;
        mikor.classList.add('text-nowrap', 'fs-6');
        divcol1.appendChild(mikor);

        belsosor.appendChild(divcol1);

        let divcol2 = document.createElement('div');
        divcol2.classList.add(
            'col-sm-10',
            'col-md-6',
            'col-lg-6',
            'd-flex',
            'align-items-center',
            'justify-content-center'
        );

        let tipusu = document.createElement('p');
        tipusu.innerText = adatok[i].tipus;
        tipusu.classList.add('text-nowrap', 'fs-6');
        divcol2.appendChild(tipusu);

        belsosor.appendChild(divcol2);
        col7div.appendChild(belsosor);
        div.appendChild(col7div);

        let divcol3 = document.createElement('div');
        divcol3.classList.add('col-sm-5', 'd-flex', 'align-items-center', 'justify-content-center');

        let arszoveg = document.createElement('h2');
        arszoveg.classList.add('no-wrap', 'fs-5');
        arszoveg.innerText = adatok[i].ar + ' Ft';
        divcol3.appendChild(arszoveg);
        div.appendChild(divcol3);
        cardbody.appendChild(div);
        card.appendChild(cardbody);
        col.appendChild(card);
        sor.appendChild(col);
    }
    return sor;
}
