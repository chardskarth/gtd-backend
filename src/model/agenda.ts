import {BaseModel, SQLBuilder} from "./baseModel"
import {DBNames} from "./../helpers/ModelCommon";

class Agenda extends BaseModel{
  static dbName: string = "agenda";
  constructor(){
    super(Agenda.dbName, ["name", "description"]);
  }
  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Agenda.dbName, function (table) {
      table.increments();
      table.string("name").notNullable();
      table.string("description").notNullable();
    });
    db.run(q.toString());
  }
  joinAllSort(key, whereObj){
    var agendaFields = [
      `agenda.id as id`,
      `agenda.name as name`,
      `agenda.description as description`,
      ];
    var res = SQLBuilder.select(agendaFields)
      .from(DBNames.sort)
      .where("key", key).andWhere("tablename", agenda.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${DBNames.sort}.tableid`, `${agenda.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res);
  }
}

var agenda = new Agenda();
export {agenda};