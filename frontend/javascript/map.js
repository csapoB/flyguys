import { getNavbar } from "./locale.js";
import { getLocale } from "./locale.js";
import { getFooter } from "./locale.js";
import { getMap } from "./locale.js";
import { modalInit } from "./modal.js";
import { plannerMapInit } from "./plannermap.js";

$(async function () {

  let getlocale = await getLocale(); // megadja, hogy a böngésző nyelve magyar vagy angol (default) 

  let language;

  let old_url = window.location.href.split("/")
  if (old_url[3] == "map") {
    old_url.splice(3, 0, getlocale);
    let new_url = old_url.join("/")
    history.pushState({}, "", new_url);
    language = getlocale;

  } else {
    language = old_url[3];
  }

  (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
    key: "AIzaSyCGmwlN95_KmdNN5xAq2VO7qJCWSrNkuaA",
    v: "weekly",
    language: language
  });


  $("html").prop("lang", language);

  await initMap(language);

  await getNavbar(language, old_url);
  await modalInit(language);

  await plannerMapInit(language);

  await getFooter(language);

});

async function initMap(language) {

  const { Map } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");

  let map = new Map(document.getElementById("map"), {
    center: { lat: 47.31577891543344, lng: 19.98946307432514 },
    zoom: 5,
    mapId: '339ffbadd5c5008584bb6746',
    disableDefaultUI: true
  });

  let pins = (await (await fetch('/api/map_pins', { method: "GET", headers: { "Accept-Language": language } })).json()).pins;
  let getmap = await getMap(language);

  for (let i = 0; i < pins.length; i++) {
    let cordinates = pins[i].GeographicCoordinates.split(',').map(x => parseFloat(x));
    let origin_marker = new AdvancedMarkerElement({
      position: { lat: cordinates[0], lng: cordinates[1] },
      map: map
    });
    origin_marker.id = `marker_${i}`;
    origin_marker.tabIndex = -1;

    let contentString = $('<div>', {
      html: `<h2>${pins[i].CityName}</h2><p>(${pins[i].DepartureAirport})</p>`,
      class: 'pin-info'
    });

    let btn = $('<button>', {
      text: getmap.choose_button,
      class: 'pin-btn',
      on: {
        "click": () => {
          $("#origin_input").trigger("marker:click", [pins[i].DepartureAirport]);
          (bootstrap.Popover.getInstance(origin_marker)).hide();
        }
      }
    });

    contentString.append(btn);

    /*const markerElement = marker.element;

    // Add Bootstrap attributes (optional, or do it via JS)
    markerElement.setAttribute("data-bs-toggle", "popover");
    markerElement.setAttribute("data-bs-content", "This is a Bootstrap Popover on a Map Marker!");
    markerElement.setAttribute("title", "Marker Details");
    */
    let marker_popover = new bootstrap.Popover(origin_marker, {
      html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
      container: "body",
      content: contentString,
      placement: "top",
      trigger: "manual" // A popover mikor jelenjen meg. "manual": a fejlesztő írja meg hozzá a szabályrendszert
    });

    console.log(origin_marker);

    markerPopoverManualTrigger(origin_marker, marker_popover);
  }



}

function markerPopoverManualTrigger(marker, popover_obj) {
  let popover_div;
  let markers = document.getElementsByTagName("gmp-advanced-marker");

  marker.addEventListener("focus", function () {

    if (popover_obj.tip == null) {
      for (let i = 0; i < markers.length; i++) {
        (bootstrap.Popover.getInstance(markers[i])).hide();

      }
      popover_obj.show();
      popover_div = document.getElementById(popover_obj.tip.id); // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
      popover_div.tabIndex = -1; // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
      popover_div.addEventListener("blur", (event) => {

        if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
          popover_obj.hide();
          console.log(event.relatedTarget)

        } else {
          if (event.relatedTarget.id != marker.id) { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
            popover_obj.hide();
            console.log(event.relatedTarget)
          }
        }
      });
    }
  });


}


