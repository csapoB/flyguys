document.addEventListener("DOMContentLoaded", function(){
    const box = document.getElementById("box");

    const cim = document.createElement("div");
    cim.classList.add("magazin-cim");
    cim.innerHTML = `
        <h1>FlyGuys Magazin</h1>
        <p class="subtitle">Válassz prémium termékek közül utazásod alatt</p>
    `;
    box.appendChild(cim);

    const grid = document.createElement("div");
    grid.classList.add("magazin-grid");

    const sor = document.createElement("div");
    sor.classList.add("row", "g-4");
    grid.appendChild(sor);

    tesztadatok.forEach(function(termek) {
        sor.appendChild(keszitsKartyat(termek));
    });

    box.appendChild(grid);
});

let tesztadatok = [
    {
        "nev": "Hugo Boss Parfüm 60ml",
        "leiras": "Prémium márkás parfüm akár 24 órán keresztül is tartós",
        "kep": "https://www.embarkperfumes.com/cdn/shop/articles/Untitled_design_84.jpg?v=1764662860",
        "ar": 29990
    },
    {
        "nev": "Telefontok",
        "leiras": "Iphone 17 pro max telefontok",
        "kep": "https://black-gifts.com/cdn/shop/articles/5-best-black-artist-phone-cases-to-rep-your-style-418175_800x.webp?v=1764065748",
        "ar": 15670
    },
    {
        "nev": "Popcorn",
        "leiras": "finom nasi",
        "kep": "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_auto,w_800,h_400/tk%2Fphoto%2F2025%2F12-2025%2F2025-12-furikake-popcorn%2Ffurikake-popcorn-332",
        "ar": 1250
    },
    {
        "nev": "Coca Cola",
        "leiras": "Eredeti íz",
        "kep": "https://assets.superhivemarket.com/store/product/153344/image/xlarge-7d055f9090cbd76e9b0066810f54a7f2.png",
        "ar": 990
    },
    {
        "nev": "zajszűrős füllhalgató",
        "leiras": "Zárd ki a környezeted és hallgasd a saját gondolataid",
        "kep": "https://images.yourstory.com/cs/2/70651a302d6d11e9aa979329348d4c3e/Image87zr-1591971382780.jpg?fm=png&auto=format&blur=500",
        "ar": 29990
    },
    {
        "nev": "FlyGuys kulcstartó",
        "leiras": "Dobd fel a kulcs csomódat",
        "kep": "css/images/flyguys_kulcstarto.png",
        "ar": 15670
    },
    {
        "nev": "Rolex karóra",
        "leiras": "Emeld új szintre a megjelenésed",
        "kep": "https://emirateswoman.com/wp-content/uploads/2019/07/rolex-watch.jpg",
        "ar": 6265000
    },
    {
        "nev": "Szendvics",
        "leiras": "Ízletes csirkés szendvics",
        "kep": "https://www.longos.com/media/800x999/PeamealBaconAndCheddarSandwiches_Recipe_1280x640.jpg",
        "ar": 990
    },
    {
        "nev": "hűtőmágnes",
        "leiras": "Vigyél magaddal egy emléket a látogatott országból",
        "kep": "https://thumbs.dreamstime.com/b/usa-magnets-new-york-san-francisco-yellow-background-travel-destination-america-181020807.jpg",
        "ar": 3500
    }
];

function keszitsKartyat(termek) {
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
    ar.textContent = termek.ar.toLocaleString("hu-HU") + " Ft";

    body.appendChild(nev);
    body.appendChild(leiras);
    body.appendChild(ar);

    kartya.appendChild(kepKeret);
    kartya.appendChild(body);
    col.appendChild(kartya);

    return col;
}
