import { getFooter, getMap } from "./locale.js";
import { plannerMapInit } from "./plannermap.js";
import { plannerResizer } from "./plannerresizer.js";
import { initI18n, errorPageGenerator } from "./toolbox.js";

$(async function () {

  let language;

  try {

    language = await initI18n("map");

    let getmap = await getMap(language);

    let $map_frame = $("#map_frame");
    let $map = $("<div>", {
      "id": "map",
      "class" : "container mb-2 border border-2 border-danger rounded w-100"
    });
    $map_frame.append($map);

    try {
      (g => { var h, a, k, p = "The Google Maps JavaScript API", c = "google", l = "importLibrary", q = "__ib__", m = document, b = window; b = b[c] || (b[c] = {}); var d = b.maps || (b.maps = {}), r = new Set, e = new URLSearchParams, u = () => h || (h = new Promise(async (f, n) => { await (a = m.createElement("script")); e.set("libraries", [...r] + ""); for (k in g) e.set(k.replace(/[A-Z]/g, t => "_" + t[0].toLowerCase()), g[k]); e.set("callback", c + ".maps." + q); a.src = `https://maps.${c}apis.com/maps/api/js?` + e; d[q] = f; a.onerror = () => h = n(Error(p + " could not load.")); a.nonce = m.querySelector("script[nonce]")?.nonce || ""; m.head.append(a) })); d[l] ? console.warn(p + " only loads once. Ignoring:", g) : d[l] = (f, ...n) => r.add(f) && u().then(() => d[l](f, ...n)) })({
        key: "API_KEY",
        v: "weekly",
        language: language
      });

      await initMap(language, getmap);

      $map.css("width", "60vw");
      $map.css("height", "60vh");

    } catch (error) {
      $map_frame.addClass("d-flex justify-content-center")
      $map.removeClass("w-100")
      $map.addClass("row p-2");
      console.error(error);
      errorPageGenerator($map, getmap.error.map_not_loaded);
    }

    $(document).prop('title', `${getmap.title}`);

    await plannerMapInit(language);

    plannerResizer();

    await getFooter(language);

  } catch (error) {
    let $keret = $("#keret");
    if ($keret.children().length == 2) {
      $keret.children().eq(1).remove();
    }
    console.error(error);
    errorPageGenerator($keret, (await (await fetch("/api/geterrors", { method: "GET", headers: { "Accept-Language": language } })).json()).errors.client_error);
  }

});

