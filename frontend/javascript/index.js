document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('keret').appendChild(jaratok());
});

//Teszt adatok
var adatok = [
    {
        varos: 'Bécs',
        ar: 19990,
        idopont: 'Január',
        tipus: 'oda-vissza',
        kep: 'https://www.wien.info/resource/image/387880/Hero-Header/1890/700/99bc99f314f2cfc014d9379d6fb650c2/5D1B23B0089FB6614BA763C22BC03ECC/header-3840x1060px-wien-oben.webp'
    },
    {
        varos: 'Iráklio',
        ar: 35620,
        idopont: 'Június',
        tipus: 'Egyirányú',
        kep: 'https://blueskytravel.hu/uploads/6404ed8e4ccdd9e5be820525f61e86d4.jpg'
    },
    {
        varos: 'New York',
        ar: 275090,
        idopont: 'December',
        tipus: 'oda-vissza',
        kep: 'https://cdn.sanity.io/images/nxpteyfv/goguides/dd05bddc197a1c9dba9ecb43e26b30af4dbcf4f9-1600x1066.jpg'
    },
    {
        varos: 'Shanghai',
        ar: 430210,
        idopont: 'Augusztus',
        tipus: 'oda-vissza',
        kep: 'https://images.goway.com/production/featured_images/View-of-downtown-Shanghai-skyline-at-twilight-in-China%20_iStock-1031781438.jpg?VersionId=NAttsb7CpfztlS2leLO4tzRWWtlt2wRX'
    }
];

//Ajánlott járatok megjelenítése
function jaratok() {
    let sor = document.createElement('div');
    sor.classList.add('row', 'justify-content-center', 'g-3');
    for (let i = 0; i < adatok.length; i++) {
        let col = document.createElement('div');
        col.classList.add('col-6', 'col-md-4', 'col-lg-3');

        let card = document.createElement('div');
        card.classList.add('card', 'h-100', 'shadow-sm', 'bg-light');

        let kepkeret = document.createElement('div');
        kepkeret.classList.add('w-100', 'h-75', 'overflow-hidden');

        let img = document.createElement('img');
        img.src = adatok[i].kep;
        img.classList.add('card-img-top', 'object-fit-cover', 'h-100', 'w-100');
        kepkeret.appendChild(img);
        card.appendChild(kepkeret);

        let cardbody = document.createElement('div');
        cardbody.classList.add('card-body', 'd-flex', 'flex-column');

        let varosnev = document.createElement('h3');
        varosnev.innerText = adatok[i].varos;
        cardbody.appendChild(varosnev);

        let div = document.createElement('div');
        div.classList.add('row', 'justify-content-around', 'mt-auto', 'pt-2');

        let col7div = document.createElement('div');
        col7div.classList.add('col-sm-7');

        let belsosor = document.createElement('div');
        belsosor.classList.add('row');

        let divcol1 = document.createElement('div');
        divcol1.classList.add(
            'col-sm-10',
            'col-md-6',
            'col-lg-6',
            'd-flex',
            'align-items-center',
            'justify-content-center'
        );

        let mikor = document.createElement('p');
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
