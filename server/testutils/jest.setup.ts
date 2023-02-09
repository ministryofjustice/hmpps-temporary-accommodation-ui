/* eslint-disable @typescript-eslint/no-namespace */
export {}

declare global {
  namespace jest {
    interface Matchers<R> {
      toMatchStringIgnoringWhitespace(expected: string): R
    }
  }
}

expect.extend({
  toMatchStringIgnoringWhitespace(received, expected) {
    const pass = received.replace(/\s+/g, ``) === expected.replace(/\s+/g, ``)

    return {
      pass,
      message: pass
        ? () => `expected ${received} not to match ${expected}`
        : () => `expected ${received} to match ${expected}`,
    }
  },
})
