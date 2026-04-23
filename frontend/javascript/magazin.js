import { getMagazine } from "./locale.js";
import { initI18n, errorPageGenerator } from "./toolbox.js";

document.addEventListener("DOMContentLoaded", async function () {

    let language;
    try {
        language = await initI18n("magazine");
        let getmagazine = await getMagazine(language);

        $(document).prop('title', `${getmagazine.title}`);

        if (language != "hu") {
            let current_eur_exch_rate;

            try {
                current_eur_exch_rate = (await (await fetch("https://api.frankfurter.dev/v1/latest?base=HUF&symbols=EUR", { method: "GET" })).json()).rates.EUR;
            } catch {
                current_eur_exch_rate = 0.00259;
            }

            for (const key in getmagazine.product.price) {
                getmagazine.product.price[key] = Math.round(getmagazine.product.price[key] * current_eur_exch_rate);

            }
        }

        let tesztadatok = [
            {
                "nev": getmagazine.product.name.hugo_boss_perfume,
                "leiras": getmagazine.product.caption.hugo_boss_perfume,
                "kep": "https://www.embarkperfumes.com/cdn/shop/articles/Untitled_design_84.jpg?v=1764662860",
                "ar": getmagazine.product.price.hugo_boss_perfume
            },
            {
                "nev": getmagazine.product.name.phone_case_iphone_17_pro_max,
                "leiras": getmagazine.product.caption.phone_case_iphone_17_pro_max,
                "kep": "https://black-gifts.com/cdn/shop/articles/5-best-black-artist-phone-cases-to-rep-your-style-418175_800x.webp?v=1764065748",
                "ar": getmagazine.product.price.phone_case_iphone_17_pro_max
            },
            {
                "nev": getmagazine.product.name.popcorn,
                "leiras": getmagazine.product.caption.popcorn,
                "kep": "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_auto,w_800,h_400/tk%2Fphoto%2F2025%2F12-2025%2F2025-12-furikake-popcorn%2Ffurikake-popcorn-332",
                "ar": getmagazine.product.price.popcorn
            },
            {
                "nev": getmagazine.product.name.coca_cola,
                "leiras": getmagazine.product.caption.coca_cola,
                "kep": "https://assets.superhivemarket.com/store/product/153344/image/xlarge-7d055f9090cbd76e9b0066810f54a7f2.png",
                "ar": getmagazine.product.price.coca_cola
            },
            {
                "nev": getmagazine.product.name.noise_canceling_airpods,
                "leiras": getmagazine.product.caption.noise_canceling_airpods,
                "kep": "https://images.yourstory.com/cs/2/70651a302d6d11e9aa979329348d4c3e/Image87zr-1591971382780.jpg?fm=png&auto=format&blur=500",
                "ar": getmagazine.product.price.noise_canceling_airpods
            },
            {
                "nev": getmagazine.product.name.flyguys_keychain,
                "leiras": getmagazine.product.caption.flyguys_keychain,
                "kep": "../css/images/flyguys_kulcstarto.png",
                "ar": getmagazine.product.price.flyguys_keychain
            },
            {
                "nev": getmagazine.product.name.rolex_watch,
                "leiras": getmagazine.product.caption.rolex_watch,
                "kep": "https://emirateswoman.com/wp-content/uploads/2019/07/rolex-watch.jpg",
                "ar": getmagazine.product.price.rolex_watch
            },
            {
                "nev": getmagazine.product.name.sandwich,
                "leiras": getmagazine.product.caption.sandwich,
                "kep": "https://www.longos.com/media/800x999/PeamealBaconAndCheddarSandwiches_Recipe_1280x640.jpg",
                "ar": getmagazine.product.price.sandwich
            },
            {
                "nev": getmagazine.product.name.fridge_magnet,
                "leiras": getmagazine.product.caption.fridge_magnet,
                "kep": "https://thumbs.dreamstime.com/b/usa-magnets-new-york-san-francisco-yellow-background-travel-destination-america-181020807.jpg",
                "ar": getmagazine.product.price.fridge_magnet
            }
        ];

        const box = document.getElementById("box");

        const cim = document.createElement("div");
        cim.classList.add("magazin-cim");
        cim.innerHTML = `
        <h1>${getmagazine.title}</h1>
        <p class="subtitle">${getmagazine.subtitle}</p>
    `;
        box.appendChild(cim);

        const grid = document.createElement("div");
        grid.classList.add("magazin-grid");

        const sor = document.createElement("div");
        sor.classList.add("row", "g-4");
        grid.appendChild(sor);

        tesztadatok.forEach(function (termek) {
            sor.appendChild(keszitsKartyat(termek, getmagazine));
        });

        box.appendChild(grid);

    } catch (error) {
        let $box = $("#box");
        $box.html("");
        console.error(error);
        errorPageGenerator($box, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
    }
});

function keszitsKartyat(termek, i18n_values) {
    const col = document.createElement("div");
    col.classList.add("col-12", "col-sm-6", "col-lg-4");

    const kartya = document.createElement("div");
    kartya.classList.add("mag-card", "d-flex", "flex-column");

    const kepKeret = document.createElement("div");
    kepKeret.classList.add("mag-card-img");

    const kep = document.createElement("img");
    kep.src = termek.kep;
    kep.alt = termek.nev;
    kepKeret.appendChild(kep);

    const body = document.createElement("div");
    body.classList.add("mag-card-body", "d-flex", "flex-column", "flex-grow-1");

    const nev = document.createElement("h3");
    nev.classList.add("mag-card-title");
    nev.textContent = termek.nev;

    const leiras = document.createElement("p");
    leiras.classList.add("mag-card-desc");
    leiras.textContent = termek.leiras;

    const ar = document.createElement("p");
    ar.classList.add("mag-card-price");
    ar.textContent = termek.ar.toLocaleString("hu-HU") + ` ${i18n_values.currency}`;

    body.appendChild(nev);
    body.appendChild(leiras);
    body.appendChild(ar);

    kartya.appendChild(kepKeret);
    kartya.appendChild(body);
    col.appendChild(kartya);

    return col;
}
