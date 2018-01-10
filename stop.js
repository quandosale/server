var chalk = require('chalk');

var path = require('path');
var daemon = require("daemonize2").setup({
    main: "start_server.js",
    name: "sampleapp",
    pidfile: "sampleapp.pid"
});

var stop_function = function (program) {
    daemon.stop();
};

module.exports = {
    stop_function: stop_function
};