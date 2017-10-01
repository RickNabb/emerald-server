/**
* dataObjectManager.js
* A file to serve as a master manager for all data objects
* the app will need.
*/

import * as fs from 'fs'
import * as promise from 'promise'
import { FsExtensions } from './utils/fsExt'
import { ObjectExtensions } from './utils/objExt'
import Engine from './Server'
import { StringHelpers } from './utils/stringHelpers'
import { DatabaseManager } from './db/databaseManager'

class DataObjectManager {

  private engine : Engine
  private dbManager : DatabaseManager

  private dataObjects
  private dataObjectModules
  private dataTypes = {
    "int(11)": "int",
    "varchar(255)": "string",
    "tinyint(1)": "boolean"
  }

  constructor (engine, dbManager) {
    this.engine = engine
    this.dbManager = dbManager
  }

  /**
   * Initialize the Data Object Manager.
   * Collect all of the data objects in the user's project,
   * update the database with the data object's schema,
   * and automatically write data object modules to import into the engine.
   */
  public init() {
    return new Promise(async (resolve, reject) => {
      const asyncTasks = []
      this.dataObjects = await this.collectDataObjects()
        .catch(err => reject(err))
      asyncTasks.push(this.updateDatabase())
      asyncTasks.push(this.writeDataObjectModules())
      await Promise.all(asyncTasks)
        .catch(err => reject(err))
      // this.dataObjectModules = await this.loadDataObjectModules()
      //   .catch(err => reject(err))
      this.engine.debug.log('Data Object Manager started')
      resolve()
    })
  }

  /**
   * Load all of the data object modules we automatically
   * generated into the dataObjectModules variable.
   */
  public loadDataObjectModules() {
    return new Promise(async (resolve, reject) => {
      let dataObjectFiles = await FsExtensions.readdirPromise(__dirname + '/dataobjects/')
        .catch(err => reject(err))
      const objectModules = {}
      dataObjectFiles.reduce(async (modules, file) => {
        const extension = await FsExtensions.getFileExtension(file)
          .catch(err => reject(err))
        if (extension === '.js') {
          const dataModule = require(__dirname + '/dataobjects/' + file)
          console.log(dataModule)
          // modules[file.replace('.js', '')] = dataModule(this.dbManager)
        }
        return modules
      }, objectModules)
      resolve(objectModules)
    })
  }

  /**
   * collectDataObjects - Read all of the files in the data objects directory
   * into a collection that we can use to use those objects in the engine.
   *
   * @return {object} A collection of all the data objects keyed by name.
   */
  public collectDataObjects() {
    return new Promise(async (resolve, reject) => {
      let filePromises = [], parsePromises = [], dataObjects = {}
      let filePath = this.engine.configDir + this.engine.config.dataObjectDir
      let files = await FsExtensions.readdirPromise(filePath)
        .catch(err => reject(err))
      files.reduce((accum, cur) => {
        accum[cur.replace('.json', '')] = require(filePath + cur)
        return accum
      }, dataObjects)
      resolve(dataObjects)
    })
  }

