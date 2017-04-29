/**
 * Created by EvgenySH on 17.03.17.
 */

var map = L.map('mapid').setView([37, -109.05], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

function onMapClick(e) {
    alert("You clicked the map at " + e.latlng);
}
// var plugin = RasterPlugin();
// plugin.createRandomValues(10, 20 * 20);

var myRectangles = createGeoRectangles(60, 60,  32, -120, 39.73, -105);
var rawData = createRandomValues(10, 360 * 180);

for (i = 0; i < myRectangles.length; i++) {
    myRectangles[i].addTo(map);

    var value = rawData[i];
    myRectangles[i].on('click', function () {
        alert("Value of this rectangle is " + value);
    })
}

map.fitBounds(myRectangles[1].getBounds());

// // zoom the map to the polygon
// map.fitBounds(polygon.getBounds());

// L.geoJSON(rectangle, {
//     style: function (feature) { // Setting styles for each polygon
//         return feature.properties && feature.properties.style;
//     }
// }).addTo(map);



