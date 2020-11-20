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
              @click="clear()"
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
            <PlaygroundFormMostSimilarResultTabs
              :similarities="similarities"
              :raw-result="rawResult"
              :error="error"
              :error-message="errorMessage"
              :running="running"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { beatifyMostSimilar } from '@/userModules/jsonBeautifier'
import PlaygroundFormMostSimilarResultTabs from '@/components/PlaygroundFormMostSimilarResultTabs.vue'
import { Similarity, Error } from '@/types/mostSimilar'

type Term = {
  type: 'positive' | 'negative'
  word: string
}

type Data = {
  newWord: string | null
  newWordType: Term['type'] | null
  terms: Term[]
  similarities: Similarity[]
  rawResult: string
  running: boolean
  error: Error
  resultTabTransition: string | boolean
  errorMessage: string
}

type Computed = {
  newWordSanitized: string
  canAddNewWord: boolean
  canRun: boolean
}

type Method = {
  addNewWord: () => void
  getMostSimilar: () => void
  inputOnKeyDown: (event: KeyboardEvent) => void
  clear: () => void
}
export default Vue.extend<Data, Method, Computed, unknown>({
  components: { PlaygroundFormMostSimilarResultTabs },
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
    clear() {
      this.error = false
      this.newWord = ''
      this.newWordType = 'positive'
      this.terms = []
      this.similarities = []
      this.rawResult = ''
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

  &-Input {
    font-size: 1rem;
    font-weight: 500;
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
