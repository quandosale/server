// [BEGIN] CONFIGURE for Web server
var path = require('path');
const express = require('express')
const app = express()

const http = require('http');
var server = require('http').createServer();

app.use(express.static(path.join(__dirname, '/public')));
server.on('request', app);
server.listen(80, function () {
    console.log('Listening on http://localhost:80');
});
// [END] CONFIGURE for Web server


// [BEGIN] for Ble management
const noble = require('noble');

var ECG_SERVICE_UUID = '1977';
var ECG_NOTIFY_CHAR = '1028';
var DESCRIPTOR_UUID = '2901';

var SCANNING_DURATION = 4 * 1000;
var CONNECTING_DURATION = 6 * 1000;

var foundDevices = [];
var isScanning = false;

var start_scan = function () {
    console.log('start_scan method');
    // noble.on('stateChange', function (state) {
    //     console.log('stateChange', state);
    //     if (state === 'poweredOn') {
    startScanningDuration();
    //     } else {
    //         console.log('stopScanning...');
    //         noble.stopScanning();
    //     }
    // });
};

var startScanningDuration = function () {
    if (!isScanning) {
        console.log('start scanning...');
        noble.startScanning();
    }

    setTimeout(function () {
        console.log(foundDevices.length);
        // if (foundDevices.length == 0) {
        // startScanningDuration();
        // return;
        // }

        noble.stopScanning(function (err) {
            uploadScanedDevice();
        });

    }, SCANNING_DURATION);
}

noble.on('scanStart', function () {
    isScanning = true;
    console.log('on scanStart');
});

noble.on('scanStop', function () {
    isScanning = false;
    console.log('on scanStop');
});

noble.on('discover', function (peripheral) {
    var advertisement = peripheral.advertisement;
    var localName = advertisement.localName;
    if (!localName) return;
    if (!localName.toLocaleLowerCase().includes('calm')) return;
    if (exist(peripheral)) return;
    console.log(peripheral.id);
    foundDevices.push(peripheral);
});

var exist = function (_peripheral) {
    for (var i = 0; i < foundDevices.length; i++) {
        var peripheral = foundDevices[i];
        if (peripheral.id == _peripheral.id) return true;
    }
    return false;
}


//configure azure
var config = require('../config');

var clientFromConnectionString = require('azure-iot-device-mqtt').clientFromConnectionString;
var Message = require('azure-iot-device').Message;

var DEVICE_ID = config.DEVICE_ID;

var connectionString = `HostName=${config.IOT_HOSTNAME};DeviceId=${DEVICE_ID};SharedAccessKey=${config.DEVICE_KEY}`;
var client = clientFromConnectionString(connectionString);

function printResultFor(op) {
    return function printResult(err, res) {
        if (err) console.log(op + ' error: ' + err.toString());
        if (res) console.log(op + ' status: ' + res.constructor.name);
    };
}

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
        client.on('message', function (msg) {
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
            client.complete(msg, printResultFor('completed'));
        });
        // Create a message and send it to the IoT Hub every second
        // setInterval(function () {
        var arr_foundDevices_id = [];
        for (var i = 0; i < foundDevices.length; i++) {
            var peripheral = foundDevices[i];
            arr_foundDevices_id.push(peripheral.id);
        }
        var json_str = JSON.stringify({
            scannedDevices: arr_foundDevices_id
        });
        var message = new Message(json_str);
        message.properties.add('temperatureAlert', (arr_foundDevices_id.length > 7) ? 'true' : 'false');
        console.log("Sending message: " + message.getData());
        client.sendEvent(message, printResultFor('send'));
        // }, 100000);
    }
};


var uploadScanedDevice = function () {
    client.open(connectCallback);
}

module.exports = {
    start_scan: start_scan
}