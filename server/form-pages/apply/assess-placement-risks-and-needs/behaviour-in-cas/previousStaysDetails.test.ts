import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import PreviousStaysDetails from './previousStaysDetails'

const body = {
  accommodationTypes: ['cas1' as const, 'cas3' as const],
  cas1Detail: 'Approved Premises detail',
  cas3Detail: 'Temporary Accommodation detail',
}

describe('PreviousStaysDetails', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new PreviousStaysDetails(body, application)

      expect(page.body).toEqual(body)
      expect(page.title).toEqual(`What type of accommodation did John Smith stay at?`)
    })
  })

  itShouldHavePreviousValue(new PreviousStaysDetails({}, application), 'previous-stays')
  itShouldHaveNextValue(new PreviousStaysDetails({}, application), '')

  describe('errors', () => {
    it('returns an empty object if the previous stays details are populated', () => {
      const page = new PreviousStaysDetails(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the accommodation types array is undefined', () => {
      const page = new PreviousStaysDetails({ accommodationTypes: undefined }, application)
      expect(page.errors()).toEqual({
        accommodationTypes: 'You must specify what type of accommodation John Smith stayed at',
      })
    })

    it('returns an error if the accommodation types array is empty', () => {
      const page = new PreviousStaysDetails({ accommodationTypes: [] }, application)
      expect(page.errors()).toEqual({
        accommodationTypes: 'You must specify what type of accommodation John Smith stayed at',
      })
    })

    it('returns errors if the accommodation types array is populated but the associated details are not present', () => {
      const page = new PreviousStaysDetails({ ...body, cas1Detail: undefined, cas3Detail: undefined }, application)
      expect(page.errors()).toEqual({
        cas1Detail: 'You must provide details about their behaviour during their stay',
        cas3Detail: 'You must provide details about their behaviour during their stay',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new PreviousStaysDetails(body, application)
      expect(page.response()).toEqual({
        'Approved Premises (AP or CAS1)': 'Approved Premises detail',
        'Temporary Accommodation (CAS3)': 'Temporary Accommodation detail',
      })
    })
  })

  describe('items', () => {
    it('returns radio button items', () => {
      const page = new PreviousStaysDetails(body, application)
      expect(page.items()).toEqual([
        {
          value: 'cas1',
          text: 'Approved Premises (AP or CAS1)',
        },
        { value: 'cas2', text: 'Bail Accommodation and Support Service (BASS or CAS2)' },
        { value: 'cas3', text: 'Temporary Accommodation (CAS3)' },
      ])
    })
  })
})
