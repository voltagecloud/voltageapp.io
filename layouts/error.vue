<template>
  <div class="container justify-center row" style="height: 100%;">
    <div v-if="error.statusCode === 404" class="container justify-center row" style="height: 100%;">
      <h1>
        404 - Page Not Found
      </h1>
      <div class="container justify-center row">
        <h3>
          <NuxtLink to="/">
            Home page
          </NuxtLink>
        </h3>
      </div>
    </div>
    <div v-else class="container justify-center row" style="height: 100%;">
      <h1>
        An Error Occured
      </h1>
      <div class="container justify-center row">
        <h3>
          <NuxtLink to="/">
            Home page
          </NuxtLink>
        </h3>
      </div>
      <div class="container justify-center row">
        <h3>
            <a href="#" onclick="location.reload();">
              Refresh
            </a>
        </h3>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  layout: 'plain',
  props: {
    error: {
      type: Object,
      default: null
    }
  },
  head () {
    const title =
      this.error.statusCode === 404 ? this.pageNotFound : this.otherError
    return {
      title
    }
  }
}
</script>

<style scoped>
h1 {
  font-size: 25px;
}
</style>
