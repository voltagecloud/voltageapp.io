module.exports = {
  root: true,
  env: {
    browser: true,
    node: true
  },
  extends: [
    '@nuxtjs/eslint-config-typescript'
  ],
  // add your custom rules here
  rules: {
    '@typescript/eslint-camelcase': 'off', 
    camelcase: 'off'
  }
}
