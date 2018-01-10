var chalk = require('chalk');

var path = require('path');
const express = require('express');
const app = express();
var server = require('http').createServer();

// var start_scan = require('./ble/start_scan').start_scan;
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

var connectCallback = function (err) {
    if (err) {
        console.log('Could not connect: ' + err);
    } else {
        console.log('Client connected');
        client.on('message', function (msg) {
            console.log('Id: ' + msg.messageId + ' Body: ' + msg.data);
            var command = '' + msg.messageId;
            switch (command) {
                case "startScan":
                    console.log(chalk.red('command: startScan'));
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
                    // start_scan();
                    break;
                case "startConnect":
                    var json_str = msg.data;
                    console.log(chalk.red('command: startConnect with ' + json_str));
                    var json = JSON.parse(json_str);
                    var registeredDevices = json.devices;
                    console.log(registeredDevices)
                    // ble_entry();
                    break;
            }
            client.complete(msg, printResultFor('completed'));
        });
    }
};

console.log('Connecting to iot-hub...');
client.open(connectCallback);