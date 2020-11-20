export function beatifyVector(vector: number[]): string {
  let result = '[\n'
  let currentRow = ' '
  const FIXED = 20

  for (const v of vector) {
    const strV = v < 0 ? v.toFixed(FIXED) : ` ${v.toFixed(FIXED)}`
    const tempRow = `${currentRow} ${strV},`
    if (tempRow.length < 80) {
      currentRow = tempRow
    } else {
      result += `${currentRow}\n`
      currentRow = `  ${strV},`
    }
  }

  result += `${currentRow}\n]`
  return result
}

export function beatifyMostSimilar(
  similarWordArray: [string, number][]
): string {
  const FIXED = 20

  const words = similarWordArray.map((s) => s[0])

  const getLength = (str: string) => {
    let length = 0
    for (const s of str) {
      const char = s.charCodeAt(0)
      if (
        (char >= 0x00 && char < 0x81) ||
        char === 0xf8f0 ||
        (char >= 0xff61 && char < 0xffa0) ||
        (char >= 0xf8f1 && char < 0xf8f4)
      ) {
        // Half-width
        length += 1
      } else {
        // Full-width
        length += 2
      }
    }

    return length
  }

  const longestWordLength = Math.max(...words.map((w) => getLength(w)))

  const beautified = similarWordArray
    .map((input) => {
      const word = input[0]
      const diff = longestWordLength - getLength(word)
      const similarity =
        input[1] < 0 ? input[1].toFixed(FIXED) : ` ${input[1].toFixed(FIXED)}`
      return `  [ "${word}", ${' '.repeat(diff)}${similarity} ]`
    })
    .join('\n')
  return '[\n' + beautified + '\n]'
}
