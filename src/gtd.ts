// import executor from "./helpers/BusinessLogicExecutor";
// import * as commander from 'commander';

// executor(commander);
// commander.parse(process.argv);

import Main from "./commands/main";
import cmdln = require("cmdln");

cmdln.main(new Main(), {showErrStack: true});  // mainline 