/**
* app.js
* The server implementation for the Emerald application.
* This is the main point of entry.
*/

import { ObjectExtensions } from './utils/objExt'
import { FsExtensions } from './utils/fsExt'
import { ArrayExtensions } from './utils/arrayExt'
import { StringHelpers } from './utils/stringHelpers'
import { Debug } from './utils/debug'
import { DatabaseManager } from './db/databaseManager'
import MasterPacketManager from './masterPacketManager'
import { DataObjectManager } from './dataObjectManager'
import { ExtensionManager } from './extensionManager'
import { MasterManager } from './masterManager'

/**
 * We need this to polyfill stuff!
 */
require('babel-polyfill')

class EmeraldServer {
  /**
   * The ExpressJS module to set up routing for the client side of the app.
   */
  private express = require('express')
  private app = this.express()

  /**
   * The HTTP module for routing.
   */
  private http = require('http').Server(this.app)
  
  /**
   * The path module for resolving filepaths.
   */
  private path = require('path')
  
  /**
   * The file system module.
   */
  private fs = require('fs')
  
  /**
   * The module we can use to convert async Node FUNCTIONS
   * into those using promises.
   */
  private promise = require('promise')
  
  /**
   * The socketIO module for handling app communications.
   */
  public io = require('socket.io')(this.http, { 'pingInterval': 15000, 'pingTimeout': 30000 })

  /**
   * A custom debugging framework for the application.
   */
  public debug : Debug

  /**
   * A function full of string helper functions.
   */
  private stringFunctions

  /**
   * A module containing object extension functions.
   */
  private objExt

  /**
   * The database module.
   */
  private db

  /**
   * The main server engine.
   */
  private engine

  /**
   * The packet manager to handle transactions between client and server.
   */
  private packetManager

  /**
   * The data object manager to handle reading in all of the data objects
   * and running any functions associated with them.
   */
  private dataObjectManager

  /**
   * The master manager module used to load engine extensions.
   */
  private masterManager

  /**
   * A collection of managers that the server engine has registered.
   * 
   * @memberof EmeraldServer
   */
  public managers

  /**
   * The Emerald Server configuration.
   * 
   * @memberof EmeraldServer
   */
  public config

  /**
   * The location of the server config.
   * 
   * @type {string}
   * @memberof EmeraldServer
   */
  public configDir : string

  constructor() {
    this.debug = new Debug()
    this.stringFunctions = new StringHelpers()
    this.objExt = new ObjectExtensions()
    this.managers = {}
    
    this.managers.dbManager = new DatabaseManager(this.debug)
    this.managers.dataObjectManager = new DataObjectManager(this)
  }

  /**
   * init - The initialization method.
   * Modules that load asynchronously are loaded here as well.
   */
  public async init() {
    // Start the server
    this.debug.log('Emerald Server Started...')
    // TODO : Make this not have to be hardcoded pls
    this.configDir = __dirname + '/../../../../../'
    this.config = require(this.configDir + "emerald-config.json").server
    
    // Start up all the managers
    await this.managers.dbManager.init(this.config)
    await this.managers.dataObjectManager.init()

    this.app.listen(this.config.connection.port, () => {
      this.debug.log("Ready to receive input on port " + this.config.connection.port)
    })
  }

  /**
   * Load the Emerald server configuration.
   * @returns JSON server config found in the emerald-config.json file.
   */
  private loadConfig() {
    return new Promise(async (resolve, reject) => {
      console.log('test')
      const judge = (file) => {
        return new Promise(async (resolve, reject) => {
          if (file.indexOf('emerald-config.json') > -1)
            resolve(file)
          else resolve()
        })
      }
      // We should pass over some well-known, large directories
      const skip = (file) => {
        return file.indexOf('node_modules') > -1 || file.indexOf('.git') > -1
      }
      let config: any = await FsExtensions.readdirRecursive(this.path.join(__dirname, '/../../'), judge, skip)
        .catch(err => reject(err))
      let configPath
      config = ArrayExtensions.flatten(config)
      configPath = config[0]
      config = require(config[0])
      config.server.baseDir = this.path
      resolve(config.server)
    })
  }
}

export default EmeraldServer