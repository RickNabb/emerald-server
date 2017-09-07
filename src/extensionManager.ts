/**
 * Extension Manager
 * Copyright (C) Nick Rabb <nick.rabb2@gmail.com> 2017
 * 
 * This module manages all of the user extensions that could be added
 * to the Emerald engine.
 */

import * as readline from "readline"
import * as fs from 'fs'
import { FsExtensions } from './utils/fsExt'

class ExtensionManager {

  private engine
  private config

  /**
   * An enumeration of extension types.
   */
  public EXTENSION_TYPES = {
    MANAGER: {
      name: "manager",
      val: 0
    },
    DATA_OBJECT: {
      name: 'dataobject',
      val: 1
    }
  }

  constructor (engine, config) {
    this.engine = engine
    this.config = config
  }

  /**
   * Initialize the Extension Manager.
   */
  public init() {
    return new Promise((resolve, reject) => {
      resolve()
    })
  }

  /**
   * Find user extensions of a given type throughout the user's
   * project directory.
   * @param {String} type The type of extension to look for.
   */
  public findExtensions(type) {
    return new Promise(async (resolve, reject) => {
      const judge = (path) => {
        const reader = readline.createInterface({
          input: fs.createReadStream(path)
        })
        reader.on('line', (line) => {
          if (line.toLocaleLowerCase() === '[\'emerald-' + type.name + '\']') resolve(path)
        })
        reader.on('close', () => resolve())
      }
      const skip = (file) => {
        return file.indexOf('node_modules') > -1 || file.indexOf('.git') > -1
      }
      const extensionFiles = await FsExtensions.readdirRecursive(this.config.baseDir, judge, skip)
      const extensions = {}
      extensionFiles.reduce((accum, cur) => {
        const managerName = cur.substring(cur.lastIndexOf('/'), cur.lastIndexOf('.'))
        accum[managerName] = require(cur)(this.engine)
        return accum
      }, extensions)
      resolve(extensions)
    })
  }
}

export { ExtensionManager }