import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {context} from "./../model/context";
import {sort} from "./../model/sort";

export function createContext(name, description){
  var db = init.getDb();
  db.run("Begin");
  context.add(name, description);
  var contextId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sort.getSortKeys(context.dbName)
    .forEach(function(sortKey) {
      sort.add(sortKey, context.dbName, contextId);
  });

  db.run("End");
}

export function sortContext(contextId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sort.getSortKeys(context.dbName).reduce(x => x); //getfirst
    sort.updateSortOrder(context.dbName, contextId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function listContext(){
  var db = init.getDb();
  var sortKey = sort.getSortKeys(context.dbName).reduce(x => x); //getfirst
  var sql = context.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function setEvery() {
}

export function reset() {
}

export function set(contextId, until){
}

export function unset() {
}