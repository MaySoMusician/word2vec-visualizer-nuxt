<template>
  <v-card class="PlaygroundForm-Card" max-width="600px" width="100%">
    <v-form onsubmit="return false;">
      <v-container>
        <v-row justify="center" align="center">
          <v-col cols="12">
            <ul class="PlaygroundForm-Instruction">
              <li>
                左の<v-icon>mdi-plus</v-icon
                ><v-icon>mdi-minus</v-icon>でたし算・ひき算を選ぶ
              </li>
              <li>式に追加する単語を入力し、追加ボタンをタップ</li>
            </ul>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" dense>
          <v-col cols="12">
            <div class="d-flex justify-space-between align-stretch">
              <v-btn-toggle
                v-model="newWordType"
                class="PlaygroundForm-PosNegSwitch"
                color="primary"
                mandatory
                tile
              >
                <v-btn value="positive" :disabled="running">
                  <v-icon>mdi-plus</v-icon>
                </v-btn>
                <v-btn value="negative" :disabled="running">
                  <v-icon>mdi-minus</v-icon>
                </v-btn>
              </v-btn-toggle>
              <v-text-field
                v-model="newWord"
                class="PlaygroundForm-Input"
                autocomplete="off"
                clearable
                color="#DDB13A"
                :disabled="running"
                hide-details
                label="単語"
                placeholder="式に追加する単語を入力してください"
                @keydown="inputOnKeyDown"
              ></v-text-field>
              <v-btn
                class="PlaygroundForm-Add"
                color="primary"
                :disabled="!canAddNewWord"
                height="auto"
                min-width="2rem"
                @click="addNewWord()"
                >追加</v-btn
              >
            </div>
          </v-col>
        </v-row>
        <v-row justify="center" align="center">
          <v-col cols="12">
            <v-chip-group column :show-arrows="false">
              <div v-for="(term, i) in terms" :key="i">
                <v-icon
                  v-if="i !== 0 || term.type === 'negative'"
                  :disabled="running"
                  >{{
                    term.type === 'positive' ? 'mdi-plus' : 'mdi-minus'
                  }}</v-icon
                >
                <v-chip
                  class="PlaygroundForm-TermChip mr-1"
                  close
                  :disabled="running"
                  label
                  outlined
                  :ripple="false"
                  @click:close="terms.splice(i, 1)"
                  >{{ term.word }}</v-chip
                >
              </div>
            </v-chip-group>
          </v-col>
        </v-row>
        <v-row justify="center" align="center" no-gutters>
          <v-col cols="4" class="pr-1">
            <v-btn
              class="PlaygroundForm-Clear"
              color=""
              :disabled="running || (terms.length === 0 && !error)"
              width="100%"
              @click="clearInput()"
              >リセット</v-btn
            >
          </v-col>
          <v-col cols="8" class="pl-1">
            <v-btn
              class="PlaygroundForm-Run"
              color="primary"
              :disabled="!canRun"
              :loading="running"
              width="100%"
              @click="getMostSimilar()"
              >実行</v-btn
            >
          </v-col>
        </v-row>
        <v-row justify="center" align="center">
          <v-col cols="12">
            <v-tabs-items :value="resultTab">
              <v-tab-item
                :transition="resultTabTransition"
                :reverse-transition="resultTabTransition"
              >
                <v-divider />
                <v-list
                  class="mx-auto"
                  dense
                  :disabled="running"
                  flat
                  min-width="300px"
                >
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
                        <div
                          class="PlaygroundForm-ResultList-Similarity text-right"
                        >
                          <span>{{
                            formatSimilarity(similarity.similarity)
                          }}</span>
                        </div>
                      </div>
                    </v-list-item-content>
                  </v-list-item>
                </v-list>
                <v-divider />
                <v-expansion-panels accordion flat tile>
                  <v-expansion-panel>
                    <v-expansion-panel-header
                      >生の出力</v-expansion-panel-header
                    >
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
                  <span class="error--text font-weight-bold">{{
                    errorMessage
                  }}</span>
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
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { beatifyMostSimilar } from '@/userModules/jsonBeautifier'

type Term = {
  type: 'positive' | 'negative'
  word: string
}

type Similarity = {
  word: string
  similarity: number
}

type Data = {
  newWord: string | null
  newWordType: Term['type'] | null
  terms: Term[]
  similarities: Similarity[]
  rawResult: string
  running: boolean
  error: 'general' | 'notfound' | false
  resultTabTransition: string | boolean
  errorMessage: string
}

type Computed = {
  newWordSanitized: string
  rawResultPlaceholder: string
  resultTab: number
  canAddNewWord: boolean
  canRun: boolean
}

