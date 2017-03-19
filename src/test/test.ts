import mocha = require("mocha");
import * as path from "path";

var mochaTest = new mocha({
  reporter: "spec"
});

function resolve(toResolve) {
  return path.resolve(__dirname,toResolve);
}
mochaTest.addFile(resolve("./businesslogic/agenda.js"));
mochaTest.addFile(resolve("./businesslogic/context.js"));
mochaTest.addFile(resolve("./businesslogic/folder.js"));
mochaTest.addFile(resolve("./businesslogic/task.js"));
mochaTest.run();