import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {context} from "./../model/context";
import {folder} from "./../model/folder";
import {task} from "./../model/task";
import {sort} from "./../model/sort";
import {foldercontext} from "./../model/foldercontext";
import {taskagenda} from "./../model/taskagenda";
import {taskcontext} from "./../model/taskcontext";
import {taskfolder} from "./../model/taskfolder";


export function listTasks(folderId, agendaId, contextId
  , parentTaskId, allOrNotDone){
  var db = init.getDb();
  var sortKey;
  if(folderId) {
    sortKey = sort.getSortKeys("task", folderId)[0];
  } else if (agendaId) {
    sortKey = sort.getSortKeys("task", false, agendaId)[1];
  } else if (contextId) {
    sortKey = sort.getSortKeys("task", false, false, contextId)[1];
  } else if (parentTaskId) {
    sortKey = sort.getSortKeys("task", false, false, false, parentTaskId)[1];
  } else {
    sortKey = sort.getSortKeys("task")[0];
  }

  var whereObj = { 
    where: []
  };
  if(typeof allOrNotDone === "undefined") {
    delete whereObj.where;
  } else if(allOrNotDone === true) {
    whereObj.where = ["task.done", 0];
  } else { // if false
    whereObj.where = ["task.done", 1];
  }
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortTask(folderId, agendaId, contextId, parentTaskId, taskId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey;
    if(folderId) {
      sortKey = sort.getSortKeys("task", folderId)[0];
    } else if (agendaId) {
      sortKey = sort.getSortKeys("task", false, agendaId)[1];
    } else if (contextId) {
      sortKey = sort.getSortKeys("task", false, false, contextId)[1];
    } else if (parentTaskId) {
      sortKey = sort.getSortKeys("task", false, false, false, parentTaskId)[1];
    } else {
      sortKey = sort.getSortKeys("task")[0];
    }
    sort.updateSortOrder("task", taskId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveFolder(taskId, newFolderId, shouldForce) {
  taskId = parseInt(taskId);
  newFolderId = parseInt(newFolderId);
  newFolderId = isNaN(newFolderId) ? 0 : newFolderId;

  var db = init.getDb();
  try{
    db.run("Begin");
    var affectectedTask:any
      = task.getAllBy({where: ["id", taskId]}, task.getArrayFields("*"))[0];
    if(affectectedTask.parenttask && !shouldForce) {
      throw Error("Cannot set folder if there is parenttask. set shouldForce to remove parenttask");
    }
    if(affectectedTask.parenttask) {
//study how to set it to undefined instead of 0
      task.updateParentTask(taskId, 0); 
    }
    var tableName = "task";

//update task folderId
    var oldFolderId = taskfolder.updateFolderId(taskId, newFolderId);

    // delete sort ordervalue entry
    // decrement sort ordervalue key=oldFolderId orderValue > oldFolderOrderValue
    // insert newSortOrder at 0
    var oldSortKey;
    if(affectectedTask.parenttask) {
      oldSortKey = sort.getSortKeys(tableName, false, false, false
        , affectectedTask.parenttask)[1];
    } else {
      oldSortKey = sort.getSortKeys(tableName, oldFolderId)[0];
    }
    var newSortKey = sort.getSortKeys(tableName, newFolderId)[0];
    sort.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveAgenda(taskId, newAgendaId) {
  taskId = parseInt(taskId);
  newAgendaId = parseInt(newAgendaId);
  newAgendaId = isNaN(newAgendaId) ? 0 : newAgendaId;

  var db = init.getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    var oldAgendaId = taskagenda.updateAgendaId(taskId, newAgendaId);

    // get only sortKey for Agenda
    var oldSortKey = sort.getSortKeys(tableName, false, oldAgendaId)[1];
    var newSortKey = sort.getSortKeys(tableName, false, newAgendaId)[1];
    sort.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveContext(taskId, newContextId) {
  taskId = parseInt(taskId);
  newContextId = parseInt(newContextId);
  newContextId = isNaN(newContextId) ? 0 : newContextId;

  var db = init.getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    var oldContextId = taskcontext.updateContextId(taskId, newContextId);

    // get only sortKey for Agenda
    var oldSortKey = sort.getSortKeys(tableName, false, false, oldContextId)[1];
    var newSortKey = sort.getSortKeys(tableName, false, false, newContextId)[1];
    sort.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function setParentTask(taskId, parentTaskId, shouldForce) {
  taskId = parseInt(taskId);
  parentTaskId = parseInt(parentTaskId);
  parentTaskId = isNaN(parentTaskId) ? 0 : parentTaskId;
  if(taskId == parentTaskId) {
    throw Error("taskId and parentTaskId cannot be equal");
  }

  var db = init.getDb();
  try{
    db.run("Begin");
    var hasFolder = !!taskfolder.getAllBy({where: ["taskid", taskId]}, taskfolder.getArrayFields("*"))[0];
    if(hasFolder && !shouldForce) {
      throw Error("Task within a folder cannot be a subtask. set shouldForce to remove the folder")
    }

    task.updateParentTask(taskId, parentTaskId);
    
    var tableName = "task";
    var newFolderId = 0; //to remove folder
    var oldFolderId = taskfolder.updateFolderId(taskId, newFolderId);
    var oldSortKey = sort.getSortKeys(tableName, oldFolderId)[0];
    var newSortKey;
    if(parentTaskId) {
      newSortKey = sort.getSortKeys(tableName, false, false, false, parentTaskId)[1];
    }
    sort.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 

}

export function markDone(taskId) {
  taskId = parseInt(taskId);
  var db = init.getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    task.updateDone(taskId, 1);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function unmarkDone(taskId) {
  taskId = parseInt(taskId);
  var db = init.getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    task.updateDone(taskId, 0);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}