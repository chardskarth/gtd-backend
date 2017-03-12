import {createDb} from "./../helpers/ModelCommon";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
var print = console.log.bind(console);

function Config() {
    cmdln.Cmdln.call(this, {
        name: 'gtd config',
        desc: 'Config for database and initialization'
    });
}
util.inherits(Config, cmdln.Cmdln);
var command = CmdlnCreator(Config);
    command.create("init", function() {
        createDb();
        print("DB created");
    })
    .help("Create sqlite db");

export default Config;