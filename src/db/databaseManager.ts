import { MySQLConnector } from './mysql-connect'

/**
* DatabaseManager
* A file to serve as a master database manager for all transactions
* the app will require with any databases.
*/
class DatabaseManager {

  /**
   * An instance of our MySQL connector.
   * 
   * @type {MySQLConnector}
   * @memberof DatabaseManager
   */
  public mysql : MySQLConnector

  private debug

  constructor (debug) {
    this.debug = debug
  }

  public init (config) {
    return new Promise(async (resolve, reject) => {
      // TODO : I feel like this is super hacky and should just happen
      // naturally... Look into this.
      this.mysql = new MySQLConnector(this.debug, config)
      await this.mysql.connect()
      resolve()
    })
  }
}

export { DatabaseManager }