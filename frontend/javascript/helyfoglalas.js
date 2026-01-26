$(document).ready(function(){
    ulesek_general(tesztadatok);
})

let tesztadatok = [
    { "oszlop": "A", "sor": 1, "ar": 7500, "nagylab": true },
    { "oszlop": "B", "sor": 1, "ar": 7500, "nagylab": true },
    { "oszlop": "C", "sor": 1, "ar": 7500, "nagylab": true },
    { "oszlop": "D", "sor": 1, "ar": 7500, "nagylab": true },
    { "oszlop": "E", "sor": 1, "ar": 7500, "nagylab": true },
    { "oszlop": "F", "sor": 1, "ar": 7500, "nagylab": true },
    
    { "oszlop": "A", "sor": 2, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 2, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 2, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 2, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 2, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 2, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 3, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 3, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 3, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 3, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 3, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 3, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 4, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 4, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 4, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 4, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 4, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 4, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 5, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 5, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 5, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 5, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 5, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 5, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 6, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 6, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 6, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 6, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 6, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 6, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 7, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 7, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 7, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 7, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 7, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 7, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 8, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 8, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 8, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 8, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 8, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 8, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 9, "ar": 4500, "nagylab": false },
    { "oszlop": "B", "sor": 9, "ar": 4500, "nagylab": false },
    { "oszlop": "C", "sor": 9, "ar": 4500, "nagylab": false },
    { "oszlop": "D", "sor": 9, "ar": 4500, "nagylab": false },
    { "oszlop": "E", "sor": 9, "ar": 4500, "nagylab": false },
    { "oszlop": "F", "sor": 9, "ar": 4500, "nagylab": false },

    { "oszlop": "A", "sor": 10, "ar": 6500, "nagylab": true },
    { "oszlop": "B", "sor": 10, "ar": 6500, "nagylab": true },
    { "oszlop": "C", "sor": 10, "ar": 6500, "nagylab": true },
    { "oszlop": "D", "sor": 10, "ar": 6500, "nagylab": true },
    { "oszlop": "E", "sor": 10, "ar": 6500, "nagylab": true },
    { "oszlop": "F", "sor": 10, "ar": 6500, "nagylab": true }
];

let kivalaszottUlesek = [];

//Ülések legenerálása tesztadatok alapján
function ulesek_general(adatok){
    let sorokszama = adatok[adatok.length-1].sor;
    for (let i = 0; i < sorokszama; i++) {
        let $sorDiv = $('<div class="d-flex justify-content-center mb-1"></div>');
        $sorDiv.append('<div class=sorszama>'+(i+1)+'</div>');


        let x =i*6;
        while(x<i*6+6){
            let ulesAdat = adatok[x];
            let ulesHelye = (i+1)+ulesAdat.oszlop;
            let ulesAra = ulesAdat.ar

            let $hely;
            if (ulesAdat.nagylab) {
                $hely = $('<div class="ules nagylab">'+ulesAdat.oszlop+'</div>')
            }
            else{
                $hely = $('<div class="ules">'+ulesAdat.oszlop+'</div>')
            }
            $hely.click(function(){
                if ($hely.hasClass('kivalasztott')) {
                    $hely.removeClass('kivalasztott');
                    kivalaszottUlesek = kivalaszottUlesek.filter(u => u.hely != ulesHelye)
                }
                else{
                    $hely.addClass('kivalasztott');
                    kivalaszottUlesek.push({"hely": ulesHelye, "ar": ulesAra})
                }
                megjelenitKijeloltek();
            })
            $sorDiv.append($hely);
            if (ulesAdat.oszlop =="C") {
                $sorDiv.append('<div class="folyoso"></div>')
            }
            x++;
        }
        $('#helyek').append($sorDiv);
    }
}

//A kiválaszottak ul lista lenullázása majd visszatöltése a jelenleg kiválaszottak alapján vagy ha nincs kiválasztva akkor azt írja bele
function megjelenitKijeloltek(){
    let $lista = $('#kivalasztottak');
    let osszesen = 0;
    $lista.empty();

    if (kivalaszottUlesek.length==0) {
        $lista.append('<li class="list-group-item italic">Nincs kiválasztott hely!</li>');
        $('#lefoglal').prop('disabled', true);
    }
    else{
        for (let i = 0; i < kivalaszottUlesek.length; i++) {
            $lista.append('<li class="list-group-item d-flex justify-content-between"><span>'+kivalaszottUlesek[i].hely+' ülés</span><span>'+kivalaszottUlesek[i].ar+' Ft</span></li>')
            osszesen+=kivalaszottUlesek[i].ar
        }
        $('#lefoglal').prop('disabled', false);
    }
    $('#ar').text(osszesen);
}