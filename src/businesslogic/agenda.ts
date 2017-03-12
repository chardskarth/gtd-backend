
import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {task} from "./../model/task";
import {taskagenda} from "./../model/taskagenda";
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";
import {sort as sortModel} from "./../model/sort";

export function create(name, description){
  var db = init.getDb();
  db.run("Begin");
  agenda.add(name, description);
  var agendaId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sortModel.getSortKeys(agenda.dbName)
    .forEach(function(sortKey) {
      sortModel.add(sortKey, agenda.dbName, agendaId);
  });

  db.run("End");
}

export function sort(agendaId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sortModel.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
    sortModel.updateSortOrder(agenda.dbName, agendaId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function list(){
  var db = init.getDb();
  var sortKey = sortModel.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
  var sql = agenda.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function listTasks(agendaId, allOrNotDone) {
  var db =  init.getDb();
  var sortKey = sortModel.getSortKeys("task", false, agendaId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortTask(taskId, toInsertTo) {
  var db = init.getDb();
  try{
    db.run("Begin");
    var taskid = taskId;
    var agendaId = taskagenda.getAllBy({where: ["taskid", taskId]}
      , taskagenda.getArrayFields("*"))[0].agendaid;
    var sortKey = sortModel.getSortKeys("task", false, agendaId)[1];
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveTask(taskId, newAgendaId) {
  taskId = parseInt(taskId);
  newAgendaId = parseInt(newAgendaId);
  newAgendaId = isNaN(newAgendaId) ? 0 : newAgendaId;

  var db = init.getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    var oldAgendaId = taskagenda.updateAgendaId(taskId, newAgendaId);

    // get only sortKey for Agenda
    var oldSortKey = sortModel.getSortKeys(tableName, false, oldAgendaId)[1];
    var newSortKey = sortModel.getSortKeys(tableName, false, newAgendaId)[1];
    sortModel.updateAndDecrement(tableName, taskId, oldSortKey, newSortKey)
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}