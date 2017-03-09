import * as tasklist from "./../businesslogic/tasklist";
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
command.create("listtasks", function(subcmd, opts, args, cb) {
    var db = getDb();

    var allOrNotDone = typeof opts.allOrNotDone === "undefined" 
      ? undefined : Boolean(parseInt(opts.allOrNotDone));
    var res = tasklist.listTasks.call(tasklist, opts.folderId
      , opts.agendaId, opts.contextId, opts.parentTaskId, allOrNotDone);
    console.log(res);
    saveDb();
    cb();
  })
  .createOption('folderId', 'f', function(optObj){
    optObj.type("string")
      .help('The folder id')
      .helpArg('FolderId')
      .default(undefined);
  })
  .createOption('agendaId', 'a', function(optObj){
    optObj.type("string")
      .help('The agenda id')
      .helpArg('AgendaId')
      .default(undefined);
  })
  .createOption('contextId', 'c', function(optObj){
    optObj.type("string")
      .help('The context id')
      .helpArg('ContextId')
      .default(undefined);
  })
  .createOption('parentTaskId', 'p', function(optObj){
    optObj.type("string")
      .help('The parentask id')
      .helpArg('ParentTaskId')
      .default(undefined);
  })
  .createOption('allOrNotDone', 'd', function(optObj){
    optObj.type("number")
      .default(undefined);
  })
  .help("list the tasks")
  .aliases(["list"]);
    
command.create("sorttasks", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = tasklist.sortTask.apply(tasklist, [opts.folderId
      , opts.agendaId, opts.contextId, opts.parentTaskId].concat(args));
    saveDb();
    cb();
  })
  .createOption('folderId', 'f', function(optObj){
    optObj.type("string")
      .help('The folder id')
      .helpArg('FolderId')
      .default(undefined);
  })
  .createOption('agendaId', 'a', function(optObj){
    optObj.type("string")
      .help('The agenda id')
      .helpArg('AgendaId')
      .default(undefined);
  })
  .createOption('contextId', 'c', function(optObj){
    optObj.type("string")
      .help('The context id')
      .helpArg('ContextId')
      .default(undefined);
  })
  .createOption('parentTaskId', 'p', function(optObj){
    optObj.type("string")
      .help('The parentask id')
      .helpArg('ParentTaskId')
      .default(undefined);
  })  
  .help("sort the tasks: taskId, newSort")
  .aliases(["sort"]);

command.create("movefolder", function(subcmd, opts, args, cb) {
    var db = getDb();
    //opts is 
    var res = tasklist.moveFolder.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("move a task to folder: taskId, newFolder")
  .aliases(["move"]);

command.create("moveagenda", function(subcmd, opts, args, cb) {
    var db = getDb();
    //opts is 
    var res = tasklist.moveAgenda.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("move a task to agenda: taskId, newAgendaId")

command.create("movecontext", function(subcmd, opts, args, cb) {
    var db = getDb();
    //opts is 
    var res = tasklist.moveContext.apply(tasklist, args);
    saveDb();
    cb();
  })
  .help("move a task to context: taskId, newContextId")

command.create("parenttask", function(subcmd, opts, args, cb) {
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