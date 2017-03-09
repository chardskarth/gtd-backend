function CommandCreator(constructor){
  return Object.create({
    create: function(name, command){
      constructor.prototype[`do_${name}`] = command;
      

      return Object.create({
        help: function(helpMessage) {
          command.help = helpMessage || "";
          return this;
        }
        , aliases: function(aliases) {
          command.aliases = aliases || "";
          return this;
        }
        , createOption: function(longOpt, shortOpt, cb) {
          if(typeof command.options === "undefined"){
            command.options = [];
          }
          var opts = command.options;
          var optObj = {
            names: [longOpt, shortOpt]
          } as any;
          var toPass = Object.create({
            type: function(arg) {optObj.type = arg; return this;}
            , help: function(arg) {optObj.help = arg; return this;}
            , helpArg: function(arg) {optObj.helpArg = arg; return this;}
            , default: function(arg) {optObj.default = arg; return this;}
          });
          cb(toPass);
          opts.push(optObj);
          return this;
        }
      });
    }
  });
}

export default CommandCreator