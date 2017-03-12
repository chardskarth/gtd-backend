import * as fs from "fs";
import { Migrator, Debug } from "./../helpers/Migrator";

// var openDatabase = require('websql');
import * as SQL from "sql.js";


var _db: SQL.Database;
const FILE_NAME = "gtd.db";

export function createDb(){
  var {agenda} = require("./../model/agenda");
  var {context} = require("./../model/context");
  var {folder} = require("./../model/folder");
  var {task} = require("./../model/task");
  var {taskagenda} = require("./../model/taskagenda");
  var {foldercontext} = require("./../model/foldercontext");
  var {taskcontext} = require("./../model/taskcontext");
  var {taskfolder} = require("./../model/taskfolder");
  var {sort} = require("./../model/sort");
  
  //reading file from diskx`
  try{
    var filebuffer = fs.readFileSync(FILE_NAME);
    _db = new SQL.Database(filebuffer);//openDatabase('gtd.db', '', 'description', 1);
  } catch(err) {
    _db = new SQL.Database();
  }
  
  var M = new Migrator(_db);
  // M.setDebugLevel(Debug.HIGH);
  M.migration(1, function(db){
    agenda.createTable(db);
    context.createTable(db);
    folder.createTable(db);
    task.createTable(db);
    sort.createTable(db);
  });
  M.migration(2, function(db){
    foldercontext.createTable(db);
    taskagenda.createTable(db);
    taskcontext.createTable(db);
    taskfolder.createTable(db);
  });
  M.execute();
  saveDb();
  return _db;
}

export function getDb(){
  if(!_db){
    var filebuffer;
    try {
     filebuffer = fs.readFileSync(FILE_NAME); 
    } catch (error) {
      if(error.message.indexOf("ENOENT:") != -1)
        throw Error("DB not yet existing");
      else 
        throw error;
    }
    _db = new SQL.Database(filebuffer);//openDatabase('gtd.db', '', 'description', 1);
  }
  return _db;
}

export function saveDb() {
  fs.writeFileSync(FILE_NAME, new Buffer(_db.export()));
}

export var DBNames = {
  task: "task"
  , sort: "sort"
  , folder: "folder"
  , taskfolder: "taskfolder"
  , context: "context"
  , taskcontext: "taskcontext"
  , agenda: "agenda"
  , taskagenda: "taskagenda"
}

var FieldNames = {}
var knownFields = [ "taskfolder.taskid"
, "taskfolder.folderid"
, "folder.id"
, "taskcontext.taskid"
, "taskcontext.contextid"
, "context.id"
, "taskagenda.taskid"
, "taskagenda.agendaid"
, "agenda.id" ]
var ProxyFieldNames = new Proxy(FieldNames, {
  get: function(target, property, receiver){
    console.log(receiver);
    var found = knownFields.find(x => x === property);
    if(found) {
      return found; 
    } else {
      throw Error(`${property} is not known`);
    }
  }
});
export {ProxyFieldNames as FieldNames};