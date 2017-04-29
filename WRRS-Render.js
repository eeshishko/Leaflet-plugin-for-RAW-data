/**
 * Created by EvgenySH on 29.04.17.
 */
/** (c) 2016 by Antonio Rodriges, rodriges@wikience.org */

var COLOR_INDEX =
    [0,
        98.825,
        127.263,
        155.7,
        184.138,
        212.576,
        241.013,
        269.451,
        297.889,
        326.326,
        354.764,
        383.202,
        411.64,
        440.077,
        468.515,
        496.953,
        525.39,
        553.828,
        582.266,
        610.703,
        639.141];

var COLOR = [
    [0, 0, 0],
    [255, 255, 212],
    [254, 247, 197],
    [254, 239, 182],
    [254, 231, 167],
    [254, 223, 153],
    [254, 213, 136],
    [254, 200, 115],
    [254, 186, 94],
    [254, 173, 72],
    [254, 159, 51],
    [250, 146, 38],
    [242, 134, 32],
    [234, 122, 26],
    [226, 110, 21],
    [218, 98, 15],
    [206, 88, 12],
    [193, 79, 10],
    [179, 70, 8],
    [166, 61, 6],
    [153, 52, 4]
];

describe('Test render speed', function () {
    beforeEach(function() {
        var fixture = '<div id="container" style="position: relative"></div>';

        document.body.insertAdjacentHTML(
            'afterbegin', fixture);
    });

    it('Should render N x M raster', function (done) {
        var R = new WRRS();

        try {
            var callback = function (state) {
                if (state === R.NWSTATES.SUCCESS_CONNECT_WITH_DATASETSTREE) {
                    var Q = R.newRequest({datasetId: "GTIFF", datetime: 0});
                    Q.setNDarrayParseFlag(false);
                    Q.setUserCallback(function (params) {
                        if (params.error != undefined) {
                            done(params.error);
                        }
                        render(Q.response.rasterData, Q.response.rasterShape);
                    });
                    R.IO_TIMEOUT_THRESHOULD = 3600000; // it takes over a minute for a server to read complete Landsat scene
                    R.sendRequest(Q);
                } else {
                    done("Connect should be successful " + state);
                }
            };

            R.connect(testServerURL, callback);
        } catch (err) {
            done(err);
        }

        var render = function (array, shape) {
            var t0 = performance.now();

            var canvas = document.createElement("canvas");
            canvas.width = shape[0];
            canvas.height = shape[1];
            canvas.style.cssText = "position:absolute;left:0;top:0";

            var ctx = canvas.getContext("2d");
            var imgData = ctx.createImageData(shape[0], shape[1]);

            var imgIndex = 0;
            for (var i = 0; i < array.length; i++) {
                var color = getColor(array[i]);
                imgData.data[imgIndex++] = color[0];
                imgData.data[imgIndex++] = color[1];
                imgData.data[imgIndex++] = color[2];
                imgData.data[imgIndex++] = 255;
            }

            ctx.putImageData(imgData, 0, 0);

            document.getElementById("container").appendChild(canvas);

            var t1 = performance.now();
            console.log("Render time: " + (t1 - t0) + " milliseconds.");

            done();
        };

        var getColor = function (value) {
            var ii = COLOR_INDEX.length - 1;
            for (var i = 0; i < COLOR_INDEX.length; i++) {
                if (value < COLOR_INDEX[i]) {
                    ii = i;
                    break;
                }
            }

            return COLOR[ii];
        }
    });
});