export function getQuarterDates(quarter: string, year: number) {
  const map: Record<string, [string, string]> = {
    Q1: [`${year}-01-01`, `${year}-04-01`],
    Q2: [`${year}-04-01`, `${year}-07-01`],
    Q3: [`${year}-07-01`, `${year}-10-01`],
    Q4: [`${year}-10-01`, `${year + 1}-01-01`],
  }
  const [start, end] = map[quarter] ?? map.Q1
  return { start, end }
}
