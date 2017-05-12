/**
 * Created by EvgenySH on 05.05.17.
 */


var map = L.map('map').setView([55.751244, 37.618423], 10);
var layers = {}; // Dictionary with all layers

layers["base"] = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
});

layers["base"].addTo(map);
var layerControl = L.control.layers();
layerControl.addTo(map);
layerControl.addLayer(layers["base"], "base");
