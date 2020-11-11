<template>
  <v-card class="PlaygroundForm-Card" max-width="600px" width="100%">
    <v-form onsubmit="return false;">
      <v-container>
        <v-row justify="center" align="center" dense>
          <v-col cols="12" sm="10">
            <v-text-field
              v-model="word"
              class="PlaygroundForm-Input"
              autocomplete="off"
              clearable
              color="#DDB13A"
              hide-details
              label="単語"
              placeholder="数値化したい単語を入力してください"
              @keydown="inputOnKeyDown"
            ></v-text-field>
          </v-col>
          <v-col cols="12" sm="2" align="center">
            <v-btn
              class="PlaygroundForm-Run"
              color="primary"
              :disabled="!canRun"
              :loading="running"
              width="100%"
              @click="getVector()"
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
                <v-textarea
                  ref="resultTextarea"
                  v-model="result"
                  class="PlaygroundForm-Result"
                  color="secondary"
                  readonly
                  hide-details
                  label="実行結果"
                  outlined
                  rows="20"
                  :placeholder="resultPlaceholder"
                  @focus="selectAllResult"
                ></v-textarea>
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
            </v-tabs-items>
          </v-col>
        </v-row>
      </v-container>
    </v-form>
  </v-card>
</template>

<script lang="ts">
import Vue from 'vue'
import { beatifyVector } from '@/userModules/jsonBeautifier'

type Data = {
  word: string | null
  result: string
  running: boolean
  error: boolean
  resultTabTransition: string | boolean
  errorMessage: string
}

type Computed = {
  wordEncoded: string
  resultPlaceholder: string
  resultTab: number
  canRun: boolean
}

type Method = {
  getVector: () => void
  inputOnKeyDown: (event: KeyboardEvent) => void
  selectAllResult: () => void
}
export default Vue.extend<Data, Method, Computed, unknown>({
  data() {
    return {
      word: '',
      result: '',
      running: false,
      error: false,
      resultTabTransition: 'fade-transition',
      errorMessage: '',
    }
  },
  computed: {
    wordEncoded() {
      if (!this.word) return ''
      const replaced = this.word.replace(/\s/g, '')
      return encodeURIComponent(replaced)
    },
    resultPlaceholder() {
      return this.running ? '実行中...' : '実行結果がここに表示されます'
    },
    resultTab() {
      return this.error ? 1 : 0
    },
    canRun() {
      return this.wordEncoded !== '' && !this.running
    },
  },
  methods: {
    async getVector() {
      if (!this.canRun) return

      const wordEncoded = this.wordEncoded
      this.running = true
      this.error = false
      this.result = ''

      try {
        const res = await this.$axios.get<any>(
          `https://api.playwithjapanese.fun/vector?word=${wordEncoded}`
        )
        if (res.status === 200) {
          const result = res.data
          this.result = beatifyVector(result.result)
        } else {
          this.error = true
          this.errorMessage = 'エラー: 444'
        }
      } catch (error) {
        this.error = true
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          const { data /* , status */ } = error.response
          if (data.error.code === 404) {
            this.errorMessage = '単語が見つかりませんでした'
          } else {
            this.errorMessage = 'エラー: 111'
          }
          // this.result = JSON.stringify(data, null, 2)
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          this.errorMessage = 'エラー: 222'
        } else {
          // Something happened in setting up the request that triggered an Error
          this.errorMessage = 'エラー: 333'
        }
      } finally {
        this.running = false
      }
    },
    inputOnKeyDown(event) {
      if (event.key === 'Enter') {
        this.getVector()
      }
    },
    selectAllResult() {
      ;((this.$refs.resultTextarea as Vue).$refs
        .input as HTMLTextAreaElement).select()
    },
  },
})
</script>

<style lang="scss">
.PlaygroundForm {
  &-Result.v-textarea {
    textarea {
      font-family: 'Courier New', Courier, monospace;
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

  &-Input,
  &-Result {
  }

  &-Input {
    font-size: 1rem;
    font-weight: 500;
  }

  &-Result {
  }

  &-Run {
    font-size: 1.2rem;
    font-weight: 600;
  }
}
</style>
