import Amplify from 'aws-amplify'

Amplify.configure({
    Auth: {
        region: 'us-west-2',
        userPoolId: 'us-west-2_CsBYOdrrb',
        userPoolWebClientId: 't0g17c8gua069cfq02hd83lfk'
    }
})
