import * as folderpage from "./../businesslogic/folderpage";
import {getDb, saveDb} from "./../model/init";
import CmdlnCreator  from "./../helpers/CmdlnCommandCreator";

var util = require('util');
var cmdln = require('cmdln');
 
function Folderpage() {
    cmdln.Cmdln.call(this, {
        name: 'gtd task',
        desc: 'Do something with folders'
    });
}
util.inherits(Folderpage, cmdln.Cmdln);

var command = CmdlnCreator(Folderpage);
command.create("createfolder", function(subcmd, opts, args, cb) {
    var db = getDb();
    folderpage.createFolder.apply(folderpage, args);
    saveDb();
    cb();
  })
  .help('Add folder: name, description')
  .aliases(["create"])
  ;

command.create("sortfolder", function(subcmd, opts, args, cb) {
    var db = getDb();
    folderpage.sortFolder.apply(folderpage, args);
    saveDb();
    cb();
  })
  .help("Sort task: taskid, sortorder(to insert to)")
  .aliases(["sort"])
  ;

command.create("listfolder", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = folderpage.listFolder.apply(folderpage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("list the folder")
  .aliases(["list"]);

command.create("deletefolder", function(subcmd, opts, args, cb) {
    var db = getDb();
    var res = folderpage.deleteFolder.apply(folderpage, args);
    console.log(res);
    
    saveDb();
    cb();
  })
  .help("delete the folder")
  .aliases(["delete"]);
export default Folderpage;