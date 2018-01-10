var chalk = require('chalk');

var path = require('path');
const express = require('express');
const app = express();
var server = require('http').createServer();

var start_scan = require('./ble/start_scan').start_scan;
// var ble_entry = require('./ble/multi').entry;

// app.use(express.static(path.join(__dirname, '/public')));
// server.on('request', app);
// server.listen(80, function () {
//     console.log('Listening on http://localhost:80');
// });
// connect to Azure
var config = require('./config');

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

function onStartScan(request, response) {
    console.log(request.payload);
    console.log(chalk.red('command: onStartScan'));
    // setInterval(function () {
    //     var foundDevices = ["AA:bb:cc:dd,EA:bb:cc:dd"];
    //     var json_str = JSON.stringify({
    //         scannedDevices: foundDevices
    //     });
    //     var message = new Message(json_str);
    //     message.properties.add('temperatureAlert', (foundDevices.length > 7) ? 'true' : 'false');
    //     console.log("Sending message: " + message.getData());
    //     client.sendEvent(message, printResultFor('send'));
    // }, 1000);

    start_scan();
    response.send(200, 'Input was written to log.', function (err) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });
}

function onStartConnect(request, response) {
    console.log(request.payload);
    console.log(chalk.red('command: onStartConnect'));
    setInterval(function () {
        var foundDevices = ["AA:bb:cc:dd,EA:bb:cc:dd"];
        var json_str = JSON.stringify({
            scannedDevices: foundDevices
        });
        var message = new Message(json_str);
        message.properties.add('temperatureAlert', (foundDevices.length > 7) ? 'true' : 'false');
        console.log("Sending message: " + message.getData());
        client.sendEvent(message, printResultFor('send'));
    }, 1000);

    // ble_entry();
    response.send(200, 'Input was written to log.', function (err) {
        if (err) {
            console.error('An error ocurred when sending a method response:\n' + err.toString());
        } else {
            console.log('Response to method \'' + request.methodName + '\' sent successfully.');
        }
    });
}

console.log('Connecting to iot-hub...');
client.open(function (err) {
    if (err) {
        console.error('could not open IotHub client');
    } else {
        console.log('client opened');
        client.onDeviceMethod('startScan', onStartScan);
        client.onDeviceMethod('startConnect', onStartConnect);

    }
});