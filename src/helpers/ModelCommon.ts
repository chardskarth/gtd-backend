import * as fs from "fs";
import { Migrator, Debug } from "./../helpers/Migrator";
import Promise = require("bluebird");

// var openDatabase = require('websql');
import * as SQL from "sql.js";


var _db: SQL.Database;
const FILE_NAME = "gtd.db";
var isInMemoryDb = false;

export function createDb(){
  var db = getDb();

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

export function unsetDb(){
  _db = null;
}

export function getDb(): SQL.Database {
  if(!_db){
    if(!isInMemoryDb) {
      var filebuffer;
      try {
        filebuffer = fs.readFileSync(FILE_NAME); 
        _db = new SQL.Database(filebuffer);
      } catch (error) {
        if(error.message.indexOf("ENOENT:") != -1) {
          _db = new SQL.Database();
        } else {
          throw error;
        }
      }
    } else {
      _db = new SQL.Database();
    }
  }
  return _db;
}

export function saveDb() {
  if(!isInMemoryDb) {
    fs.writeFileSync(FILE_NAME, new Buffer(_db.export()));
  }
}

export function setInMemoryDb(toSet?) {

  if(isInMemoryDb === false && toSet === true || typeof toSet === "undefined") {
    isInMemoryDb = true;
  } else if(isInMemoryDb === true && toSet === false) {
    isInMemoryDb = false;
  }
  return _db;
}

var trans: Promise.Resolver<SQL.Database>[] = [] as  any;
export function beginTransaction() {
  return Promise.coroutine(function * () {
    trans.push(Promise.defer() as any);
    var promiseToWait: Promise<any>;
    var transBeforeThis = trans[trans.length - 2];
    if(transBeforeThis) {  
      promiseToWait = transBeforeThis.promise;
    } else {
      promiseToWait = Promise.resolve();
    }
    yield promiseToWait;
    var db = getDb();
    db.exec("Begin");
  })();
}

export function endTransaction() {
  return Promise.coroutine(function *(){ 
    var db = getDb();
    db.exec("End");
    saveDb();
    trans[0].resolve();
    trans.shift();
  })();
}

export function rollbackTransaction() {
  return Promise.coroutine(function *(){ 
    var db = getDb();;
    db.exec("Rollback");
    trans[0].resolve();
    trans.shift();
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