var path = require('path');
const express = require('express');
const app = express();
const WebSocket = require('ws');

var WebSocketServer = require('ws').Server;

const http = require('http');
var server = require('http').createServer();

var wss = new WebSocketServer({
    server: server
});
// Broadcast to all.
wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {

        if (client.readyState === WebSocket.OPEN) {
            try {
                // console.log('sending data ' + data);
                client.send(data);
            } catch (e) {
                console.error(e);
            }
        }
    });
};
wss.on('connection', function (ws) {
    var id = setInterval(function () {

        // var xt = j++;
        // var mt = j++;
        // ws.send(JSON.stringify({
        //     humidity: xt,
        //     temperature: mt,
        //     time: mt
        // }), function () { /* ignore errors */ });
    }, 100);
    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
        clearInterval(id);
    });
});
app.use(express.static(path.join(__dirname, '/public')));
server.on('request', app);
server.listen(80, function () {
    console.log('Listening on http://localhost:8080');
});
var YourThing = require('./YourThing');
var id = '<your devices id>';
var YOUR_THING_SERVICE_UUID = '1977';
var YOUR_THING_NOTIFY_CHAR = '1028';

const noble = require('noble');
noble.on('scanStart', function () {
    console.log('on scanStart');
});

noble.on('scanStop', function () {
    console.log('on scanStop');
});

YourThing.discover(function (yourThingInstance) {
    console.log('discovered peripheral: ', yourThingInstance.id);
    // you can be notified of disconnects 
    yourThingInstance.on('disconnect', function () {
        console.log('we got disconnected! :( ');
    });

    yourThingInstance.on('measumentChange', function (data) {
        console.log("update measument: " + data);
    });
    // you'll need to call connect and set up 
    yourThingInstance.connectAndSetUp(function (callback) {
        console.log('connectAndSetUp', yourThingInstance.id);

        // yourThingInstance.notifyMeasument(function (counter) {
        //     console.log('notifyMeasument');
        // });
        yourThingInstance.on('receive', function (error, data) {
            console.log('got data: ' + data);
        });

        yourThingInstance.notifyCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_NOTIFY_CHAR, YourThing, (data, isNotify, err) => onNotify(yourThingInstance, data, isNotify, err), function (err) {
            // callback(err);
        });

        // noble.startScanning();
    });

});
var j = 0;
const onNotify = (thing, data, isNotify, err) => {
    // console.log(thing.id, data);
    for (var i = 0; i < 5; i++) {

        var a = data.readUInt8(1 + i * 2) & 0x00FF;
        var b = data.readUInt8(1 + i * 2 + 1) & 0x00FF;
        var ecgVal = a + b * 256;
        isSensorDetected = ((ecgVal & 0x8000) != 0);


        ecgVal = ecgVal & 0x0fff;
        ecgVal = ecgVal * 2400 / 4096;
        // console.log('Ecg : ', ecg, typeof data);
        try {
            var mt = j++;
            if (isSensorDetected) {
                // console.log('isSensorDetected', isSensorDetected, ecgVal)
            }
            wss.broadcast(JSON.stringify({
                humidity: ecgVal,
                temperature: ecgVal,
                time: mt
            }));
        } catch (err) {
            console.error(err);
        }
    }
}