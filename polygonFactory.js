/**
 * Created by EvgenySH on 18.03.17.
 */

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}
//------------------------------------------------------------------------------------


function createRectangle(latDiff, lngDiff, latLeft, lngLeft, i, j) {
    var lng1 = Number(lngLeft + j * lngDiff);
    var lng2 = Number(lng1 + lngDiff);

    var lat1 = latLeft + i * latDiff;
    var lat2 = Number(lat1 + latDiff);

    var latlngs = [[lat1, lng1], [lat2, lng2]];

    // return L.rectangle(latlngs,{weight: 0,
    //     color: getRandomColor(),
    //     opacity: 0.1,
    //     fillColor: getRandomColor(),
    //     fillOpacity: 1})
    return L.imageOverlay('images/skobbler-maps.png', latlngs)
}

/**
 *
 * @param n - number of rows
 * @param m - number of columns
 * @param lat1 - bottom left X coordinate
 * @param lng1 - bottom left Y coordinate
 * @param lat2 - top right X coordinate
 * @param lng2 - top right Y coordinate
 * @returns Array of Geo Rectangles.
 */
function createGeoRectangles(n, m, lat1, lng1, lat2, lng2) {
    var rectangles = []; // Array of Two Dimensions array

    var latDiff = Math.abs(lat1 - lat2) / n; // Step for Y axis
    var lngDiff = Math.abs(lng2 - lng1) / m; // Step for X axis

    var count = 0;
    for (var i = 0; i < n; ++i)
        for (var j = 0; j < m; ++j)
           rectangles[count++] = createRectangle(latDiff, lngDiff, lat1, lng1, i, j);

    return rectangles;
}

function createRandomValues(max, count) {
    var rawData = [];

    for (var i = 0; i < count; ++i)
        rawData[i] = Math.random() * max;

    return rawData;
}

function addLayer() {
    var input = document.getElementById("layerURL").value;

    if (input == "")
        return;

    // Adding  URL to table
    var table = document.getElementById("addedLayers");
    var row = table.insertRow(table.size);

    row.insertCell(0).innerHTML = input
}

var renderRawData = function (array, shape) {
  var canvas = L.DomUtil.create('canvas');

};



