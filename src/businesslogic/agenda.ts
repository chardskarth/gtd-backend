import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {task} from "./../model/task";
import {taskagenda} from "./../model/taskagenda";
import {allOrNotDone as getAllOrNotDone, BusinessLogicResult} from "./../helpers/BusinessLogicCommon";
import {getDb} from "./../helpers/ModelCommon";
import {sort as sortModel} from "./../model/sort";

export function create(name, description){
  var db = getDb();
  var retVal: BusinessLogicResult;
  try {
    db.run("Begin");
    agenda.add(name, description);
    var agendaId = db.exec("select last_insert_rowid();")[0].values[0][0];
    // if there is a folder, there is a sort there, else, theres a sort here
    sortModel.getSortKeys(agenda.dbName)
      .forEach(function(sortKey) {
        sortModel.add(sortKey, agenda.dbName, agendaId);
    });
    db.run("End");
    retVal = BusinessLogicResult.OK();
  } catch(err){
    retVal = BusinessLogicResult.Error(err);
  }
  return retVal;
}

export function sort(agendaId, toInsertTo){
  var db = getDb();
  var retVal: BusinessLogicResult;
  try{
    db.run("Begin");
    var sortKey = sortModel.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
    sortModel.updateSortOrder(agenda.dbName, agendaId, sortKey, toInsertTo);
    db.run("End");
    retVal = BusinessLogicResult.OK();
  } catch(err){
    retVal = BusinessLogicResult.Error(err);
  }
  return retVal;
}

export function list(){
  var db = getDb();
  var sortKey = sortModel.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
  var sql = agenda.joinAllSort(sortKey, { }).toString();
  var result = db.exec(sql).map(BaseModel.MapExecResult)[0];
  return BusinessLogicResult.OK(result);
}

export function listTasks(agendaId, allOrNotDone) {
  var db =  getDb();
  var sortKey = sortModel.getSortKeys("task", false, agendaId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  var result = db.exec(sql).map(BaseModel.MapExecResult)[0];
  return BusinessLogicResult.OK(result);
}

export function sortTask(taskId, toInsertTo) {
  var db = getDb();
  var retVal: BusinessLogicResult;
  try{
    db.run("Begin");
    var taskid = taskId;
    var agendaId = taskagenda.getAllBy({where: ["taskid", taskId]}
      , taskagenda.getArrayFields("*"))[0].agendaid;
    var sortKey = sortModel.getSortKeys("task", false, agendaId)[1];
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
    retVal = BusinessLogicResult.OK();
    db.run("End");
  } catch(err){
    db.run("Rollback");
    retVal = BusinessLogicResult.Error(err);
  }
  return retVal;
}

export function moveTask(taskId, newAgendaId) {
  taskId = parseInt(taskId);
  newAgendaId = parseInt(newAgendaId);
  newAgendaId = isNaN(newAgendaId) ? 0 : newAgendaId;

  var db = getDb();
  var retVal: BusinessLogicResult;
  try{
    db.run("Begin");
    var tableName = "task";
    var oldAgendaId = taskagenda.updateAgendaId(taskId, newAgendaId);

    // get only sortKey for Agenda
    var oldSortKey = sortModel.getSortKeys(tableName, false, oldAgendaId)[1];
    var newSortKey = sortModel.getSortKeys(tableName, false, newAgendaId)[1];
    sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    retVal = BusinessLogicResult.OK();
    db.run("End");
  } catch(err){
    db.run("Rollback");
    retVal = BusinessLogicResult.Error(err);
  }
  return retVal;
}