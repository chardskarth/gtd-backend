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
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";

export function listByParent(parentTaskId, allOrNotDone){
  var db = init.getDb();
  var sortKey = sort.getSortKeys("task", false, false, false, parentTaskId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortByParent(taskId, parentTaskId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sort.getSortKeys("task", false, false, false, parentTaskId)[1];
    sort.updateSortOrder("task", taskId, sortKey, toInsertTo);
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