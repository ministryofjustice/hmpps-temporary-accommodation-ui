import { PersonRisksUI } from '../../../../@types/ui'
import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { mapApiPersonRisksForUi } from '../../../../utils/utils'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import SubstanceMisuse from './substanceMisuse'

jest.mock('../../../../utils/utils')
jest.mock('../../../utils')

const body = { substanceMisuse: 'yes' as const, substanceMisuseDetail: 'Detail' }
const personRisksUi = { flags: { value: ['Some flag'] } } as PersonRisksUI

describe('SubstanceMisuse', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('constructor', () => {
    it('sets the body and risk information', () => {
      ;(mapApiPersonRisksForUi as jest.MockedFunction<typeof mapApiPersonRisksForUi>).mockReturnValue(personRisksUi)

      const page = new SubstanceMisuse(body, application)

      expect(page.body).toEqual(body)
      expect(page.risks).toEqual(personRisksUi)

      expect(mapApiPersonRisksForUi).toHaveBeenCalledWith(application.risks)
    })
  })

  itShouldHavePreviousValue(new SubstanceMisuse({}, application), 'anti-social-behaviour')
  itShouldHaveNextValue(new SubstanceMisuse({}, application), 'rosh-level')

  describe('errors', () => {
    it('returns an empty object if the substance misuse fields are populated', () => {
      const page = new SubstanceMisuse(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the substance misuse answer is no', () => {
      const page = new SubstanceMisuse({ substanceMisuse: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the substance misuse answer not populated', () => {
      const page = new SubstanceMisuse({ ...body, substanceMisuse: undefined }, application)
      expect(page.errors()).toEqual({
        substanceMisuse:
          'You must specify if John Smith has any current or previous issues with drug or alcohol misuse',
      })
    })

    it('returns an error if the substance misuse answer is yes but details are not populated', () => {
      const page = new SubstanceMisuse({ ...body, substanceMisuseDetail: undefined }, application)
      expect(page.errors()).toEqual({
        substanceMisuseDetail:
          "You must provide information on the person's substance misuse and how you will support their placement given these issues",
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new SubstanceMisuse(body, application)
      expect(page.response()).toEqual({
        'Does John Smith have any current or previous issues with drug or alcohol misuse?':
          'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('substanceMisuse', body)
    })
  })
})
