import {BaseModel, SQLBuilder} from "./baseModel"

class ContextCurrent extends BaseModel{
  static dbName: string = "taskcontext";
  constructor(){
    super(ContextCurrent.dbName, ["taskid", "contextid"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(ContextCurrent.dbName, function (table) {
      table.integer("contextid").notNullable();
      table.boolean("isset");
      table.boolean("issetuntil");
      table.string("setevery").notNullable();
    });
    db.run(q.toString());
  }
}

var contextcurrent = new ContextCurrent();
export {contextcurrent as default};