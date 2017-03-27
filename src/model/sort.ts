import {BaseModel, SQLBuilder} from "./baseModel"

class Sort extends BaseModel{
  static dbName: string = "sort";
  constructor(){
    //order field should be last. see add
    super(Sort.dbName, ["key", "tablename", "tableid", "ordervalue"]);
  }

  add(key, tableName, tableId){
    var insertSql = `INSERT INTO ${this.dbName} (`;
    insertSql += this.fields.join(", ");
    insertSql += ") VALUES (";
    insertSql += this.fields.filter(x => x != "ordervalue").map(x => "?").join(", ");
    
    insertSql += `, (SELECT IFNULL(MAX(ordervalue), 0) + 1 
      FROM ${this.dbName}
      WHERE key == '${key}' AND tablename == '${tableName}')`;
    
    insertSql += ")";
    
    this.db.run(insertSql, [key, tableName, tableId]);
  }

  createTable(db){
    var q = SQLBuilder.schema.createTableIfNotExists(Sort.dbName, function (table) {
      table.string("key");
      table.integer("ordervalue");
      table.string("tablename");
      table.integer("tableid");
    });
    db.run(q.toString());
  }
  updateSortOrder(tableName, tableId, sortKey, newSortOrder){
    newSortOrder = parseInt(newSortOrder);
    if(isNaN(newSortOrder)) {
      throw Error("newSortOrder must be a number");
    }
    var db = this.db;
    var dbName = this.dbName;
    var currentDocument = db.exec(SQLBuilder(this.dbName)
      .select("*")
      .where("key", sortKey)
      .andWhere("tableid", tableId)
      .andWhere("tablename", tableName)
      .toString())
      .map(BaseModel.MapExecResult)[0]; //exec allows multiple query, sheesh.
    if(currentDocument)
      currentDocument = currentDocument[0];
    else{
      throw Error(`No sort order object found for ${tableName}:${tableId}`);
    }
    
    var previousSortOrder = (<any>currentDocument).ordervalue;
    if(previousSortOrder == newSortOrder){
      return;
    }
    db.run(SQLBuilder(this.dbName).where("tableid", tableId)
      .andWhere("tablename", tableName)
      .update("ordervalue", newSortOrder)
      .toString()
    );
    
    function execSortOrder() {
      var sql = SQLBuilder(dbName)
        .where("tableid", "<>", tableId)
        .andWhere("key", sortKey)
        .andWhere("tablename", tableName);
      if(newSortOrder < previousSortOrder) { // increase
        sql = sql.increment("ordervalue", 1).where("ordervalue", ">=", newSortOrder)
        .andWhere("ordervalue", "<", previousSortOrder)
      } else { //if(newSortOrder < previousSortOrder) // decrease
        sql = sql.decrement("ordervalue", 1).where("ordervalue", "<=", newSortOrder)
        .andWhere("ordervalue", ">", previousSortOrder)
      }
      db.run(sql.toString());
    }
    execSortOrder();
    // this will hold all the affected sort, either increment or decrement
    // var dbName = this.dbName;
    // var affectedSorts = db.exec(SQLBuilder(this.dbName)
    //   .where("tableid", "<>", tableId)
    //   .andWhere("tablename", "<>", tableName)
    //   .toString()
    // ).map(BaseModel.MapExecResult)[0]
    // // .filter(filterSortOrder, {dbName, hasSortOrder})
    // .forEach(execSortOrder, {dbName});
  }

  updateAndDecrement(tableName, tableId, oldSortKey, newSortKey){
    var db = this.db;
    var previousDoc:any;
    var previousSortOrder;

    function incrementAllNewSortKey(dbName) {
      var incrementAll = SQLBuilder(dbName).increment("ordervalue")
        .where("key", newSortKey).toString();
      db.run(incrementAll);
    }
    
    if(oldSortKey) {
      previousDoc = SQLBuilder.select("ordervalue", "key").from(this.dbName)
        .where("tablename", tableName).andWhere("tableid", tableId)
        .andWhere("key", oldSortKey).toString();
      previousDoc = db.exec(previousDoc)
        .map(BaseModel.MapExecResult)[0][0];
      previousSortOrder = previousDoc.ordervalue;
     
      if(newSortKey) {
        incrementAllNewSortKey(this.dbName);

        var updateSort = SQLBuilder(this.dbName).update("key", newSortKey)
// insert newly sorted at first index
          .update('ordervalue', 1)
          .where("tablename", tableName).andWhere("tableid", tableId)
          .andWhere("key", oldSortKey).toString();
        db.run(updateSort);
      } else  {
        sort.delete(oldSortKey, tableName, tableId);
      }

      var decrement = SQLBuilder(this.dbName).decrement("ordervalue")
        .where("ordervalue", ">", previousSortOrder).andWhere("key", oldSortKey).toString();
      db.run(decrement);
    } else {
      if(newSortKey) {
        incrementAllNewSortKey(this.dbName);
        sort.add(newSortKey, tableName, tableId);
        var updateSort = SQLBuilder(this.dbName).update("ordervalue", 1)
          .where("tablename", tableName).andWhere("tableid", tableId)
          .andWhere("key", newSortKey).toString();
        db.run(updateSort);
      }
    } // else if !oldSortKey
  }
  
  getSortKeys(prefix, folderId?, contextId?, agendaId?, parentTaskId?): any[]{
    var retVal = [];
    var hasFolder = !!folderId;
    var hasAgenda = !!agendaId;
    var hasContext = !!contextId;
    var hasParentTask = !!parentTaskId;

    if(!hasFolder) {
      retVal.push(`${prefix}_chaos`);
    } else {
      retVal.push(`${prefix}_folder:${folderId}`);
    }

    if(hasContext) {
      retVal.push(`${prefix}_context:${contextId}`);
    }

    if(hasAgenda) {
      retVal.push(`${prefix}_agenda:${agendaId}`);
    }

    if(hasParentTask) {
      retVal.push(`${prefix}_parenttask:${parentTaskId}`);
    }

    return retVal;
  }
}

var sort = new Sort();
export {sort};