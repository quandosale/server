var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer();

app.use(express.static(path.join(__dirname, '/public')));

var wss = new WebSocketServer({
    server: server
});
var i = 0;
var j = 1;
wss.on('connection', function (ws) {
    var id = setInterval(function () {

        var xt = i++;
        var mt = j++;
        ws.send(JSON.stringify({
            humidity: xt,
            temperature: mt,
            time: mt
        }), function () { /* ignore errors */ });
    }, 100);
    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
        clearInterval(id);
    });
});

server.on('request', app);
server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});