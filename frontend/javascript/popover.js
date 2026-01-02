// DOMContentLoaded
$( function() {

    /* 
    Tömb elemei:
        0 - Beviteli_mező azonosítója
        1 - Popover tartalma
        2 - Popover objektum
    */
    let origin = origin_popoverInit("origin_input", "origin_popover");
    popoverManualTrigger(origin[0].get(0), origin[1]);
    let destination = departure_popoverInit("destination_input", "destination_popover");
    popoverManualTrigger(destination[0].get(0), destination[1]);
    
    $("#departure_input").datepicker();
  
    $("#return_input").datepicker();
    
    let passengers = passengers_popoverInit("passengers_input", "passengers_popover");
    popoverManualTrigger(passengers[0].get(0), passengers[1]);

});
// origin_popover létrehozója
function origin_popoverInit(input_field_id, content_div_id) {

    let $input_field = $("#" + input_field_id);
    //let popover_content = document.getElementById(popover_content_id);
    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: "body",
        content: origin_popover_contentTemplate(content_div_id),
        placement: "bottom",
        trigger: "manual"
    });

    return [$input_field, popover];
}
// departure_popover létrehozója
function departure_popoverInit(input_field_id, content_div_id) {

    let $input_field = $("#" + input_field_id);
    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: "body",
        content: origin_popover_contentTemplate(content_div_id), // egyelőre csak teszt jelleggel (késöbb valószínűleg saját függvényt kap)
        placement: "bottom",
        trigger: "manual"
    });

    return [$input_field, popover];
}

function passengers_popoverInit(input_field_id, content_div_id) {

    let $input_field = $("#" + input_field_id);
    let popover = new bootstrap.Popover($input_field, {
        html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
        container: "body",
        content: passengers_popover_contentTemplate(content_div_id),
        placement: "bottom",
        trigger: "manual"
    });

    return [$input_field, popover];
}

// Eseménykezelő a beviteli mezőhöz, valamint a popoverhez
function popoverManualTrigger(input_field, popover_obj) {
    let popover_div;
    input_field.addEventListener("click", function () { 
       
    if (popover_obj.tip == null){
       
        popover_obj.show();
        
        popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
        popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
        popover_div.addEventListener("blur", (event) => {
            
            if (event.relatedTarget == null){ // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                popover_obj.hide();
            } else {
                if (event.relatedTarget.id != input_field.id) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                popover_obj.hide();
                }
            }
        });
       }
    });
    input_field.addEventListener("blur", (event) => {
        
        if (event.relatedTarget == null){ // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
                popover_obj.hide();
        } else {
            if (event.relatedTarget.id != popover_div.id) { // Ha nem a popover_divbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
                popover_obj.hide();
            }
        }
    });
}

// Template a popover tartlmához
function origin_popover_contentTemplate(content_div_id) {
    
    let $popover_content = $("<div>", {
        "id" : content_div_id
    });

    originTemp($popover_content);

    return $popover_content;
}

function passengers_popover_contentTemplate(content_div_id) {
    
    let $popover_content = $("<div>", {
        "id" : content_div_id
    });

    passengersTemp($popover_content);

    return $popover_content;
}

// Kiindulási országok, illetve repülőterek. Kizárólag tesztélésre van használva, a végleges verzióban nem fog szerepelni
function originTemp(content_div) {
    let flag_for_country;
    let countries = ["Magyarország", "Németország", "Egyesült Királyság ", "Olaszország", "Franciaország", "Svájc", "Finnország", "Románia"];
    let airports = ["Budapest", "Frankfurt", "London", "Milánó"];

    for (let i = 0; i < countries.length; i++) {
        let $div = $("<div>",{
            "class" : "mt-2 pb-3 pt-2 mb-2 border-bottom"
        });
        let $span = $("<span>", {
            "class" : "pt-2 ps-2 pb-2 pe-2",
            "text" : countries[i]
        });
        $div.append($span);
        $span.css({userSelect : "none"});
        
        $div.on("click", function (){
            let $thisDiv = $(this);
        
            if (flag_for_country != undefined && $thisDiv.index() != flag_for_country){
                
                $thisDiv.parent().children("div").eq(flag_for_country).children().first().removeClass("rounded-pill bg-danger text-light");

            }
            
            flag_for_country = $thisDiv.index();

            $thisDiv.children("span").first().addClass("rounded-pill bg-danger text-light");
        });
        content_div.append($div);
           
    }

}

