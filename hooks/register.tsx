import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register, ThemeSetArgs } from 'claude-code'

import { makeColors } from './make-colors.js'
import { DARK, LIGHT, ROLES } from './palette.js'
import { TALL, WIDE, extraFor, loopSeconds, scene } from './scene.js'

const START = Math.random()
const SCENE = 'dachshund'
const COMMAND = 'dachshund'
const SWITCH = 'look'
// `turns` only makes each answer a redraw, so a dog that stands still moves on.
const walk = atom({ plugin: 'pixel-dachshund', key: 'walk' } as const, { extra: 0, turns: 0 })

// A host that cannot tell the usage must not cost the session its look: the dog keeps the length it had.
const measure = async ($: EngineInterface, isTurn: boolean) => {
  let extra: number | undefined

  try {
    extra = extraFor((await $.session.usage()).context.percent)
  } catch {
    extra = undefined
  }
  await update($, walk, now => ({ extra: extra ?? now.extra, turns: now.turns + (isTurn ? 1 : 0) }))
}

const { theme, problems } = makeColors({
  label: 'Pixel Dachshund',
  roles: ROLES,
  light: { gray: { anchors: LIGHT } },
  dark: { gray: { anchors: DARK } },
})

// No tint: the panels keep their own color, which follows the light or dark mode. No blur: the pixels stay sharp.
const LOOK: ThemeSetArgs = {
  colors: theme,
  backdrop: { scene: SCENE, glass: { blur: 0, opacity: 0.45 } },
}

const isOn = async ($: EngineInterface) => (await $.store.get(SWITCH)) !== 'off'

const isOurs = (look: ThemeSetArgs) =>
  look.backdrop !== undefined && 'scene' in look.backdrop && look.backdrop.scene === SCENE

export const register: Register = on => {
  // A set made while no app is attached draws nothing, so it is made again at the next message.
  let isUndrawn = false

  on('session.start', async ($, e, next) => {
    const unpainted = problems.find(line => line.startsWith("Desktop won't paint"))

    if (unpainted !== undefined) {
      $.ui.toast(unpainted)
    }
    await $.command.register({
      name: COMMAND,
      description: 'The pixel dachshund look: alone or with "on" it is set, "off" keeps it away in every session',
    })
    // Set after the mods beneath have started, so a theme one of them sets does not land on top.
    const started = await next(e)

    await measure($, false)
    if (await isOn($)) {
      isUndrawn = !(await $.theme.set(LOOK)).isDrawn
    }

    return started
  })

  on('theme.set', ($, e, next) => {
    if (!isOurs(e)) {
      isUndrawn = false
    }

    return next(e)
  })

  on('theme.clear', ($, e, next) => {
    isUndrawn = false

    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    const entered = await next(e)

    if (isUndrawn && (await isOn($))) {
      isUndrawn = !(await $.theme.set(LOOK)).isDrawn
    }

    return entered
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    if (e.args.trim().toLowerCase() === 'off') {
      await $.store.set(SWITCH, 'off')
      await $.theme.clear()

      return { text: 'pixel-dachshund: off. /dachshund brings the dog back.' }
    }

    await $.store.delete(SWITCH)
    const set = await $.theme.set(LOOK)

    return { text: set.isDrawn ? 'pixel-dachshund: on.' : `pixel-dachshund: on. ${set.reason}` }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && !e.isAborted) {
      await measure($, true)
    }

    return next(e)
  })

  on('ui.render', { component: 'Backdrop' }, async ($, e, next) => {
    if ((e.surface !== 'desktop' && e.surface !== 'mobile') || e.props.scene !== SCENE) {
      return next(e)
    }

    const { Svg } = $.ui.resolve(e)
    const layout = e.surface === 'mobile' ? TALL : WIDE
    const loop = loopSeconds(layout)
    const at = (Date.now() / 1000 + START * loop) % loop

    return <Svg source={scene(layout, at, (await read($, walk)).extra)} alt="A pixel dachshund trotting across the page" />
  })
}
