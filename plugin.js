/**
 * Created by EvgenySH on 18.03.17.
 */

function addLayer () {
    var url = document.getElementById('layerURL');

    if (url == "")
        return;

    var xhr = new XMLHttpRequest();

    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
        var tiff = GeoTIFF.parse(this.response);
        var image = tiff.getImage();
        var tiffWidth = image.getWidth();
        var tiffHeight = image.getHeight();
        var rasters = image.readRasters();
        var tiepoint = image.getTiePoints()[0];
        var pixelScale = image.getFileDirectory().ModelPixelScale;
        var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1*pixelScale[1]];
        var invGeoTransform = [-geoTransform[0]/geoTransform[1], 1/geoTransform[1],0,-geoTransform[3]/geoTransform[5],0,1/geoTransform[5]];

        var tempData = new Array(image.getHeight());
        for (var j = 0; j<image.getHeight(); j++){
            tempData[j] = new Array(image.getWidth());
            for (var i = 0; i<image.getWidth(); i++){
                tempData[j][i] = rasters[1][i + j*image.getWidth()];
            }
        }

        //Creating the color scale https://github.com/santilland/plotty/blob/master/src/plotty.js
        var cs_def = {positions:[0, 0.25, 0.5, 0.75, 1], colors:["#0571b0", "#92c5de", "#f7f7f7", "#f4a582", "#ca0020"]};
        var scaleWidth = 256;
        var canvasColorScale = document.createElement('canvas');
        canvasColorScale.width = scaleWidth;
        canvasColorScale.height = 1;
        canvasColorScale.style.display = "none";

        document.body.appendChild(canvasColorScale);

        var contextColorScale = canvasColorScale.getContext("2d");
        var gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1);

        for (var i = 0; i < cs_def.colors.length; ++i) {
            gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
        }
        contextColorScale.fillStyle = gradient;
        contextColorScale.fillRect(0, 0, scaleWidth, 1);

        var csImageData = contextColorScale.getImageData(0, 0, scaleWidth-1, 1).data;

        var colorScale = new Image();
        colorScale.src = canvasColorScale.toDataURL();

        //Calculating the image
        var width = 680,
            height = 500;

        var canvasRaster = document.createElement('canvas');
        canvasRaster.width = width;
        canvasRaster.height = height;
        canvasRaster.style.display = "none";

        document.body.appendChild(canvasRaster);

        var contextRaster = canvasRaster.getContext("2d");

        var id = contextRaster.createImageData(width,height);
        var data = id.data;
        var pos = 0;
        for(var j = 0; j<height; j++){
            for(var i = 0; i<width; i++){
                var pointCoords = [geoTransform[0] + i*tiffWidth*geoTransform[1]/width, geoTransform[3] + j*tiffHeight*geoTransform[5]/height];

                // var px = Math.round(invGeoTransform[0] + pointCoords[0] * invGeoTransform[1]);
                // var py = Math.round(invGeoTransform[3] + pointCoords[1] * invGeoTransform[5]);
                var px = invGeoTransform[0] + pointCoords[0]* invGeoTransform[1];
                var py = invGeoTransform[3] + pointCoords[1] * invGeoTransform[5];

                var value;
                if(Math.floor(px) >= 0 && Math.ceil(px) < image.getWidth() && Math.floor(py) >= 0 && Math.ceil(py) < image.getHeight()){
                    //https://en.wikipedia.org/wiki/Bilinear_interpolation
                    var dist1 = (Math.ceil(px)-px)*(Math.ceil(py)-py);
                    var dist2 = (px-Math.floor(px))*(Math.ceil(py)-py);
                    var dist3 = (Math.ceil(px)-px)*(py-Math.floor(py));
                    var dist4 = (px-Math.floor(px))*(py-Math.floor(py));
                    if (dist1 != 0 || dist2!=0 || dist3!=0 || dist4!=0){
                        value = tempData[Math.floor(py)][Math.floor(px)]*dist1+
                            tempData[Math.floor(py)][Math.ceil(px)]*dist2 +
                            tempData[Math.ceil(py)][Math.floor(px)]*dist3 +
                            tempData[Math.ceil(py)][Math.ceil(px)]*dist4;
                    } else {
                        value = tempData[Math.floor(py)][Math.floor(px)];
                    }
                } else {
                    value = -999;
                }
                var c = Math.round((scaleWidth-1) * ((value - 14)/24));
                var alpha = 200;
                if (c<0 || c > (scaleWidth-1)){
                    alpha = 0;
                }
                data[pos]   = csImageData[c*4];
                data[pos+1]   = csImageData[c*4+1];
                data[pos+2]   = csImageData[c*4+2];
                data[pos+3]   = alpha;
                pos = pos + 4

            }
        }
        contextRaster.putImageData( id, 0, 0);
        var imageBounds = [[geoTransform[3], geoTransform[0]], [geoTransform[3] + tiffHeight*geoTransform[5], geoTransform[0] + tiffWidth*geoTransform[1]]];

        var imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds,{
            opacity: 0.5
        });

        // Adding action to represent value by click
        var clickFunc = function(e) {
            var x = (e.latlng.lng - geoTransform[0])/geoTransform[1];
            var y = (e.latlng.lat - geoTransform[3])/geoTransform[5];
            var value = tempData[Math.round(y)][Math.round(x)];

            L.popup()
                .setLatLng(e.latlng)
                .setContent("Value: " + value.toFixed(1))
                .openOn(map);
        };
        map.on('click', clickFunc);

        layers[url] = imageLayer;
        // Adding control of layer
        layerControl.addOverlay(imageLayer, url);

        addRowWith(url, colorScale);
    };
    xhr.send();
}







