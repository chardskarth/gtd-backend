export function allOrNotDone(isAllOrNotDone: boolean){
  var whereObj = { } as any;
  if(isAllOrNotDone === true) {
    whereObj.where = ["task.done", 0];
  } else if(isAllOrNotDone === false) { // if false
    whereObj.where = ["task.done", 1];
  }
  return whereObj;
}