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
    
        noble.stopScanning();

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

        explore(peripheral);
    
});
app.listen(3000, () => console.log('Example app listening on port 3000!'))