  /**
   * updateDatabase - Update the database by scanning the data objects
   * directory and creating tables, if they don't already exist, for the
   * data objects & their specified attributes
   * TODO : Clean this up!
   */
  public updateDatabase() {
    return new Promise(async (resolve, reject) => {
      let primary = -1
      let dbQueries = [], results = []
      let dataObject, query, dataObjectAttrs, dataObjectAttr,
        dataObjectAttrProps, i, queryResults, dataObjectAttrNames
      for (dataObject in this.dataObjects) {
        dataObjectAttrs = ObjectExtensions.copy(this.dataObjects[dataObject])
        query = "SHOW TABLES LIKE '" + dataObject + "';"
        queryResults = await this.engine.managers.dbManager.mysql.queryPromise(query, [])
          .catch(err => reject(err))
        if (queryResults.length === 0)
          dbQueries.push(this.createDataObjectTable(dataObject, dataObjectAttrs))
        else {
          query = "SHOW columns FROM " + dataObject + ";"
          queryResults = await this.engine.managers.dbManager.mysql.queryPromise(query, [])
            .catch(err => reject(err))
          dataObjectAttrNames = Object.keys(dataObjectAttrs)
          if (queryResults.length === dataObjectAttrNames.length) {
            for (i = 0; i < queryResults.length; i++) {
              if (queryResults[i].Field !== dataObjectAttrNames[i] && dataObjectAttrs[dataObjectAttrNames[i]].includes(this.dataTypes[queryResults[i].Type])) {
                dbQueries.push(this.changeDataObjectTableColumn(dataObject, queryResults[i].Field, dataObjectAttrNames[i], queryResults[i].Type, ''))
              }
              // Change column types if the names match, but types don't
              if (queryResults[i].Field === dataObjectAttrNames[i] && !dataObjectAttrs[dataObjectAttrNames[i]].includes(this.dataTypes[queryResults[i].Type])) {
                query = "ALTER TABLE `" + dataObject + "` CHANGE COLUMN `" + dataObjectAttrNames[i] + "` `" + dataObjectAttrNames[i] + "` "
                dataObjectAttrProps = dataObjectAttrs[dataObjectAttrNames[i]]
                if (dataObjectAttrProps.includes('int'))
                  query += 'int(11) '
                else if (dataObjectAttrProps.includes('string'))
                  query += 'varchar(255) COLLATE utf32_unicode_ci '
                else if (dataObjectAttrProps.includes('boolean'))
                  query += 'tinyint(1) '
                dbQueries.push(this.engine.managers.dbManager.mysql.queryPromise(query, []))
              }
              // Add not null to any column
              if (queryResults[i].Default !== 'null') {
                dbQueries.push(this.changeDataObjectTableColumn(dataObject, queryResults[i].Field, queryResults[i].Field, queryResults[i].Type, 'NOT NULL'))
              }
              // Add auto-increment to any primary key that doesn't have it
              if (dataObjectAttrs[dataObjectAttrNames[i]].includes('primary') && queryResults[i].Extra !== 'auto_increment') {
                dbQueries.push(this.changeDataObjectTableColumn(dataObject, queryResults[i].Field, queryResults[i].Field, queryResults[i].Type, 'auto_increment'))
              }
            }
          } else if (queryResults.length !== dataObjectAttrNames.length) {
            this.engine.debug.log("The data object '" + dataObject + "' and its corresponding mySQL table are unequal, and too disparate to automatically change. Please change one or the other.")
          }
        }
      }
      Promise.all(dbQueries)
        .catch(error => reject(error))
      resolve()
    })
  }

  public changeDataObjectTableColumn(dataObject, oldColumn, newColumn, type, extra) {
    let query = "ALTER TABLE `" + dataObject + "` CHANGE COLUMN `" + oldColumn + "` `" + newColumn + "` " + type + " " + extra + ";"
    return this.engine.managers.dbManager.mysql.queryPromise(query, [])
  }

  public createDataObjectTable(dataObject, dataObjectAttrs) {
    let query = "CREATE TABLE IF NOT EXISTS `" + dataObject + '` ('
    let primary = -1
    let dataObjectAttrProps, dataObjectAttr
    for (dataObjectAttr in dataObjectAttrs) {
      query += '`' + dataObjectAttr + '` '
      dataObjectAttrProps = dataObjectAttrs[dataObjectAttr]
      if (dataObjectAttrProps.includes('int'))
        query += 'int(11) '
      else if (dataObjectAttrProps.includes('string'))
        query += 'varchar(255) COLLATE utf32_unicode_ci '
      else if (dataObjectAttrProps.includes('boolean'))
        query += 'tinyint(1) '
      query += 'NOT NULL'
      if (dataObjectAttrProps.includes('primary')) {
        query += ' AUTO_INCREMENT'
        primary = dataObjectAttr
      }
      query += ','
    }
    if (primary !== -1)
      query += 'PRIMARY KEY (`' + primary + '`)'
    query += ') ENGINE=InnoDB DEFAULT CHARSET=utf32 COLLATE=utf32_unicode_ci;'
    return this.engine.managers.dbManager.mysql.queryPromise(query, [])
  }

