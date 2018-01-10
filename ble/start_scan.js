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
noble.on('stateChange', function (state) {
    console.log('stateChange', state);
    if (state === 'poweredOn') {
        startScanningDuration();
    } else {
        console.log('stopScanning...');
        noble.stopScanning();
    }
});

var startScanningDuration = function () {
    if (!isScanning) {
        console.log('start scanning...');
        noble.startScanning();
    }

    setTimeout(function () {
        console.log(foundDevices.length);
        if (foundDevices.length == 0) {
            startScanningDuration();
            return;
        }

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

var uploadScanedDevice = function () {

}