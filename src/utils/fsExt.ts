/**
* fsExt.js
* Any functions that are extensions to the node fs module.
*/

import * as fs from 'fs'
import * as promise from 'promise'
import * as path from 'path'
import { ArrayExtensions } from './arrayExt'

class FsExtensions {

  private debug

  public static mkdirPromise = promise.denodeify(fs.mkdir)
  public static readdirPromise = promise.denodeify(fs.readdir)
  public static readfilePromise = promise.denodeify(fs.readFile)
  public static writefilePromise = promise.denodeify(fs.writeFile)
  public static unlinkPromise = promise.denodeify(fs.unlink)
  public static rmdirPromise = promise.denodeify(fs.rmdir)

  constructor (debug) {
    this.debug = debug
  }

  /**
   * Recursively read through a directory to find files that pass
   * a given predicate function.
   * @param  {String} p     The path to recursively search through.
   * @param  {Function} judge A predicate function to judge the filenames that are
   * found.
   * @return {Array}       An array of filenames & paths that passed the predicate
   * function test.
   */
  public static readdirRecursive(p, judge, skip = (file) => { return false }) {
    return new Promise<Array<string>>(async (resolve, reject) => {
      let listing = await this.readdirPromise(p)
      let files = [], dirs = [], file
      // TODO : Switch to reduce
      listing.map((file) => {
        file = path.join(p, file)
        let doSkip = false
        if (skip) doSkip = skip(file)
        if (fs.lstatSync(file).isDirectory() && !doSkip)
          dirs.push(this.readdirRecursive(file, judge, skip))
        else
          files.push(judge(file))
      })
      files = await Promise.all(files)
      dirs = await Promise.all(dirs)
      resolve(ArrayExtensions.clean(files).concat(ArrayExtensions.clean(dirs)))
    })
  }

  /**
   * Get a filename's extension.
   * @param  {String} filename The filename to fetch the extension of.
   * @return {String}          The extension on the passed filename arg, or the
   * full filename if no extension was found.
   */
  public static getFileExtension(filename) {
    return new Promise((resolve, reject) => {
      resolve(filename.substring(filename.lastIndexOf('.')))
    })
  }
}

export { FsExtensions }