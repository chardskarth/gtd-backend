import {BaseModel, SQLBuilder} from "./baseModel";
import {DBNames} from "./../helpers/ModelCommon";


class Context extends BaseModel{
  static dbName: string = "context";
  constructor(){
    super(Context.dbName, ["name", "description"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Context.dbName, function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("description").notNullable();
    });
    db.run(q.toString());
  }
  joinAllSort(key, whereObj){
    var contextFields = [
      `context.id as id`,
      `context.name as name`,
      `context.description as description`,
      ];
    var res = SQLBuilder.select(contextFields)
      .from(DBNames.sort)
      .where("key", key).andWhere("tablename", context.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${DBNames.sort}.tableid`, `${context.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res);
  }
}

var context = new Context();
export {context};