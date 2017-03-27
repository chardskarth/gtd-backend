import {BaseModel} from "./../model/baseModel";
import {task} from "./../model/task";
import {folder} from "./../model/folder";
import {taskfolder} from "./../model/taskfolder";
import {allOrNotDone as getAllOrNotDone, BusinessLogicResult} from "./../helpers/BusinessLogicCommon";
import {sort as sortModel} from "./../model/sort";
import {beginTransaction, endTransaction, rollbackTransaction} from "./../helpers/ModelCommon";
import * as Promise from "bluebird";

export function create(name, description){
  return Promise.coroutine(function* () {
    var retVal;
    yield beginTransaction();
    try {
      folder.add(name, description);
      var folderId = BaseModel.GetLastInsertRowid();
      
      // if there is a folder, there is a sort there, else, theres a sort here
      var sortKey = sortModel.getSortKeys(folder.dbName);
      sortModel.add(sortKey, "folder", folderId);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch (err) {
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function sort(folderId, toInsertTo){
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var sortKey = sortModel.getSortKeys(folder.dbName)[0];
      sortModel.updateSortOrder("folder", folderId, sortKey, toInsertTo);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function list(){
  return Promise.coroutine(function* () {
    var sortKey = sortModel.getSortKeys(folder.dbName)[0];
    var result = folder.joinAllSort(sortKey, { })
    return BusinessLogicResult.OK(result);
  })();
  
}

export function deleteFolder(folderId, shouldForce) {
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var tasksInFolders = taskfolder.getAllBy({where: ["folderid", folderId]}
        , taskfolder.getArrayFields("*"));
      if(tasksInFolders.length && !shouldForce) {
        throw Error("task has folders. set shouldForce to remove the tasks in folders");
      }
      //todo: improve this. do single sql?
      var tableName = "task";
      tasksInFolders.forEach(function(taskFolder) {
        taskfolder.delete(taskFolder.taskid, taskFolder.folderid);
        var newFolderId = 0;
        var oldSortKey = sortModel.getSortKeys(tableName, taskFolder.folderid)[0];
        var newSortKey = sortModel.getSortKeys(tableName, newFolderId)[0];
        sortModel.updateAndDecrement(tableName, taskFolder.taskid, oldSortKey, newSortKey);
      });
      folder.deleteById(folderId);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function listTasks(folderId, allOrNotDone) {
  return Promise.coroutine(function* () {
    var sortKey = sortModel.getSortKeys(task.dbName, folderId)[0];
    var whereObj = getAllOrNotDone(allOrNotDone);
    var result = task.joinAllSort(sortKey, whereObj);
    return BusinessLogicResult.OK(result);
  })();
}

export function sortTask(taskId, toInsertTo){
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var folderId = taskfolder.getAllBy({where: ["taskid", taskId]}
        , taskfolder.getArrayFields("*"))[0].folderid;
      var sortKey = sortModel.getSortKeys(task.dbName, folderId)[0];
      sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function moveTask(taskId, newFolderId, shouldForce) {
  taskId = parseInt(taskId);
  newFolderId = parseInt(newFolderId);
  newFolderId = isNaN(newFolderId) ? 0 : newFolderId;

  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
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
        oldSortKey = sortModel.getSortKeys(tableName, false, false, false
          , affectectedTask.parenttask)[1];
      } else {
        oldSortKey = sortModel.getSortKeys(tableName, oldFolderId)[0];
      }
      var newSortKey = sortModel.getSortKeys(tableName, newFolderId)[0];
      sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}