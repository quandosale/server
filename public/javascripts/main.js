$(document).ready(function () {

    // We use an inline data source in the example, usually data would
    // be fetched from a server
    var devices = [];

    var data1 = [],
        data2 = [],
        data3 = [],
        data4 = [],
        data5 = [],
        data6 = [],
        data7 = [],
        data8 = [];

    POINT_WIDTH = 300;


    function getRandomData1(value) {
        value = value ? value : 0;

        if (data1.length > 0)
            data1 = data1.slice(1);
        while (data1.length < POINT_WIDTH) {
            data1.push(value);
        }

        var res = [];
        for (var i = 0; i < data1.length; ++i) {
            res.push([i, data1[i]])
        }

        return res;
    }

    function getRandomData2(value) {
        value = value ? value : 0;

        if (data2.length > 0)
            data2 = data2.slice(1);

        while (data2.length < POINT_WIDTH) {
            data2.push(value);
        }

        var res = [];
        for (var i = 0; i < data2.length; ++i) {
            res.push([i, data2[i]])
        }

        return res;
    }

    function getRandomData3(value) {
        value = value ? value : 0;

        if (data3.length > 0)
            data3 = data3.slice(1);

        while (data3.length < POINT_WIDTH) {
            data3.push(value);
        }

        var res = [];
        for (var i = 0; i < data3.length; ++i) {
            res.push([i, data3[i]])
        }

        return res;
    }

    function getRandomData4(value) {
        value = value ? value : 0;

        if (data4.length > 0)
            data4 = data4.slice(1);

        while (data4.length < POINT_WIDTH) {
            data4.push(value);
        }

        var res = [];
        for (var i = 0; i < data4.length; ++i) {
            res.push([i, data4[i]])
        }

        return res;
    }

    function getRandomData5(value) {
        value = value ? value : 0;

        if (data5.length > 0)
            data5 = data5.slice(1);

        while (data5.length < POINT_WIDTH) {
            data5.push(value);
        }

        var res = [];
        for (var i = 0; i < data5.length; ++i) {
            res.push([i, data5[i]])
        }

        return res;
    }

    function getRandomData6(value) {
        value = value ? value : 0;

        if (data6.length > 0)
            data6 = data6.slice(1);

        while (data6.length < POINT_WIDTH) {
            data6.push(value);
        }

        var res = [];
        for (var i = 0; i < data6.length; ++i) {
            res.push([i, data6[i]])
        }

        return res;
    }

    function getRandomData7(value) {
        value = value ? value : 0;

        if (data7.length > 0)
            data7 = data7.slice(1);

        while (data7.length < POINT_WIDTH) {
            data7.push(value);
        }

        var res = [];
        for (var i = 0; i < data7.length; ++i) {
            res.push([i, data7[i]])
        }

        return res;
    }

    function getRandomData8(value,id) {
        value = value ? value : 0;
        if (data8.length > 0)
            data8 = data8.slice(1);
        while (data8.length < POINT_WIDTH) {
            data8.push(value);
        }

        var res = [];
        for (var i = 0; i < data8.length; ++i) {
            res.push([i, data8[i]])
        }

        return res;
    }

    function isExist(id) {
        var isSuccess = false;
        devices.forEach(element => {
            if (element == id) isSuccess = true;
        });
        return isSuccess;
    }

    function length() {
        var len = 0;
        devices.forEach(element => {
            len += 1;
        });
        return len;
    }

    function index(id) {
        var itemIndex = 0;
        for (var i = 0; i < devices.length; i++) {
            if (devices[i] == id) return i;
        }
        return 0;
    }
    var plot1 = $.plot("#placeholder1", [getRandomData1()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot2 = $.plot("#placeholder2", [getRandomData2()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot3 = $.plot("#placeholder3", [getRandomData3()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot4 = $.plot("#placeholder4", [getRandomData4()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot5 = $.plot("#placeholder5", [getRandomData5()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot6 = $.plot("#placeholder6", [getRandomData6()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot7 = $.plot("#placeholder7", [getRandomData7()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });
    var plot8 = $.plot("#placeholder8", [getRandomData8()], {
        series: {
            shadowSize: 0 // Drawing is faster without shadows
        },
        yaxis: {
            min: 0,
            max: 2500
        },
        xaxis: {
            show: false
        }
    });



    var host = window.document.location.host.replace(/:.*/, '');
    var ws = new WebSocket('ws://' + host + ":80");
    ws.onopen = function () {
        console.log('Successfully connect WebSocket ');
    }
    ws.onmessage = function (message) {
        // console.log('receive message' + message.data);
        try {
            var obj = JSON.parse(message.data);

            if (!obj.time || !obj.temperature) {
                return;
            }
            if (obj.id) {
                if (!isExist(obj.id)) {
                    devices.push(obj.id)
                }

                switch (index(obj.id)) {
                    case 0:
                        plot1.setData([getRandomData1(obj.temperature)]);
                        plot1.draw();
                        break;
                    case 1:
                        plot2.setData([getRandomData2(obj.temperature)]);
                        plot2.draw();
                        break;
                    case 2:
                        plot3.setData([getRandomData3(obj.temperature)]);
                        plot3.draw();
                        break;
                    case 3:
                        plot4.setData([getRandomData4(obj.temperature)]);
                        plot4.draw();
                        break;
                    case 4:
                        plot5.setData([getRandomData5(obj.temperature)]);
                        plot5.draw();
                        break;
                    case 5:
                        plot6.setData([getRandomData6(obj.temperature)]);
                        plot6.draw();
                        break;
                    case 6:
                        plot7.setData([getRandomData7(obj.temperature)]);
                        plot7.draw();
                        break;
                    case 7:
                        plot8.setData([getRandomData8(obj.temperature)]);
                        plot8.draw();
                        break;
                    


                }
            }

            // myLineChart.update();
        } catch (err) {
            console.error(err);
        }
    }
});