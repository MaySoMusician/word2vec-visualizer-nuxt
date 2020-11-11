<template>
  <v-dialog v-model="showDialog" width="500px">
    <v-card>
      <v-card-title class="Title grey lighten-2">
        <v-icon color="#000000de" aria-hidden="false" large>mdi-alert</v-icon
        ><span class="ml-1">こちらは開発版サイトです</span>
      </v-card-title>

      <v-card-text class="pt-2 pb-3 grey--text text--darken-3">
        ご覧のサイトは開発中のものであり、不具合や意図しない動作が含まれている可能性があります。
      </v-card-text>

      <v-divider />

      <v-card-actions class="py-3">
        <v-checkbox
          v-model="suppressToday"
          class="mt-0 pt-0"
          color="accent"
          hide-details
        >
          <template #label>
            <span
              class="SuppressToday-Label accent--text d-inline-flex flex-column"
              >今日はこれ以上表示しない
              <small v-if="suppressToday" class="warning--text text--darken-2"
                >24時間経過後にアクセスすると再度表示されます。</small
              ></span
            >
          </template>
        </v-checkbox>
        <v-spacer></v-spacer>
        <v-btn color="primary" elevation="1" @click="saveSettings()">
          了解
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import Vue from 'vue'

type Data = {
  showDialog: boolean
  suppressToday: boolean
}

type Method = {
  saveSettings: () => void
}

const suppressCookieName = 'suppressDemoNoWarranty'

const isDemo = () => process.env.APP_ENV === 'development'

export default Vue.extend<Data, Method, unknown, unknown>({
  data() {
    if (!isDemo()) return { showDialog: false, suppressToday: false }

    const suppress = this.$cookies.get(suppressCookieName)

    const show = !suppress
    return {
      showDialog: show,
      suppressToday: false,
    }
  },
  methods: {
    saveSettings() {
      this.showDialog = false

      if (isDemo() && this.suppressToday) {
        this.$cookies.set(suppressCookieName, true, {
          path: '/',
          maxAge: 60 * 60 * 24,
          secure: true,
          sameSite: 'lax',
        })
      }
    },
  },
})
</script>

<style lang="scss" scoped>
.Title {
  font-size: 1.5rem !important;
  font-weight: 700 !important;
}
</style>
