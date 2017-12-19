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

YourThing.discoverAll(function (yourThingInstance) {
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

        yourThingInstance.notifyCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_NOTIFY_CHAR, YourThing, (data, isNotify, err) => func(yourThingInstance, data, isNotify, err), function (err) {
            // callback(err);
        });

        // noble.startScanning();
    });

});
const func = (thing, data, isNotify, err) => {
    console.log(thing.id, data);
}