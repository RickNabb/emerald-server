/**
* mysql-connect.js
* (C) Yes And Games 2016
* Nick Rabb <nrabb@outlook.com>
* <yesandgames@gmail.com>
* A mySQL connection wrapper for the Yes And Games
* REST API.
*/

import * as mysql from 'mysql'

class MySQLConnector {

  public pool

  private debug
  private config

  constructor(debug, config) {
    this.debug = debug
    this.config = config
  }

  /**
   * Create a pool to the MYSQL database.
   * @author Nick Rabb <nrabb@outlook.com>
   */
  public connect() {
    return new Promise((resolve, reject) => {
      this.pool = mysql.createPool({
        host: this.config.db.host,
        user: this.config.db.user,
        password: this.config.db.password,
        database: this.config.db.databaseName
      })
      if (this.pool) this.debug.log("Connection to MySQL " + this.config.db.id + " : " + this.config.db.databaseName + " set up")
      resolve()
    })
  }

  /**
   * Send a query to the MYSQL pool.
   * @author Nick Rabb <nrabb@outlook.com>
   * @param {string} queryString - The query to send to the MYSQL pool.
   * @param {array} params - Parameters to send into a potentially parameterized query string.
   * @param {function} callback - Code to run when the request is complete
   */
  public query(queryString, params, callback) {
    this.pool.getConnection((err, conn) => {
      if (err) {
        callback(err, 'Error connecting to the database');
      } else {
        conn.query(queryString, params, (err, results) => {
          // Debugging
          // console.log("Query results: " + JSON.stringify(results));
          // console.log("Query: " + queryString);
          if (callback) {
            callback(err, results)
          }
          conn.release();
        });
      }
    });
  }

  /**
   * Return a Promise that will send a query to the MySQL Pool.
   * @author Nick Rabb <nrabb@outlook.com>
   * @param {string} queryString - The query to send to the MYSQL pool.
   * @param {array} params - Parameters to send into a potentially parameterized query string.
   */
  public queryPromise(queryString, params) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((err, conn) => {
        if (err) {
          reject('Error connecting to the database: ' + err)
        } else {
          conn.query(queryString, params, (err, results) => {
            // Debugging
            // console.log("Query results: " + JSON.stringify(results));
            // console.log("Query: " + queryString);

            conn.release()
            if (err) reject(err)
            resolve(results)
          })
        }
      });
    })
  }

  /**
   * Close the MYSQL connection
   * @author Nick Rabb <nrabb@outlook.com>
   */
  public closeConnection() {
    // Make sure the connection isn't null
    if (this.pool === null) {
      return null;
    }

    this.pool.end();
  }
}

export { MySQLConnector }