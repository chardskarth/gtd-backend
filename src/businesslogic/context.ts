import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {task} from "./../model/task";
import {context} from "./../model/context";
import {taskcontext} from "./../model/taskcontext";
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";
import {sort as sortModel} from "./../model/sort";

export function create(name, description){
  var db = init.getDb();
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
  var db = init.getDb();
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
  var db = init.getDb();
  var sortKey = sortModel.getSortKeys(context.dbName).reduce(x => x); //getfirst
  var sql = context.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function listTasks(contextId, allOrNotDone) {
  var db =  init.getDb();
  var sortKey = sortModel.getSortKeys("task", false, false, contextId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortTask(taskId, toInsertTo){
  var db = init.getDb();
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

  var db = init.getDb();
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
}

export function reset() {
}

export function set(contextId, until){
}

export function unset(contextId) {
}