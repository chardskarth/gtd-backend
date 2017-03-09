import * as SQL from "sql.js";

export enum Debug{
  HIGH,
  LOW,
  NONE
}

function mapExecResult(result){
    var retVal = [];
    for (var i = 0; i < result.values.length; i++) {
      var document = {};
      var item = result.values[i];
      for (var j = 0; j < result.columns.length; j++) {
        var key = result.columns[j];
        document[key] = item[j];
      }
      retVal.push(document);
    }
    return retVal;
  }

export function Migrator(db: SQL.Database){
	// Pending migrations to run
	var migrations = [];
	// Callbacks to run when migrations done
	var whenDone = [];

	var state = 0;
	
	var MIGRATOR_TABLE = "_migrator_schema";

	// Use this method to actually add a migration.
	// You'll probably want to start with 1 for the migration number.
	this.migration = function(number, func){
		migrations[number] = func;
	};
	
	// Execute a given migration by index
	var doMigration = function(number){
		if(migrations[number]){
			try{
				debug(Debug.HIGH, "Beginning migration %d", [number]);
				db.run("BEGIN");
				migrations[number](db);
				var stmt = db.prepare(`update ${MIGRATOR_TABLE} set version = ?`, [number]);
				stmt.run();
				db.run("END");
				debug(Debug.HIGH, "Completed migration %d", [number]);
				doMigration(number+1);
			} catch (err){
				error("Error!: %o (while upgrading to %s from %s)", err, number);
			}
		} else {
			debug(Debug.HIGH, "Migrations complete, executing callbacks.");
			state = 2;
			executeWhenDoneCallbacks();
		}
	};
	
	// helper that actually calls doMigration from doIt.
	var migrateStartingWith = function(ver){
		state = 1;
		debug(Debug.LOW, "Main Migrator starting.");

		try {
			doMigration(ver+1);
		} catch(e) {
			error(e);
		}
	};

	this.execute = function(){
		if(state > 0){
			throw "Migrator is only valid once -- create a new one if you want to do another migration.";
		}
		try{
			var res, version;
			try {
				res = db.exec(`select version from ${MIGRATOR_TABLE}`).map(mapExecResult)[0][0];
				version = res.version;
				debug(Debug.HIGH, "Existing database present, migrating from %d", [version]);
				migrateStartingWith(version);
			} catch (err) {
				if(err.message.match(/no such table/i)){
					db.run(`create table ${MIGRATOR_TABLE}(version integer)`);
					// error("Unrecoverable error creating version table: %o", err);
					db.run(`insert into ${MIGRATOR_TABLE} values(0)`);
					// error("Unrecoverable error inserting initial version into db: %o", err);
					debug(Debug.HIGH, "New migration database created...");
					migrateStartingWith(0);
				} else {
					error("Unrecoverable error resolving schema version: %o", err);
				}
			}
		} catch (err){
			error(err);
		}
		return this;
	};

	// Called when the migration has completed.  If the migration has already completed,
	// executes immediately.  Otherwise, waits.
	this.whenDone = function(func){
		if(typeof func !== "array"){
			func = [func];
		}
		for(var f in func){
			whenDone.push(func[f]);
		}
		if(state > 1){
			debug(Debug.LOW, "Executing 'whenDone' tasks immediately as the migrations have already finished.");
			executeWhenDoneCallbacks();
		}
	};
	
	var executeWhenDoneCallbacks = function(){
		for(var f in whenDone){
			whenDone[f]();
		}
		debug(Debug.LOW, "Callbacks complete.");
	}
	
	// Debugging stuff.
	var log = (console.log) ? function() { console.log.apply(console, argumentsToArray(arguments)) } : function(){};
	var error: (...any) => any = (console.error) ? function() { console.error.apply(console, argumentsToArray(arguments)) } : function(){};
	
	var debugLevel = Debug.NONE;

	var argumentsToArray = function(args) { return Array.prototype.slice.call(args); };
	this.setDebugLevel = function(level){
		debugLevel = level;
	}
	
	var debug = function(minLevel, message, args?){
		if(debugLevel >= minLevel){
			var newArgs = [message];
			if(args != null) for(var i in args) newArgs.push(args[i]);
		
			log.apply(null, newArgs);
		}
	}
}