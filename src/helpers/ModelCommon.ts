import * as fs from "fs";
import { Migrator, Debug } from "./../helpers/Migrator";
import Promise = require("bluebird");

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
  var {contextcurrent} = require("./../model/contextcurrent");
  
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
    contextcurrent.createTable(db);
  });
  M.execute();
  saveDb();
  return _db;
}

export function getDb(): SQL.Database {
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

var _lastTransactionDefer: Promise.Resolver<SQL.Database> = Promise.defer() as any;
var trans: Promise.Resolver<SQL.Database>[] = [] as  any;
export function beginTransaction() {
  return Promise.coroutine(function * () {
    var db = getDb();
    db.exec("Begin");
    trans.push(Promise.defer() as any);
    var promiseToWait;
    var transBeforeThis = trans[trans.length - 2];
    if(transBeforeThis) {  
      promiseToWait = transBeforeThis.promise;
    } else {
      promiseToWait = Promise.resolve();
    }
    yield promiseToWait;
  })();
}

export function endTransaction() {
  return Promise.coroutine(function *(){ 
    var db = getDb();
    db.exec("End");
    trans[trans.length - 1].resolve();
    yield trans[trans.length - 1].promise;
    trans.pop();
  })();
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
  , contextcurrent: "contextcurrent"
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
    var found = knownFields.find(x => x === property);
    if(found) {
      return found; 
    } else {
      throw Error(`${property} is not known`);
    }
  }
});
export {ProxyFieldNames as FieldNames};