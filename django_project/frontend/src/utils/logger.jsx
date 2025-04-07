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
  },
  layers: function (map) {
    if (IS_DEBUG) {
      const output = map.getStyle()
      Logger.log('LAYERS:', output.layers.map(layer => layer.id))
      Logger.log(
        'LAYERS-VISIBLE:', output.layers.filter(
          layer => {
            return layer?.layout?.visibility !== 'none'
          }
        ).map(layer => layer.id)
      )
    }
  }
}