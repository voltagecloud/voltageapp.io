import { Context } from '@nuxt/types'
import { ref } from '@vue/composition-api'
import { inviteStore, layoutStore } from '~/store'

import { CheckInvite } from '~/types/apiResponse'

export default function useInvite ({ $axios }: Context) {
  const loading = ref(false)
  const error = ref('')

  async function checkInvite (code: string) {
    loading.value = true
    try {
      const invite = await $axios.post<CheckInvite>(
        '/user/invite',
        {
          code
        }
      )
      if (invite.data?.granted == false) {
        console.log('ACCESS DENIED')
        throw new Error('Access Denied')
      } else {
        inviteStore.SET_INVITE(invite.data?.granted)
      }
      return code
    } catch (e) {
      error.value = e
      layoutStore.SET_ERROR(e)
    } finally {
      loading.value = false
    }
  }

  return {
    checkInvite,
    loading,
    error
  }
}
