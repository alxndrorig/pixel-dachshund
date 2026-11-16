import { expect, test } from 'claude-code/testing'

import { WIDE, loopSeconds, scene } from '../hooks/scene.js'

type Look = { backdrop?: { scene?: string } }

test('the dachshund is set when a session starts', async ($, on) => {
  const seen: Look[] = []

  on('command.register', () => ({ value: { command: 'dachshund' } }))
  on('store.get', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    seen.push(e)

    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(seen.map(look => look.backdrop?.scene)).toEqual(['dachshund'])
})

test('switched off, the dachshund is not set', async ($, on) => {
  const seen: Look[] = []

  on('command.register', () => ({ value: { command: 'dachshund' } }))
  on('store.get', () => ({ value: 'off' }))
  on('theme.set', (_, e) => {
    seen.push(e)

    return { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })

  expect(seen).toEqual([])
})

test('a set that no app drew is made again at the next message, once', async ($, on) => {
  const seen: Look[] = []

  on('command.register', () => ({ value: { command: 'dachshund' } }))
  on('store.get', () => ({ value: undefined }))
  on('theme.set', (_, e) => {
    seen.push(e)

    return seen.length === 1
      ? { value: { isDrawn: false, requestId: 'backdrop', reason: 'no app attached' } }
      : { value: { isDrawn: true, requestId: 'backdrop' } }
  })
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('prompt.submit', (_, e) => ({ text: e.text }))

  await $.session.start({ cwd: '/', surface: 'desktop', isInteractive: true })
  await $.prompt.submit({ text: 'first', wait: true, origin: { kind: 'composer' } })
  await $.prompt.submit({ text: 'second', wait: true, origin: { kind: 'composer' } })

  expect(seen.map(look => look.backdrop?.scene)).toEqual(['dachshund', 'dachshund'])
})

test('the dog grows with the answers and the loop keeps its length', async () => {
  const short = scene(WIDE, 0, 0)
  const long = scene(WIDE, 0, 10)

  expect(short.includes('M4 6h18v1')).toEqual(true)
  expect(long.includes('M4 6h28v1')).toEqual(true)
  expect(scene(WIDE, 0, 999)).toEqual(scene(WIDE, 0, 24))
  expect(short.includes(`${loopSeconds(WIDE).toFixed(2)}s`)).toEqual(true)
})
