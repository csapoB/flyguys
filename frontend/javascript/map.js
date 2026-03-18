import { getNavbar } from "./locale.js";
import { getLocale } from "./locale.js";
import { plannerInit } from "./planner.js";
import { modalInit } from "./modal.js";
import { getIndex } from "./locale.js";



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

   (g=>{var h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;b=b[c]||(b[c]={});var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));e.set("libraries",[...r]+"");for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);e.set("callback",c+".maps."+q);a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;a.onerror=()=>h=n(Error(p+" could not load."));a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
    key: "AIzaSyCGmwlN95_KmdNN5xAq2VO7qJCWSrNkuaA",
    v: "weekly",
    language : language
  });


  $("html").prop("lang", language);

  //$("#map_api").prop("src", `https://maps.googleapis.com/maps/api/js?key=AIzaSyCGmwlN95_KmdNN5xAq2VO7qJCWSrNkuaA&map_ids=339ffbadd5c5008584bb6746&language=${language}`);

  await initMap(language);

  await getNavbar(language, old_url);
  await modalInit(language);

  await plannerInit(language);

  await getIndex(language);

});

async function initMap(language) {

  const { Map } = await google.maps.importLibrary("maps");

  let map = new Map(document.getElementById("map"), {
    center: { lat: 47.31577891543344, lng: 19.98946307432514 },
    zoom: 5,
    mapId: '339ffbadd5c5008584bb6746',
    disableDefaultUI: true
  });
  let pins = (await (await fetch('/api/map_pins', { method: "GET", headers: { "Accept-Language": language } })).json()).pins;
  for (let i = 0; i < pins.length; i++) {
    let cordinates = pins[i].GeographicCoordinates.split(',').map(x => parseFloat(x));
    let marker = new google.maps.Marker({
      position: { lat: cordinates[0], lng: cordinates[1] },
      animation: google.maps.Animation.DROP,
      title: pins[i].CityName,
      map: map
    });


    let contentString = $('<div>', {
      html: `<h2>${pins[i].CityName}</h2><p>(${pins[i].DepartureAirport})</p>`,
      class: 'pin-info'
    });

    let btn = $('<button>', {
      text: 'Kiválaszt',
      class: 'pin-btn',
      on: {
        click: () => {
          console.log('működik');
        }
      }
    });

    contentString.append(btn);

    const infoWindow = new google.maps.InfoWindow({
      content: contentString[0]
    });

    marker.addListener("click", () => {
      infoWindow.open(map, marker);
    });
  }

}


