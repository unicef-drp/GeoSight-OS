/***
 * Log system based on the debug
 */

let IS_DEBUG = false
try {
  IS_DEBUG = DEBUG
} catch (e) {
}

export const Logger = {
  log: function (text) {
    if (IS_DEBUG) {
      console.log('LOGGER.log:', text)
    }
  }
}