import { applicationFactory } from '../../../../testutils/factories'
import { hasSubmittedDtr } from '../../../utils'
import CrsSubmitted from './crsSubmitted'

jest.mock('../../../utils')

const body = { crsSubmitted: 'yes' as const }

describe('CrsSubmitted', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new CrsSubmitted(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('previous', () => {
    it('returns the DTR details page ID when the DTR has been submitted', () => {
      ;(hasSubmittedDtr as jest.Mock).mockReturnValue(true)

      expect(new CrsSubmitted(body, application).previous()).toEqual('dtr-details')
    })

    it('returns the DTR submitted page ID when the DTR has not been submitted', () => {
      ;(hasSubmittedDtr as jest.Mock).mockReturnValue(false)

      expect(new CrsSubmitted(body, application).previous()).toEqual('dtr-submitted')
    })
  })

  describe('next', () => {
    it('returns the CRS details page ID when the CRS has been submitted', () => {
      expect(new CrsSubmitted({ ...body, crsSubmitted: 'yes' }, application).next()).toEqual('crs-details')
    })

    it('returns the other accommodation options page ID when the CRS has not been submitted', () => {
      expect(new CrsSubmitted({ ...body, crsSubmitted: 'no' }, application).next()).toEqual(
        'other-accommodation-options',
      )
    })
  })

  describe('errors', () => {
    it('returns an empty object if crsSubmitted is populated', () => {
      const page = new CrsSubmitted(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the crsSubmitted is not populated', () => {
      const page = new CrsSubmitted({}, application)
      expect(page.errors()).toEqual({
        crsSubmitted: 'You must specify if a referral to Commissioned Rehabilitative Services (CRS) has been submitted',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new CrsSubmitted(body, application)

      expect(page.response()).toEqual({ [page.title]: 'Yes' })
    })
  })
})
