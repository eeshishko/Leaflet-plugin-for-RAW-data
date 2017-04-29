/**
 * Created by EvgenySH on 12.03.17.
 */

//var mymap = L.map('mapid').setView([39.742043, -104.991531], 13);
var mymap = L.map('mapid').setView([40.712216, -74.22655], 13);

L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> ' +
    'contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.satellite',
    accessToken: 'pk.eyJ1IjoiZGVpbW9zdXMiLCJhIjoiY2owNmd2dW40MDA3YTMycGY5YTVzdTY4MiJ9.Cgh2SMJd8cIPLywUTMQ2mQ'
}).addTo(mymap);


// Draw raster image
var imageUrl = 'https://yt3.ggpht.com/-V92UP8yaNyQ/AAAAAAAAAAI/AAAAAAAAAAA/zOYDMx8Qk3c/s100-c-k-no-mo-rj-c0xffffff/photo.jpg',
    imageBounds = [[40.712216, -74.22655], [40.773941, -74.12544]];
L.imageOverlay(imageUrl, imageBounds, {opacity: 0.6}).addTo(mymap);

var myRenderer = L.svg({ padding: 0.5 });

var circle = L.circle( [0, 0], { renderer: myRenderer } );

// Draw poligone

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff7800"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(map);