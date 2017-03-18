export function allOrNotDone(isAllOrNotDone: boolean){
  var whereObj = { } as any;
  if(isAllOrNotDone === true) {
    whereObj.where = ["task.done", 0];
  } else if(isAllOrNotDone === false) { // if false
    whereObj.where = ["task.done", 1];
  }
  return whereObj;
}

export class BusinessLogicResult {
  error: Error
  stack: string
  result: any
  constructor(public ok: number, result?, error?: Error) {
    error && (this.error = error);
    result && (this.result = result);
  }
  static OK (result?){
    return new BusinessLogicResult(1, result);
  }
  static Error (err){
    return new BusinessLogicResult(0, undefined, err);
  }
}