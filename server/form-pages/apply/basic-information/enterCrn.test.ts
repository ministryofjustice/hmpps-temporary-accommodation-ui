import EnterCRN from './enterCrn'

describe('EnterCRN', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new EnterCRN({ crn: 'ABC123', something: 'else' })

      expect(page.body).toEqual({ crn: 'ABC123' })
    })
  })

  describe('next', () => {
    it('should return the confirm-details step', () => {
      const page = new EnterCRN({})
      expect(page.next()).toEqual('confirm-details')
    })
  })

  describe('errors', () => {
    it('should return an empty array when the crn is entered', () => {
      const page = new EnterCRN({ crn: 'ABC123' })
      expect(page.errors()).toEqual([])
    })

    it('should return an error when the crn is empty', () => {
      const page = new EnterCRN({ crn: '' })
      expect(page.errors()).toEqual([
        {
          propertyName: 'crn',
          errorType: 'blank',
        },
      ])
    })
  })
})
