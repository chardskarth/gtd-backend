import {BaseModel, SQLBuilder} from "./baseModel"

class FolderContext extends BaseModel{
  constructor(){
    super("foldercontext", ["folderid", "contextid"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists("foldercontext", function (table) {
      table.integer("folderid").notNullable();
      table.integer("contextid").notNullable();
      table.unique(["contextid", "folderid"]);
    });
    db.run(q.toString());
  }
}

var foldercontext = new  FolderContext();
export {foldercontext};
