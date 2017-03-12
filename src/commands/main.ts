import ConfigModule from "./config";
import ChaosBoxModule from "./chaosbox";
import TaskListModule from "./tasklist";
import FolderPageModule from "./folder";
import AgendaPageModule from "./agenda";
import ContextPageModule from "./context";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function Main() {
    cmdln.Cmdln.call(this, {
        name: 'gtd',
        desc: 'GTD is your source of power'
    });
}
util.inherits(Main, cmdln.Cmdln);
var command = CmdlnCreator(Main);
    command.create("config", ConfigModule);
    command.create("chaosbox", ChaosBoxModule);
    command.create("folder", FolderPageModule);
    command.create("task", TaskListModule);
    command.create("agenda", AgendaPageModule);
    command.create("context", ContextPageModule);

export default Main;