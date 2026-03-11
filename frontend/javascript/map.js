document.addEventListener('DOMContentLoaded', () => {

});

let map;

async function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.31577891543344, lng: 19.98946307432514 },
    zoom: 5,
    mapId: '339ffbadd5c5008584bb6746',
    disableDefaultUI: true
  });
  let pins = (await (await fetch('/api/map_pins')).json()).pins;
  for (let i = 0; i < pins.length; i++) {
    let cordinates = pins[i].GeographicCoordinates.split(',').map(x => parseFloat(x));
    let marker = new google.maps.Marker({
      position: { lat: cordinates[0], lng: cordinates[1] },
      animation: google.maps.Animation.DROP,
      title: pins[i].Hungarian,
      map: map
    });


    let contentString = $('<div>', {
      html: `<h2>${pins[i].Hungarian}</h2><p>(${pins[i].AirportCode})</p>`,
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


