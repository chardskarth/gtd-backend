import * as chai from "chai";
import * as chaiPromise from "chai-as-promised";
import Promise from "bluebird";

// chai.use(chaiPromise);

describe("agenda", function() {
  describe("create", function() {
    it("Should work fine");
    it("Should add an agenda");
    it("Should throw if there is no name provided");
    it("Should throw if there is no desscription provided");
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