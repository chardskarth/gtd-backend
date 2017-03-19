import * as chai from "chai";
import * as chaiPromise from "chai-as-promised";
import Promise from "bluebird";

// chai.use(chaiPromise);

describe("task", function() {
  describe("create", function() {
    it("Should work fine");
    it("Should add a task");
    it("Should throw if there is no name provided");
    it("Should throw if there is no desscription provided");
    it("done is false by default");
    it("parenttask is null/undefined by default");
  });

  describe("sort", function(){
    it("Should work fine");
    it("Should sort a task");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if taskId is not existing");
    it("Should throw if toInsertTo is not set");
  });

  describe("list", function(){
    it("Should work fine");
    it("Should list task");
  });

  describe("list by parent", function(){
    it("Should work fine");
    it("Should list task by parent");
    it("Should throw if parentTaskId is not existing");
    it("Should list all if allOrNotDone is not set");
    it("Should list only the done tasks if true");
    it("Should list only the undone tasks if false");
  });
  
  describe("sort by parent", function(){
    it("Should work fine");
    it("Should sort a task by parent");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if taskId is not existing");
    it("Should throw if toInsertTo is not set");
    it("Should throw if task has no parent task");
  });
  
  describe("set parent task", function(){
    it("Should work fine");
    it("Should set a parent task");
    it("Should throw if taskId is not existing");
    it("Should throw if parentTaskId is not existing");
    it("Should throw if shouldForce is false and task is in a folder");
    it("Should not throw if shouldForce is set and task is in a folder; it should remove current folder");
    it("Should throw if taskId and parentTaskId is equal");
  });

  describe("mark done", function(){
    it("Should work fine");
    it("Should mark a task as done");
    it("Should throw if taskId is not existing");
    it("Should work fine if task is already set as done");
  });

  describe("unmark done", function(){
    it("Should work fine");
    it("Should mark a task as undone");
    it("Should throw if taskId is not existing");
    it("Should work fine if task is not yet done");
  });
});