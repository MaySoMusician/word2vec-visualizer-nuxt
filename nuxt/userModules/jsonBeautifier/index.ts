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
