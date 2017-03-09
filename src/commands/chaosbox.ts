import * as chaosbox from "./../businesslogic/chaosbox";
import {getDb, saveDb} from "./../model/init";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function Chaosbox() {
    cmdln.Cmdln.call(this, {
        name: 'gtd task',
        desc: 'Do something with tasks in chaos'
    });
}
util.inherits(Chaosbox, cmdln.Cmdln);
var command = CmdlnCreator(Chaosbox);

command.create("createtask", function(subcmd, opts, args, cb) {
    var db = getDb();
    chaosbox.createTask.apply(chaosbox, args);
    saveDb();
    cb();
  })
  .help('Add tasks: name, description, folderId, contextId, agendaId, reminder, repeat')
  .aliases(["create"])
  ;

command.create("sorttask", function(subcmd, opts, args, cb) {
    var db = getDb();
    chaosbox.sortTask.apply(chaosbox, args);
    saveDb();
    cb();
  })
  .help("Sort task: taskid, sortorder(to insert to)")
  .aliases(["sort"]);

command.create("listtask", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = chaosbox.listTask.apply(chaosbox, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the task")
  .aliases(["list"]);

export default Chaosbox;