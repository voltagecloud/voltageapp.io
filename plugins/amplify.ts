import Auth from '@aws-amplify/auth'

Auth.configure({
  region: 'us-west-2',
  userPoolId: process.env.poolId as string,
  userPoolWebClientId: process.env.webClientId as string
})
