<template>
  <v-app>
    <!-- <v-navigation-drawer v-model="drawer" clipped fixed app :width="160">
      <v-list>
        <v-list-item
          v-for="(item, i) in items"
          :key="i"
          :to="item.to"
          router
          exact
        >
          <v-list-item-action class="NavDrawer-ListItemAction">
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title v-text="item.title" />
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer> -->
    <v-app-bar clipped-left fixed app dense>
      <nuxt-link to="/">
        <Logo class="Logo" />
      </nuxt-link>
      <v-spacer />
      <a
        class="Header-Icon"
        href="https://github.com/MaySoMusician/word2vec-visualizer-nuxt"
        target="_blank"
        rel="noopener"
      >
        <v-icon color="black" size="40px">mdi-github</v-icon>
      </a>
    </v-app-bar>
    <v-main>
      <v-container id="MainContainer">
        <nuxt />
      </v-container>
      <v-footer class="Footer">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <small v-html="copyright" />
      </v-footer>
    </v-main>

    <v-snackbar v-model="showSnackbar" color="error" timeout="8000">
      {{ snackbarText }}
      <template #action="{ attrs }">
        <v-btn text v-bind="attrs" @click="showSnackbar = false">閉じる</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>

<script lang="ts">
import Vue from 'vue'
import { websiteName, websiteCopyright, baseUrl } from '@/userModules/constants'
import Logo from '@/assets/logo2.svg?inline'

type Data = {
  drawer: boolean
  items: { icon: string; title: string; to: string }[]
  title: string
  showSnackbar: boolean
  snackbarText: string
}

type Computed = {
  copyright: string
}

export default Vue.extend<Data, unknown, Computed, unknown>({
  components: { Logo },
  /* async asyncData() {
    if (process.browser) return
  }, */
  data() {
    return {
      drawer: false,
      items: [
        {
          icon: 'mdi-home',
          title: 'ホーム',
          to: '/',
        },
        {
          icon: 'mdi-message-processing-outline',
          title: '不具合・要望',
          to: '/feedback',
        },
      ],
      title: websiteName,
      showSnackbar: false,
      snackbarText: '',
    }
  },
  computed: {
    copyright() {
      return websiteCopyright
    },
  },
  head() {
    const href = `${baseUrl}${this.$route.path.slice(1)}`
    return {
      meta: [{ hid: 'og:url', property: 'og:url', content: href }],
      link: [{ rel: 'canonical', href }],
    }
  },
  /* async mounted() {
  }, */
})
</script>

<style lang="scss">
@import '~vuetify/src/styles/styles.sass';

.v-application {
  font-feature-settings: 'palt' 1;

  // Applied both to light & dark theme
  .v-btn:not(.v-btn--outlined) {
    &.primary {
      color: map-deep-get($material-light, 'text', 'primary');
    }
  }

  // Applied only to light theme
  &.theme--light {
    background-color: #efefef;
  }

  .theme--light {
    // &.v-navigation-drawer {
    //   // background-color: #ffbda2;
    // }

    &.v-footer {
      background-color: #fcca42;
    }

    &.v-app-bar.v-toolbar.v-sheet {
      background-color: #fbb803;
    }

    &.v-app-bar.v-toolbar.v-sheet {
      box-shadow: 0px 1px 4px -1px rgba(0, 0, 0, 0.2);
    }
  }
}

.Header {
  &-Icon {
    text-decoration: none;
  }
}

.Footer {
  position: sticky !important;
  top: 100vh;

  small {
    font-size: 0.74rem;
    font-weight: 500;
    color: rgba(0, 0, 0, 1);
    p {
      margin: {
        bottom: 0.1em;
      }
    }
  }
}
</style>

<style lang="scss" scoped>
.Logo {
  height: 48px;
  width: auto;
  margin: {
    top: 4px;
  }
}

/* .v-application.v-application--is-ltr {
  .NavDrawer-ListItemAction {
    margin: {
      right: 16px;
    }
  }
} */
</style>
