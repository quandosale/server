var chalk = require('chalk');
var login_function = function (program) {
    console.log('login');
    var name = program.username;
    var pwd = program.password;
    if (!name || !pwd) {
        console.error(chalk.red("require 'Name/Password' "));
        return;
    }
    console.log('Success login with your accout (user: %s pass: %s)',
        program.username, program.password);
};
module.exports = {
    login_function: login_function
};