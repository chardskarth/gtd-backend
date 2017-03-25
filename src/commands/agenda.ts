import * as agendapage from "./../businesslogic/agenda";
import {getDb, saveDb} from "./../helpers/ModelCommon";
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
    agendapage.create.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help('Add agenda: name, description')
  ;

command.create("sort", function(subcmd, opts, args, cb) {
    agendapage.sort.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help("Sort agenda: taskid, sortorder(to insert to)")
  ;

command.create("list", function(subcmd, opts, args, cb) {
    agendapage.list.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help("list the agendas")

command.create("list-task", function(subcmd, opts, args, cb) {
    agendapage.listTasks.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help("list tasks: agendaId, allOrNotDone")
  .aliases(["list-t"]);

command.create("sort-task", function(subcmd, opts, args, cb) {
    agendapage.sortTask.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help("sort the task: taskId, toInsertTo")
  .aliases(["sort-t"]);

command.create("move-task", function(subcmd, opts, args, cb) {
    agendapage.moveTask.apply(agendapage, args)
      .then(function(res){ console.log(res); });
    cb();
  })
  .help("move the task: taskId, newAgendaId")
  .aliases(["move-t"]);

export default Agendapage;