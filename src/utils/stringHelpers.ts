/**
* stringFunctions.js
* Helper functions for strings
*/

class StringHelpers {
  
  public static capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
}

export { StringHelpers }