  /**
   * Write data object module files, containing CRUD operations on the
   * object, that we can use inside the app
   */
  public writeDataObjectModules() {
    return new Promise((resolve, reject) => {
      let fileWrites = [], results = []
      let dataObject, fileContents, fileAppend, dataObjectAttrs, dataObjectAttr, dataObjectAttrProps, dataObjectAttrStr, capitalDataObject
      if (!fs.existsSync(__dirname + '/dataObjects')) {
        fs.mkdirSync(__dirname + '/dataobjects')
      }
      for (dataObject in this.dataObjects) {
        dataObjectAttrs = ObjectExtensions.copy(this.dataObjects[dataObject])
        capitalDataObject = StringHelpers.capitalizeFirstLetter(dataObject)
        // Remove the id attribute from the DO attributes
        // because we don't want to insert IDs, etc.
        if (dataObjectAttrs.id) {
          delete dataObjectAttrs['id']
        }
        // File header
        fileContents =
          "/**\n" +
          "* " + dataObject + ".js\n" +
          "* The auto-generated data manipulator module for the \n" +
          "* " + dataObject + " data object.\n" +
          "*/\n" +
          "module.exports = (db) => {\n" +
          "\tfunction create" + capitalDataObject + "("
        // Create function
        fileAppend = ""
        for (dataObjectAttr in dataObjectAttrs) {
          fileAppend += dataObjectAttr + ","
        }
        dataObjectAttrStr = fileAppend.substring(0, fileAppend.length - 1)
        fileContents += dataObjectAttrStr + ") {\n" +
          "\t\treturn new Promise(async (resolve, reject) => {\n" +
          "\t\t\tlet " + dataObject + " = await db.mysql.queryPromise('INSERT INTO `" + dataObject + "` (" + dataObjectAttrStr + ") VALUES ("
        fileAppend = ""
        for (dataObjectAttr in dataObjectAttrs) {
          fileAppend += "?,"
        }
        fileAppend = fileAppend.substring(0, fileAppend.length - 1)
        fileContents += fileAppend + ")',\n" +
          "\t\t\t\t[" + dataObjectAttrStr + "])\n" +
          "\t\t\t\t.catch(err => reject(err))\n" +
          "\t\t\tresolve(" + dataObject + ")\n" +
          "\t\t})\n" +
          "\t}\n"
        // Update function
        fileContents += "\tfunction update" + capitalDataObject + "(id," + dataObjectAttrStr + ") {\n" +
          "\t\treturn new Promise(async (resolve, reject) => {\n" +
          "\t\t\tlet " + dataObject + " = await db.mysql.queryPromise('UPDATE `" + dataObject + "` SET "
        fileAppend = ""
        for (dataObjectAttr in dataObjectAttrs) {
          fileAppend += "`" + dataObjectAttr + "`=?,"
        }
        fileAppend = fileAppend.substring(0, fileAppend.length - 1)
        fileContents += fileAppend + " WHERE `id`=?',\n" +
          "\t\t\t[" + dataObjectAttrStr + ",id])\n" +
          "\t\t\t\t.catch(err => reject(err))\n" +
          "\t\t\tresolve(" + dataObject + ")\n" +
          "\t\t})\n" +
          "\t}\n"
        // Remove function
        fileContents += "\tfunction remove" + capitalDataObject + "(id) {\n" +
          "\t\treturn new Promise(async (resolve, reject) => {\n" +
          "\t\t\tlet " + dataObject + " = await db.mysql.queryPromise('DELETE FROM `" + dataObject + "` WHERE `id`=?',\n" +
          "\t\t\t[id])\n" +
          "\t\t\t\t.catch(err => reject(err))\n" +
          "\t\t\tresolve(" + dataObject + ")\n" +
          "\t\t})\n" +
          "\t}\n"
        // Get singular function
        fileContents += "\tfunction get" + capitalDataObject + "(id) {\n" +
          "\t\treturn new Promise(async (resolve, reject) => {\n" +
          "\t\t\tlet " + dataObject + " = await db.mysql.queryPromise('SELECT * FROM `" + dataObject + "` WHERE `id`=?',\n" +
          "\t\t\t[id])\n" +
          "\t\t\t\t.catch(err => reject(err))\n" +
          "\t\t\tresolve(" + dataObject + ")\n" +
          "\t\t})\n" +
          "\t}\n"
        // Get all function
        fileContents += "\tfunction get" + capitalDataObject + "s() {\n" +
          "\t\treturn new Promise(async (resolve, reject) => {\n" +
          "\t\t\tlet " + dataObject + "s = await db.mysql.queryPromise('SELECT * FROM `" + dataObject + "`',\n" +
          "\t\t\t[])\n" +
          "\t\t\t\t.catch(err => reject(err))\n" +
          "\t\t\tresolve(" + dataObject + "s)\n" +
          "\t\t})\n" +
          "\t}\n" +
          "\treturn {\n" +
          "\t\t\"create" + capitalDataObject + "\": create" + capitalDataObject + ",\n" +
          "\t\t\"update" + capitalDataObject + "\": update" + capitalDataObject + ",\n" +
          "\t\t\"remove" + capitalDataObject + "\": remove" + capitalDataObject + ",\n" +
          "\t\t\"get" + capitalDataObject + "\": get" + capitalDataObject + ",\n" +
          "\t\t\"get" + capitalDataObject + "s\": get" + capitalDataObject + "s\n\t}\n"
        fileContents += "}"
        fileWrites.push(FsExtensions.writefilePromise(__dirname + '/dataobjects/' + dataObject + '.js', fileContents))
      }
      Promise.all(fileWrites)
        .catch(error => this.engine.debug.error(error))
      resolve()
    })
  }
}

export { DataObjectManager }