import {expect} from "chai";
import * as Promise from 'bluebird';
import * as context from "./../../businesslogic/context";
import * as task from "./../../businesslogic/task";
import {BusinessLogicResult} from "./../../helpers/BusinessLogicCommon";
import {getExpectError as _getExpectError} from "./../common";
import {createDb, setInMemoryDb, saveDb, unsetDb} from "./../../helpers/ModelCommon";
var expectError = _getExpectError(expect);

describe("context", function() {
  before(function() {
    this.timeout(10000);
    unsetDb();
    setInMemoryDb(true);
    createDb();
  });
  describe("create", function() {
    it("Should not work if there is no name provided", function(){
      return Promise.coroutine(function* (){
        var res = yield context.create(undefined, "desc");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error);
      })();
    });
    it("Should not work if there is no description provided", function(){
      return Promise.coroutine(function* (){
        var res = yield context.create("name", undefined);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error);
      })();
    });
    it("Should add an context", function(){
      return Promise.coroutine(function* (){
        var res = yield context.create("name", "desc");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expect(res.error).to.not.exist;
      })();
    });
  });

  describe("sort", function(){
    it("Should not work if contextId is not existing", function(){
      return Promise.coroutine(function* (){
        var res = yield context.sort(-1, 1);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "No sort order object found for context:-1");        
      })();
    });
    it("Should tell if newSortOrder is not a number", function(){
      return Promise.coroutine(function* (){
        var res = yield context.sort(1, "not a number");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "newSortOrder must be a number");
      })();
    });
    it("Should not work if toInsertTo is not set", function() {
      return Promise.coroutine(function* (){
        var res = yield context.sort(1, undefined);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "newSortOrder must be a number");
      })();
    });
    it("Should sort an context", function() {
      return Promise.coroutine(function* (){
        yield context.create("another", "something");
        var res = yield context.sort(1, 2);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expect(res.error).to.not.exist;
        var contexts = yield context.list();
        expect(contexts).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>contexts).result).to.not.be.empty;
        expect(contexts.result[1].id).to.equal(1);
      })();
    });
    it("Should work fine even if toInsertTo is the same as the current index", function() {
      return Promise.coroutine(function* (){
        yield context.sort(1, 2);
        var contexts = yield context.list();
        expect(contexts).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>contexts).result).to.not.be.empty;
        expect(contexts.result[1].id).to.equal(1);
      })();
    });
  });

  describe("list", function(){
    it("Should list contexts", function() {
      return Promise.coroutine(function* (){
        var contexts = yield context.list();
        expect(contexts).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>contexts).result).to.not.be.empty;
      })();
    });
  });

  describe("list tasks", function(){
    it("Should not work if contextId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield context.listTasks(-1);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "context id not found: -1");
      })();
    });
    it("Should list all if allOrNotDone is not set", function() {
      return Promise.coroutine(function* (){
        var contextId = (yield context.create("contextTest", "dessszzk")).result;
        var arrTaskIds = [
          ["task1", "description1"]
          , ["task2", "description2"]
          , ["task3", "description3"]
        ].map(toAdd => {
          return task.create.call(undefined, toAdd[0], toAdd[1], undefined
            , contextId);
        });
        var taskIds = (yield Promise.all(arrTaskIds)).map(x => x.result);
        yield task.markDone(taskIds[2]);
        var res = yield context.listTasks(contextId);
        expect(res.result).to.have.lengthOf(3);
      })();
    });
    it("Should list only the done tasks if true", function() {
      return Promise.coroutine(function* (){
        var contextId = 3; // 3 because its the 3rd context created since test began
        var res = yield context.listTasks(contextId, true);
        expect(res.result).to.have.lengthOf(2);
      })();
    });
    it("Should list only the undone tasks if false", function() {
      return Promise.coroutine(function* (){
        var contextId = 3; // 3 because its the 3rd context created since test began
        var res = yield context.listTasks(contextId, false);
        expect(res.result).to.have.lengthOf(1);
      })();
    });
  });
  
  describe("sort tasks", function(){
    it("Should not work if task has no context", function() {
      return Promise.coroutine(function* (){
        var taskId = (yield task.create("nocontext", "task with no context")).result;
        var res = yield context.sortTask(taskId, 2);
        expectError(res.error);
      })();
    });
    it("Should not work if toInsertTo is not set", function() {
      return Promise.coroutine(function* (){
        var taskId = (yield task.create("nocontext", "task with no context")).result;
        yield context.moveTask(taskId, 3);
        var res = yield context.sortTask(taskId, undefined);
        expectError(res.error);
      })();
    });
    it("Should not work if taskId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield context.sortTask(undefined, "asfasfsa");
        expectError(res.error);
      })();
    });
    it("Should sort a task by context", function() {
      return Promise.coroutine(function* (){
        function getList() {
          return context.listTasks(3)
            .then(x => x.result)
            .then(function(res) {
              return res.map(function(res) {
                return res.id;
              });
            })
            .then(res => {
              // console.log(res);
              return res;
            });
        }
        yield context.sortTask(5, 1);
        yield context.sortTask(3, 1);
        yield context.sortTask(2, 1);
        yield context.sortTask(1, 1);
        var tasks = yield getList();
        expect(tasks).to.deep.equal([1,2,3,5]);
        yield context.sortTask(5, 2);
        tasks = yield getList();
        expect(tasks).to.deep.equal([1,5,2,3]);
      })();
    });
    it("Should work fine even if toInsertTo is the same as the current index", function(){
      return Promise.coroutine(function* (){
        var res = yield context.sortTask(3, 4);
        var tasks = (yield context.listTasks(3)).result.map(function(res) {
            return res.id;
          });
        expect(res.error).to.not.exist;
        expect(tasks).to.deep.equal([1,5,2,3]);
      })();
    });
  });
  
  describe("move task", function(){
    it("Should not work if taskId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield context.moveTask(undefined, 2);
        expectError(res.error);
      })();
    });
    it("Should not work if newContextId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield context.moveTask(1, -1);
        expectError(res.error);
      })();
    });
    it("Should move task to context", function() {
      return Promise.coroutine(function* (){
        var res = yield context.moveTask(1, 1);
        expect(res.error).to.not.exist;
        var tasks = (yield context.listTasks(3)).result;
        expect(tasks).to.have.lengthOf(3);
        tasks = (yield context.listTasks(1)).result;
        expect(tasks).to.have.lengthOf(1);
      })();
    });
    it("Should unset context if newContextId is falsy", function() {
      return Promise.coroutine(function* (){
        var res = yield context.moveTask(1, false);
        expect(res.error).to.not.exist;
        var tasks = (yield context.listTasks(1)).result;
        expect(tasks).to.not.exist;
      })();
    });
    it("Should work fine if task is already in context", function() {
      return Promise.coroutine(function* (){
        var res = yield context.moveTask(2, 3);
        expect(res.error).to.not.exist;
        var tasks = (yield context.listTasks(3)).result;
        expect(tasks).to.have.lengthOf(3);
      })();
    });
  });
  });
  
  describe("set every", function(){
    it("Should work fine");
    it("Should not work if contextId is not existing");
    it("Should not work if evertStatement is not valid");
    it("Should unset context if everyStatement is falsy");
    it("Should work fine");
  });
  
  describe("reset", function(){
    it("Should work fine");
    it("Should unset all manually set contexts");
    it("Should set all every context that was manually unset");
  });
  
  describe("current", function(){
    it("Should unset manually set context that is expired");
    it("Should unset every context that is expired");
    it("Should list all new every context");
    it("Should list context manually set");
  });
  
  describe("set", function(){
    it("Should not work if contextId is not existing");
    it("Should not work if until is not in correct format");
    it("Should work fine");
  });

  describe("unset", function(){
    it("Should not work if contextId is not existing");
    it("Should set isset as unset");
    it("Should remove issetuntil");
    it("Should not affect the every column");
  });
});