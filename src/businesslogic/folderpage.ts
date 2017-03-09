import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {folder} from "./../model/folder";
import {sort} from "./../model/sort";
import {taskfolder} from "./../model/taskfolder";

export function createFolder(name, description){
  var db = init.getDb();
  db.run("Begin");
  folder.add(name, description);
  var folderId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sort.getSortKeys("folder")
    .forEach(function(sortKey) {
      sort.add(sortKey, "folder", folderId);
  });

  db.run("End");
}

export function sortFolder(folderId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sort.getSortKeys("folder").reduce(x => x); //getfirst
    sort.updateSortOrder("folder", folderId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}

export function listFolder(){
  var db = init.getDb();
  var sortKey = sort.getSortKeys("folder").reduce(x => x); //getfirst
  var sql = folder.joinAllSort(sortKey, { }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function deleteFolder(folderId, shouldForce) {
  var db = init.getDb();
  try{
    db.run("Begin");
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
      var oldSortKey = sort.getSortKeys(tableName, taskFolder.folderid)[0];
      var newSortKey = sort.getSortKeys(tableName, newFolderId)[0];
      sort.updateAndDecrement(tableName, taskFolder.taskid, oldSortKey, newSortKey);
    });
    folder.deleteById(folderId);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
  
}