/**
 * masterManager.js
 * Copyright Nick Rabb <nick.rabb2@gmail.com> 2017
 * This is the master manager (manager) - haha...
 * This module should load up all of the manager extensions for the
 * Emerald server engine.
 */

import * as readline from 'readline'
import * as fs from 'fs'
import { FsExtensions } from './utils/fsExt'
import Engine from './Server'

class MasterManager {

  private engine : Engine

  constructor (engine : Engine) {
    this.engine = engine
  }

  /**
   * Initialize the Master Manager module.
   */
  public init() {
    return new Promise((resolve, reject) => {
    })
  }

  /**
   * Register all of the managers that the user
   * has defined as extensions for the engine by
   * adding them to the engine.managers object.
   */
  public async registerManagers() {
    const judge = (path) => {
      return new Promise(async (resolve, reject) => {
        console.log(path)
        const reader = readline.createInterface({
          input: fs.createReadStream(path)
        })
        reader.on('line', (line) => {
          if (line === '[\'emeraldManager\']') resolve(path)
        })
        reader.on('close', () => resolve())
      })
    }
    const managers = await FsExtensions.readdirRecursive(__dirname, judge)
    managers.map((val : string) => {
      const managerName = val.substring(val.lastIndexOf('/'), val.lastIndexOf('.'))
      this.engine.managers[managerName] = require(val)(this.engine)
    })
  }

  public initManagers() {

  }
}

export { MasterManager }