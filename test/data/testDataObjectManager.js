/**
 * Data Object Manager Test
 * Copyright (C) Nick Rabb <nick.rabb2@gmail.com> 2017
 * 
 * This module tests the Data Object Manager module.
 */
module.exports = (debug, fs, fsExt) => {

  const config = {
    baseDir: __dirname + '/.temp/'
  }
  const extensionManager = require(__dirname + '/../extensionManager.js')(null, config, fs, fsExt)
  const tests = [
    prepareTempFileStructure,
    testFindExtensions
  ]

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting Data Object Manager Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping Data Object Manager Tests ---")
      resolve()
    })
  }

  // function testEquals() {
  //   return new Promise((resolve, reject) => {
  //     const obj1 = {
  //       attr1: [1, 2, 3, [4, 'abc']],
  //       attr2: {
  //         embedded1: 'test',
  //         embed2: true
  //       }
  //     }
  //     const obj2 = {
  //       attr1: [1, 2, 3, [4, 'abc']],
  //       attr2: {
  //         embedded1: 'test',
  //         embed2: true
  //       }
  //     }
  //     if (objExt.equals(obj1, obj2))
  //       resolve('Equality Object Test: SUCCESS')
  //     else
  //       reject('Equality Object Test: FAILED (did not match)')
  //   })
  // }

  return {
    "run": run
  }
}
