var NobleDevice = require('noble-device');

var YOUR_THING_SERVICE_UUID = '1977';
var YOUR_THING_NOTIFY_CHAR = '1028';

var YourThing = require('./YourThing');
var id = '<your devices id>';
YourThing.discover(function (yourThingInstance) {

    // you can be notified of disconnects 
    yourThingInstance.on('disconnect', function () {
        console.log('we got disconnected! :( ');
    });

    // you'll need to call connect and set up 
    yourThingInstance.connectAndSetUp(function (error) {
        console.log('were connected!');
        // yourThingInstance.notifyMeasument(function (counter) {
        //     console.log('notifyMeasument');
        // });
    });

});