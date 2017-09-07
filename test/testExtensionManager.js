/**
 * Extension Manager Test
 * Copyright (C) Nick Rabb <nick.rabb2@gmail.com> 2017
 * 
 * This module tests the Extension Manager module.
 */
module.exports = (debug, utils, fs, fsExt) => {

  const config = {
    baseDir: __dirname + '/.temp/'
  }
  const extensionManager = require(__dirname + '/../extensionManager.js')(null, config, fs, fsExt)
  const tests = [
    prepareTempFileStructure,
    testFindExtensions
  ]

  const dirs = [__dirname + '/.temp/', __dirname + '/.temp/.temp2/', __dirname + '/.temp/.temp3/', __dirname + '/.temp/.temp3/.temp4/']
  const files = {
    '/.temp/file.js': "This is the first text file.\nBlah blah blah.",
    '/.temp/file2.txt': "This is another text file... the second one! Blah blah blah.",
    '/.temp/.temp2/file3.png': "This is supposed to be a png file but you know there's not a whole lot we can do for that.",
    '/.temp/.temp3/file4.txt': "Yet another text file",
    '/.temp/.temp3/.temp4/file5.js': "['emerald-manager']\n\module.exports=(emerald)=>{\nfunction init(){return new Promise((resolve, reject)=>{resolve()})}\nreturn{'init':init}}"
  }

  function run() {
    return new Promise(async (resolve, reject) => {
      let res, i, test
      debug.log("--- Starting Extension Manager Tests ---")
      for (i in tests) {
        let test = tests[i]
        res = await test()
          .catch(err => debug.error(err))
        if (res !== undefined) debug.log(res)
      }
      debug.log("Cleaning up...")
      res = await cleanUp()
        .catch(err => engine.debug.error(err))
      debug.log("--- Stopping Extension Manager Tests ---")
      resolve()
    })
  }

  function prepareTempFileStructure() {
    return utils.prepareTempFileStructure(dirs, files)
  }

  function cleanUp() {
    return utils.cleanUp(dirs, files)
  }

  function testFindExtensions() {
    return new Promise(async (resolve, reject) => {
      const extensions = await extensionManager.findExtensions(extensionManager.EXTENSION_TYPES.MANAGER.name)
      console.log(extensions)
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
