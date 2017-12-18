var async = require('async');
const express = require('express')
const app = express()


var noble = require('noble');

app.get('/', (req, res) => {
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
        } else {
            console.log('stopScanning...');
            noble.stopScanning();
        }
    })
    res.send('Hello World!');
})
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
    } else {
        console.log('stopScanning...');
        noble.stopScanning();
    }
})

noble.on('discover', function (peripheral) {

    // noble.stopScanning();

    console.log('peripheral with ID ' + peripheral.id + ' found');
    var advertisement = peripheral.advertisement;

    var localName = advertisement.localName;
    var txPowerLevel = advertisement.txPowerLevel;
    var manufacturerData = advertisement.manufacturerData;
    var serviceData = advertisement.serviceData;
    var serviceUuids = advertisement.serviceUuids;

    if (localName) {
        console.log('  Local Name        = ' + localName);
    }

    if (txPowerLevel) {
        console.log('  TX Power Level    = ' + txPowerLevel);
    }

    if (manufacturerData) {
        console.log('  Manufacturer Data = ' + manufacturerData.toString('hex'));
    }

    if (serviceData) {
        console.log('  Service Data      = ' + serviceData);
    }

    if (serviceUuids) {
        console.log('  Service UUIDs     = ' + serviceUuids);
    }

    console.log();
    if (localName) {
        if (localName.toLocaleLowerCase().includes('calm')) {
            // noble.stopScanning();
            // console.log()
            explore(peripheral);
        }
    }


});


function explore(peripheral) {
    console.log('services and characteristics:');

    peripheral.on('disconnect', function () {
        console.log('on Disconnected & exit(0)')
        process.exit(0);
    });

    // console.log('connecting ', peripheral)
    peripheral.connect(function (error) {
        if (error) {
            console.log('peripheral connect error', error);

        }
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
                                    characteristic.on('data', function (data, isNotification) {
                                        var a = data.readUInt8(0) & 0x00FF;
                                        var b = data.readUInt8(1) & 0x00FF;
                                        var ecg = a * 256 + b;
                                        // console.log('Ecg : ', ecg, typeof data);
                                    });
                                    characteristic.subscribe(function (error) {
                                        console.log('battery level notification on');
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
                                        console.log(characteristicInfo);
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
    });
}


app.listen(3000, () => console.log('Example app listening on port 3000!'))