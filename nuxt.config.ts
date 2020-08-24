import { Configuration } from '@nuxt/types'
import colors from 'vuetify/es5/util/colors'

const dev = process.env.NODE_ENV !== 'production' || process.env.NETLIFY

export default {
  mode: 'spa',
  server: {
    host: '0.0.0.0',
    port: '3000'
  },
  env: {
    poolId: (dev) ? 'us-west-2_QBaQFtzDy' : 'us-west-2_n7m64jCzU',
    webClientId: (dev) ? '4n1knfj0o7c473ult1qeqtv9u2' : '16hidm6n73l20ses41ruukko6t',
  },
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: 'Voltage Dashboard',
    title: 'Voltage Dashboard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        hid: 'script',
        innerHTML: 'window.$crisp=[];window.CRISP_WEBSITE_ID="726634f1-0f0d-43b1-a98f-59e24f1ffa45";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();',
        type: 'text/javascript',
        charset: 'utf-8'
      },
      {
        hid: 'ga',
        innerHTML: 'window.$crisp=[];window.CRISP_WEBSITE_ID="726634f1-0f0d-43b1-a98f-59e24f1ffa45";(function(){d=document;s=d.createElement("script");s.src="https://client.crisp.chat/l.js";s.async=1;d.getElementsByTagName("head")[0].appendChild(s);})();',
        type: 'text/javascript',
        charset: 'utf-8'
      }
    ]
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#fff4e3' },
  loadingIndicator: {
    name: '~/static/loader.html',
    background: '#fff4e3'
  },
  /*
  ** Global CSS
  */
  css: [
    '~/assets/global.scss'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/composition',
    '~/plugins/amplify',
    '~/plugins/axios'
  ],
  /*
  ** Nuxt.js dev-modules
  */
  buildModules: [
    '@nuxt/typescript-build',
    '@nuxtjs/vuetify',
    '@nuxtjs/google-analytics'
  ],
  publicRuntimeConfig: {
    googleAnalytics: {
      id: 'UA-176155335-1'
    }
  },
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    browserBaseURL: (dev) ? 'https://7cwrwu4xxi.execute-api.us-west-2.amazonaws.com' : 'https://api.voltageapp.io',
    https: true,
    progress: true,
    debug: true
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    options: {
      customProperties: true
    },
    theme: {
      dark: false,
      themes: {
        light: {
          primary: '#EF820D',
          secondary: '#fff4e3',
          accent: '#ffcdab',
          info: '#ffa45c',
          warning: '#5d5d5a',
          highlight: '#343851',
          error: '#8B0000',
          success: colors.green.accent3
        },
        dark: {
          primary: '#EF820D',
          secondary: '#f6ea8c',
          accent: '#f26d5b',
          info: '#c03546',
          warning: '#492540',
          highlight: '#b31e6f',
          error: colors.deepOrange.accent4,
          success: colors.green.accent3
        }
      }
    }
  },
  /*
  ** Build configuration
  */
  build: {
  //   /*
  //   ** You can extend webpack config here
  //   */
  //   extend (config, ctx) {
  //   }
  },
  /*
  ** Generate configuration
  */
  generate: {
    fallback: '404.html'
  }
} as Configuration
