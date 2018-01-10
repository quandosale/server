// [BEGIN] CONFIGURE for Web server
var path = require('path');
const express = require('express')
const app = express()
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
    var id = setInterval(function () {}, 100);
    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
        clearInterval(id);
    });
});
app.use(express.static(path.join(__dirname, '/public')));
server.on('request', app);
server.listen(80, function () {
    console.log('Listening on http://localhost:80');
});
// [END] CONFIGURE for Web server


// [BEGIN] for Ble management
const async = require('async');
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
        //
        // Once the BLE radio has been powered on, it is possible
        // to begin scanning for services. Pass an empty array to
        // scan for all services (uses more time and power).
        //
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
            connectWithFoundDevice();
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

function connectWithFoundDevice() {
    console.log("connect with found device ", foundDevices.length);
    if (foundDevices.length == 0) return;
    for (var i = 0; i < foundDevices.length; i++) {
        var peripheral = foundDevices[i];
        connectWith(peripheral);
    }
    setTimeout(function () {
        startScanningDuration();
    }, CONNECTING_DURATION);
}

function connectWith(peripheral) {
    // console.log(peripheral);
    var state = peripheral.state;
    console.log('connecting... with ' + peripheral.id, "state = '" + state + "'");

    if (state != "disconnected") return;

    peripheral.on('disconnect', function () {
        console.log('on Disconnected: ' + peripheral.id)
    });

    peripheral.connect(function (error) {
        // noble.startScanning();
        if (error) {
            console.log('peripheral connect error', error);
            return;
        }
        console.log(peripheral.id + ' connected');
        //[BEGIN connected]
        peripheral.discoverServices([], function (error, services) {
            var serviceIndex = 0;

            async.whilst(function () {
                    return (serviceIndex < services.length);
                },
                function (callback) {
                    var service = services[serviceIndex];
                    var serviceInfo = service.uuid;

                    if (service.name) {
                        serviceInfo += ' (' + service.name + ')';
                    }
                    // console.log('serviceInfo', serviceInfo);

                    service.discoverCharacteristics([], function (error, characteristics) {
                        var characteristicIndex = 0;

                        async.whilst(function () {
                                return (characteristicIndex < characteristics.length);
                            },
                            function (callback) {
                                var characteristic = characteristics[characteristicIndex];
                                var characteristicInfo = '  ' + characteristic.uuid;
                                if (characteristic.uuid == ECG_NOTIFY_CHAR) {
                                    characteristic.on('data', (data, isNotification) => onNotify(characteristic, data, isNotification));
                                    characteristic.subscribe(function (error) {
                                        console.log('ecg notification on', peripheral.id);
                                    });
                                }
                                if (characteristic.name) {
                                    characteristicInfo += ' (' + characteristic.name + ')';
                                }

                                async.series([
                                    function (callback) {
                                        characteristic.discoverDescriptors(function (error, descriptors) {
                                            async.detect(
                                                descriptors,
                                                function (descriptor, callback) {
                                                    return callback(descriptor.uuid === DESCRIPTOR_UUID);
                                                },
                                                function (userDescriptionDescriptor) {
                                                    if (userDescriptionDescriptor) {
                                                        userDescriptionDescriptor.readValue(function (error, data) {
                                                            if (data) {
                                                                characteristicInfo += ' (' + data.toString() + ')';
                                                            }
                                                            callback();
                                                        });
                                                    } else {
                                                        callback();
                                                    }
                                                }
                                            );
                                        });
                                    },
                                    function (callback) {
                                        characteristicInfo += '\n    properties  ' + characteristic.properties.join(', ');

                                        if (characteristic.properties.indexOf('read') !== -1) {
                                            characteristic.read(function (error, data) {
                                                if (data) {
                                                    var string = data.toString('ascii');

                                                    characteristicInfo += '\n    value       ' + data.toString('hex') + ' | \'' + string + '\'';
                                                }
                                                callback();
                                            });
                                        } else {
                                            callback();
                                        }
                                    },
                                    function () {
                                        // console.log(characteristicInfo);
                                        characteristicIndex++;
                                        callback();
                                    }
                                ]); //async.series
                            },
                            function (error) {
                                serviceIndex++;
                                callback();
                            }); //async.whilst(characteristic)
                    });
                },
                function (err) {
                    if (err) {
                        console.log('line 223 error', err)
                        peripheral.disconnect();
                    }
                }
            );
        }); //async.whilst(service)
        //[END connected]
    });
}
var time = 0;
const onNotify = (characteristic, data, isNotification) => {

    // console.log('-----------------------------------------')
    for (var i = 0; i < 5; i++) {

        var byte1 = data.readUInt8(1 + i * 2) & 0x00FF;
        var byte2 = data.readUInt8(1 + i * 2 + 1) & 0x00FF;
        var ecg = ecgTransform(byte1, byte2);
        // console.log('Ecg : ', ecg, typeof data);
        try {
            // if (characteristic._peripheralId == "f2b70e1995e0") {
            // console.log('isSensorDetected', mt, characteristic._peripheralId, isSensorDetected, ecgVal);
            // }
            wss.broadcast(JSON.stringify({
                humidity: ecg,
                temperature: ecg,
                time: time++,
                id: characteristic._peripheralId
            }));
        } catch (err) {
            console.error('error', err);
        }
    } // end for i = 5
}
// [END] for Ble management

var ecgTransform = function (byte1, byte2) {
    var ecgVal = byte1 + byte2 * 256;
    var isSensorDetected = ((ecgVal & 0x8000) != 0);

    ecgVal = ecgVal & 0x0fff;

    ecgVal = ecgVal * 2400 / 4096;

    if (ecgVal >= 2400) {
        ecgVal = 2390;
    }

    if (ecgVal <= 0) {
        ecgVal = 10;
    }

    return ecgVal;
}