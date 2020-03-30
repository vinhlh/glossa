const rewire = require('rewire')
const defaults = rewire('react-scripts/scripts/build.js')
const config = defaults.__get__('config')

config.optimization.splitChunks = {
  cacheGroups: {
    default: false
  }
}

config.output.filename = 'static/js/[name].js'

config.optimization.runtimeChunk = false
