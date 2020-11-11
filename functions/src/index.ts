import * as functions from 'firebase-functions'

const { Nuxt } = require('nuxt')

const nuxt = new Nuxt({
  buildDir: 'ssr',
  dev: false,
  env: {
    APP_ENV: functions.config().appinfo.env,
  },
})

exports.ssr = functions.https.onRequest(async (req, res) => {
  await nuxt.ready()
  return nuxt.render(req, res)
})
