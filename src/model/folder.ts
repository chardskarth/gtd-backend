import {BaseModel, SQLBuilder} from "./baseModel"
import {DBNames} from "./../helpers/ModelCommon";

class Folder extends BaseModel{
  static dbName: string = "folder";
  constructor(){
    super(Folder.dbName, ["name", "description"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Folder.dbName, function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("description").notNullable();
    });
    db.run(q.toString());
  }
  joinAllSort(key, whereObj){
    var folderFields = [
      `folder.name as name`,
      `folder.description as description`,
      ];
    var res = SQLBuilder.select(folderFields)
      .from(DBNames.sort)
      .where("key", key).andWhere("tablename", folder.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${DBNames.sort}.tableid`, `${folder.dbName}.id`);
    var sql = BaseModel.BuildWhere(whereObj, res).toString();
    return this.db.exec(sql).map(BaseModel.MapExecResult)[0];
  }
}


var folder = new Folder();
export {folder};