import type TasklistPage from '../tasklistPage'

const itShouldHaveNextValue = (target: TasklistPage, value: string) => {
  describe('next', () => {
    it(`should have a next value of ${value}`, () => {
      expect(target.next()).toEqual(value)
    })
  })
}

const itShouldHavePreviousValue = (target: TasklistPage, value: string) => {
  describe('previous', () => {
    it(`should have a previous value of ${value}`, () => {
      expect(target.previous()).toEqual(value)
    })
  })
}

export { itShouldHaveNextValue, itShouldHavePreviousValue }
