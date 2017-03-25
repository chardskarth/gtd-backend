import {expect} from "chai";
import * as chaiPromise from "chai-as-promised";
import * as Promise from 'bluebird';
import * as agenda from "./../../businesslogic/agenda";

// chai.use(chaiPromise);

describe("agenda", function() {
  describe("create", function() {
    it("Should throw if there is no name provided", function(){
      var res = agenda.create(undefined, "desc");
      expect(res.error).to.be.instanceof(Error)
    });
    it("Should throw if there is no desscription provided", function(){
      var res = agenda.create("name", undefined);
      expect(res.error).to.be.instanceof(Error)
    });
    it("Should add an agenda");
  });

  describe("sort", function(){
    it("Should work fine");
    it("Should sort an agenda");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if agendaId is not existing");
    it("Should throw if toInsertTo is not set");
  });

  describe("list", function(){
    it("Should work fine");
    it("Should list agendas");
  });

  describe("list tasks", function(){
    it("Should work fine");
    it("Should list task by agenda");
    it("Should throw if agendaId is not existing");
    it("Should list all if allOrNotDone is not set");
    it("Should list only the done tasks if true");
    it("Should list only the undone tasks if false");
  });
  
  describe("sort tasks", function(){
    it("Should work fine");
    it("Should sort a task by agenda");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if taskId is not existing");
    it("Should throw if toInsertTo is not set");
    it("Should throw if task has no agenda");
  });
  
  describe("move task", function(){
    it("Should work fine");
    it("Should move task to agenda");
    it("Should throw if taskId is not existing");
    it("Should throw if newAgendaId is not existing");
    it("Should unset agenda if newAgendaId is falsy");
    it("Should work fine if task is already in agenda");
  });
});