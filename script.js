/**
 * Created by EvgenySH on 17.03.17.
 */

var map = L.map('mapid').setView([55.751244, 37.618423], 10);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
}).addTo(map);

map.on('click', function () {
    alert('Map grid layer tile size: ');
});


/*var myRectangles = createGeoRectangles(60, 60,  32, -120, 39.73, -105);
var rawData = createRandomValues(10, 360 * 180);

for (i = 0; i < myRectangles.length; i++) {
    myRectangles[i].addTo(map);

    var value = rawData[i];
    myRectangles[i].on('click', function () {
        alert("Value of this rectangle is " + value);
    })
}*/

// map.fitBounds(myRectangles[1].getBounds());





