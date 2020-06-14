import { Configuration } from '@nuxt/types'
import colors from 'vuetify/es5/util/colors'

export default {
  mode: 'spa',
  server: {
    host: '0.0.0.0',
    port: '3000'
  },
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - ' + process.env.npm_package_name,
    title: process.env.npm_package_name || '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
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
    '@nuxtjs/vuetify'
  ],
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
    browserBaseURL: 'https://7cwrwu4xxi.execute-api.us-west-2.amazonaws.com',
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
          highlight: '#b31e6f',
          error: '#b31e6f',
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
  }
} as Configuration
