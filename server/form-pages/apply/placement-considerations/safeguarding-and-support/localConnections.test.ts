import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import LocalConnections from './localConnections'

const body = { localConnections: 'Local connection details' }

describe('LocalConnections', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new LocalConnections(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new LocalConnections({}, application), 'support-in-the-community')
  itShouldHaveNextValue(new LocalConnections({}, application), 'caring-responsibilities')

  describe('errors', () => {
    it('returns an empty object if the local connections field is populated', () => {
      const page = new LocalConnections(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the local connections field is not populated', () => {
      const page = new LocalConnections({ ...body, localConnections: undefined }, application)
      expect(page.errors()).toEqual({
        localConnections: 'You must provide details of local connections',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new LocalConnections(body, application)
      expect(page.response()).toEqual({
        'Details of local connections': body.localConnections,
      })
    })
  })
})
