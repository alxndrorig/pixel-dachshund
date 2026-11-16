import { DOG_W, MAX_EXTRA, dog } from './sprite.js'

type Pass = { y: number; isFlipped: boolean }

export type Layout = { w: number; h: number; passes: Pass[] }

// One cell of the sprite is one unit of the viewBox; the dog moves a cell per tick.
const TICK = 0.14
const REST = 5
const REACH = DOG_W + MAX_EXTRA
const STRENGTH = 0.7

export const WIDE: Layout = {
  w: 320,
  h: 208,
  passes: [
    { y: 150, isFlipped: false },
    { y: 38, isFlipped: true },
    { y: 98, isFlipped: false },
    { y: 172, isFlipped: true },
    { y: 16, isFlipped: true },
    { y: 124, isFlipped: false },
    { y: 66, isFlipped: true },
  ],
}

export const TALL: Layout = {
  w: 160,
  h: 346,
  passes: [
    { y: 240, isFlipped: false },
    { y: 70, isFlipped: true },
    { y: 166, isFlipped: false },
    { y: 286, isFlipped: true },
    { y: 34, isFlipped: false },
    { y: 204, isFlipped: true },
    { y: 118, isFlipped: false },
  ],
}

// How many cells longer the dog is for a context window filled to `percent`.
export const extraFor = (percent: number | undefined) =>
  percent === undefined ? undefined : Math.round((Math.max(0, Math.min(100, percent)) / 100) * MAX_EXTRA)

const walkSeconds =({ w }: Layout) => (w + REACH) * TICK

export const loopSeconds = (layout: Layout) => layout.passes.length * (walkSeconds(layout) + REST)

// The app can draw a backdrop with every animation switched off (its background animation setting, reduced motion,
// software compositing). The dog then stands where this puts it, clear of the sidebar, and moves on at the next redraw.
const still = ({ w, passes }: Layout, at: number, dogWidth: number) => {
  const span = (w + REACH) * TICK + REST
  const index = Math.min(passes.length - 1, Math.floor(at / span))
  const pass = passes[index]

  if (pass === undefined) {
    return 'none'
  }

  const done = Math.min(1, (at - index * span) / (span - REST))
  const left = Math.round(w * 0.2)
  const x = Math.round(left + (pass.isFlipped ? 1 - done : done) * Math.max(0, w - dogWidth - 4 - left))

  return pass.isFlipped ? `translate(${x + dogWidth}px,${pass.y}px) scale(-1,1)` : `translate(${x}px,${pass.y}px) scale(1,1)`
}

// `at` is the place in the loop, in seconds: a redraw restarts CSS animations, so each draw names its own phase.
export const scene = (layout: Layout, at: number, extra: number) => {
  const { w, h, passes } = layout
  const walk = walkSeconds(layout)
  const loop = loopSeconds(layout)
  const pct = (seconds: number) => `${((seconds / loop) * 100).toFixed(4)}%`
  const from = ({ y, isFlipped }: Pass) =>
    isFlipped ? `translate(${w + REACH}px,${y}px) scale(-1,1)` : `translate(${-REACH}px,${y}px) scale(1,1)`
  const to = ({ y, isFlipped }: Pass) =>
    isFlipped ? `translate(0px,${y}px) scale(-1,1)` : `translate(${w}px,${y}px) scale(1,1)`
  const frames = passes
    .map((pass, i) => {
      const start = i * (walk + REST)

      return (
        `${pct(start)}{transform:${from(pass)};animation-timing-function:steps(${w + REACH})}` +
        `${pct(start + walk)}{transform:${to(pass)};animation-timing-function:step-end}`
      )
    })
    .join('')
  const first = passes[0]
  const delay = `-${at.toFixed(2)}s`
  const length = Math.max(0, Math.min(MAX_EXTRA, Math.round(extra)))
  const css =
    `.run{transform:${still(layout, at, DOG_W + length)};animation:run ${loop.toFixed(2)}s linear infinite ${delay}}` +
    `.la,.ta{animation:fa ${(TICK * 4).toFixed(2)}s step-end infinite ${delay}}` +
    `.lb,.tb{opacity:0;animation:fb ${(TICK * 4).toFixed(2)}s step-end infinite ${delay}}` +
    `.ta,.tb{animation-duration:${(TICK * 6).toFixed(2)}s}` +
    `@keyframes fa{0%{opacity:1}50%{opacity:0}}@keyframes fb{0%{opacity:0}50%{opacity:1}}` +
    `@keyframes run{${frames}100%{transform:${first === undefined ? 'none' : from(first)}}}`

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="100%" height="100%" ` +
    `preserveAspectRatio="xMidYMid slice" shape-rendering="crispEdges"><style>${css}</style>` +
    `<g class="run" opacity="${STRENGTH}">${dog(length)}</g></svg>`
  )
}
