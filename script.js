/**
 * Created by EvgenySH on 05.05.17.
 */


var map = L.map('map').setView([55.751244, 37.618423], 1);
var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
    maxZoom: 18,
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
    '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
    'Imagery © <a href="http://mapbox.com">Mapbox</a>',
    id: 'mapbox.light'
});

var rasterMap = new RasterMap(map, tileLayer);

var select = document.getElementById('colorScaleSelect');
var selectedScaleImage = document.getElementById('scaleElement');
selectedScaleImage.src = rasterMap.createCanvasColorScale('rainbow').toDataURL();

for (var cs in colorscales) {
    var opt = document.createElement('option');
    opt.value = cs;
    opt.innerHTML = cs;
    select.appendChild(opt);
}

select.onchange = function () {
    var selectedName = select.options[select.selectedIndex].value;
    selectedScaleImage.src = rasterMap.createCanvasColorScale(selectedName).toDataURL();
};

function addClick(url, name, rasterChannel) {
    if (url == "" || name == "") {
        alert('URL or name field is empty');
        return;
    }

    if (rasterMap.isLayerExist(name)) {
        alert('Layer with such name already exists');
        return;
    }

    if (isNaN(rasterChannel)) {
        alert('Raster channel must be a number');
        return;
    }

    if (rasterChannel < 0) {
        alert('Raster channel cannot be negative number');
        return;
    }

    try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        var colorScale = undefined;
        xhr.onload = function (e) {
            try {
                var colorScaleName = select.options[select.selectedIndex].value;
                colorScale = rasterMap.addLayer(name, this.response, colorScaleName, rasterChannel);
                if (colorScale != undefined)
                    addRowWith(name, colorScale, rasterMap.rasterLayers[name].processTime);
            } catch (error) {
                alert("Error: the layer hasn't been added.");
            }
        };
        xhr.send();
    } catch (error) {
        alert("Error: the file hasn't been uploaded.");
    }
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

    // Creating interpolating checkbox
    var checkBox = document.createElement('input');
    checkBox.type = "checkbox";
    checkBox.onclick = function () {
        changeBtn.style.backgroundColor = "#b5d128"; // Changes are not up to date
    };

    // Adding color gradient
    colorScale.style.height = "40px";
    colorScale.style.width = "300px";

    row.insertCell(1).innerHTML = time + " sec";

    row.insertCell(2).appendChild(colorScale);
    var colorSelect = document.createElement('select');
    for (var cs in colorscales) {
        var opt = document.createElement('option');
        opt.value = cs;
        opt.innerHTML = cs;
        colorSelect.appendChild(opt);
    }

    colorSelect.onchange = function () {
        var selectedScaleName = colorSelect.options[colorSelect.selectedIndex].value;
        rasterMap.rasterLayers[name].canvasColorScale = rasterMap.createCanvasColorScale(selectedScaleName);
        colorScale.src = rasterMap.rasterLayers[name].canvasColorScale.toDataURL();
        changeBtn.style.backgroundColor = "#b5d128"; // Changes are not up to date
    };
    colorSelect.selectedIndex = select.selectedIndex;

    row.cells[2].appendChild(colorSelect);
    row.insertCell(3).appendChild(checkBox);

    var changeBtn = document.createElement("BUTTON");
    changeBtn.style.backgroundColor = "#c7c7d7";
    changeBtn.style.color = "white";
    t = document.createTextNode("Change");

    changeBtn.appendChild(t);

    changeBtn.onclick = function () {
        rasterMap.rasterLayers[name].interpolated = checkBox.checked;
        rasterMap.rasterLayers[name].drawLayer();
        changeBtn.style.backgroundColor = "#c7c7d7"; // Changes are up to date
    };
    row.insertCell(4).appendChild(changeBtn);
    row.insertCell(5).appendChild(btn);

}