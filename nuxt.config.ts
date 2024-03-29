import { Configuration } from '@nuxt/types'
import colors from 'vuetify/es5/util/colors'

const dev = process.env.BRANCH !== 'master' 
console.log({ env: process.env, dev })

const endpoint = (dev) ? 'https://ugak8gc6dk.execute-api.us-west-2.amazonaws.com' : 'https://frontend-api.voltage.cloud'

export default {
  ssr: false,
  target: 'static',
  server: {
    host: '0.0.0.0',
    port: '3000'
  },
  env: {
    poolId: (dev) ? 'us-west-2_QBaQFtzDy' : 'us-west-2_n7m64jCzU',
    webClientId: (dev) ? '4n1knfj0o7c473ult1qeqtv9u2' : '16hidm6n73l20ses41ruukko6t',
    stripeKey: (dev) ? 'pk_test_51HAHUBFE3QI8QkHeTr6oaBLIUUobHjxy3OeV2hVfhumWpJv8o0aZl7nsVPyOi2PbvuUhD0heQxxtwxsFbPRZhBbB00sTGDK9of' : 'pk_live_51HAHUBFE3QI8QkHeJoBERYx7cvgsbqcvVZdzGw4YC9e5aCCTOBOOZGjGj7pVeFatlZzi4OvG9qDNvphGBGd4tD5S00d7ZkkPzx',
    apiEndpoint: endpoint
  },
  router: {
    // POSSIBLE VALUES
    // ['maintenance'] --> Enables maintenance mode, redirects all traffic to /maintenance
    // [] --> disables maintenance mode
    middleware: [
      // override the btcpay redirect
      'btcpayOverride',
      'loadCognito',
      // capture podcast referal code to store on every route
      'captureReferral'
    ]
  },
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: 'Voltage Dashboard',
    title: 'Voltage Dashboard',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' },
      { property: 'og:site_name', content: 'Voltage Dashboard' },
      { property: 'og:title', content: 'Voltage Dashboard' },
      { property: 'og:description', content: 'Voltage offers enterprise-grade infrastructure services for Bitcoin. Build, Deploy, and Scale faster with Voltage.' },
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: `https://${process.env.NODE_ENV === 'prod' ? 'voltage.cloud' : 'competent-mclean-65ff0b.netlify.app'}` },
      { property: 'og:image', content: `https://${process.env.NODE_ENV === 'prod' ? 'voltage.cloud' : 'competent-mclean-65ff0b.netlify.app'}/images/voltage-og.png` },
      { property: 'og:image:width', content: '600' },
      { property: 'og:image:height', content: '315' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@voltage_cloud' },
      { name: 'twitter:creator', content: '@voltage_cloud' },
      { name: 'twitter:title', content: 'Voltage Dashboard' },
      { name: 'twitter:description', content: 'Voltage offers enterprise-grade infrastructure services for Bitcoin. Build, Deploy, and Scale faster with Voltage.' },
      { name: 'twitter:image', content: `https://${process.env.NODE_ENV === 'prod' ? 'voltage.cloud' : 'competent-mclean-65ff0b.netlify.app'}/images/voltage-twitter.png` }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ],
    script: [
      {
        hid: 'ga',
        innerHTML: "(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');ga('create', 'UA-176155335-1', 'auto');ga('send', 'pageview');",
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
    '@nuxtjs/composition-api'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/pwa'
  ],
  pwa: {
    meta: {
      appleStatusBarStyle: 'black-translucent'
    }
  },
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
    browserBaseURL: endpoint,
    https: true,
    progress: true,
    debug: !!(dev)
  },
  /*
  ** vuetify module configuration
  ** https://github.com/nuxt-community/vuetify-module
  */
  vuetify: {
    customVariables: ['~/assets/variables.scss'],
    treeShake: true,
    defaultAssets: {
      font: {
        family: 'Noto Sans TC'
      }
    },
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