async function initMap(language, i18n_values) {
  /* 
  Tömb elemei:
      0 - marker objektum
      1 - a markerből képzett jquery objektum
  */
  let origin_markers = [];
  let destination_markers = [];
  const { Map } = await google.maps.importLibrary("maps");

  let map = new Map(document.getElementById("map"), {
    center: { lat: 47.31577891543344, lng: 19.98946307432514 },
    zoom: 5,
    mapId: '339ffbadd5c50085b5c8ffb2',
    disableDefaultUI: true
  });

  let $map = $("#map");

  let flightPath = new google.maps.Polyline({

    strokeColor: '#dc3545',
    strokeOpacity: 1.0,
    strokeWeight: 3
  });

  $map.on("map:factory-reset", function (event, departureDate, wasPreviousArrivalAirport) {
    if (!wasPreviousArrivalAirport) {
      deleteMarkers(destination_markers);
    }

    updateOriginMapMarkers(origin_markers, map, language, departureDate);
  });
  $map.on("map:reset", function (event, departureDate, departureAirport) {
    deleteMarkers(destination_markers);
    console.log(departureAirport);
    console.log(departureDate)
    if (departureAirport != "") {
      updateArrivalMapMarkers(destination_markers, map, language, departureAirport, departureDate);
    }
    flightPath.setPath([]);
  });
  $map.on("map:origin-selected", function (event, departureDate, departureAirport, arrivalAirport) {

    let i = 0;
    while (origin_markers[i][0].dataset.code != departureAirport) {
      i++;
    }
    deleteMarkersWithException(origin_markers, origin_markers[i][0]);
    origin_markers[i][0].setMap(map);
    if (arrivalAirport != "") {

      let j = 0;
      while (destination_markers[j][0].dataset.code != arrivalAirport) {
        j++;
      }

      flightPath.setPath([origin_markers[i][0].position, destination_markers[j][0].position]);
    } else {
      updateArrivalMapMarkers(destination_markers, map, language, departureAirport, departureDate);
    }
  });
  $map.on("map:destination-selected", function (event, arrivalAirport, departureAirport) {
    let i = 0;
    while (destination_markers[i][0].dataset.code != arrivalAirport) {
      i++;
    }
    deleteMarkersWithException(destination_markers, destination_markers[i][0]);
    destination_markers[i][0].setMap(map);

    let j = 0;
    while (origin_markers[j][0].dataset.code != departureAirport) {
      j++;
    }

    flightPath.setPath([origin_markers[j][0].position, destination_markers[i][0].position]);

    flightPath.setMap(map);
  });
  $map.on("map:departure-changed", function (event, departureDate, departureAirport, arrivalAirport) {
    if (departureAirport == "") {
      deleteMarkers(origin_markers);
      updateOriginMapMarkers(origin_markers, map, language, departureDate);
    } else {
      if (arrivalAirport == "") {
        deleteMarkers(destination_markers);
        updateArrivalMapMarkers(destination_markers, map, language, departureAirport, departureDate);
      }
    }
  });

  $map.on("map:swapper-clicked", function (event, departureAirport, arrivalAirport) {
    let i = 0;
    while (origin_markers[i][0].dataset.code != arrivalAirport) {
      i++;
    }
    deleteMarker(origin_markers[i][0]);

    let j = 0;
    while (destination_markers[j][0].dataset.code != departureAirport) {
      j++;
    }
    deleteMarker(destination_markers[j][0]);

    let k = 0;
    while (origin_markers[k][0].dataset.code != departureAirport) {
      k++;
    }
    console.log(origin_markers[k][0].dataset.code)
    reviveMarker(origin_markers[k][0], map);

    let l = 0;
    while (destination_markers[l][0].dataset.code != arrivalAirport) {
      l++;
    }
    console.log(destination_markers[l][0].dataset.code)
    reviveMarker(destination_markers[l][0], map);
  });

  // /api/availabledepartureairportsfiltered
  initMapMarkers("/api/availabledepartureairportsfiltered", "origin", origin_markers, map, language, { glyphColor: '#FFFFFF', borderColor: '#dc3545', background: '#dc3545' }, i18n_values);
  initMapMarkers("/api/availablearrivalairportsfiltered", "destination", destination_markers, null, language, { glyphColor: '#dc3545', borderColor: '#dc3545', background: '#D1D1D1' }, i18n_values);

}

async function initMapMarkers(api, input_name, markers_array, map, language, custom_pin_obj, i18n_values) {

  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  let pins = (await (await fetch(`${api}`, { method: "GET", headers: { "Accept-Language": language } })).json()).results;

  for (let i = 0; i < pins.length; i++) {
    let cordinates = pins[i].GeographicCoordinates.split(',').map(x => parseFloat(x));
    let marker = new AdvancedMarkerElement({
      position: { lat: cordinates[0], lng: cordinates[1] },
      map: map
    });
    marker.id = `${input_name}_marker_` + i;
    marker.tabIndex = -1;

    let custom_pin = new PinElement(custom_pin_obj);
    marker.append(custom_pin);
    marker.dataset.code = pins[i].AirportCode

    let $marker = $(marker);

    let $contentString = $('<div>', {
      html: `<img src="../css/images/${pins[i].AirportCode}.png" class="img-fluid mb-2">`,
      class: "d-flex align-items-center flex-column"
    });

    $contentString.append(`<div class="pin-info"><h2>${pins[i].City}</h2><p>(${pins[i].AirportCode})</p></div>`)

    let btn = $('<button>', {
      id: "pin-btn",
      text: i18n_values.choose_button,
      class: 'w-50 mb-3',
      on: {
        "click": () => {
          $(`#${input_name}_input`).trigger("marker:click", [pins[i].AirportCode]);
          (bootstrap.Popover.getInstance(marker)).hide();
        }
      }
    });

    $contentString.append(btn);

    let marker_popover = new bootstrap.Popover(marker, {
      html: true, // A popover ne csak szöveget de HTML kódot is tudjon tárolni
      container: "#map",
      content: $contentString,
      placement: "top",
      trigger: "manual" // A popover mikor jelenjen meg. "manual": a fejlesztő írja meg hozzá a szabályrendszert
    });

    markerPopoverManualTrigger(markers_array, $marker, marker_popover);

    markers_array.push([marker, $marker])
  }
}

