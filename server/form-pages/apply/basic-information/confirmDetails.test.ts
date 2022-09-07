import ConfirmDetails from './confirmDetails'

describe('ConfirmDetails', () => {
  const page = new ConfirmDetails()

  describe('next', () => {
    it('should return the sentence-type step', () => {
      expect(page.next()).toEqual('sentence-type')
    })
  })

  describe('previous', () => {
    it('should return the enter-crn step', () => {
      expect(page.previous()).toEqual('enter-crn')
    })
  })
})
