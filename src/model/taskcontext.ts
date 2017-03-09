import {BaseModel, SQLBuilder} from "./baseModel"

class TaskContext extends BaseModel{
  static dbName: string = "taskcontext";
  constructor(){
    super(TaskContext.dbName, ["taskid", "contextid"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(TaskContext.dbName, function (table) {
      table.integer("taskid").notNullable();
      table.integer("contextid").notNullable();
      table.unique(["taskid", "contextid"]);
    });
    db.run(q.toString());
  }
  updateContextId(taskId, newContextId){
    var db = this.db;
    var retVal; //retVal is oldcontextid if there exist
    var selectOld = SQLBuilder.select("contextid")
      .from(this.dbName).where("taskid", taskId).toString();
    var oldTaskContext = db.exec(selectOld).map(BaseModel.MapExecResult)[0];
    if(oldTaskContext){
      retVal = oldTaskContext[0].contextid;
      if(newContextId) {
        var updateNew = SQLBuilder.update("contextid", newContextId).from(this.dbName)
          .where("taskid", taskId).toString();
        db.exec(updateNew);
      } else { //if newContextId is false, delete taskfolder row
        taskcontext.delete(taskId, retVal);
      }
    } else { // if oldTaskContext is not existing
      retVal = undefined;
      if(newContextId) {
        taskcontext.add(taskId, newContextId);
      }
    }

    return retVal;
  }
}

var taskcontext = new TaskContext();
export {taskcontext};