import { NuxtAppOptions, Plugin } from '@nuxt/types'

const plugin: Plugin = ({ app }) => {
  if (!process.browser) return

  app.router?.afterEach((to, _from) => {
    const sendPageView = (app: NuxtAppOptions) => {
      app.$fireAnalytics.logEvent('page_view', {
        page_location: document.URL,
        page_path: to.path,
        page_title: document.title,
      })
    }
    setTimeout(sendPageView.bind(null, app), 500)
  })
}

export default plugin
