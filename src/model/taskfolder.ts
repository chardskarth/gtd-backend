import {BaseModel, SQLBuilder} from "./baseModel";
import {DBNames} from "./../helpers/ModelCommon";

class TaskFolder extends BaseModel{
  static dbName: string = "taskfolder";
  constructor(){
    super(TaskFolder.dbName, ["taskid", "folderid"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(TaskFolder.dbName, function (table) {
      table.integer("taskid").notNullable();
      table.integer("folderid").notNullable();
      table.unique(["taskid", "folderid"]);
    });
    db.run(q.toString());
  }
  updateFolderId(taskId, newFolderId){
    var db = this.db;
    var retVal; //retVal is oldFolderId if there exist
    var selectOld = SQLBuilder.select("folderid")
      .from(this.dbName).where("taskid", taskId).toString();
    var oldTaskFolder = db.exec(selectOld).map(BaseModel.MapExecResult)[0];
    if(oldTaskFolder){
      retVal = oldTaskFolder[0].folderid;
      if(newFolderId) {
        var updateNew = SQLBuilder.update("folderid", newFolderId).from(this.dbName)
          .where("taskid", taskId).toString();
        db.exec(updateNew);
      } else { //if newFolderId is false, delete taskfolder row
        taskfolder.delete(taskId, retVal);
      }
    } else { // if oldTaskFolder is not existing
      retVal = undefined;
      if(newFolderId) {
        taskfolder.add(taskId, newFolderId);
      }
    }

    return retVal;
  }
}

var taskfolder = new TaskFolder();
export {taskfolder};