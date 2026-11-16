export type Answers = number

declare module 'claude-code' {
  interface PluginState {
    'pixel-dachshund': { answers: Answers }
  }
}
