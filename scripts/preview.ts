import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { DARK, LIGHT } from '../hooks/palette.ts'
import { TALL, WIDE, loopSeconds, scene } from '../hooks/scene.ts'
import { DOG_H, DOG_W, MAX_EXTRA, dog } from '../hooks/sprite.ts'

const out = process.argv[2]

if (out === undefined) {
  throw new Error('usage: bun scripts/preview.ts <folder>')
}
mkdirSync(out, { recursive: true })

const frame = (extra: number, hidden: string, x: number, y: number) =>
  `<g transform="translate(${x},${y})"><g class="${hidden}">${dog(extra)}</g></g>`
const sheetW = DOG_W + MAX_EXTRA + 8
const sheet = (ground: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${sheetW * 2} ${(DOG_H + 6) * 2}" shape-rendering="crispEdges">` +
  `<style>.a .lb,.a .tb,.b .la,.b .ta{display:none}</style><rect width="100%" height="100%" fill="${ground}"/>` +
  `${frame(0, 'a', 4, 3)}${frame(0, 'b', sheetW + 4, 3)}${frame(12, 'a', 4, DOG_H + 9)}${frame(MAX_EXTRA, 'b', sheetW + 4, DOG_H + 9)}</svg>`

writeFileSync(join(out, 'sheet-light.svg'), sheet(LIGHT['surface-0']))
writeFileSync(join(out, 'sheet-dark.svg'), sheet(DARK['surface-0']))

const shots: string[] = []

for (const [name, layout] of [['wide', WIDE], ['tall', TALL]] as const) {
  const pass = loopSeconds(layout) / layout.passes.length

  layout.passes.forEach((_, i) => {
    const file = `${name}-${i}.svg`

    writeFileSync(join(out, file), scene(layout, i * pass + (pass - 5) * 0.5, i * 4))
    shots.push(file)
  })
}

const page = (ground: string, files: string[], size: string) =>
  `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:${ground}}img{position:fixed;inset:0;${size}}</style>` +
  files.map(file => `<img src="${file}">`).join('')

writeFileSync(join(out, 'wide-light.html'), page(LIGHT['surface-0'], shots.filter(f => f.startsWith('wide')), 'width:100vw;height:100vh'))
writeFileSync(join(out, 'wide-dark.html'), page(DARK['surface-0'], shots.filter(f => f.startsWith('wide')), 'width:100vw;height:100vh'))
writeFileSync(join(out, 'tall-dark.html'), page(DARK['surface-0'], shots.filter(f => f.startsWith('tall')), 'width:100vw;height:100vh'))
writeFileSync(join(out, 'live-light.html'), page(LIGHT['surface-0'], ['wide-0.svg'], 'width:100vw;height:100vh'))
writeFileSync(join(out, 'live-dark.html'), page(DARK['surface-0'], ['wide-0.svg'], 'width:100vw;height:100vh'))
writeFileSync(
  join(out, 'index.html'),
  `<!doctype html><meta charset="utf-8">` +
    ['sheet', 'live-light', 'live-dark', 'wide-light', 'wide-dark', 'tall-dark'].map(name => `<p><a href="${name}.html">${name}</a>`).join(''),
)
writeFileSync(
  join(out, 'sheet.html'),
  `<!doctype html><meta charset="utf-8"><style>body{margin:0}img{display:block;width:100vw}</style><img src="sheet-light.svg"><img src="sheet-dark.svg">`,
)
console.log(`${shots.length} scenes, ${scene(WIDE, 0, MAX_EXTRA).length} characters in the largest`)
