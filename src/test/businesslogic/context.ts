import * as chai from "chai";
import * as chaiPromise from "chai-as-promised";
import Promise from "bluebird";

// chai.use(chaiPromise);

describe("context", function() {
  describe("create", function() {
    it("Should work fine");
    it("Should add a context");
    it("Should throw if there is no name provided");
    it("Should throw if there is no desscription provided");
  });

  describe("sort", function(){
    it("Should work fine");
    it("Should sort contexts");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if contextId is not existing");
    it("Should throw if toInsertTo is not set");
  });

  describe("list", function(){
    it("Should work fine");
    it("Should list contexts");
  });

  describe("list tasks", function(){
    it("Should work fine");
    it("Should list task by contexts");
    it("Should throw if contextId is not existing");
    it("Should list all if allOrNotDone is not set");
    it("Should list only the done tasks if true");
    it("Should list only the undone tasks if false");
  });
  
  describe("sort tasks", function(){
    it("Should work fine");
    it("Should sort a task by context");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if taskId is not existing");
    it("Should throw if toInsertTo is not set");
    it("Should throw if task has no context");
  });
  
  describe("move task", function(){
    it("Should work fine");
    it("Should move task to context");
    it("Should throw if taskId is not existing");
    it("Should throw if newContextId is not existing");
    it("Should unset context if newContextId is falsy");
    it("Should work fine if task is already in context");
  });
  
  describe("set every", function(){
    it("Should work fine");
    it("Should throw if contextId is not existing");
    it("Should throw if evertStatement is not valid");
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
    it("Should throw if contextId is not existing");
    it("Should throw if until is not in correct format");
    it("Should work fine");
  });

  describe("unset", function(){
    it("Should throw if contextId is not existing");
    it("Should set isset as unset");
    it("Should remove issetuntil");
    it("Should not affect the every column");
  });
});