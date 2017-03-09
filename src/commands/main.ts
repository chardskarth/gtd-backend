import ConfigModule from "./config";
import ChaosBoxModule from "./chaosbox";
import TaskListModule from "./tasklist";
import FolderPageModule from "./folderpage";
import AgendaPageModule from "./agendapage";
import ContextPageModule from "./contextpage";
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
    command.create("folderpage", FolderPageModule);
    command.create("tasklist", TaskListModule);
    command.create("agendapage", AgendaPageModule);
    command.create("contextpage", ContextPageModule);

export default Main;