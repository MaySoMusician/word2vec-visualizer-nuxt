<template>
  <v-row justify="center" align="center">
    <v-col cols="12" md="8" class="Title-Wrapper">
      <h1 class="Title">
        <span class="Title-First">理系版 にほんごであそぼ</span>
        <span class="Title-Second">inspired by ラムダ技術部</span>
      </h1>
      <section class="my-2 text-center">
        <a
          href="https://youtu.be/sK3HqLwag_w"
          target="_blank"
          rel="noopener"
          style="font-size: 2.4rem; font-weight: 700"
          >元ネタ</a
        >
      </section>
      <!-- <v-divider /> -->
      <v-tabs
        v-model="playgroundTab"
        class="Playground-TabBar"
        background-color="primary"
        fixed-tabs
        slider-color="black"
      >
        <v-tab class="Playground-TabBarItem">単語を数値化する！</v-tab>
        <v-tab class="Playground-TabBarItem"> 単語のたし算・ひき算 </v-tab>
      </v-tabs>
      <v-tabs-items v-model="playgroundTab" class="Playground-TabContainer">
        <v-tab-item>
          <section class="Playground-TabItem">
            <h2>単語を数値化する！</h2>
            <PlaygroundFormVector />
          </section>
        </v-tab-item>
        <v-tab-item>
          <section class="Playground-TabItem">
            <h2>単語のたし算・ひき算</h2>
            <PlaygroundFormMostSimilar />
          </section>
        </v-tab-item>
      </v-tabs-items>
    </v-col>
  </v-row>
</template>

<script lang="ts">
import Vue from 'vue'
import PlaygroundFormVector from '@/components/PlaygroundFormVector.vue'
import PlaygroundFormMostSimilar from '@/components/PlaygroundFormMostSimilar.vue'
import { titlePerPage } from '@/userModules/constants'

type Data = {
  playgroundTab: number | null
}

export default Vue.extend<Data, unknown, unknown, unknown>({
  components: { PlaygroundFormVector, PlaygroundFormMostSimilar },
  data() {
    return {
      playgroundTab: null,
    }
  },
  head() {
    return {
      title: titlePerPage.index,
      titleTemplate: '',
      meta: [
        { hid: 'og:title', property: 'og:title', content: titlePerPage.index },
      ],
    }
  },
})
</script>

<style lang="scss" scoped>
.Title {
  line-height: 100%;
  text-align: center;

  > span {
    display: block;
  }

  &-First {
    font-size: 2.4rem;
    font-weight: 900;
  }

  &-Second {
    font-size: 1.3rem;
    font-weight: 700;
  }

  &-Wrapper {
    padding: {
      top: 4px;
      bottom: 8px;
    }
  }
}

.Playground {
  &-Tab {
    &Bar {
      &Item {
        font-size: 1.2rem;

        &.v-tab--active {
          color: black !important;
        }
      }
      // color: black;
    }

    &Container {
      background-color: transparent !important;
    }

    &Item {
      padding: {
        top: 1rem;
        bottom: 3rem;
      }

      h2 {
        line-height: 100%;
        text-align: center;
        font-size: 1.8rem;
        font-weight: 700;
      }
    }
  }
}
</style>
