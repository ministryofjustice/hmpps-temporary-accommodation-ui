import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import AccommodationSharing from './accommodationSharing'

jest.mock('../../../../utils/utils')

const body = {
  accommodationSharing: 'yes' as const,
  accommodationSharingYesDetail: 'Yes detail',
  accommodationSharingNoDetail: '',
  higherRisk: 'yes',
  higherRiskDetail: 'Risk detail',
}

const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('AccommodationSharing', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new AccommodationSharing(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new AccommodationSharing({}, application), 'dashboard')
  itShouldHaveNextValue(new AccommodationSharing({}, application), 'cooperation')

  describe('errors', () => {
    it('returns an empty object if all mandatory fields are populated', () => {
      const page = new AccommodationSharing(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the accommodation sharing answer is no and the details are populated', () => {
      const page = new AccommodationSharing(
        { ...body, accommodationSharing: 'no', accommodationSharingNoDetail: 'No details' },
        application,
      )
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the accommodation sharing answer not populated', () => {
      const page = new AccommodationSharing({ ...body, accommodationSharing: undefined }, application)
      expect(page.errors()).toEqual({
        accommodationSharing: 'You must specify if John Smith would be able to share accommodation with others',
      })
    })

    it('returns an error if the higher risk answer is not populated', () => {
      const page = new AccommodationSharing({ ...body, higherRisk: undefined }, application)
      expect(page.errors()).toEqual({
        higherRisk:
          'Select whether John Smith poses a higher risk to any specific person or group if accommodated in a CAS3 property during curfew',
      })
    })

    it('returns an error if the higher risk answer is yes but details are not populated', () => {
      const page = new AccommodationSharing({ ...body, higherRiskDetail: undefined }, application)
      expect(page.errors()).toEqual({
        higherRiskDetail: 'Enter details of who is at risk and what the risks are',
      })
    })

    it('returns an error if the accommodation sharing answer is yes but details are not populated', () => {
      const page = new AccommodationSharing({ ...body, accommodationSharingYesDetail: undefined }, application)
      expect(page.errors()).toEqual({
        accommodationSharingYesDetail:
          "You must provide details of how you will manage the person's risk if they are placed in shared accommodation",
      })
    })

    it('returns an error if the accommodation sharing answer is no but details are not populated', () => {
      const page = new AccommodationSharing(
        { ...body, accommodationSharing: 'no', accommodationSharingNoDetail: undefined },
        application,
      )
      expect(page.errors()).toEqual({
        accommodationSharingNoDetail:
          'You must provide details of why the person is unsuitable to share accommodation with others',
      })
    })

    it('removes orphan data', () => {
      const page = new AccommodationSharing({ ...body, accommodationSharing: 'no', higherRisk: 'no' }, application)
      page.errors()
      expect(page.body).toEqual({
        ...body,
        accommodationSharing: 'no',
        higherRisk: 'no',
        accommodationSharingYesDetail: '',
        higherRiskDetail: '',
      })
    })

    it('removes orphan data when accommodation sharing answer is yes', () => {
      const page = new AccommodationSharing({ ...body, accommodationSharingNoDetail: 'Some detail' }, application)
      page.errors()
      expect(page.body).toEqual({
        ...body,
        accommodationSharingNoDetail: '',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response when the answers are yes', () => {
      const page = new AccommodationSharing(body, application)
      expect(page.response()).toEqual({
        'Is the person suitable to share accommodation with others?': 'Yes - Yes detail',
        'Does the person pose a higher risk to any specific person or group if accommodated in a CAS3 property during curfew?':
          'Yes - Risk detail',
      })
    })

    it('returns a translated version of the response when the answers are no', () => {
      const page = new AccommodationSharing(
        { accommodationSharing: 'no', accommodationSharingNoDetail: 'No detail' },
        application,
      )
      expect(page.response()).toEqual({
        'Is the person suitable to share accommodation with others?': 'No - No detail',
        'Does the person pose a higher risk to any specific person or group if accommodated in a CAS3 property during curfew?':
          'No',
      })
    })
  })
})