// A passenger popover tartalmának kialakításáért felel
function passengersTemp(content_div) {

        let $adults_div = $("<div>", {
            "class" : "mt-2 pb-3 pt-2 mb-2 border-bottom"
        });

        let $label_adults = $("<span>", {
            "class" : "me-2",
            "text" : "Felnőttek:"
        });

        let $minus_adult = $("<span>", {
            "class" : "text-danger",
            "html" : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
            on : {
                "click" : function () {
                    // A felnőttek számát csökkenti egyel, ha nagyobb, mint 0
                    let serv = parseInt($("#counter_adults").text());
                    if (serv > 0){
                        serv--;
                        $("#counter_adults").text(serv);
                        $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");

                    }
                }
            }
        });

        let $counter_adults = $("<span>", {
            "id" : "counter_adults",
            "class" : "ms-1 me-1",
            "text" : "0"
        });

        let $plus_adult = $("<span>", {
            "class" : "text-danger",
            "html" : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
            on : {
                "click" : function () {
                    // A felnőttek számát növeli egyel, ha kisebb vagy egyenlő, mint 16
                    let serv = parseInt($("#counter_adults").text());
                    if (serv <= 16) {
                        serv++;
                        $("#counter_adults").text(serv);
                        $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                    }

                }
            }
        });

        $adults_div.append($label_adults);
        $adults_div.append($minus_adult);
        $adults_div.append($counter_adults);
        $adults_div.append($plus_adult);


        let $children_div = $("<div>", {
            "class" : "mt-2 pb-3 pt-2 mb-2"
        });

        let $label_children = $("<span>", {
            "class" : "me-2",
            "text" : "Gyerekek:"
        });

        let $minus_child = $("<span>", {
            "class" : "text-danger",
            "html" : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-dash-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M4.5 7.5a.5.5 0 0 0 0 1h7a.5.5 0 0 0 0-1z\"/></svg>",
            on : {
                "click" : function () {
                    // a gyerekek számát csökkenti egyel, ha nagyobb, mint 0
                    let serv = parseInt($("#counter_children").text());
                    if (serv > 0){
                        serv--;
                        $("#counter_children").text(serv);
                        $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                    }
                }
            }
        });

        let $counter_children = $("<span>", {
            "id" : "counter_children",
            "class" : "ms-1 me-1",
            "text" : "0"
        });

        let $plus_child = $("<span>", {
            "class" : "text-danger",
            "html" : "<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"16\" height=\"16\" fill=\"currentColor\" class=\"bi bi-plus-circle-fill\" viewBox=\"0 0 16 16\"><path d=\"M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M8.5 4.5a.5.5 0 0 0-1 0v3h-3a.5.5 0 0 0 0 1h3v3a.5.5 0 0 0 1 0v-3h3a.5.5 0 0 0 0-1h-3z\"/></svg>",
            on : {
                "click" : function () {
                    // a gyerekek számát növeli egyel, ha kisebb vagy egyenlő, mint 16
                    let serv = parseInt($("#counter_children").text());
                    if (serv <= 16) {
                        serv++;
                        $("#counter_children").text(serv);
                        $("#passengers_input").attr("value", $("#counter_adults").text() + " felnőtt, " + $("#counter_children").text() + " gyermek");
                    }
                }
            }
        });

        $children_div.append($label_children);
        $children_div.append($minus_child);
        $children_div.append($counter_children);
        $children_div.append($plus_child);


        content_div.append($adults_div);
        content_div.append($children_div);
           
    

}

