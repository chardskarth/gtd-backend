import * as contextpage from "./../businesslogic/contextpage";
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
command.create("createcontext", function(subcmd, opts, args, cb) {
    var db = getDb();
    contextpage.createContext.apply(contextpage, args);
    saveDb();
    cb();
  })
  .help('Add context: name, description')
  .aliases(["create"])
  ;

command.create("sortcontext", function(subcmd, opts, args, cb) {
    var db = getDb();
    contextpage.sortContext.apply(contextpage, args);
    saveDb();
    cb();
  })
  .help("Sort context: taskid, sortorder(to insert to)")
  .aliases(["sort"])
  ;

command.create("listcontext", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = contextpage.listContext.apply(contextpage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the contexts")
  .aliases(["list"]);

export default ContextPage;