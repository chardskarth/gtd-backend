import * as folderpage from "./../businesslogic/folder";
import {getDb, saveDb} from "./../helpers/ModelCommon";;
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
command.create("create", function(subcmd, opts, args, cb) {
    folderpage.create.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help('Add folder: name, description')
  ;

command.create("sort", function(subcmd, opts, args, cb) {
    folderpage.sort.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("Sort folder: folderId, sortorder(to insert to)")
  ;

command.create("list", function(subcmd, opts, args, cb) {
    folderpage.list.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("list folders")

command.create("delete", function(subcmd, opts, args, cb) {
    folderpage.deleteFolder.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("delete the folder: folderId, shouldForce");

command.create("list-task", function(subcmd, opts, args, cb) {
    folderpage.listTasks.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("list tasks: folderId, allOrNotDone")
  .aliases(["list-t"]);

command.create("sort-task", function(subcmd, opts, args, cb) {
    folderpage.sortTask.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("sort task: taskId, allOrNotDone")
  .aliases(["sort-t"]);

command.create("move-task", function(subcmd, opts, args, cb) {
    folderpage.moveTask.apply(folderpage, args)
      .then(res => console.log(res));
    cb();
  })
  .help("move task: taskId, newFolderId")
  .aliases(["move-tt"]);
export default Folderpage;