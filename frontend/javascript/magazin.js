document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("box").appendChild(general(tesztadatok))
})

let tesztadatok = 
    [
        {
            "nev": "Hugo Boss Parfüm 60ml",
            "leiras": "Prémium márkás parfüm akár 24 órán keresztül is tartós",
            "kep": "https://fimgs.net/mdimg/secundar/o.51094.jpg",
            "ar": 29990
        },
        {
            "nev": "Telefontok",
            "leiras": "Iphone 17 pro max telefontok",
            "kep": "https://siaifon.com/userfiles/productlargeimages/product_36270.jpg",
            "ar": 15670
        },
        {
            "nev": "Ropi",
            "leiras": "finom nasi",
            "kep": "https://tse1.mm.bing.net/th/id/OIP.xsMFcVwVNQGUjTAumGFkUwHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
            "ar": 1250
        },
        {
            "nev": "Coca Cola",
            "leiras": "Eredeti íz",
            "kep": "https://images.heb.com/is/image/HEBGrocery/000862949",
            "ar": 990
        },
        {
            "nev": "Hugo Boss Parfüm 60ml",
            "leiras": "Prémium márkás parfüm akár 24 órán keresztül is tartós",
            "kep": "https://fimgs.net/mdimg/secundar/o.51094.jpg",
            "ar": 29990
        },
        {
            "nev": "Telefontok",
            "leiras": "Iphone 17 pro max telefontok",
            "kep": "https://siaifon.com/userfiles/productlargeimages/product_36270.jpg",
            "ar": 15670
        },
        {
            "nev": "Ropi",
            "leiras": "finom nasi",
            "kep": "https://tse1.mm.bing.net/th/id/OIP.xsMFcVwVNQGUjTAumGFkUwHaHa?cb=ucfimg2&ucfimg=1&rs=1&pid=ImgDetMain&o=7&rm=3",
            "ar": 1250
        },
        {
            "nev": "Coca Cola",
            "leiras": "Eredeti íz",
            "kep": "https://images.heb.com/is/image/HEBGrocery/000862949",
            "ar": 990
        }
    ]

function general(adatok){
    let keret = document.createElement("div");

    let i = 0;
    let sorok = 0;

    while(i<adatok.length){
        let sor = document.createElement("div");
        sor.classList.add('row', 'g-4', 'mb-4');

        let elemekszama;
        let elemekmerete;

        if (sorok %2==0) {
            elemekszama = 3;
            elemekmerete = 'col-md-4';
        }
        else{
            elemekszama = 2;
            elemekmerete = 'col-md-6';
        }

        for (let j = 0; j < elemekszama && i<adatok.length; j++) {
            let elem = document.createElement('div');
            elem.classList.add('col-12', elemekmerete);

            let kartya = document.createElement('div');
            kartya.classList.add('card', 'h-100');
            kartya.style.borderColor = "#A4161A";

            let flexkeret = document.createElement('div');
            flexkeret.classList.add('d-flex', 'flex-column', 'flex-md-row');

            let kepkeret = document.createElement('div');
            if (elemekszama==2) {
                kepkeret.classList.add('col-12', 'col-md-6', 'flex-shrink-0');
            }
            else{
                kepkeret.classList.add('col-12', 'col-md-4', 'flex-shrink-0');
            }

            let kep = document.createElement('img');
            kep.src = adatok[i].kep;
            kep.classList.add('card-img-left');

            kepkeret.appendChild(kep);
            flexkeret.appendChild(kepkeret);
            
            let szovegkeret = document.createElement('div');
            if (elemekszama==2) {
                szovegkeret.classList.add('col-12', 'col-md-6');
            }
            else{
                szovegkeret.classList.add('col-12', 'col-md-8');
            }

            let szovegdoboz = document.createElement('div');
            szovegdoboz.classList.add('card-body', 'd-flex', 'flex-column', 'h-100');

            let neve = document.createElement('h3');
            neve.classList.add('card-title');
            neve.innerHTML=adatok[i].nev;
            neve.style.color = "#660708";

            let leirasa = document.createElement('p');
            leirasa.classList.add('card-text');
            leirasa.innerHTML=adatok[i].leiras;

            let ara = document.createElement('h4');
            ara.classList.add('mt-auto');
            ara.innerHTML=adatok[i].ar + " Ft";
            ara.style.color = "#0b090a";

            szovegdoboz.appendChild(neve);
            szovegdoboz.appendChild(leirasa);
            szovegdoboz.appendChild(ara);
            szovegkeret.appendChild(szovegdoboz);
            flexkeret.appendChild(szovegkeret);
            kartya.appendChild(flexkeret);

            elem.appendChild(kartya);

            sor.appendChild(elem);
            i++;
        }
        keret.appendChild(sor);
        sorok++;
    }
    return keret;
}