import * as Lexer from "lex";
import {pick} from "underscore";
import StateMachine = require("javascript-state-machine");

export function parse(input) {
  var stateMachine = Object.create({
    initial(i) {
      this._initial = i;
      return this;
    }
    , addEvent(name: String, from: String  & String[], regex: RegExp, to?: String) {
      to = to || name;

      this._events = this._events || [];
      this._events.push({name, from, to, regex});
      return this;
    }
    , create() {
      var create = this._create = {};
      var initial = this._initial;
      var events = this._events;
      initial && (create["initial"] = initial);
      create["events"] = this._events.map(x => pick(x, 'name', 'from', 'to'));
      var fs = (this._fs = StateMachine.create(create));

      var lastToken; //for debugging
      var lexer = this._lexer = new Lexer(function (token) {
        throw new Error(`Unexpected "${token}" near "${lastToken}"`);
      });
      this._events.map(x => pick(x, 'name', 'regex'))
        .forEach(function (evt) {
          lexer.addRule(evt.regex, function(token){
            lastToken = token;
            fs[evt.name]();
          });
        });
        
      return {fs, lexer};
    }
  });
  var {fs, lexer} = stateMachine.initial("none")
// go to "every" state, only when from state "none". input should be the regex
    .addEvent("every", "none", /every/i)
    .addEvent("dayset", "every", /day/i)
    .addEvent("weekdayset", "every", /((monday)|(tuesday)|(wednesday)|(thursday)|(friday)|(sunday)|(saturday))/i)
    .addEvent("weekdayadding", "weekdayset", /(and)|(,)/i)
    .addEvent("monthsetting", "every", /month/i)
    .addEvent("monthdayelaborating", "monthsetting", /(on)|(the)/i)
    .addEvent("monthdayelaboratedset", "monthdayelaborating", /[123]?((1st)|(2nd)|(3rd)|([4-9]th))/i)
    .addEvent("monthdaylastdayset", ["monthdayelaborating"], /lastday/i)
    .addEvent("timesetting", ["dayset", "weekdayset", "monthdayelaboratedset"
      , "monthdaylastdayset"], /at/i)
    .addEvent("timeset", ["timesetting", "dayset", "weekdayset", "monthdayelaboratedset"
      , "monthdaylastdayset"], /([01]?[0-9]):([01-5][0-9])(am|pm)/i)
  .create();

  lexer.input = input;
  lexer.lex();
}