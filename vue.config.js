const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: "./",
  outputDir: "dist",
  productionSourceMap: false,
  chainWebpack: config => {
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
  },
  devServer: {
    port: 8010,
    client: {
      webSocketURL: 'ws://localhost:8010/ws',
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    }
  }
})