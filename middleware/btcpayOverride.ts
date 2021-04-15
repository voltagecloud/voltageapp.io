// middleware to override the redirect caused by btc
// since btcpay is unable to have different redirect paths
//
// usage: before redirecting to btcpay commit { btcpayRedir: '/volage/path' } to localstorage
// this middleware should be the first middleware on every route

import type { Middleware } from '@nuxt/types'
const btcpayOverride: Middleware = ({ redirect, route }) => {
  const key = 'btcpayRedir'
  const redir = localStorage.getItem(key)
  localStorage.removeItem(key)
  if (redir && redir !== route.path) return redirect(redir)
  return
}

export default btcpayOverride

