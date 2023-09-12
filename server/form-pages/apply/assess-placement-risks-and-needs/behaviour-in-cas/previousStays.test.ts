import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHavePreviousValue } from '../../../shared-examples'
import { yesNoOrDontKnowResponse } from '../../../utils'
import PreviousStays from './previousStays'

jest.mock('../../../utils')

const body = { previousStays: 'yes' as const }

describe('PreviousStays', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new PreviousStays(body, application)

      expect(page.body).toEqual(body)
      expect(page.questions.previousStays).toEqual(
        'Has John Smith previously stayed in Community Accommodation Services (CAS)?',
      )
    })
  })

  itShouldHavePreviousValue(new PreviousStays({}, application), 'dashboard')

  describe('next', () => {
    it('returns the previous stays details page ID when the person has previous stayed in CAS', () => {
      expect(new PreviousStays({ ...body, previousStays: 'yes' }, application).next()).toEqual('previous-stays-details')
    })

    it('returns an empty page ID when the person has not previously stayed in CAS', () => {
      expect(new PreviousStays({ ...body, previousStays: 'no' }, application).next()).toEqual('')
    })

    it('returns an empty page ID when it is unknown whether the person has previously stayed in CAS', () => {
      expect(new PreviousStays({ ...body, previousStays: 'iDontKnow' }, application).next()).toEqual('')
    })
  })

  describe('errors', () => {
    it('returns an empty object if previousStays is populated', () => {
      const page = new PreviousStays(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the previousStays is not populated', () => {
      const page = new PreviousStays({}, application)
      expect(page.errors()).toEqual({
        previousStays:
          'You must specify whether John Smith has previously stayed in Community Accommodation Services (CAS)',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesNoOrDontKnowResponse as jest.Mock).mockReturnValue("Yes, no, or don't know response")

      const page = new PreviousStays(body, application)

      expect(page.response()).toEqual({
        'Has the person previously stayed in Community Accommodation Services (CAS)?':
          "Yes, no, or don't know response",
      })
      expect(yesNoOrDontKnowResponse).toHaveBeenCalledWith('previousStays', body)
    })
  })
})
