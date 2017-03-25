import {BaseModel} from "./../model/baseModel";
import {task} from "./../model/task";
import {context} from "./../model/context";
import {taskcontext} from "./../model/taskcontext";
import {contextcurrent, IsSetType} from "./../model/contextcurrent";
import {allOrNotDone as getAllOrNotDone, BusinessLogicResult} from "./../helpers/BusinessLogicCommon";
import {beginTransaction, endTransaction, rollbackTransaction} from "./../helpers/ModelCommon";
import {isTimeValid} from "./../helpers/Extension";
import {sort as sortModel} from "./../model/sort";
import moment = require("moment");
import * as Promise from "bluebird";


export function create(name, description){
  return Promise.coroutine(function* () {
    var retVal;
    yield beginTransaction();
    try {
      context.add(name, description);
      var contextId = BaseModel.GetLastInsertRowid();
      
      // if there is a folder, there is a sort there, else, theres a sort here
      sortModel.getSortKeys(context.dbName)
        .forEach(function(sortKey) {
          sortModel.add(sortKey, context.dbName, contextId);
      });
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch (err) {
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function sort(contextId, toInsertTo){
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var sortKey = sortModel.getSortKeys(context.dbName).reduce(x => x); //getfirst
      sortModel.updateSortOrder(context.dbName, contextId, sortKey, toInsertTo);
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
  return Promise.coroutine(function* (...any) {
    var sortKey = sortModel.getSortKeys(context.dbName).reduce(x => x); //getfirst
    var result = context.joinAllSort(sortKey, { });
    return BusinessLogicResult.OK(result);
  })();
}

export function listTasks(contextId, allOrNotDone) {
  return Promise.coroutine(function* () {
    var sortKey = sortModel.getSortKeys("task", false, false, contextId)[1];
    var whereObj = getAllOrNotDone(allOrNotDone);
    var result = task.joinAllSort(sortKey, whereObj).toString();
    return BusinessLogicResult.OK(result);
  })();
}

export function sortTask(taskId, toInsertTo){
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var contextId = taskcontext.getAllBy({where: ["taskid", taskId]}
        , taskcontext.getArrayFields("*"))[0].contextid;
      var sortKey = sortModel.getSortKeys("task", false, false, contextId)[1];
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

export function moveTask(taskId, newContextId) {
  taskId = parseInt(taskId);
  newContextId = parseInt(newContextId);
  newContextId = isNaN(newContextId) ? 0 : newContextId;

  return Promise.coroutine(function* (...any) {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var tableName = "task";
      var oldContextId = taskcontext.updateContextId(taskId, newContextId);

      // get only sortKey for Agenda
      var oldSortKey = sortModel.getSortKeys(tableName, false, false, oldContextId)[1];
      var newSortKey = sortModel.getSortKeys(tableName, false, false, newContextId)[1];
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

export function setEvery(contextId, everyStatement) {
  contextId = parseInt(contextId);
  return Promise.coroutine(function* (...any) {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      contextcurrent.setEvery(contextId, everyStatement);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function reset() {
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      contextcurrent.removeIsSetInAll();
      contextcurrent.automaticContextSet();
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function currentContexts() {
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      contextcurrent.checkManualContextSet();
      contextcurrent.automaticContextSet();
      var result = contextcurrent.currentContexts();
      yield endTransaction();
      retVal = BusinessLogicResult.OK(result);
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function set(contextId, until){
  contextId = parseInt(contextId);
  if(until && !isTimeValid(until)) {
    throw Error("until is not a valid time format.");
  }
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      contextcurrent.upsertIsSetByContextId(contextId, IsSetType.manual);
      until && contextcurrent.upsertUntil(contextId, until);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function unset(contextId) {
  contextId = parseInt(contextId);
  return Promise.coroutine(function* () {
    yield beginTransaction();
    var retVal: BusinessLogicResult;
    try{
      contextcurrent.upsertIsSetByContextId(contextId, IsSetType.unset);
      contextcurrent.upsertUntil(contextId, null);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}