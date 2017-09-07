/**
* main.js
* The main entry point to run the Emerald Engine test suite.
*/

/**
 * The file system module.
 */
const fs = require('fs')

/**
 * The promise node module.
 */
const promise = require('promise')

/**
 * The path module.
 */
const path = require('path')

/**
 * The debug module.
 */
const debug = require(__dirname + '/../utils/debug.js')

/**
 * The database module.
 */
const db = require(__dirname + '/../db/databaseManager.js')(fs)

/**
 * Load in the JSON configuration.
 */
const config = require(__dirname + "/config.json")

/**
 * The Emerald array extensions module.
 */
const arrayExt = require(__dirname + '/../utils/arrayExt.js')()

/**
 * The Emerald fs extensions module.
 */
const fsExt = require(__dirname + '/../utils/fsExt.js')(debug, fs, path, promise, arrayExt)

/**
 * The Test Suite Utilities module containing many shared functions for the suite.
 */
const utils = require(__dirname + '/utils.js')(fsExt)

/**
 * The tests for the extension manager.
 */
const testExtensionManager = require(__dirname + '/testExtensionManager.js')(debug, utils, fs, fsExt)

/**
 * The data manager.
 */
// let dataManager = require(__dirname + "/data/testDataManager.js")(db, engine, fs, promise)

/**
 * The data object manager.
 */
// let dataObjectManager

/**
 * Run the test suite.
 */
async function run() {
  let test
  // await db.init()
  // TODO : Run the data manager's test data setup
  // dataObjectManager = await require(__dirname + '/../../server/dataObjects/dataObjectManager.js')(engine, db, fs, promise)
  for (test in config) {
    if (config[test] === 1) {
      if (test === "extensionManager") {
        testExtensionManager.run()
      }
    }
  }
}

run()