// a departureDate alapján megjeleníti az origin_marker-eket 
async function updateOriginMapMarkers(origin_markers_array, map, language, departure) {
  let origin_airports = (await (await fetch(`/api/availabledepartureairportsfiltered?departureDate=${departure}`, { method: "GET", headers: { "Accept-Language": language } })).json()).results;
  let origin_airport_codes = origin_airports.map((x) => x.AirportCode);

  for (let i = 0; i < origin_markers_array.length; i++) {
    if (origin_airport_codes.includes(origin_markers_array[i][0].dataset.code)) {
      origin_markers_array[i][0].setMap(map);
      markerPopoverManualTrigger(origin_markers_array, origin_markers_array[i][1], bootstrap.Popover.getInstance(origin_markers_array[i][0]));
    }

  }

}

// a departureDate és a departureAirport alapján megjeleníti a destination_marker-eket 
async function updateArrivalMapMarkers(destination_markers_array, map, language, origin, departure) {
  let destination_airports = (await (await fetch(`/api/availablearrivalairportsfiltered?departureAirport=${origin}&departureDate=${departure}`, { method: "GET", headers: { "Accept-Language": language } })).json()).results;
  let destination_airport_codes = destination_airports.map((x) => x.AirportCode);

  for (let i = 0; i < destination_markers_array.length; i++) {
    if (destination_airport_codes.includes(destination_markers_array[i][0].dataset.code)) {
      destination_markers_array[i][0].setMap(map);
      markerPopoverManualTrigger(destination_markers_array, destination_markers_array[i][1], bootstrap.Popover.getInstance(destination_markers_array[i][0]));
    }

  }


}

// az adott marker-t kivéve minden markert eltüntet ami egy listában van vele, illetve az adott markerról elveszi a felugró ablakot
function deleteMarkersWithException(markers_array, remaining_marker) {

  for (let i = 0; i < markers_array.length; i++) {

    if (markers_array[i][0] != remaining_marker) {

      markers_array[i][0].setMap(null);

    } else {
      markers_array[i][1].off(".popover");
    }

  }

}


function deleteMarkers(markers_array) {

  for (let i = 0; i < markers_array.length; i++) {
    markers_array[i][0].setMap(null);
    markers_array[i][1].off(".popover");
  }
}

function deleteMarker(remaining_marker) {

  remaining_marker.setMap(null);

}

function reviveMarker(marker, map) {
  marker.setMap(map);
}


function markerPopoverManualTrigger(markers_array, $marker, popover_obj) {


  let $popover_div;

  $marker.on("click.popover", function () {
    //console.log(1)
    if (popover_obj.tip == null) {
      for (let i = 0; i < markers_array.length; i++) {
        (bootstrap.Popover.getInstance(markers_array[i][0])).hide();

      }
      
      popover_obj.show();
      //console.log($(popover_obj.tip).find(".popover-body").first())
      $(popover_obj.tip).find(".popover-body").addClass("marker_popover_body")

      $popover_div = $(`#${popover_obj.tip.id}`) // Az popover_div id-ja minden megjelenésnél újragenerálódik => más lesz, mint az előző
      $popover_div.prop("tabindex", -1); // A tabindex beállítása azért szükséges, hogy az elemet (popover_div) a böngésző focusable-nek tekintse
      $popover_div.on("blur", (event) => {

        if (event.relatedTarget == null) { // Ha az elem amire kattintottunk nem focusable, akkor lesz null az event.relatedTarget értéke
          popover_obj.hide();


        } else {
          if (event.relatedTarget.id != $marker.prop("id") && !event.relatedTarget.id != "pin-btn") { // Ha nem az input_fiealdbe kattintunk, mikőzben megvan nyitva a popover, akkor tűnjön el a popover
            popover_obj.hide();

          }
        }
      });
      $popover_div.trigger("focus");
    }
  });


}


