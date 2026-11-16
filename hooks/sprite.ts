export const DOG_W = 36
export const DOG_H = 15
export const MAX_EXTRA = 24

// The column that repeats when the dog grows longer: body only, between the leg pairs.
const STRETCH = 12

const INK: Record<string, string> = { o: '#c4692e', e: '#8a4116', k: '#2b1a10' }

const BODY = [
  '........................ooooo',
  '.......................eoooooo',
  '......................eeoookooo',
  '......................eeeoooooooook',
  '......................eeeoooooooooo',
  '......................eeeoooooooo',
  '....ooooooooooooooooooeeeooooo',
  '...oooooooooooooooooooeeoooo',
  '...ooooooooooooooooooooeooo',
  '...oooooooooooooooooooooooo',
  '...ooooooooooooooooooooooo',
  '....ooooo.......oooooooooo',
]

const LEGS_A = [
  '.....oo.ee.........oo.ee',
  '.....oo.ee.........oo.ee',
  '.....ooo..............eee',
]

const LEGS_B = [
  '.....oo.ee.........oo.ee',
  '.....oo.ee.........oo.ee',
  '........eee........ooo',
]

const TAIL_A = ['o', '.o', '.o', '..o', '...o']

const TAIL_B = ['', '', 'o', '.oo', '...o']

const draw = (rows: readonly string[], top: number, extra: number) => {
  const paths = new Map<string, string>()

  rows.forEach((row, i) => {
    const cells = row.padEnd(DOG_W, '.')
    const line = cells.slice(0, STRETCH) + cells.charAt(STRETCH).repeat(extra) + cells.slice(STRETCH)
    let x = 0

    while (x < line.length) {
      const ink = line.charAt(x)
      let run = 1

      while (line.charAt(x + run) === ink) {
        run += 1
      }
      if (ink !== '.') {
        paths.set(ink, `${paths.get(ink) ?? ''}M${x} ${top + i}h${run}v1h-${run}z`)
      }
      x += run
    }
  })

  return [...paths].map(([ink, d]) => `<path fill="${INK[ink] ?? '#000'}" d="${d}"/>`).join('')
}

// Faces right, feet on DOG_H. Classes la/lb and ta/tb are the two frames of the legs and the tail.
export const dog = (extra: number) =>
  `<g class="ta">${draw(TAIL_A, 2, extra)}</g><g class="tb">${draw(TAIL_B, 2, extra)}</g>${draw(BODY, 0, extra)}` +
  `<g class="la">${draw(LEGS_A, 12, extra)}</g><g class="lb">${draw(LEGS_B, 12, extra)}</g>`
