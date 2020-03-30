const rewire = require('rewire')
const path = require('path')
const defaults = rewire('react-scripts/scripts/start.js')
const WriteFilePlugin = require('write-file-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')

const originalConfigFactory = defaults.__get__('configFactory')

const BUILD_PATH = './build'

const configFactory = (...params) => {
  const config = originalConfigFactory(...params)
  config.optimization.splitChunks = {
    cacheGroups: {
      default: false
    }
  }
  config.optimization.runtimeChunk = false
  config.output.path = path.join(__dirname, '../', BUILD_PATH)
  config.output.filename = 'static/js/main.js'
  config.output.futureEmitAssets = false
  config.plugins.push(
    new CopyPlugin([
      {
        from: 'public',
        to: '.'
      }
    ])
  )
  config.plugins.push(new WriteFilePlugin())

  // disable webpackHotDevClient
  config.entry.shift()

  return config
}

defaults.__set__('configFactory', configFactory)
