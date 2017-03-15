import * as Lexer from "lex";
import {pick} from "underscore";
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
          // console.log("hadsfasdf");
          // console.log(arguments);
          self._lastToken = token;
          self._stateMachine[evt.name]();
          evt.cb && evt.cb.call(self, [token].concat(arguments));
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

  lexicalStateMachine.useDefaultSpace();
  lexicalStateMachine
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

  var {stateMachine, lexer} = lexicalStateMachine.create();
  lexer.input = input;
  lexer.lex();

  return { 
    isToday: function(){
  } };
}

parse("every day");
parse("every tuesday");
parse("every wednesday and friday");
parse("every month on the 15th");
parse("every monday at 12:00pm");