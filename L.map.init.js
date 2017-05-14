/**
 * Created by EvgenySH on 05.05.17.
 */


var map = L.map('map').setView([55.751244, 37.618423], 10);

var select = document.getElementById('colorScaleSelect');
for (var cs in colorscales)
{
    var opt = document.createElement('option');
    opt.value = cs;
    opt.innerHTML = cs;
    select.appendChild(opt);
}

var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
});

var rasterMap = new RasterMap(map, tileLayer);

function addClick(url, name) {
    if (url == "" || name == "") {
        alert('URL or name field is empty');
        return;
    }

    if (rasterMap.isLayerExist(name)) {
        alert('Layer with such name already exists');
        return;
    }

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';

    var colorScale = undefined;
    xhr.onload = function (e) {
        var colorScaleName = select.options[select.selectedIndex].value;
        colorScale = rasterMap.addLayer(url, name, this.response, colorScaleName);
        if (colorScale != undefined)
            addRowWith(name, colorScale, rasterMap.rasterLayers[name].processTime);
    };
    xhr.send();
}

/**
 * Adding new layer to table with all needed elements
 * @param name
 * @param colorScale
 * @param time
 */
function addRowWith(name, colorScale, time) {
    // Adding  URL to table
    var table = document.getElementById("addedLayers");
    var size = table.size;
    var row = table.insertRow(size);

    row.insertCell(0).innerHTML = name;

    // Creating delete button
    var btn = document.createElement("BUTTON");
    btn.style.backgroundColor = "#f44336";
    btn.style.color = "white";
    var t = document.createTextNode("-");
    btn.appendChild(t);
    btn.onclick = function () {
        table.deleteRow(size == undefined ? 1 : size + 1);
        rasterMap.removeLayer(name);
    };
    row.insertCell(1).appendChild(btn);

    // Creating interpolating checkbox
    var checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.onclick = function () {
        rasterMap.rasterLayers[name].switchInterpolation();
    };

    // Adding color gradient
    colorScale.style.height = "40px";
    colorScale.style.width = "120px";
    row.insertCell(2).appendChild(colorScale);
    row.insertCell(3).innerHTML = time;
    row.insertCell(4).appendChild(checkBox);
}