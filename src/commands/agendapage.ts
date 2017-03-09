import * as agendapage from "./../businesslogic/agendapage";
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
command.create("createagenda", function(subcmd, opts, args, cb) {
    var db = getDb();
    agendapage.createAgenda.apply(agendapage, args);
    saveDb();
    cb();
  })
  .help('Add agenda: name, description')
  .aliases(["create"])
  ;

command.create("sortagenda", function(subcmd, opts, args, cb) {
    var db = getDb();
    agendapage.sortAgenda.apply(agendapage, args);
    saveDb();
    cb();
  })
  .help("Sort agenda: taskid, sortorder(to insert to)")
  .aliases(["sort"])
  ;

command.create("listagenda", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = agendapage.listAgenda.apply(agendapage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the agendas")
  .aliases(["list"]);

export default Agendapage;