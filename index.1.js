var path = require('path');
const async = require('async');
const express = require('express')
const app = express()
const noble = require('noble');
const WebSocket = require('ws');

var WebSocketServer = require('ws').Server;

const moment = require('moment');
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
var j = 1;
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
    console.log('Listening on http://localhost:80');
});

var SCANNING_DURATION = 4 * 1000;
var foundDevices = {};

noble.on('stateChange', function (state) {
    console.log('stateChange', state);
    if (state === 'poweredOn') {
        //
        // Once the BLE radio has been powered on, it is possible
        // to begin scanning for services. Pass an empty array to
        // scan for all services (uses more time and power).
        //
        console.log('scanning...');
        noble.startScanning();
        setTimeout(function stopScanning() {
            console.log("-          stop scanning               -");
            console.log(" found devices  ");
            console.log(foundDevices);
            noble.stopScanning();

          
        }, 10000);
    } else {
        console.log('stopScanning...');
        noble.stopScanning();
    }
});
var peripheralIndex = 1;
var processPeripheral = {};
var connectedIDs = {};

noble.on('scanStart', function () {
    console.log('on scanStart');
});

noble.on('scanStop', function () {
    console.log('on scanStop');
    connectWithFoundDevice();
});

noble.on('discover', function (peripheral) {

    // noble.stopScanning();

    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    // if (localName) {
    //     console.log('  Local Name        = ' + localName);
    // }

    // if (txPowerLevel) {
    //     console.log('  TX Power Level    = ' + txPowerLevel);
    // }

    // if (manufacturerData) {
    //     console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
    // }

    // if (serviceData) {
    //     console.log('  Service Data      = ' + serviceData);
    // }

    // if (serviceUuids) {
    //     console.log('  Service UUIDs     = ' + serviceUuids);
    // }

    console.log();
    if (!localName) return;
    if (!localName.toLocaleLowerCase().includes('calm')) return;
    foundDevices[peripheral.id] = peripheral;
});

function connectWithFoundDevice() {
    // console.log("connect with found device ", foundDevices);
    if (foundDevices.length == 0) return;
    for (var i = 0; i < foundDevices.length; i++) {
        var peripheral = foundDevices[i];
        console.log("item", peripheral.id);
        connectWith(peripheral);
    }
}

function connectWith(peripheral) {
    // if (connectedIDs[peripheral.id] == 'known') {
        // console.log(peripheral.id + ' discovered again');
    // } else {

        console.log(new Date() + ' ' + peripheral.id + ' discovered first time');
        peripheral.on('disconnect', function () {
            console.log('on Disconnected & exit(0)')
            // process.exit(0);
        });

        connectedIDs[peripheral.id] = 'known';

        // var timeVar = setInterval(() => {
            peripheral.connect(function (error) {
                noble.startScanning();
                if (error) {
                    console.log('peripheral connect error', error);
                    if (error.message)
                        if (error.message.toLocaleLowerCase().includes('already connected')) {
                            console.log('clear Time Interval, unneccessory repeat');
                            // clearInterval(timeVar);
                        }
                    return;
                }
                console.log(new Date() + ' ' + peripheral.id + ' connected');
                //[BEGIN connected]
                peripheral.discoverServices([], function (error, services) {
                    var serviceIndex = 0;

                    async.whilst(
                        function () {
                            return (serviceIndex < services.length);
                        },
                        function (callback) {
                            var service = services[serviceIndex];
                            var serviceInfo = service.uuid;

                            if (service.name) {
                                serviceInfo += ' (' + service.name + ')';
                            }
                            console.log('serviceInfo', serviceInfo);

                            service.discoverCharacteristics([], function (error, characteristics) {
                                var characteristicIndex = 0;

                                async.whilst(
                                    function () {
                                        return (characteristicIndex < characteristics.length);
                                    },
                                    function (callback) {
                                        var characteristic = characteristics[characteristicIndex];
                                        var characteristicInfo = '  ' + characteristic.uuid;
                                        if (characteristic.uuid == '1028') {
                                            characteristic.on('data', (data, isNotification) => onNotify(characteristic, data, isNotification));
                                            characteristic.subscribe(function (error) {
                                                console.log('ecg notification on');
                                                console.log();
                                                console.log('scanning...  ' + peripheralIndex);
                                                // setTimeout(() => noble.startScanning(), 3000);
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
                                                            return callback(descriptor.uuid === '2901');
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
                                        ]);
                                    },
                                    function (error) {
                                        serviceIndex++;
                                        callback();
                                    }
                                );
                            });
                        },
                        function (err) {
                            if (err) {
                                console.log('line 188 error', err)
                                peripheral.disconnect();
                            }
                        }
                    );
                });
                //[END connected]
            });
        // }, 1000);
    // }
    console.log('services and characteristics:');



    console.log('connecting with', peripheral.id)
    // peripheral.connect(function (error) {
    //     if (error) {
    //         console.log('peripheral connect error', error);

    //     }

    // });
}

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// })


// app.listen(3000, () => console.log('Example app listening on port 3000!'))

const onNotify = (characteristic, data, isNotification) => {

    console.log('-----------------------------------------')
    for (var i = 0; i < 5; i++) {

        var a = data.readUInt8(1 + i * 2) & 0x00FF;
        var b = data.readUInt8(1 + i * 2 + 1) & 0x00FF;
        var ecgVal = a + b * 256;
        var isSensorDetected = ((ecgVal & 0x8000) != 0);


        ecgVal = ecgVal & 0x0fff;
        if (ecgVal >= 4095) {
            ecgVal = 4090;
        }
        ecgVal = ecgVal * 2400 / 4096;

        if (ecgVal <= 0) {
            ecgVal = 10;
        }
        // console.log('Ecg : ', ecg, typeof data);
        try {
            var mt = j++;
            // if (characteristic._peripheralId == "f2b70e1995e0") {
            // console.log('isSensorDetected', mt, characteristic._peripheralId, isSensorDetected, ecgVal);
            // }
            wss.broadcast(JSON.stringify({
                humidity: ecgVal,
                temperature: ecgVal,
                time: mt,
                id: characteristic._peripheralId
            }));
        } catch (err) {
            console.error('error', err);
        }
    } // end for i = 5
}