import {getDb} from "./../helpers/ModelCommon";
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
import {allOrNotDone as getAllOrNotDone} from "./../helpers/BusinessLogicCommon";

export function create(name, description, folderId, contextId, agendaId){
  var db = getDb();
  db.run("Begin");
  folder.shouldExistOrUndefined(folderId);
  context.shouldExistOrUndefined(contextId);
  agenda.shouldExistOrUndefined(agendaId);
  task.add(name, description);
  var taskId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sortModel.getSortKeys("task", folderId, contextId, agendaId)
    .forEach(function(sortKey) {
      sortModel.add(sortKey, "task", taskId);
  });

  typeof folderId !== "undefined" && taskfolder.add(taskId, folderId);
  typeof contextId !== "undefined" && taskcontext.add(taskId, contextId);
  typeof agendaId !== "undefined" && taskagenda.add(taskId, agendaId);
  db.run("End");
}

export function sort(taskId, toInsertTo){
  var db = getDb();
  try{
    db.run("Begin");
    var sortKey = sortModel.getSortKeys("task").reduce(x => x); //getfirst
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function list(){
  var db = getDb();
  var sortKey = sortModel.getSortKeys("task").reduce(x => x); //getfirst
  var sql = task.joinAllSort(sortKey, {
  }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}



export function listByParent(parentTaskId, allOrNotDone){
  var db = getDb();
  var sortKey = sortModel.getSortKeys("task", false, false, false, parentTaskId)[1];
  var whereObj = getAllOrNotDone(allOrNotDone);
  var sql = task.joinAllSort(sortKey, whereObj).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

export function sortByParent(taskId, toInsertTo){
  var db = getDb();
  try{
    db.run("Begin");
    var parentTaskId = task.getById(taskId, task.getArrayFields("*")).parenttask;
    var sortKey = sortModel.getSortKeys("task", false, false, false, parentTaskId)[1];
    sortModel.updateSortOrder("task", taskId, sortKey, toInsertTo);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function setParentTask(taskId, parentTaskId, shouldForce) {
  taskId = parseInt(taskId);
  parentTaskId = parseInt(parentTaskId);
  parentTaskId = isNaN(parentTaskId) ? 0 : parentTaskId;
  if(taskId == parentTaskId) {
    throw Error("taskId and parentTaskId cannot be equal");
  }

  var db = getDb();
  try{
    db.run("Begin");
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
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 

}

export function markDone(taskId) {
  taskId = parseInt(taskId);
  var db = getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    task.updateDone(taskId, 1);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}

export function unmarkDone(taskId) {
  taskId = parseInt(taskId);
  var db = getDb();
  try{
    db.run("Begin");
    var tableName = "task";
    task.updateDone(taskId, 0);
    db.run("End");
  } catch(err){
    db.run("Rollback");
    throw err;
  } 
}