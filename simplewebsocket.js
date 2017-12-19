var WebSocketServer = require('ws').Server;
var express = require('express');
var path = require('path');
var app = express();
var server = require('http').createServer();

app.use(express.static(path.join(__dirname, '/public')));
const WebSocket = require('ws');
var wss = new WebSocketServer({
    server: server
});
var i = 0;
var j = 1;
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
wss.on('connection', function (ws) {
    // var id = setInterval(function () {

    //     var xt = i++;
    //     var mt = j++;
    //     // ws.send(JSON.stringify({
    //     //     humidity: xt,
    //     //     temperature: mt,
    //     //     time: mt
    //     // }), function () { /* ignore errors */ });
    //     var ecgVal = xt;
    //     wss.broadcast(JSON.stringify({
    //         humidity: ecgVal,
    //         temperature: ecgVal,
    //         time: mt
    //     }));
    // }, 100);
    console.log('started client interval');
    ws.on('close', function () {
        console.log('stopping client interval');
        clearInterval(id);
    });
});
var id = setInterval(function () {

    var xt = i++;
    var mt = j++;
    // ws.send(JSON.stringify({
    //     humidity: xt,
    //     temperature: mt,
    //     time: mt
    // }), function () { /* ignore errors */ });
    var ecgVal = Math.sin(xt / 2 * 3.14) * 1000;
    wss.broadcast(JSON.stringify({
        humidity: ecgVal,
        temperature: ecgVal,
        time: mt
    }));
}, 100);
server.on('request', app);
server.listen(8080, function () {
    console.log('Listening on http://localhost:8080');
});