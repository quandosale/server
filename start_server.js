var chalk = require('chalk');

var path = require('path');
const express = require('express');
const app = express();
var server = require('http').createServer();

app.use(express.static(path.join(__dirname, '/public')));
server.on('request', app);
server.listen(80, function () {
    console.log('Listening on http://localhost:80');
});