var NobleDevice = require('noble-device');

var idOrLocalName = 'CALM_ECG'; //process.argv[2];

if (!idOrLocalName) {
    console.log("node hrm-device.js [ID or local name]");
    process.exit(1);
}

var YOUR_THING_SERVICE_UUID = '1977';
var YOUR_THING_NOTIFY_CHAR = '1028';

var YourThing = function (peripheral) {
    // console.log('constructor', peripheral);
    // this.id = peripheral.id
    NobleDevice.call(this, peripheral);
};

YourThing.is = function (peripheral) {
    var localName = peripheral.advertisement.localName;
    return (peripheral.id === idOrLocalName || localName === idOrLocalName);
};

NobleDevice.Util.inherits(YourThing, NobleDevice);
NobleDevice.Util.mixin(YourThing, NobleDevice.DeviceInformationService);
NobleDevice.Util.mixin(YourThing, NobleDevice.HeartRateMeasumentService);

YourThing.prototype.connectAndSetup = function (callback) {
    NobleDevice.prototype.connectAndSetUp.call(this, function (error) {
        // maybe notify on a characteristic ?
        this.notifyCharacteristic(YOUR_THING_SERVICE_UUID, YOUR_THING_NOTIFY_CHAR, true, this._onRead.bind(this), function (err) {
            console.log('error ', err);
            callback(err);
        });
    }.bind(this));
};
// YourThing.prototype.onDisconnect = function () {
//     // clean up ...
//     // call super's onDisconnect
//     NobleDevice.prototype.onDisconnect.call(this);
// };


// export your device 
module.exports = YourThing;