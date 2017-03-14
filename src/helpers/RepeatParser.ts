import * as Lexer from "lex";
import {pick} from "underscore";
import StateMachine = require("javascript-state-machine");
import recur = require('date-recur')

export function parse(input) {
  var stateMachine = Object.create({
    initial(i) {
      this._initial = i;
      return this;
    }
    , addToContext(cb){
      cb.call(this);
    }
    , useDefaultSpace(){
      this._defaultSpaceRegex = /\s+/i;
      this._isUsingDefaultSpace = true;
      return this;
    }
    , addEvent(name: String, from: String  & String[], regex: RegExp, to?: String) {
      to = to || name;

      this._events = this._events || [];
      this._events.push({name, from, to, regex});
      return this;
    }
    , finalStates(...states) {
      this._finalStates = states;
      return this;
    }
    , create() {
      var create = this._create = {};
      var initial = this._initial;
      var events = this._events;
      var self = this;
      initial && (create["initial"] = initial);
      create["events"] = this._events.map(x => pick(x, 'name', 'from', 'to'));
      var fs = (this._fs = StateMachine.create(create));

      var lastToken; //for debugging
      var lexer = this._lexer = new Lexer(function (token) {

        //if space is enabled, do nothing
        if(self._isUsingDefaultSpace && self._defaultSpaceRegex.test(token)){}
        else {
          throw new Error(`Unexpected "${token}" near "${lastToken}"`);

        }
      });
      this._events.map(x => pick(x, 'name', 'regex'))
        .forEach(function (evt) {
          lexer.addRule(evt.regex, function(token){
            lastToken = token;
            fs[evt.name]();
          });
        });
      
      var originalLex = lexer.lex;
      lexer.lex = function(){
        var retVal = originalLex.apply(lexer, arguments);
        console.log(fs.current);
        var isInFinalStates = self._finalStates.find(x => x == fs.current);
        if(!isInFinalStates) throw Error("Not in final state!");
        return retVal;
      }
      return {fs, lexer};
    }
  });
  var {fs, lexer} = stateMachine.initial("none")
    .useDefaultSpace()
    .addToContext(function(){ 
      this._recur = recur();
    })
// go to "every" state, only when from state "none". input should be the regex
    .addEvent("every", "none", /every/i)
    .addEvent("dayset", "every", /day/i)
    .addEvent("weekdayset", "every", /((monday)|(tuesday)|(wednesday)|(thursday)|(friday)|(sunday)|(saturday))/i)
    .addEvent("weekdayadding", "weekdayset", /(and)|(,)/i)
    .addEvent("monthsetting", "every", /month/i)
    .addEvent("monthdayelaborating", ["monthsetting", "monthdayelaborating"], /(on)|(the)/i)
    .addEvent("monthdayelaboratedset", "monthdayelaborating", /([123]?[1-9])((st)|(th))/i)
    .addEvent("monthdaylastdayset", ["monthdayelaborating"], /lastday/i)
    .addEvent("timesetting", ["dayset", "weekdayset", "monthdayelaboratedset"
      , "monthdaylastdayset"], /at/i)
    .addEvent("timeset", ["timesetting", "dayset", "weekdayset", "monthdayelaboratedset"
      , "monthdaylastdayset"], /([01]?[0-9]):([01-5][0-9])(am|pm)/i)
    .addEvent("timeendsetting", "timeset", /until/i)
    .addEvent("timeendset", "timeendsetting", /([01]?[0-9]):([01-5][0-9])(am|pm)/i)
    .finalStates("dayset", "weekdayset", "monthdayelaboratedset", "monthdaylastdayset"
      , "timeset", "timeendset")
  .create();

  lexer.input = input;
  lexer.lex();

  return { isToday: function(){

  } };
}

// parse("every day");
// parse("every month on the 15th");
// parse("every monday at 12:00pm");