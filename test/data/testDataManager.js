/**
* dataManager.js
* The manager for all data transactions the test suite undergoes.
*/

module.exports = (db, engine, fs, promise) => {

  // TODO: Create test data

  function createTestData() {
    return db.mysql.queryPromise(
      '',
      []
    )
  }

  return {
    "createTestData": createTestData
  }
}
