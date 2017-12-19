var NobleDevice = require('noble-device');

var YOUR_THING_SERVICE_UUID = '1977';
var YOUR_THING_NOTIFY_CHAR = '1028';
var YOUR_THING_READ_CHAR = 'xxxxxxxxxxxxxxxxxxxxxxxx';
var YOUR_THING_WRITE_CHAR = 'xxxxxxxxxxxxxxxxxxxxxxxx';

// then create your thing with the object pattern 
var YourThing = function (peripheral) {
    // call nobles super constructor 
    NobleDevice.call(this, peripheral);

    // setup or do anything else your module needs here 
};

// tell Noble about the service uuid(s) your peripheral advertises (optional) 
YourThing.SCAN_UUIDS = [YOUR_THING_SERVICE_UUID];

// and/or specify method to check peripheral (optional) 
YourThing.is = function (peripheral) {
    return (peripheral.advertisement.localName === 'CALM_ECG');
};

YourThing.connectAndSetup = function (callback) {
    console.log('YourThing.prototype.connectAndSetup')
    NobleDevice.prototype.connectAndSetUp.call(this, function (error) {
        // maybe notify on a characteristic ?
        this.notifyCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_NOTIFY_CHAR, true, this._onRead.bind(this), function (err) {
            callback(err);
        });
    }.bind(this));
};
YourThing.prototype.onDisconnect = function () {
    // clean up ...

    // call super's onDisconnect
    NobleDevice.prototype.onDisconnect.call(this);
};
// inherit noble device 
NobleDevice.Util.inherits(YourThing, NobleDevice);

// you can mixin other existing service classes here too, 
// noble device provides battery and device information, 
// add the ones your device provides 
// NobleDevice.Util.mixin(YourThing, NobleDevice.BatteryService);
// NobleDevice.Util.mixin(YourThing, NobleDevice.HeartRateMeasumentService);


// export your device 
module.exports = YourThing;