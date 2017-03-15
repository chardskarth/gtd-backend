import * as Lexer from "lex";
import {pick} from "underscore";
import moment = require("moment");
import {StateMachine} from "javascript-state-machine";
import recur = require('date-recur')

type LexicalStateCB = (this: LexicalStateMachine, token, fromState, toState) => any;
interface LexicalState{
  name: string
  , from: string | string[]
  , to: string
  , regex: RegExp
  , cb?: LexicalStateCB
}

interface StateMachineConfig{
  initial: string
  events: any[]
  callbacks
}

class LexicalStateMachine{
  _defaultSpaceRegex = /\s+/i;
  _isUsingDefaultSpace = false;
  _states: LexicalState[] = [];
  _finalStates: string[] = [];
  _stateMachineConfig: StateMachineConfig = {} as any;
  _stateMachine: StateMachine;
  _lexer;
  _lastToken: string
  constructor(public initialStateName) { }
  useDefaultSpace() {
    this._isUsingDefaultSpace = true;
  }
  addEvent(name: string, from: string | string[], regex: RegExp, cb?: LexicalStateCB, to?: string){
    to = to || name;
    var toAdd = {name, from, to, regex, cb};
    this._states.push(toAdd);
    return this;
  }
  finalStates(...states) {
    this._finalStates = states;
  }
  create() {
    var self = this;

    //create finite machine
    var stateMachineConfig = this._stateMachineConfig;
    var initial = this.initialStateName;
    initial && (stateMachineConfig.initial = initial);
    stateMachineConfig.events = this._states.map(x => pick(x, 'name', 'from', 'to'));
    stateMachineConfig.callbacks = this._states.reduce(function(prev, curr) {
      var prevCb = curr.cb || function() {};
      prev[`onenter${curr.name}`] = function(evt, from, to, token) {
        prevCb.call(self, token, from, to);
      }
      return prev;
    }, {});
    this._stateMachine = StateMachine.create(stateMachineConfig);

    //create lexer
    var lexer = this._lexer = new Lexer(function (token) {
      if(self._isUsingDefaultSpace && self._defaultSpaceRegex.test(token)){}
      else {
        throw new Error(`Unexpected "${token}" near "${self._lastToken}"`);
      }
    });
    this._states.map(x => pick(x, 'name', 'regex', 'cb'))
      .forEach(function (evt: LexicalState) {
        lexer.addRule(evt.regex, function(token){
          self._lastToken = token;
          self._stateMachine[evt.name](token);
        });
      });

    return {
      stateMachine: this._stateMachine
      , lexer
    }
  }
}



export function parse(input) {
  var lexicalStateMachine = new LexicalStateMachine("none");
  var recurStack = [] as any;
  var _recur = recur(moment().format("YYYY-MM-DD"));
  var timeOfDay, endTimeOfDay;

  lexicalStateMachine.useDefaultSpace();
  lexicalStateMachine
    .addEvent("every", "none", /every/i)
    .addEvent("dayset", "every", /day/i, function(token) {
      // recurStack.push("setDailyInterval");
      // recurStack.push(1);
      _recur.setDailyInterval(1);
    })
    .addEvent("weekdayset", "every", /((monday)|(tuesday)|(wednesday)|(thursday)|(friday)|(sunday)|(saturday))/i, function(token) {
      // recurStack.push("setDaysOfWeek");
      // recurStack.push(token);
      var dayNum = moment(token, "dddd", true).day();
      _recur.setDaysOfWeek([dayNum]);
    })
    .addEvent("monthsetting", "every", /month/i, function() {
      // recurStack.push("setMonthlyInterval");
      // recurStack.push(1);
      _recur.setMonthlyInterval(1);
    })
    .addEvent("monthdayelaborating", ["monthsetting", "monthdayelaborating"], /(on)|(the)/i)
    .addEvent("monthdayelaboratedset", "monthdayelaborating", /([123]?[1-9])((st)|(th))/i, function(token) {
      var num = parseInt(token.replace(/(st)|(th)/i, ""));
      // console.log(typeof num);
      // console.log(num);
      // recurStack.push("setDaysOfMonth");
      // recurStack.push(num);
      _recur.setDaysOfMonth([num]);
    })
    // .addEvent("monthdaylastdayset", ["monthdayelaborating"], /lastday/i)
    .addEvent("timesetting", ["dayset", "weekdayset", "monthdayelaboratedset"
      , "monthdaylastdayset"], /at/i)
    .addEvent("timeset", ["timesetting", "dayset", "weekdayset", "monthdayelaboratedset"
      /* , "monthdaylastdayset" */], /([01]?[0-9]):([01-5][0-9])(am|pm)/i, function(token) {
        // recurStack.push("setTimeOfDay");
        // recurStack.push(token);
        timeOfDay = token;
      })
    .addEvent("timeendsetting", "timeset", /until/i)
    .addEvent("timeendset", "timeendsetting", /([01]?[0-9]):([01-5][0-9])(am|pm)/i, function(token) {
      // recurStack.push("setEndTimeOfDay");
      // recurStack.push(token);
      endTimeOfDay = token;
    })
    .finalStates("dayset", "weekdayset", "monthdayelaboratedset", "monthdaylastdayset"
      , "timeset", "timeendset")

  var {stateMachine, lexer} = lexicalStateMachine.create();
  lexer.input = input;
  lexer.lex();

  return { 
    isToday: function(){
      return _recur.matches(moment().format("YYYY-MM-DD"));
  } };
}

console.log(parse("every day").isToday());
console.log(parse("every Thursday").isToday());
console.log(parse("every month on the 16th").isToday());
console.log(parse("every monday at 12:00pm").isToday());