import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {context} from "./../model/context";
import {folder} from "./../model/folder";
import {task} from "./../model/task";
import {sort as sortModel} from "./../model/sort";
import {foldercontext} from "./../model/foldercontext";
import {taskagenda} from "./../model/taskagenda";
import {taskcontext} from "./../model/taskcontext";
import {taskfolder} from "./../model/taskfolder";
import {allOrNotDone as getAllOrNotDone, BusinessLogicResult} from "./../helpers/BusinessLogicCommon";
import {beginTransaction, endTransaction, rollbackTransaction} from "./../helpers/ModelCommon";
import * as Promise from "bluebird";

export function create(name, description, folderId?, contextId?, agendaId?){
  return Promise.coroutine(function* () {
    var retVal;
    yield beginTransaction();
    try{
      folder.shouldExistOrUndefined(folderId);
      context.shouldExistOrUndefined(contextId);
      agenda.shouldExistOrUndefined(agendaId);
      task.add(name, description);
      var taskId = BaseModel.GetLastInsertRowid();
      
      // if there is a folder, there is a sort there, else, theres a sort here
      sortModel.getSortKeys("task", folderId, contextId, agendaId)
        .forEach(function(sortKey) { 
          sortModel.add(sortKey, "task", taskId);
      });

      typeof folderId !== "undefined" && taskfolder.add(taskId, folderId);
      typeof contextId !== "undefined" && taskcontext.add(taskId, contextId);
      typeof agendaId !== "undefined" && taskagenda.add(taskId, agendaId);
      yield endTransaction();
      retVal = BusinessLogicResult.OK(taskId);
    } catch(err) {
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function sort(taskId, toInsertTo){
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var sortKey = sortModel.getSortKeys(task.dbName)[0];
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

export function list(){
  return Promise.coroutine(function* () {
    var sortKey = sortModel.getSortKeys(task.dbName)[0];
    var result = task.joinAllSort(sortKey, { });
    return BusinessLogicResult.OK(result);
  })();
}

export function listByParent(parentTaskId, allOrNotDone){
  return Promise.coroutine(function* () {
    var sortKey = sortModel.getSortKeys(task.dbName, false, false, false, parentTaskId)[1];
    var whereObj = getAllOrNotDone(allOrNotDone);
    var result = task.joinAllSort(sortKey, whereObj);
    return BusinessLogicResult.OK(result);    
  })();
}

export function sortByParent(taskId, toInsertTo){
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      var parentTaskId = task.getById(taskId, task.getArrayFields("*")).parenttask;
      var sortKey = sortModel.getSortKeys(task.dbName, false, false, false, parentTaskId)[1];
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

export function setParentTask(taskId, parentTaskId, shouldForce) {
  taskId = parseInt(taskId);
  parentTaskId = parseInt(parentTaskId);
  parentTaskId = isNaN(parentTaskId) ? 0 : parentTaskId;
  if(taskId == parentTaskId) {
    throw Error("taskId and parentTaskId cannot be equal");
  }
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      var taskFolderEntry = taskfolder.getAllBy({where: ["taskid", taskId]}, taskfolder.getArrayFields("*"));
      var hasFolder = taskFolderEntry ? !!taskFolderEntry[0] : false;
      if(hasFolder && !shouldForce) {
        throw Error("Task within a folder cannot be a subtask. set shouldForce to remove the folder")
      }

      task.updateParentTask(taskId, parentTaskId);
      
      var tableName = "task";
      var newFolderId = 0; //to remove folder
      var oldFolderId = taskfolder.updateFolderId(taskId, newFolderId);
      var oldSortKey = sortModel.getSortKeys(tableName, oldFolderId)[0];
      var newSortKey;
      if(parentTaskId) {
        newSortKey = sortModel.getSortKeys(tableName, false, false, false, parentTaskId)[1];
      }
      sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey);
      retVal = BusinessLogicResult.OK();
      yield endTransaction();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function markDone(taskId) {
  taskId = parseInt(taskId);
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      var tableName = "task";
      task.updateDone(taskId, 1);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function unmarkDone(taskId) {
  taskId = parseInt(taskId);
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      var tableName = "task";
      task.updateDone(taskId, 0);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}