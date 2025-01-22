/***
 * Log system based on the debug
 */

export let IS_DEBUG = false
let currTime = new Date().getTime()
try {
  IS_DEBUG = DEBUG
} catch (e) {
}

export const Logger = {
  log: function (key, text) {
    if (IS_DEBUG) {
      const newCurrTime = new Date().getTime()
      console.log((newCurrTime - currTime) + ' : ' + key + text)
      currTime = newCurrTime
    }
  }
}