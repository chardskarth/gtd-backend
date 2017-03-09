var path = require("path");

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
