import * as tasklist from "./../businesslogic/task";
import {getDb, saveDb} from "./../helpers/ModelCommon";;
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
command.create("create", function(subcmd, opts, args, cb) {
    tasklist.create.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help('Add tasks: name, description, folderId, contextId, agendaId')
  ;

command.create("sort", function(subcmd, opts, args, cb) {
    tasklist.sort.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("Sort task: taskid, sortorder(to insert to)")

command.create("list", function(subcmd, opts, args, cb) {
    tasklist.list.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("list the task")

command.create("list-by-parent", function(subcmd, opts, args, cb) {
    tasklist.listByParent.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("list by parent: parentTaskId, allOrNotDone")
  .aliases(["list-p"]);
    
command.create("sort-by-parent", function(subcmd, opts, args, cb) {
    tasklist.sortByParent.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("sort by parent: taskId, toInsertTo")
  .aliases(["sort-p"]);


command.create("set-parent", function(subcmd, opts, args, cb) {
    tasklist.setParentTask.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("set parenttask: taskId, parentTaskId, shouldForce")
command.create("done", function(subcmd, opts, args, cb) {
    tasklist.markDone.apply(tasklist, args)
      .then(res => console.log(res) );
    cb();
  })
  .help("set task as done: taskId")
command.create("undone", function(subcmd, opts, args, cb) {
  tasklist.unmarkDone.apply(tasklist, args)
    .then(res => console.log(res) );
  cb();
})
.help("set task as not yet done: taskId")
export default TaskList;