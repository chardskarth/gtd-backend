import * as agendapage from "./../businesslogic/agenda";
import {getDb, saveDb} from "./../model/init";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function Agendapage() {
    cmdln.Cmdln.call(this, {
        name: 'gtd agendapage',
        desc: 'Do something with agendas'
    });
}
util.inherits(Agendapage, cmdln.Cmdln);

var command = CmdlnCreator(Agendapage);
command.create("create", function(subcmd, opts, args, cb) {
    var db = getDb();
    agendapage.create.apply(agendapage, args);
    saveDb();
    cb();
  })
  .help('Add agenda: name, description')
  ;

command.create("sort", function(subcmd, opts, args, cb) {
    var db = getDb();
    agendapage.sort.apply(agendapage, args);
    saveDb();
    cb();
  })
  .help("Sort agenda: taskid, sortorder(to insert to)")
  ;

command.create("list", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = agendapage.list.apply(agendapage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the agendas")

command.create("listtask", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = agendapage.listTasks.apply(agendapage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list tasks: agendaId, allOrNotDone")
  .aliases(["lt"]);

command.create("sorttask", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = agendapage.sortTask.apply(agendapage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("sort the task: taskId, toInsertTo")
  .aliases(["st"]);

command.create("movetask", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = agendapage.moveTask.apply(agendapage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("move the task: taskId, newAgendaId")
  .aliases(["mt"]);

export default Agendapage;