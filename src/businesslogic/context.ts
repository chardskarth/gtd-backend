import {BaseModel} from "./../model/baseModel";
import {task} from "./../model/task";
import {context} from "./../model/context";
import {taskcontext} from "./../model/taskcontext";
import {contextcurrent, IsSetType} from "./../model/contextcurrent";
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";
import {getDb} from "./../helpers/ModelCommon";
import {isTimeValid} from "./../helpers/Extension";
import {sort as sortModel} from "./../model/sort";
import moment = require("moment");


export function create(name, description){
  var db = getDb();
  db.run("Begin");
  context.add(name, description);
  var contextId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sortModel.getSortKeys(context.dbName)
    .forEach(function(sortKey) {
      sortModel.add(sortKey, context.dbName, contextId);
  });

  db.run("End");
}

export function sort(contextId, toInsertTo){
  var db = getDb();
  try{
    db.run("Begin");
    var sortKey = sortModel.getSortKeys(context.dbName).reduce(x => x); //getfirst
    sortModel.updateSortOrder(context.dbName, contextId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function list(){
  var db = getDb();
  var sortKey = sortModel.getSortKeys(context.dbName).reduce(x => x); //getfirst
  var sql = context.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function listTasks(contextId, allOrNotDone) {
  var db =  getDb();
  var sortKey = sortModel.getSortKeys("task", false, false, contextId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortTask(taskId, toInsertTo){
  var db = getDb();
  try{
    db.run("Begin");
    var contextId = taskcontext.getAllBy({where: ["taskid", taskId]}
      , taskcontext.getArrayFields("*"))[0].contextid;
    var sortKey = sortModel.getSortKeys("task", false, false, contextId)[1];
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveTask(taskId, newContextId) {
  taskId = parseInt(taskId);
  newContextId = parseInt(newContextId);
  newContextId = isNaN(newContextId) ? 0 : newContextId;

  var db = getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    var oldContextId = taskcontext.updateContextId(taskId, newContextId);

    // get only sortKey for Agenda
    var oldSortKey = sortModel.getSortKeys(tableName, false, false, oldContextId)[1];
    var newSortKey = sortModel.getSortKeys(tableName, false, false, newContextId)[1];
    sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function setEvery(contextId, everyStatement) {
  contextId = parseInt(contextId);
  var db = getDb();
  try{
    db.run("Begin");
    contextcurrent.setEvery(contextId, everyStatement);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function reset(autoOrManual) {
  var db = getDb();
  try{
    db.run("Begin");
    contextcurrent.removeIsSetInAll(IsSetType.unset);
    if(typeof autoOrManual === "undefined") {
      contextcurrent.removeIsSetInAll();
    } else if(autoOrManual) {
      contextcurrent.removeIsSetInAll(IsSetType.auto);
    } else {
      contextcurrent.removeIsSetInAll(IsSetType.manual);
    }
    contextcurrent.automaticContextSet();
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}

export function currentContexts() {
  var db = getDb();
  var activeContexts;
  try{
    db.run("Begin");
    contextcurrent.checkManualContextSet();
    contextcurrent.automaticContextSet();
    activeContexts = contextcurrent.currentContexts();
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
  return activeContexts;
}

export function set(contextId, until){
  contextId = parseInt(contextId);
  if(until && !isTimeValid(until)) {
    throw Error("until is not a valid time format.");
  }
  var db = getDb();
  try{
    db.run("Begin");
    contextcurrent.upsertIsSetByContextId(contextId, IsSetType.manual);
    until && contextcurrent.upsertUntil(contextId, until);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}

export function unset(contextId) {
  contextId = parseInt(contextId);
  var db = getDb();
  try{
    db.run("Begin");
    contextcurrent.upsertIsSetByContextId(contextId, IsSetType.unset);
    contextcurrent.upsertUntil(contextId, null);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}