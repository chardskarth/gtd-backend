import * as path from 'path';
import * as fs from 'fs';
import * as commander from 'commander';
import { createJoinResolve, joinCwd } from './../helpers/Extension';

const DEFAULT_BUSINESSLOGIC_PATH = joinCwd("./build/businesslogic");

// get all businesslogics in folder
export default function loadBusinessLogicsInCommander(commander: commander.ICommand){
  var blogicsPath = DEFAULT_BUSINESSLOGIC_PATH;
  var joinResolve = createJoinResolve(process.cwd(), DEFAULT_BUSINESSLOGIC_PATH);

  //load all businessLogic, get alias, description. run getModuleAction for each module
  return fs.readdirSync(blogicsPath).map(curr => {
    var retVal = {} as any;  
    var completePath = joinResolve(`./${curr}`);
    (<any>Object).assign(retVal, path.parse(completePath) );
    var module = retVal.module = require(completePath);

    commander
      .command(`${retVal.name}`)
      .alias(module.alias)
      .description(module.description)
      .action(getModuleAction(retVal.module));

    return retVal;
  });
}

// loops the module's exported properties but skips 'alias' and 'description'
// create command and action
function getModuleAction(module: any): any{
  return function(args, cmd){ 

// execute main as default
    if(!args.length && module.main){
      module.main.apply(module);
    } else {

// find the command exported by the module
      Object.keys(module)
        .filter(x => !(<any>["alias", "description"]).find(y => x == y))
        .forEach(subcommand => {
            var temp = commander.command(`${subcommand}`);

// if function, execute it
          if(typeof module[subcommand] === "function"){
            temp.action(function(args, cmd){
              module[subcommand].apply(module, args);
            });
// if object, it should have action property, but check for alias and description first
          } else {
            (<any>["alias", "description"]).forEach(otherProps => {
              if(otherProps in module[subcommand]){
                temp[otherProps](module[subcommand][otherProps]);
              }
            });
            temp.action(function(args, cmd){
              module[subcommand]._args = args;
              module[subcommand]._cmd = cmd;
              module[subcommand].action.apply(module, args);
            });
          }
      });
      commander.parse(["node", "index"].concat(args));
    } // if else
  }
}