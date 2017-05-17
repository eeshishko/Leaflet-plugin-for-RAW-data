/**
 * Created by EvgenySH on 14.05.17.
 */

function RasterMap(leafletMap, tileLayer) {
    this.map = leafletMap;
    this.rasterLayers = {};
    var layerControl = L.control.layers();
    var scaleWidth = 256;
    var width = 1000,
        height = 1000;

    /**
     * Represents raster layer object
     * @param name - name of the layer
     * @param image - image data on the Leaflet map
     * @param rasterData - raster data on this layer
     * @param canvasColorScale - canvas to render raster values
     * @param geoTransform - matrix to transform pixels ot latlng coords
     * @param domain - min and max raster values
     */
    function RasterLayer(name, image, rasterData, canvasColorScale, geoTransform, domain) {
        this.name = name;
        this.image = image;
        this.rasterData = rasterData;
        this.canvasColorScale = canvasColorScale;
        this.interpolated = false;
        this.processTime = undefined;
        this.tiffWidth = undefined;
        this.tiffHeight = undefined;

        // Adding action to represent value by click
        this.initLayer = function () {
            var clickFunc = function (e) {
                var x = (e.latlng.lng - geoTransform[0]) / geoTransform[1];
                var y = (e.latlng.lat - geoTransform[3]) / geoTransform[5];
                var value = rasterData[Math.round(y)][Math.round(x)];

                L.popup()
                    .setLatLng(e.latlng)
                    .setContent(name + "<br>Value: " + value.toFixed(1) + "<br>" + "Coordinates: " + e.latlng)
                    .openOn(leafletMap);
            };

            // Adding control of layer
            layerControl.addOverlay(this.image, name);
            leafletMap.flyTo(this.image.getBounds().getCenter());

            leafletMap.off('click');
            leafletMap.on('click', clickFunc);
        };

        // First initialization
        this.initLayer();

        /**
         * This function draws layer according to parameters of this layer
         */
        this.drawLayer = function () {
            leafletMap.removeLayer(this.image);
            layerControl.removeLayer(this.image);

            var canvasRaster = document.createElement('canvas');
            canvasRaster.width = width;
            canvasRaster.height = height;
            canvasRaster.style.display = "none";

            var contextRaster = canvasRaster.getContext("2d");

            var id = contextRaster.createImageData(width, height);
            var data = id.data;
            var pos = 0;

            var invGeoTransform = [-geoTransform[0] / geoTransform[1], 1 / geoTransform[1], 0, -geoTransform[3] / geoTransform[5], 0, 1 / geoTransform[5]];
            var csImageData = this.canvasColorScale.getContext("2d").getImageData(0, 0, scaleWidth - 1, 1).data;

            for (var j = 0; j < height; j++) {
                for (var i = 0; i < width; i++) {
                    var pointCoords = [geoTransform[0] + i * this.tiffWidth * geoTransform[1] / width, geoTransform[3] + j * this.tiffHeight * geoTransform[5] / height];

                    if (this.interpolated) {
                        var px = invGeoTransform[0] + pointCoords[0] * invGeoTransform[1];
                        var py = invGeoTransform[3] + pointCoords[1] * invGeoTransform[5];

                        var value;
                        if (Math.floor(px) >= 0 && Math.ceil(px) < this.tiffWidth && Math.floor(py) >= 0 && Math.ceil(py) < this.tiffHeight) {
                            var dist1 = (Math.ceil(px) - px) * (Math.ceil(py) - py);
                            var dist2 = (px - Math.floor(px)) * (Math.ceil(py) - py);
                            var dist3 = (Math.ceil(px) - px) * (py - Math.floor(py));
                            var dist4 = (px - Math.floor(px)) * (py - Math.floor(py));
                            if (dist1 != 0 || dist2 != 0 || dist3 != 0 || dist4 != 0) {
                                value = rasterData[Math.floor(py)][Math.floor(px)] * dist1 +
                                    rasterData[Math.floor(py)][Math.ceil(px)] * dist2 +
                                    rasterData[Math.ceil(py)][Math.floor(px)] * dist3 +
                                    rasterData[Math.ceil(py)][Math.ceil(px)] * dist4;
                            } else {
                                value = rasterData[Math.floor(py)][Math.floor(px)];
                            }
                        } else {
                            value = -999;
                        }
                        var c = Math.round((scaleWidth - 1) * ((value - domain[0]) / (domain[1] - domain[0])));
                        var alpha = 200;
                        if (c < 0 || c > (scaleWidth - 1)) {
                            alpha = 0;
                        }
                        data[pos] = csImageData[c * 4];
                        data[pos + 1] = csImageData[c * 4 + 1];
                        data[pos + 2] = csImageData[c * 4 + 2];
                        data[pos + 3] = alpha;
                        pos = pos + 4
                    } else {
                        var px = Math.floor(invGeoTransform[0] + pointCoords[0] * invGeoTransform[1]);
                        var py = Math.floor(invGeoTransform[3] + pointCoords[1] * invGeoTransform[5]);

                        if (Math.floor(px) >= 0 && Math.ceil(px) < this.tiffWidth && Math.floor(py) >= 0 && Math.ceil(py) < this.tiffHeight) {
                            var value = rasterData[py][px];

                            var c = Math.round((scaleWidth - 1) * ((value - domain[0]) / (domain[1] - domain[0])));
                            var alpha = 200;
                            if (c < 0 || c > (scaleWidth - 1)) {
                                alpha = 0;
                            }
                            data[pos] = csImageData[c * 4];
                            data[pos + 1] = csImageData[c * 4 + 1];
                            data[pos + 2] = csImageData[c * 4 + 2];
                            data[pos + 3] = alpha;
                            pos = pos + 4
                        }
                    }
                }
            }

            contextRaster.putImageData(id, 0, 0);
            var imageBounds = [[geoTransform[3], geoTransform[0]], [geoTransform[3] + this.tiffHeight * geoTransform[5], geoTransform[0] + this.tiffWidth * geoTransform[1]]];

            this.image = L.imageOverlay(canvasRaster.toDataURL(), imageBounds, {
                opacity: 0.7
            });

            this.interpolated = !this.interpolated;

            this.initLayer();
        }
    }

    tileLayer.addTo(this.map); // Base layer
    layerControl.addTo(this.map); // Layer Controller

    /**
     * This function loads raster data from response, creates and add layer to leaflet map
     * @param name - Name of the layer
     * @param response - array of bytes of GeoTIFF file
     * @param colorScaleName - name of color scale to render
     * @param rasterChannel - index of raster channel in file which will be represented
     * @returns color scale image for created layer
     */
    this.addLayer = function (name, response, colorScaleName, rasterChannel) {

        var t0 = new Date().getTime();
        var tiff = GeoTIFF.parse(response);
        var image = tiff.getImage();
        var tiffWidth = image.getWidth();
        var tiffHeight = image.getHeight();
        var rasters = image.readRasters();
        var tiepoint = image.getTiePoints()[0];
        var pixelScale = image.getFileDirectory().ModelPixelScale;
        var geoTransform = [tiepoint.x, pixelScale[0], 0, tiepoint.y, 0, -1 * pixelScale[1]];
        var invGeoTransform = [-geoTransform[0] / geoTransform[1], 1 / geoTransform[1], 0, -geoTransform[3] / geoTransform[5], 0, 1 / geoTransform[5]];
        var domain = [rasters[rasterChannel][0], rasters[rasterChannel][0]]; // min and max values of data

        var rasterData = new Array(image.getHeight());
        for (var j = 0; j < image.getHeight(); j++) {
            rasterData[j] = new Array(image.getWidth());
            for (var i = 0; i < image.getWidth(); i++) {
                rasterData[j][i] = rasters[rasterChannel][i + j * image.getWidth()];
                if (rasterData[j][i] < domain[0])
                    domain[0] = rasterData[j][i];
                if (rasterData[j][i] > domain[1])
                    domain[1] = rasterData[j][i];
            }
        }

        var canvasColorScale = this.createCanvasColorScale(colorScaleName);

        var csImageData = canvasColorScale.getContext("2d").getImageData(0, 0, scaleWidth - 1, 1).data;

        var colorScale = new Image();
        colorScale.src = canvasColorScale.toDataURL();

        //Calculating the image
        var canvasRaster = document.createElement('canvas');
        canvasRaster.width = width;
        canvasRaster.height = height;
        canvasRaster.style.display = "none";

        document.body.appendChild(canvasRaster);

        var contextRaster = canvasRaster.getContext("2d");

        var id = contextRaster.createImageData(width, height);
        var data = id.data;
        var pos = 0;
        for (var j = 0; j < height; j++) {
            for (var i = 0; i < width; i++) {
                var pointCoords = [geoTransform[0] + i * tiffWidth * geoTransform[1] / width,
                                   geoTransform[3] + j * tiffHeight * geoTransform[5] / height];

                var px = Math.floor(invGeoTransform[0] + pointCoords[0] * invGeoTransform[1]);
                var py = Math.floor(invGeoTransform[3] + pointCoords[1] * invGeoTransform[5]);

                if(Math.floor(px) >= 0 && Math.ceil(px) < image.getWidth() && Math.floor(py) >= 0 && Math.ceil(py) < image.getHeight()){
                    var value = rasterData[py][px];

                    var c = Math.round((scaleWidth-1) * ((value - domain[0])/(domain[1] - domain[0])));
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
        }
        contextRaster.putImageData(id, 0, 0);
        var imageBounds = [[geoTransform[3], geoTransform[0]], [geoTransform[3] + tiffHeight * geoTransform[5], geoTransform[0] + tiffWidth * geoTransform[1]]];

        var imageLayer = L.imageOverlay(canvasRaster.toDataURL(), imageBounds, {
            opacity: 0.5
        });

        this.rasterLayers[name] = new RasterLayer(name, imageLayer, rasterData, canvasColorScale, geoTransform, domain);

        var t1 = new Date().getTime();
        this.rasterLayers[name].processTime = (t1 - t0) / 1000;
        this.rasterLayers[name].tiffWidth = tiffWidth;
        this.rasterLayers[name].tiffHeight = tiffHeight;

        return colorScale;
    };

    /**
     * Remove layer from the map and layer controller
     * @param name - name of layer to remove
     */
    this.removeLayer = function (name) {
        this.map.removeLayer(this.rasterLayers[name].image);
        layerControl.removeLayer(this.rasterLayers[name].image);
        this.rasterLayers[name] = undefined;
    };

    /**
     * Checks if such name exists or not
     * @param name
     * @returns {boolean}
     */
    this.isLayerExist = function (name) {
        return this.rasterLayers[name] != undefined;
    };

    /**
     * Creates canvas for color scale
     * @param colorScaleName - name in the list of color scales
     * @returns
     */
    this.createCanvasColorScale = function (colorScaleName) {
        var cs_def = colorscales[colorScaleName];
        var canvasColorScale = document.createElement('canvas');
        canvasColorScale.width = scaleWidth;
        canvasColorScale.height = 1;
        canvasColorScale.style.display = "none";

        var contextColorScale = canvasColorScale.getContext("2d");
        var gradient = contextColorScale.createLinearGradient(0, 0, scaleWidth, 1);

        for (var i = 0; i < cs_def.colors.length; ++i) {
            gradient.addColorStop(cs_def.positions[i], cs_def.colors[i]);
        }
        contextColorScale.fillStyle = gradient;
        contextColorScale.fillRect(0, 0, scaleWidth, 1);

        return canvasColorScale;
    };


}

// Colorscale definitions from https://github.com/santilland/plotty/blob/master/src/plotty.js
var colorscales = {
    "rainbow": {
        colors: ['#96005A', '#0000C8', '#0019FF', '#0098FF', '#2CFF96', '#97FF00', '#FFEA00', '#FF6F00', '#FF0000'],
        positions: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
    },
    "jet": {
        colors: ['#000083', '#003CAA', '#05FFFF', '#FFFF00', '#FA0000', '#800000'],
        positions: [0, 0.125, 0.375, 0.625, 0.875, 1]
    },
    "hsv": {
        colors: ["#ff0000", "#fdff02", "#f7ff02", "#00fc04", "#00fc0a", "#01f9ff", "#0200fd", "#0800fd", "#ff00fb", "#ff00f5", "#ff0006"],
        positions: [0, 0.169, 0.173, 0.337, 0.341, 0.506, 0.671, 0.675, 0.839, 0.843, 1]
    },
    "hot": {
        colors: ["#000000", "#e60000", "#ffd200", "#ffffff"],
        positions: [0, 0.3, 0.6, 1]
    },
    "cool": {
        colors: ["#00ffff", "#ff00ff"],
        positions: [0, 1]
    },
    "spring": {
        colors: ["#ff00ff", "#ffff00"],
        positions: [0, 1]
    },
    "summer": {
        colors: ["#008066", "#ffff66"],
        positions: [0, 1]
    },
    "autumn": {
        colors: ["#ff0000", "#ffff00"],
        positions: [0, 1]
    },
    "winter": {
        colors: ["#0000ff", "#00ff80"],
        positions: [0, 1]
    },
    "bone": {
        colors: ["#000000", "#545474", "#a9c8c8", "#ffffff"],
        positions: [0, 0.376, 0.753, 1]
    },
    "copper": {
        colors: ["#000000", "#ffa066", "#ffc77f"],
        positions: [0, 0.804, 1]
    },
    "greys": {
        colors: ["#000000", "#ffffff"],
        positions: [0, 1]
    },
    "yignbu": {
        colors: ["#081d58", "#253494", "#225ea8", "#1d91c0", "#41b6c4", "#7fcdbb", "#c7e9b4", "#edf8d9", "#ffffd9"],
        positions: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
    },
    "greens": {
        colors: ["#00441b", "#006d2c", "#238b45", "#41ab5d", "#74c476", "#a1d99b", "#c7e9c0", "#e5f5e0", "#f7fcf5"],
        positions: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
    },
    "yiorrd": {
        colors: ["#800026", "#bd0026", "#e31a1c", "#fc4e2a", "#fd8d3c", "#feb24c", "#fed976", "#ffeda0", "#ffffcc"],
        positions: [0, 0.125, 0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1]
    },
    "bluered": {
        colors: ["#0000ff", "#ff0000"],
        positions: [0, 1]
    },
    "rdbu": {
        colors: ["#050aac", "#6a89f7", "#bebebe", "#dcaa84", "#e6915a", "#b20a1c"],
        positions: [0, 0.35, 0.5, 0.6, 0.7, 1]
    },
    "picnic": {
        colors: ["#0000ff", "#3399ff", "#66ccff", "#99ccff", "#ccccff", "#ffffff", "#ffccff", "#ff99ff", "#ff66cc", "#ff6666", "#ff0000"],
        positions: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]
    },
    "portland": {
        colors: ["#0c3383", "#0a88ba", "#f2d338", "#f28f38", "#d91e1e"],
        positions: [0, 0.25, 0.5, 0.75, 1]
    },
    "blackbody": {
        colors: ["#000000", "#e60000", "#e6d200", "#ffffff", "#a0c8ff"],
        positions: [0, 0.2, 0.4, 0.7, 1]
    },
    "earth": {
        colors: ["#000082", "#00b4b4", "#28d228", "#e6e632", "#784614", "#ffffff"],
        positions: [0, 0.1, 0.2, 0.4, 0.6, 1]
    },
    "electric": {
        colors: ["#000000", "#1e0064", "#780064", "#a05a00", "#e6c800", "#fffadc"],
        positions: [0, 0.15, 0.4, 0.6, 0.8, 1]
    }
};