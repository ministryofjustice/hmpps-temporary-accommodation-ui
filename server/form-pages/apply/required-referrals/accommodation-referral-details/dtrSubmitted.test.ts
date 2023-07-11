import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import DtrSubmitted from './dtrSubmitted'

const body = { dtrSubmitted: 'yes' as const }

describe('DtrSubmitted', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new DtrSubmitted(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new DtrSubmitted({}, application), 'dashboard')

  describe('next', () => {
    it('returns the DTR details page ID when the DTR has been submitted', () => {
      expect(new DtrSubmitted({ ...body, dtrSubmitted: 'yes' }, application).next()).toEqual('dtr-details')
    })

    it('returns the CRS submitted page ID when the DTR has not been submitted', () => {
      expect(new DtrSubmitted({ ...body, dtrSubmitted: 'no' }, application).next()).toEqual('crs-submitted')
    })
  })

  describe('errors', () => {
    it('returns an empty object if dtrSubmitted is populated', () => {
      const page = new DtrSubmitted(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the dtrSubmitted is not populated', () => {
      const page = new DtrSubmitted({}, application)
      expect(page.errors()).toEqual({
        dtrSubmitted:
          'You must specify if the Duty to Refer (DTR) / National Offender Pathway (NOP) has been submitted',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new DtrSubmitted(body, application)

      expect(page.response()).toEqual({ [page.title]: 'Yes' })
    })
  })
})
