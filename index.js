const express = require('express')
const app = express()

var noble = require('noble');

app.get('/', (req, res) => {
    noble.on('stateChange', function (state) {
        if (state === 'poweredOn') {
            noble.startScanning();
        } else {
            noble.stopScanning();
        }
    });
    // res.send('Hello World!');
})

app.listen(3000, () => console.log('Example app listening on port 3000!'))