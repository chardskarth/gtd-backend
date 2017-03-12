import * as contextpage from "./../businesslogic/context";
import {getDb, saveDb} from "./../model/init";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function ContextPage() {
    cmdln.Cmdln.call(this, {
        name: 'gtd ContextPage',
        desc: 'Do something with contexts'
    });
}
util.inherits(ContextPage, cmdln.Cmdln);

var command = CmdlnCreator(ContextPage);
command.create("create", function(subcmd, opts, args, cb) {
    var db = getDb();
    contextpage.create.apply(contextpage, args);
    saveDb();
    cb();
  })
  .help('Add context: name, description')
  ;

command.create("sort", function(subcmd, opts, args, cb) {
    var db = getDb();
    contextpage.sort.apply(contextpage, args);
    saveDb();
    cb();
  })
  .help("Sort context: contextId, sortorder(to insert to)")
  ;

command.create("list", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = contextpage.list.apply(contextpage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the contexts")

command.create("list-task", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = contextpage.listTasks.apply(contextpage, args);
    console.log(res);
    saveDb();
    cb();
  })
  .help("list tasks: contextId, allOrNotDone")
  .aliases(["list-t"]);

command.create("sort-task", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = contextpage.sortTask.apply(contextpage, args);
    console.log(res);
    saveDb();
    cb();
  })
  .help("sort task: taskId, allOrNotDone")
  .aliases(["sort-t"]);

command.create("move-task", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = contextpage.moveTask.apply(contextpage, args);
    console.log(res);
    saveDb();
    cb();
  })
  .help("move task: taskId, newContextId")
  .aliases(["move-t"]);

export default ContextPage;