var path = require("path");
import moment = require("moment");

//define function: join all paths passed with process.cwd
export function joinCwd(...any) {
  return path.join.apply(process.cwd(), arguments);
}

//define function: join all paths passed with process.cwd
export function createJoinResolve(...any) {
  var args = Array.prototype.slice.call(arguments);
  return function(...any){
    var args2 = Array.prototype.slice.call(arguments);
    return path.resolve.apply(undefined, args.concat(args2));
  }
}

export function isTimeValid(time){
  time = time.toLowerCase().trim();
  return moment(time, ["h:mma", "H:mma"], true).isValid();
}

export function parseTime(time){
  time = time.toLowerCase().trim();
  return moment(time, ["h:mma", "H:mma"], true);
}
