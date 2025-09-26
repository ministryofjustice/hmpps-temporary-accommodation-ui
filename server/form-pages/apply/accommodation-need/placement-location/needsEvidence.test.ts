import { applicationFactory } from '../../../../testutils/factories'
import NeedsEvidence from './needsEvidence'

describe('NeedsEvidence', () => {
  const application = applicationFactory.build()
  const body = {}

  describe('constructor', () => {
    it('sets the title and htmlDocumentTitle', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.title).toEqual('Evidence must be in NDelius before you can submit the referral')
      expect(page.htmlDocumentTitle).toEqual(page.title)
    })

    it('sets the body', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.body).toEqual(null)
    })
  })

  describe('response', () => {
    it('returns null', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.response()).toBeNull()
    })
  })

  describe('next', () => {
    it('returns ""', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.next()).toEqual('')
    })
  })

  describe('previous', () => {
    it('returns "pdu-evidence"', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.previous()).toEqual('pdu-evidence')
    })
  })

  describe('errors', () => {
    it('returns no errors', () => {
      const page = new NeedsEvidence(body, application)
      expect(page.errors()).toEqual({})
    })
  })
})
