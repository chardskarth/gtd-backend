import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {task} from "./../model/task";
import {taskagenda} from "./../model/taskagenda";
import {allOrNotDone as getAllOrNotDone, BusinessLogicResult} from "./../helpers/BusinessLogicCommon";
import {beginTransaction, endTransaction, rollbackTransaction} from "./../helpers/ModelCommon";
import {sort as sortModel} from "./../model/sort";
import * as Promise from 'bluebird';

Promise.config({
  longStackTraces: true
})

export function create(name, description): Promise<BusinessLogicResult>{
  return Promise.coroutine(function *() {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try {
      agenda.add(name, description);
      var agendaId = BaseModel.GetLastInsertRowid();
      // if there is a folder, there is a sort there, else, theres a sort here
      var sortKey = sortModel.getSortKeys(agenda.dbName)[0];
      sortModel.add(sortKey, agenda.dbName, agendaId);
      yield endTransaction();
      retVal = BusinessLogicResult.OK(agendaId);
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function sort(agendaId, toInsertTo){
  return Promise.coroutine(function *() {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var sortKey = sortModel.getSortKeys(agenda.dbName)[0];
      sortModel.updateSortOrder(agenda.dbName, agendaId, sortKey, toInsertTo);
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
    var sortKey = sortModel.getSortKeys(agenda.dbName)[0]; //getfirst
    var result = agenda.joinAllSort(sortKey, { });
    return BusinessLogicResult.OK(result);
  })();
}

export function listTasks(agendaId, allOrNotDone?) {
  return Promise.coroutine(function* (...any) {
    var retVal;
    try {
      //test if it exist
      agenda.getById(agendaId, "id");
      var sortKey = sortModel.getSortKeys(task.dbName, false, false, agendaId)[1];
      var whereObj = getAllOrNotDone(allOrNotDone);
      var result = task.joinAllSort(sortKey, whereObj);
      retVal = BusinessLogicResult.OK(result);
    } catch(err) {
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function sortTask(taskId, toInsertTo) {
  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      var agendaId = taskagenda.getAllBy({where: ["taskid", taskId]}
        , taskagenda.getArrayFields("*"))[0].agendaid;
      var sortKey = sortModel.getSortKeys(task.dbName, false, false, agendaId)[1];
      sortModel.updateSortOrder(task.dbName, taskId, sortKey, toInsertTo);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}

export function moveTask(taskId, newAgendaId) {
  taskId = parseInt(taskId);
  newAgendaId = parseInt(newAgendaId);
  newAgendaId = isNaN(newAgendaId) ? 0 : newAgendaId;

  return Promise.coroutine(function* () {
    var retVal: BusinessLogicResult;
    yield beginTransaction();
    try{
      //test if it exist
      task.getById(taskId, "id");
      newAgendaId && agenda.getById(newAgendaId, "id");
      var tableName = "task";
      var oldAgendaId = taskagenda.updateAgendaId(taskId, newAgendaId);

      // get only sortKey for Agenda
      var oldSortKey = sortModel.getSortKeys(tableName, false, false, oldAgendaId)[1];
      var newSortKey = sortModel.getSortKeys(tableName, false, false, newAgendaId)[1];
      sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey);
      yield endTransaction();
      retVal = BusinessLogicResult.OK();
    } catch(err){
      yield rollbackTransaction();
      retVal = BusinessLogicResult.Error(err);
    }
    return retVal;
  })();
}