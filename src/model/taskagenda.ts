import {BaseModel, SQLBuilder} from "./baseModel"

class TaskAgenda extends BaseModel{
  static dbName: string = "taskagenda";
  constructor(){
    super(TaskAgenda.dbName, ["taskid", "agendaid"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(TaskAgenda.dbName, function (table) {
      table.integer("taskid");
      table.integer("agendaid");
      table.unique(["taskid", "agendaid"]);
    });
    db.run(q.toString());
  }
  updateAgendaId(taskId, newAgendaId){
    var db = this.db;
    var retVal; //retVal is oldAgendaId if there exist
    var selectOld = SQLBuilder.select("agendaid")
      .from(this.dbName).where("taskid", taskId).toString();
    var oldTaskFolder = db.exec(selectOld).map(BaseModel.MapExecResult)[0];
    if(oldTaskFolder){
      retVal = oldTaskFolder[0].agendaid;
      if(newAgendaId) {
        var updateNew = SQLBuilder.update("agendaid", newAgendaId).from(this.dbName)
          .where("taskid", taskId).toString();
        db.exec(updateNew);
      } else { //if newAgendaId is false, delete taskfolder row
        taskagenda.delete(taskId, retVal);
      }
    } else { // if oldTaskFolder is not existing
      retVal = undefined;
      if(newAgendaId) {
        taskagenda.add(taskId, newAgendaId);
      }
    }

    return retVal;
  }
}

var taskagenda = new TaskAgenda();
export {taskagenda};