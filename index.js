#!/usr/bin/env node

var chalk = require('chalk');
var program = require('commander');
var login_function = require('./cli/login').login_function;
var start_function = require('./cli/start').start_function;
var stop_function = require('./cli/stop').stop_function;

program
    .arguments('<command>')
    .option('-u, --username <username>', 'The user to authenticate as')
    .option('-p, --password <password>', 'The user\'s password')
    .action(function (command) {
        console.log('user: %s, pass: %s, command: %s', program.username, program.password, command);
        command = "" + command;
        command = command.toLowerCase();
        switch (command) {
            case "login":
                login_function(program);
                break;
            case 'start':
                console.log(chalk.red("start?"));
                start_function(program);
                break;
            case 'stop':
                console.log(chalk.green("stop?"));
                stop_function(program);
                break;

        }
    })
    .parse(process.argv);
console.log('Kanagawa CLI v 0.3');