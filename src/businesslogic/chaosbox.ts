import * as init from "./../model/init";
import {BaseModel} from "./../model/baseModel";
import {agenda} from "./../model/agenda";
import {context} from "./../model/context";
import {folder} from "./../model/folder";
import {task} from "./../model/task";
import {sort} from "./../model/sort";
import {foldercontext} from "./../model/foldercontext";
import {taskagenda} from "./../model/taskagenda";
import {taskcontext} from "./../model/taskcontext";
import {taskfolder} from "./../model/taskfolder";

export function createTask(name, description, folderId, contextId, agendaId){
  var db = init.getDb();
  db.run("Begin");
  folder.shouldExistOrUndefined(folderId);
  context.shouldExistOrUndefined(contextId);
  agenda.shouldExistOrUndefined(agendaId);
  task.add(name, description);
  var taskId = db.exec("select last_insert_rowid();")[0].values[0][0];
  
  // if there is a folder, there is a sort there, else, theres a sort here
  sort.getSortKeys("task", folderId, contextId, agendaId)
    .forEach(function(sortKey) {
      sort.add(sortKey, "task", taskId);
  });

  typeof folderId !== "undefined" && taskfolder.add(taskId, folderId);
  typeof contextId !== "undefined" && taskcontext.add(taskId, contextId);
  typeof agendaId !== "undefined" && taskagenda.add(taskId, agendaId);
  db.run("End");
}

export function sortTask(taskId, toInsertTo){
  var db = init.getDb();
  try{
    db.run("Begin");
    var sortKey = sort.getSortKeys("task").reduce(x => x); //getfirst
    sort.updateSortOrder("task", taskId, sortKey, toInsertTo);
  } catch(err){
    throw err;
  } finally {
    db.run("End");
  }
}

export function listTask(){
  var db = init.getDb();
  var sortKey = sort.getSortKeys("task").reduce(x => x); //getfirst
  var sql = task.joinAllSort(sortKey, {
  }).toString();
  return db.exec(sql).map(BaseModel.MapExecResult)[0];
}

