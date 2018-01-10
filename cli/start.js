var chalk = require('chalk');

var path = require('path');
const async = require('async');
const express = require('express')
const app = express()
const WebSocket = require('ws');

var WebSocketServer = require('ws').Server;

const moment = require('moment');
const http = require('http');
var server = require('http').createServer();

var daemon = require("daemonize2").setup({
    main: "../start_server.js",
    name: "sampleapp",
    pidfile: "sampleapp.pid"
});

// var wss = new WebSocketServer({
//     server: server
// });

// // Broadcast to all.
// wss.broadcast = function broadcast(data) {
//     wss.clients.forEach(function each(client) {

//         if (client.readyState === WebSocket.OPEN) {
//             try {
//                 // console.log('sending data ' + data);
//                 client.send(data);
//             } catch (e) {
//                 console.error(e);
//             }
//         }
//     });
// };

var j = 1;
// wss.on('connection', function (ws) {
//     var id = setInterval(function () {

//         var xt = j++;
//         var mt = j++;
//         ws.send(JSON.stringify({
//             humidity: xt,
//             temperature: mt,
//             time: mt
//         }), function () { /* ignore errors */ });
//     }, 100);
//     console.log('started client interval');
//     ws.on('close', function () {
//         console.log('stopping client interval');
//         clearInterval(id);
//     });
// });


var start_function = function (program) {
    // console.log('start server');
    // app.use(express.static(path.join(__dirname, '/public')));
    // server.on('request', app);
    // server.listen(80, function () {
    //     console.log('Listening on http://localhost:80');
    // });
    daemon.start();
};
module.exports = {
    start_function: start_function
};