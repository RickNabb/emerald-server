/**
* debug.js
* A handy debugging library for ease of error and warning
* tracing throughout the execution of the server.
*/
class Debug {

  /**
   * debug - Write a debug message to the console.
   *
   * @param  {string} message The message to write to console.
   */
  public log(message) {
    // var path = this._getCallerFile();
    // console.log('[' + path.substring(path.lastIndexOf('\\') + 1) + '] ' + message)
    console.log(message)
  }

  /**
   * error - Write an error to the console.
   *
   * @param  {string} message The message to write.
   * @param  {boolean} stack   Whether or not to write a stack trace.
   */
  public error(message, stack = false) {
    if (stack) {
      this.log("ERROR: " + message + "\n\n" + new Error().stack)
    }
    else {
      this.log("ERROR: " + message)
    }
  }

  /**
   * _getCallerFile - A function to get the file path of the method that
   * is the caller of whatever function calls this.
   */
  private _getCallerFile() {
    // return __filename
    try {
      var err = new Error();
      var callerfile;
      var currentfile;

      const prepareStackTrace = function (err, stack) { return stack; };
      return err.stack.substring(err.stack.indexOf('\n'))

      // const stack : Array<string> = err.stack
      // currentfile = err.stack.getFileName();

      // while (err.stack.length) {
      //   callerfile = err.stack.shift().getFileName();

      //   if (currentfile !== callerfile) return callerfile;
      // }
    } catch (err) { }
    return undefined;
  }
}

export { Debug }