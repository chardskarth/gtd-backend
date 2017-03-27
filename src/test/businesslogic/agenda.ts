import {expect} from "chai";
import * as Promise from 'bluebird';
import * as agenda from "./../../businesslogic/agenda";
import * as task from "./../../businesslogic/task";
import {BusinessLogicResult} from "./../../helpers/BusinessLogicCommon";
import {getExpectError as _getExpectError} from "./../common";
import {createDb, setInMemoryDb, saveDb} from "./../../helpers/ModelCommon";
var expectError = _getExpectError(expect);

describe("agenda", function() {
  before(function() {
    this.timeout(10000);
    setInMemoryDb(true);
    createDb();
  });
  describe("create", function() {
    it("Should not work if there is no name provided", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.create(undefined, "desc");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error);
      })();
    });
    it("Should not work if there is no description provided", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.create("name", undefined);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error);
      })();
    });
    it("Should add an agenda", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.create("name", "desc");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expect(res.error).to.not.exist;
      })();
    });
  });

  describe("sort", function(){
    it("Should not work if agendaId is not existing", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.sort(-1, 1);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "No sort order object found for agenda:-1");        
      })();
    });
    it("Should tell if newSortOrder is not a number", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.sort(1, "not a number");
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "newSortOrder must be a number");
      })();
    });
    it("Should not work if toInsertTo is not set", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.sort(1, undefined);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "newSortOrder must be a number");
      })();
    });
    it("Should sort an agenda", function() {
      return Promise.coroutine(function* (){
        yield agenda.create("another", "something");
        var res = yield agenda.sort(1, 2);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expect(res.error).to.not.exist;
        var agendas = yield agenda.list();
        expect(agendas).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>agendas).result).to.not.be.empty;
        expect(agendas.result[1].id).to.equal(1);
      })();
    });
    it("Should work fine even if toInsertTo is the same as the current index", function() {
      return Promise.coroutine(function* (){
        yield agenda.sort(1, 2);
        var agendas = yield agenda.list();
        expect(agendas).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>agendas).result).to.not.be.empty;
        expect(agendas.result[1].id).to.equal(1);
      })();
    });
  });

  describe("list", function(){
    it("Should list agendas", function() {
      return Promise.coroutine(function* (){
        var agendas = yield agenda.list();
        expect(agendas).to.be.instanceof(BusinessLogicResult);
        expect((<BusinessLogicResult>agendas).result).to.not.be.empty;
      })();
    });
  });

  describe("list tasks", function(){
    it("Should not work if agendaId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.listTasks(-1);
        expect(res).to.be.instanceof(BusinessLogicResult);
        expectError(res.error, "agenda id not found: -1");
      })();
    });
    it("Should list all if allOrNotDone is not set", function() {
      return Promise.coroutine(function* (){
        var agendaId = (yield agenda.create("agendaTest", "dessszzk")).result;
        var arrTaskIds = [
          ["task1", "description1"]
          , ["task2", "description2"]
          , ["task3", "description3"]
        ].map(toAdd => {
          return task.create.call(undefined, toAdd[0], toAdd[1], undefined
            , undefined, agendaId);
        });
        var taskIds = (yield Promise.all(arrTaskIds)).map(x => x.result);
        yield task.markDone(taskIds[2]);
        var res = yield agenda.listTasks(agendaId);
        expect(res.result).to.have.lengthOf(3);
      })();
    });
    it("Should list only the done tasks if true", function() {
      return Promise.coroutine(function* (){
        var agendaId = 3; // 3 because its the 3rd agenda created since test began
        var res = yield agenda.listTasks(agendaId, true);
        expect(res.result).to.have.lengthOf(2);
      })();
    });
    it("Should list only the undone tasks if false", function() {
      return Promise.coroutine(function* (){
        var agendaId = 3; // 3 because its the 3rd agenda created since test began
        var res = yield agenda.listTasks(agendaId, false);
        expect(res.result).to.have.lengthOf(1);
      })();
    });
  });
  
  describe("sort tasks", function(){
    it("Should not work if task has no agenda", function() {
      return Promise.coroutine(function* (){
        var taskId = (yield task.create("noAgenda", "task with no agenda")).result;
        var res = yield agenda.sortTask(taskId, 2);
        expectError(res.error);
      })();
    });
    it("Should not work if toInsertTo is not set", function() {
      return Promise.coroutine(function* (){
        var taskId = (yield task.create("noAgenda", "task with no agenda")).result;
        yield agenda.moveTask(taskId, 3);
        var res = yield agenda.sortTask(taskId, undefined);
        expectError(res.error);
      })();
    });
    it("Should not work if taskId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.sortTask(undefined, "asfasfsa");
        expectError(res.error);
      })();
    });
    it("Should sort a task by agenda", function() {
      return Promise.coroutine(function* (){
        function getList() {
          return agenda.listTasks(3)
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
        yield agenda.sortTask(5, 1);
        yield agenda.sortTask(3, 1);
        yield agenda.sortTask(2, 1);
        yield agenda.sortTask(1, 1);
        var tasks = yield getList();
        expect(tasks).to.deep.equal([1,2,3,5]);
        yield agenda.sortTask(5, 2);
        tasks = yield getList();
        expect(tasks).to.deep.equal([1,5,2,3]);
      })();
    });
    it("Should work fine even if toInsertTo is the same as the current index", function(){
      return Promise.coroutine(function* (){
        var res = yield agenda.sortTask(3, 4);
        var tasks = (yield agenda.listTasks(3)).result.map(function(res) {
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
        var res = yield agenda.moveTask(undefined, 2);
        expectError(res.error);
      })();
    });
    it("Should not work if newAgendaId is not existing", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.moveTask(1, -1);
        expectError(res.error);
      })();
    });
    it("Should move task to agenda", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.moveTask(1, 1);
        expect(res.error).to.not.exist;
        var tasks = (yield agenda.listTasks(3)).result;
        expect(tasks).to.have.lengthOf(3);
        tasks = (yield agenda.listTasks(1)).result;
        expect(tasks).to.have.lengthOf(1);
      })();
    });
    it("Should unset agenda if newAgendaId is falsy", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.moveTask(1, false);
        expect(res.error).to.not.exist;
        var tasks = (yield agenda.listTasks(1)).result;
        expect(tasks).to.not.exist;
      })();
    });
    it("Should work fine if task is already in agenda", function() {
      return Promise.coroutine(function* (){
        var res = yield agenda.moveTask(2, 3);
        expect(res.error).to.not.exist;
        var tasks = (yield agenda.listTasks(3)).result;
        expect(tasks).to.have.lengthOf(3);
      })();
    });
  });
});