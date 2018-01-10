var daemon = require("daemonize2").setup({
    main: "start_server.js",
    name: "sampleapp",
    pidfile: "sampleapp.pid"
});

var start_function = function (program) {
    daemon.start();
};

module.exports = {
    start_function: start_function
};