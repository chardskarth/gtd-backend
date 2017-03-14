import {BaseModel, SQLBuilder} from "./baseModel"
import {DBNames} from "./../helpers/ModelCommon";

export const IsSetType = {
  manual:"manual"
  , every: "every"
}

class ContextCurrent extends BaseModel{
  static dbName: string = DBNames.contextcurrent;
  constructor(){
    super(ContextCurrent.dbName, ["contextid", "isset", "issetuntil", "every"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(ContextCurrent.dbName, function (table) {
      table.integer("contextid").notNullable();
      table.string("isset");
      table.boolean("issetuntil");
      table.string("every");
      table.unique(["contextid"]);
    });
    db.run(q.toString());
  }
  setEvery(contextId, every){
    var sql = SQLBuilder(this.dbName).update("every", every).where("contextid", contextId).toString();
    this.db.run(sql);
  }
  removeIsSetInAll() {
    var sql = SQLBuilder(this.dbName).update("isset", null).toString();
    this.db.run(sql);
  }
  updateIsSetByContextId(contextId, isSet) {
    var sql = SQLBuilder(this.dbName).update("isset", isSet).where("contextid", contextId).toString();
    this.db.run(sql);
  }
  updateUntil(contextId, until) {
    var sql = SQLBuilder(this.dbName).update("issetuntil", until).where("contextid", contextId).toString();
    this.db.run(sql);
  }
}

var contextcurrent = new ContextCurrent();
export {contextcurrent};