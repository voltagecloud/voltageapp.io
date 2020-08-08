<template lang="pug">
  v-container
    v-row(justify='center' align='center')
      v-col(cols='12' md='10' lg='7' xl='5')
        base-material-card
          template(v-slot:heading='')
            h2.font-weight-light
              | Invite Code
          v-card-actions
            v-col(cols='12')
              v-form(ref='inviteForm' v-model='valid' @submit.prevent='checkInvite')
                v-text-field(v-model='invite' :rules='[char6]' label='Invite Code' required='')
                v-col(cols='12' v-if='error').error--text
                  | {{ error.message }}
                v-btn.mr-4(type='submit' :disabled='!valid' color='primary' light='' :loading='loading')
                  span(style='color: black;') Get Access
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api'
import useFormValidation from '~/compositions/useFormValidation'
import useInvite from '~/compositions/useInvite'

export default defineComponent({
  layout: 'plain',
  middleware: ['assertUnInvited'],
  components: {
    BaseMaterialCard: () => import('~/components/core/MaterialCard.vue')
  },
  setup (_, { root: { $router, $nuxt } }) {
    const { invite, char6, valid } = useFormValidation()
    const { checkInvite: tryInvite, loading, error } = useInvite($nuxt.context)

    async function checkInvite () {
      try {
        await tryInvite(invite.value)
        $router.push('/login')
      } catch (error) {
        console.log({ error })
      }
    }

    return {
      checkInvite,
      invite,
      char6,
      valid,
      error,
      loading
    }
  }
})
</script>
