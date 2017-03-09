
import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {sort} from "./../model/sort";

export function createAgenda(name, description){
  var db = init.getDb();
  db.run("Begin");
  agenda.add(name, description);
  var agendaId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sort.getSortKeys(agenda.dbName)
    .forEach(function(sortKey) {
      sort.add(sortKey, agenda.dbName, agendaId);
  });

  db.run("End");
}

export function sortAgenda(agendaId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sort.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
    sort.updateSortOrder(agenda.dbName, agendaId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function listAgenda(){
  var db = init.getDb();
  var sortKey = sort.getSortKeys(agenda.dbName).reduce(x => x); //getfirst
  var sql = agenda.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}