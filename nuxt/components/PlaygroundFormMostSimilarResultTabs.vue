<template>
  <v-tabs-items :value="resultTab">
    <v-tab-item
      :transition="resultTabTransition"
      :reverse-transition="resultTabTransition"
    >
      <v-divider />
      <div>
        <div class="d-flex justify-end px-4 mb-n1">
          <span
            class="d-inline-block"
            style="
              width: 4.9rem;
              font-size: 0.9rem;
              font-weight: 400;
              text-align: center;
            "
            >類似率</span
          >
        </div>
        <v-list class="pt-0" dense :disabled="running" flat>
          <v-list-item
            v-for="similarity in similarities"
            :key="similarity.word"
          >
            <v-list-item-content>
              <div
                class="d-flex"
                :class="{
                  'PlaygroundForm-ResultList-Disabled': running,
                }"
              >
                <span class="PlaygroundForm-ResultList-Word">{{
                  similarity.word
                }}</span>
                <div class="PlaygroundForm-ResultList-Similarity text-right">
                  <span>{{ formatSimilarity(similarity.similarity) }}</span>
                </div>
              </div>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </div>
      <v-divider />
      <v-expansion-panels accordion flat tile>
        <v-expansion-panel>
          <v-expansion-panel-header>生の出力</v-expansion-panel-header>
          <v-expansion-panel-content>
            <v-textarea
              ref="rawResultTextarea"
              v-model="rawResult"
              class="PlaygroundForm-RawResult"
              color="secondary"
              readonly
              hide-details
              label="生の出力"
              outlined
              rows="12"
              :placeholder="rawResultPlaceholder"
              @focus="selectAllRawResult"
            ></v-textarea>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </v-tab-item>
    <v-tab-item
      :transition="resultTabTransition"
      :reverse-transition="resultTabTransition"
    >
      <div class="text-center">
        <span class="error--text font-weight-bold">{{ errorMessage }}</span>
      </div>
    </v-tab-item>
    <v-tab-item
      :transition="resultTabTransition"
      :reverse-transition="resultTabTransition"
    >
      <div class="text-center error--text">
        <p class="mb-0 font-weight-bold">
          単語リストに存在しない単語が含まれていました。
        </p>
        <p class="mb-0 font-weight-bold">
          {{ errorMessage }}
        </p>
        <p class="mb-0">
          ※ リストに存在しない単語が他にも含まれている場合があります。
        </p>
      </div>
    </v-tab-item>
  </v-tabs-items>
</template>

<script lang="ts">
import Vue, { PropType } from 'vue'
import { Similarity, Error } from '@/types/mostSimilar'

type Data = {
  resultTabTransition: string | boolean
}

type Props = {
  similarities: Similarity[]
  rawResult: string
  error: Error
  errorMessage: string
  running: boolean
}

type Computed = {
  rawResultPlaceholder: string
  resultTab: number
}

type Method = {
  selectAllRawResult: () => void
  formatSimilarity: (similarity: number) => string
}

export default Vue.extend<Data, Method, Computed, Props>({
  props: {
    similarities: {
      type: Array as PropType<Similarity[]>,
      default: [],
    },
    rawResult: {
      type: String,
      default: '',
    },
    error: {
      type: [String as () => 'general' | 'notfound', Boolean as () => false],
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
    running: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      resultTabTransition: 'fade-transition',
    }
  },
  computed: {
    rawResultPlaceholder() {
      return this.running ? '実行中...' : '実行結果がここに表示されます'
    },
    resultTab() {
      if (!this.error) return 0
      return this.error === 'notfound' ? 2 : 1
    },
  },
  methods: {
    selectAllRawResult() {
      ;((this.$refs.rawResultTextarea as Vue).$refs
        .input as HTMLTextAreaElement).select()
    },
    formatSimilarity(similarity: number) {
      return `${(similarity * 100).toFixed(2)} %`
    },
  },
})
</script>

<style lang="scss">
.PlaygroundForm {
  &-RawResult.v-textarea {
    textarea {
      font-family: 'Mgen+ 1mn Subset Medium', monospace;
      font-size: 0.72rem;
      line-height: 140%;
      white-space: pre;
    }
  }
}
</style>

<style lang="scss" scoped>
.PlaygroundForm {
  &-ResultList {
    &-Word {
      font-size: 1.4rem;
      font-weight: 700;
    }

    &-Similarity {
      position: relative;
      font-size: 1.2rem;
      font-weight: 500;
      flex-grow: 1;

      margin: {
        left: 0.5em;
      }

      > span::before {
        content: '';
        position: absolute;
        top: 50%;
        right: 4.9rem;
        width: calc(100% - 4.9rem);
        height: 2px;

        background: repeating-linear-gradient(
          to left,
          #6d6d6d 0,
          #6d6d6d 4px,
          transparent 4px,
          transparent 8px
        );
      }
    }

    &-Disabled {
      opacity: 0.3;
    }
  }
}
</style>
