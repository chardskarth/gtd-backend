import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {task} from "./../model/task";
import {folder} from "./../model/folder";
import {taskfolder} from "./../model/taskfolder";
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";
import {sort as sortModel} from "./../model/sort";

export function create(name, description){
  var db = init.getDb();
  db.run("Begin");
  folder.add(name, description);
  var folderId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sortModel.getSortKeys("folder")
    .forEach(function(sortKey) {
      sortModel.add(sortKey, "folder", folderId);
  });

  db.run("End");
}

export function sort(folderId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sortModel.getSortKeys("folder").reduce(x => x); //getfirst
    sortModel.updateSortOrder("folder", folderId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}

export function list(){
  var db = init.getDb();
  var sortKey = sortModel.getSortKeys("folder").reduce(x => x); //getfirst
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
      var oldSortKey = sortModel.getSortKeys(tableName, taskFolder.folderid)[0];
      var newSortKey = sortModel.getSortKeys(tableName, newFolderId)[0];
      sortModel.updateAndDecrement(tableName, taskFolder.taskid, oldSortKey, newSortKey);
    });
    folder.deleteById(folderId);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  }
}

export function listTasks(folderId, allOrNotDone) {
  var db =  init.getDb();
  var sortKey = sortModel.getSortKeys("task", folderId)[0];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortTask(taskId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var folderId = taskfolder.getAllBy({where: ["taskid", taskId]}
      , taskfolder.getArrayFields("*"))[0].folderid;
    var sortKey = sortModel.getSortKeys("task", folderId)[0];
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function moveTask(taskId, newFolderId, shouldForce) {
  taskId = parseInt(taskId);
  newFolderId = parseInt(newFolderId);
  newFolderId = isNaN(newFolderId) ? 0 : newFolderId;

  var db = init.getDb();
  try{
    db.run("Begin");
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
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}