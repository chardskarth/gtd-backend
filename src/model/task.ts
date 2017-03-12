import {BaseModel, SQLBuilder} from "./baseModel";
import {DBNames, FieldNames} from "./../helpers/ModelCommon";

import * as _knex from "knex";

class Task extends BaseModel{
  constructor(){
    super(DBNames.task, ["name", "description", "parenttask", "done"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(DBNames.task, function (table) {
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
      .from(DBNames.sort)
      .where("key", key).andWhere("tablename", task.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${DBNames.sort}.tableid`, `${task.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res)
      .leftJoin(DBNames.taskfolder, `${task.dbName}.id`, FieldNames["taskfolder.taskid"])
      .leftJoin(DBNames.folder, FieldNames["taskfolder.folderid"], FieldNames["folder.id"])
      .leftJoin(DBNames.taskcontext, `${DBNames.task}.id`, FieldNames["taskcontext.taskid"])
      .leftJoin(DBNames.context, FieldNames["taskcontext.contextid"], FieldNames["context.id"])
      .leftJoin(DBNames.taskagenda, `${DBNames.task}.id`, FieldNames["taskagenda.taskid"])
      .leftJoin(DBNames.agenda, FieldNames["taskagenda.agendaid"], FieldNames["agenda.id"]);
  }
}

var task = new Task();
export {task};