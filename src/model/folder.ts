import {BaseModel, SQLBuilder} from "./baseModel"
import {sort} from "./sort"

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
      .from(sort.dbName)
      .where("key", key).andWhere("tablename", folder.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${sort.dbName}.tableid`, `${folder.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res);
  }
}


var folder = new Folder();
export {folder};