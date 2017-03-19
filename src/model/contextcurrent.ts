import {BaseModel, SQLBuilder} from "./baseModel";
import {DBNames} from "./../helpers/ModelCommon";
import {parse as RepeatParser} from "./../helpers/RepeatParser";
import {parseTime} from "./../helpers/Extension";
import moment = require("moment");

export const IsSetType = {
  manual:"manual"
  , auto: "auto"
  , unset: "unset"
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
    RepeatParser(every);
    //generalize this upsert soon
    var sql = SQLBuilder.raw(`INSERT OR REPLACE INTO ${this.dbName} (contextid, every, issetuntil, isset) 
    VALUES (  ${contextId}
              , "${every}"
              , (SELECT issetuntil FROM ${this.dbName} WHERE contextid = ${contextId})
              , (SELECT isset FROM ${this.dbName} WHERE contextid = ${contextId})
            );
    `).toString();
    this.db.run(sql);
  }
  removeIsSetInAll() {
    //if has every, remove issetuntil
    var sql: any = SQLBuilder(this.dbName)
      .update("isset", null)
      .update("issetuntil", null);
    this.db.run(sql.toString());
  }
  upsertIsSetByContextId(contextId, isSet) {
    //generalize this upsert soon
    var sql = SQLBuilder.raw(`INSERT OR REPLACE INTO ${this.dbName} (contextid, isset, issetuntil, every) 
    VALUES (  ${contextId}
              , ${typeof isSet === "undefined" ? "null" : '"' + isSet + '"' }
              , (SELECT issetuntil FROM ${this.dbName} WHERE contextid = ${contextId})
              , (SELECT every FROM ${this.dbName} WHERE contextid = ${contextId})
            );
    `).toString();
    this.db.run(sql);
    var sql = SQLBuilder(this.dbName).update("isset", isSet).where("contextid", contextId).toString();
    this.db.run(sql);
  }
  upsertUntil(contextId, until) {
    //generalize this upsert soon
    var sql = SQLBuilder.raw(`INSERT OR REPLACE INTO ${this.dbName} (contextid, isset, every, issetuntil) 
    VALUES (  ${contextId}
              , (SELECT isset FROM ${this.dbName} WHERE contextid = ${contextId})
              , (SELECT every FROM ${this.dbName} WHERE contextid = ${contextId})
              , ${typeof until === "undefined" ? "null" : '"' + until + '"' }
            );
    `).toString();
    this.db.run(sql);
  }
  automaticContextSet() {
    
    var sql = SQLBuilder(DBNames.contextcurrent)
      .whereRaw("isset is null and every is not null and trim(every) <> \"\"")

    var contextsWithEvery = this.db.exec(sql.toString())
      .map(BaseModel.MapExecResult)[0] || [];

    contextsWithEvery.filter(function(contextCurrent) {
      return RepeatParser(contextCurrent.every).isToday();
    }).forEach(function(contextsPassed) {
      contextcurrent.upsertIsSetByContextId(contextsPassed.contextid, IsSetType.auto);
    });
  }
  checkManualContextSet() {
    var manualSetContext = contextcurrent.getAllBy({
      where: ["isset", IsSetType.manual]
      , andWhere: ["issetuntil", "<>", ""]
      , whereNotNull: ["issetuntil"]
    }, "*");
    manualSetContext = manualSetContext || [];
    manualSetContext.filter(function(contextCurrent) {
      var momentTime = parseTime(contextCurrent.issetuntil);
      var today = moment();
      //make sure it is today with the time set
      momentTime = moment()
        .hours(momentTime.hours())
        .minutes(momentTime.minutes())
        .seconds(momentTime.seconds())
      ;
      return today.isAfter(momentTime);
    })
    .forEach(function(contextCurrent) {
      contextcurrent.upsertIsSetByContextId(contextCurrent.contextid, null);
      contextcurrent.upsertUntil(contextCurrent.contextid, null);
    });
  }
  currentContexts() {
    var contextFields = [
      `context.*`
    ];
    var res = SQLBuilder.select(contextFields)
      .from(this.dbName)
      .where("isset", IsSetType.auto)
      .orWhere("isset", IsSetType.manual)
      .andWhereNot("isset", IsSetType.unset)
      .innerJoin(DBNames.context, `${this.dbName}.contextid`, `${DBNames.context}.id`)
    .toString();
    return this.db.exec(res).map(BaseModel.MapExecResult)[0];
  }
}

var contextcurrent = new ContextCurrent();
export {contextcurrent};