import {BaseModel, SQLBuilder} from "./baseModel"
import {sort} from "./sort"

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
      `agenda.name as name`,
      `agenda.description as description`,
      ];
    var res = SQLBuilder.select(agendaFields)
      .from(sort.dbName)
      .where("key", key).andWhere("tablename", agenda.dbName)
      .orderBy("ordervalue")
      .innerJoin(this.dbName, `${sort.dbName}.tableid`, `${agenda.dbName}.id`);
    return BaseModel.BuildWhere(whereObj, res);
  }
}

var agenda = new Agenda();
export {agenda};