document.addEventListener('DOMContentLoaded', () => {

});

let map;

function initMap() {
  map = new google.maps.Map(document.getElementById("map"), {
    center: { lat: 47.31577891543344, lng: 19.98946307432514 },
    zoom: 5,
    mapId: '339ffbadd5c5008584bb6746'
  });
}

window.initMap = initMap;