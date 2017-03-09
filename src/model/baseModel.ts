import * as _knex from "knex";
import * as SQL from "sql.js";
import * as init from "./init";

var knex = _knex({
  client: 'sqlite3',
  useNullAsDefault: true,
});

abstract class BaseModel{
  constructor(public dbName, public fields){ }
  static MapExecResult(result){
    var retVal = [];
    for (var i = 0; i < result.values.length; i++) {
      var document = {};
      var item = result.values[i];
      for (var j = 0; j < result.columns.length; j++) {
        var key = result.columns[j];
        document[key] = item[j];
      }
      retVal.push(document);
    }
    return retVal;
  }
  static BuildWhere(whereObj, qb?): _knex.QueryBuilder{
    var testWhereObj = {
      where: ["id", 1]
      , orWhere: ["id2", "<", 10], andWhere: ["id2", ">", 5]
    }
    var retValKnex = (qb || knex) as any;
    for (var key in whereObj) {
      if (whereObj.hasOwnProperty(key)) {
        var params = whereObj[key];
        retValKnex = retValKnex[key].apply(retValKnex, params);
      }
    }
    return retValKnex;
  }
  
  init(){
    this.createTable(this.db);
  }

  get db(){
    return init.getDb();
  }
  abstract createTable(db: SQL.Database);

  add(...fieldValues){
    var insertSql = `INSERT INTO ${this.dbName} (`;
    insertSql += fieldValues.map((curr, i) => this.fields[i]).join(", ");
    insertSql += ") VALUES (";
    insertSql += fieldValues.map(x => "?").join(", ");
    insertSql += ")";
    fieldValues = fieldValues.map(x => {
      if(typeof x === "string")
        return x.trim();
      return x;
    })
    this.db.run(insertSql, fieldValues);
  }

  delete(...fieldValues) {
    var deleteWhere = {};
    for (var i = 0; i < fieldValues.length; i++) {
      var element = fieldValues[i];
      var whereClause;
      if(!Object.keys(deleteWhere).length) {
        whereClause = "where";
      } else {
        whereClause = "andWhere";
      }
      deleteWhere[whereClause] = [this.fields[i], fieldValues[i]];
    }
    var deleteSql = BaseModel.BuildWhere(deleteWhere).delete().from(this.dbName).toString();
    this.db.run(deleteSql);
  }

  deleteById(id) {
    var deleteSql = knex(this.dbName).delete().where("id", id).toString();
    this.db.run(deleteSql);
  }

  shouldExistOrUndefined(checkId){
    if(!checkId) {
      return;
    }
    var res = this.db.exec(knex.select("id").from(this.dbName).where("id", checkId).toString());
    if(!res[0] || !res[0].values[0][0]) {
      throw new Error(`${this.dbName} id:${checkId} is not existing`);
    }
  }
  
  getArrayFields(...params){
    if(params.indexOf("*") != -1) {
      return this.fields
    } else {
      return params.map(field => {
        if(field == "id")
          return field;
        else
          throw Error(`${field} not found in ${this.dbName}`);
      });
    }
  }

  getFieldsById(id, arrFields){
    var sql = knex.select(arrFields).where("id", id).from(this.dbName).toString();
    var result = this.db.exec(sql);
    return result.map(res => {
      return res.values[0];
    })[0];
  }

  getAllBy(whereObj, arrFields){
    var sql = BaseModel.BuildWhere(whereObj).select(arrFields).from(this.dbName).toString();
    return this.db.exec(sql).map(BaseModel.MapExecResult)[0];
  }
  
  dottedField(fieldName: string): string{
    return `${this.dbName}.${fieldName}`;
  }
}

export { 
  knex as SQLBuilder
  , BaseModel 
};

knex.where("id", 1);