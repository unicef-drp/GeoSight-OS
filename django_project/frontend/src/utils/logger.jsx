/***
 * Log system based on the debug
 */

export let IS_DEBUG = false
try {
  IS_DEBUG = DEBUG
} catch (e) {
}

export const Logger = {
  log: function (key, text) {
    if (IS_DEBUG) {
      console.log(key + text)
    }
  }
}