/**
 * This class contains functions that aid in writing JavaScript code
 * from inside of a program.
 * 
 * @class JSWriter
 */
class JSWriter {

  constructor() {}

  /**
   * 
   * 
   * @memberof JSWriter
   */
  public getFunction = target => name => async => args => {
    switch (target) {
      case JSTarget.ES5:
        return async ? 'async' : '' + 'function(' + args.toString().substring(1, args.toString().length - 1) + ') '
      case JSTarget.ES6:

        break;
    }
  }
}

enum JSTarget {
  ES5,
  ES6
}

export { JSWriter }