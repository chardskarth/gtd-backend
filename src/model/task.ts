import {BaseModel, SQLBuilder} from "./baseModel";
import {folder} from "./folder";
import {taskfolder} from "./taskfolder";
import {context} from "./context";
import {taskcontext} from "./taskcontext";
import {agenda} from "./agenda";
import {taskagenda} from "./taskagenda";
import {sort} from "./sort";

import * as _knex from "knex";

class Task extends BaseModel{
  static dbName: string = "task";
  constructor(){
    super(Task.dbName, ["name", "description", "parenttask", "done"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Task.dbName, function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("description").notNullable();
      table.integer("parenttask");
      table.boolean("done").defaultTo(false).notNullable();
    });
    db.run(q.toString());
  }
  add(...fieldValues){
    if(fieldValues.length >= 5) {
      throw Error("parenttask cannot be set");
    }
    super.add.apply(this, fieldValues);
  }
  updateParentTask(taskId, parentTaskId) {
    var sql = SQLBuilder(this.dbName).update("parenttask", parentTaskId)
      .where("id", taskId).toString();
    this.db.run(sql);
  }
  updateDone(taskId, isDone) {
    var sql = SQLBuilder(this.dbName).update("done", isDone)
      .where("id", taskId).toString();
    this.db.run(sql);
  }
  joinAllSort(key, whereObj){
    var taskFields = [
      `task.*`, 
      `folder.name as foldername`, 
      `context.name as contextname`, 
      `agenda.name as agendaname` ];
    var res = SQLBuilder.select(taskFields)
      .from(sort.dbName)
      .where("key", key).andWhere("tablename", task.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${sort.dbName}.tableid`, `${task.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res)
      .leftJoin(taskfolder.dbName, `${task.dbName}.id`, taskfolder.dottedField("taskid"))
      .leftJoin(folder.dbName, taskfolder.dottedField("folderid"), folder.dottedField("id"))
      .leftJoin(taskcontext.dbName, `${task.dbName}.id`, taskcontext.dottedField("taskid"))
      .leftJoin(context.dbName, taskcontext.dottedField("contextid"), context.dottedField("id"))
      .leftJoin(taskagenda.dbName, `${task.dbName}.id`, taskagenda.dottedField("taskid"))
      .leftJoin(agenda.dbName, taskagenda.dottedField("agendaid"), agenda.dottedField("id"));
  }
}

var task = new Task();
export {task};