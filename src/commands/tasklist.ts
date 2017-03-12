import * as tasklist from "./../businesslogic/task";
import {getDb, saveDb} from "./../model/init";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function TaskList() {
    cmdln.Cmdln.call(this, {
        name: 'gtd task',
        desc: 'Do something with tasks'
    });
}
util.inherits(TaskList, cmdln.Cmdln);

var command = CmdlnCreator(TaskList);
command.create("list-by-parent", function(subcmd, opts, args, cb) {
    var db = getDb();

    var allOrNotDone = typeof opts.allOrNotDone === "undefined" 
      ? undefined : Boolean(parseInt(opts.allOrNotDone));
    var res = tasklist.listByParent.apply(tasklist, args);
    console.log(res);
    saveDb();
    cb();
  })
  .help("list by parent: parentTaskId, allOrNotDone")
  .aliases(["list"]);
    
command.create("sort-by-parent", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = tasklist.sortByParent.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("sort by parent: taskId, parentTaskId, toInsertTo")
  .aliases(["sort"]);


command.create("setparent", function(subcmd, opts, args, cb) {
    var db = getDb();
    //opts is 
    var res = tasklist.setParentTask.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("set parenttask: taskId, parentTaskId, shouldForce")
command.create("markdone", function(subcmd, opts, args, cb) {
    var db = getDb();
    //opts is 
    var res = tasklist.markDone.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("set task as done: taskId")
command.create("unmarkdone", function(subcmd, opts, args, cb) {
  var db = getDb();
  //opts is 
  var res = tasklist.unmarkDone.apply(tasklist, args);
  saveDb();
  cb();
})
.help("set task as not yet done: taskId")
export default TaskList;