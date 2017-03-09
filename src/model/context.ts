import {BaseModel, SQLBuilder} from "./baseModel"
import {sort} from "./sort"

class Context extends BaseModel{
  static dbName: string = "context";
  constructor(){
    super(Context.dbName, ["name", "description", "activetime", "activeday"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Context.dbName, function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("description").notNullable();
      table.string("activetime");
      table.string("activeday");
    });
    db.run(q.toString());
  }
  joinAllSort(key, whereObj){
    var contextFields = [
      `context.name as name`,
      `context.description as description`,
      ];
    var res = SQLBuilder.select(contextFields)
      .from(sort.dbName)
      .where("key", key).andWhere("tablename", context.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${sort.dbName}.tableid`, `${context.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res);
  }
}

var context = new Context();
export {context};