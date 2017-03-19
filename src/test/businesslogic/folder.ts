import * as chai from "chai";
import * as chaiPromise from "chai-as-promised";
import Promise from "bluebird";

// chai.use(chaiPromise);

describe("folder", function() {
  describe("create", function() {
    it("Should work fine");
    it("Should add an agenda");
    it("Should throw if there is no name provided");
    it("Should throw if there is no desscription provided");
  });

  describe("sort", function(){
    it("Should work fine");
    it("Should sort a folder");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if folderId is not existing");
    it("Should throw if toInsertTo is not set");
  });

  describe("list", function(){
    it("Should work fine");
    it("Should list folders");
  });

  describe("delete folder", function(){
    it("Should throw if folderId is not existing");
    it("Should throw if shouldForce not set and there is a task in the folder");
    it("Should delete folder");
    it("Should set tasks under the deleted folder back to chaos");
  });

  describe("list task by folder", function(){
    it("Should work fine");
    it("Should list task by folder");
    it("Should throw if folderId is not existing");
    it("Should list all if allOrNotDone is not set");
    it("Should list only the done tasks if true");
    it("Should list only the undone tasks if false");
  });
  
  describe("sort tasks by folder", function(){
    it("Should work fine");
    it("Should sort a task by folder");
    it("Should work fine even if toInsertTo is the same as the current index");
    it("Should throw if taskId is not existing");
    it("Should throw if toInsertTo is not set");
    it("Should throw if task has no folder");
  });
  
  describe("move task", function(){
    it("Should work fine");
    it("Should move task to folder");
    it("Should throw if taskId is not existing");
    it("Should throw if newFolderId is not existing");
    it("Should unset folder if newFolderId is falsy");
    it("Should work fine if task is already in folder");
  });
});