type Method = {
  addNewWord: () => void
  getMostSimilar: () => void
  inputOnKeyDown: (event: KeyboardEvent) => void
  clearInput: () => void
  selectAllRawResult: () => void
  formatSimilarity: (similarity: number) => string
}
export default Vue.extend<Data, Method, Computed, unknown>({
  data() {
    return {
      newWord: '',
      newWordType: null,
      terms: [],
      similarities: [],
      rawResult: '',
      running: false,
      error: false,
      resultTabTransition: 'fade-transition',
      errorMessage: '',
    }
  },
  computed: {
    newWordSanitized() {
      if (!this.newWord) return ''
      const replaced = this.newWord.replace(/\s/g, '')
      return replaced
    },
    rawResultPlaceholder() {
      return this.running ? '実行中...' : '実行結果がここに表示されます'
    },
    resultTab() {
      if (!this.error) return 0
      return this.error === 'notfound' ? 2 : 1
    },
    canAddNewWord() {
      return this.newWordSanitized !== '' && !this.running
    },
    canRun() {
      return this.terms.length > 0 && !this.running
    },
  },
  methods: {
    addNewWord() {
      if (!this.canAddNewWord) return

      if (!this.newWordSanitized || !this.newWordType) return

      this.terms.push({
        type: this.newWordType,
        word: this.newWordSanitized,
      })

      this.newWord = ''
    },
    async getMostSimilar() {
      if (!this.canRun) return
      this.running = true
      this.error = false
      // this.similarities = []
      this.rawResult = ''

      const positives = this.terms.filter((term) => term.type === 'positive')
      const negatives = this.terms.filter((term) => term.type === 'negative')
      const topn = 10

      const positiveParams = positives.map(
        (p) => `positive=${encodeURIComponent(p.word)}`
      )

      const negativeParams = negatives.map(
        (p) => `negative=${encodeURIComponent(p.word)}`
      )

      const paramaters =
        '?' +
        [''].concat(positiveParams, negativeParams, `topn=${topn}`).join('&')

      try {
        const res = await this.$axios.get<any>(
          `https://api.playwithjapanese.fun/most-similar${paramaters}`
        )
        if (res.status === 200) {
          const result = res.data.result as [string, number][]
          this.similarities = result.map(([word, similarity]) => ({
            word,
            similarity,
          }))
          this.rawResult = beatifyMostSimilar(result)
        } else {
          this.error = 'general'
          this.errorMessage = 'エラー: 444'
        }
      } catch (error) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { data /* , status */ } = error.response
          if (data.error.code === 400) {
            const message = data.error.message as string

            if (
              message.includes(
                'The requested word was not found in the vocabulary'
              )
            ) {
              this.error = 'notfound'
              const missingWordMatched = message.match(
                /word '(.*)' not in vocabulary/i
              )
              if (missingWordMatched) {
                this.errorMessage = `対象: ${missingWordMatched[1]}`
              } else {
                this.errorMessage = ``
              }
            } else {
              this.error = 'general'
              this.errorMessage = message
            }
          } else {
            this.error = 'general'
            this.errorMessage = 'エラー: 111'
          }
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          this.error = 'general'
          this.errorMessage = 'エラー: 222'
        } else {
          // Something happened in setting up the request that triggered an Error
          this.error = 'general'
          this.errorMessage = 'エラー: 333'
        }
      } finally {
        this.running = false
      }
    },
    inputOnKeyDown(event) {
      if (event.key === 'Enter') {
        if (this.canAddNewWord) {
          this.addNewWord()
        } else if (this.canRun) {
          this.getMostSimilar()
        }
      }
    },
    clearInput() {
      this.error = false
      this.terms = []
      this.similarities = []
      this.rawResult = ''
    },
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
  &-Term {
    &Chip {
      .v-chip__close {
        color: #757575 !important;
      }
    }
  }

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
  &-Card {
    margin: {
      top: 1rem;
      left: auto;
      right: auto;
    }
  }

  &-Instruction {
    margin: 0;

    > li > .v-icon {
      vertical-align: text-bottom;
    }
  }

  &-PosNegSwitch {
    margin: {
      right: 8px;
    }
    .v-btn {
      // height: 32px !important;
      min-width: 32px !important;
      width: 32px !important;

      &--active {
        &::before {
          opacity: 0.9 !important;
        }
        &:focus::before {
          opacity: 0.95 !important;
        }
        &:hover::before {
          opacity: 0.7 !important;
        }
      }
    }
  }

  &-Input,
  &-Result {
  }

  &-Input {
    font-size: 1rem;
    font-weight: 500;
  }

  &-ResultList {
    &-Word {
      font-size: 1.4rem;
      font-weight: 700;
    }

    &-Similarity {
      position: relative;
      font-size: 1.4rem;
      font-weight: 700;
      flex-grow: 1;

      margin: {
        left: 0.5em;
      }

      > span::before {
        content: '';
        position: absolute;
        top: 50%;
        right: 4.3em;
        width: calc(100% - 4.3em);
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

  &-Add {
    font-size: 1.1rem;
    font-weight: 600;

    margin: {
      left: 8px;
    }
    padding: {
      left: 0.5rem !important;
      right: 0.5rem !important;
    }
  }

  &-Term {
    &Chip {
      font-size: 1.2rem !important;
    }
  }

  &-Clear,
  &-Run {
    font-size: 1.2rem;
    font-weight: 600;
  }
}
</style>
