export type Walk = { extra: number; turns: number }

declare module 'claude-code' {
  interface PluginState {
    'pixel-dachshund': { walk: Walk }
  }
}
