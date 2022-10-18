import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

import EsapPlacementCCTV, { cctvHistory } from './esapPlacementCCTV'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

jest.mock('../../../utils/formUtils')

describe('EsapPlacementCCTV', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvNotes: 'notes',
          something: 'else',
        },
        application,
      )

      expect(page.body).toEqual({
        cctvHistory: ['prisonerAssualt'],
        cctvIntelligence: 'yes',
        cctvNotes: 'notes',
      })
    })
  })

  itShouldHaveNextValue(new EsapPlacementCCTV({}, application), '')

  describe('previous', () => {
    describe('when the application has a previous response that includes `secreting`', () => {
      beforeEach(() => {
        application.data = {
          'type-of-ap': {
            'esap-placement-screening': {
              esapReasons: ['cctv', 'secreting'],
            },
          },
        }
      })

      itShouldHavePreviousValue(new EsapPlacementCCTV({}, application), 'esap-placement-secreting')
    })

    describe('when the application has a previous response does not include `secreting`', () => {
      beforeEach(() => {
        application.data = {
          'type-of-ap': {
            'esap-placement-screening': {
              esapReasons: ['cctv'],
            },
          },
        }
      })

      itShouldHavePreviousValue(new EsapPlacementCCTV({}, application), 'esap-placement-screening')
    })
  })

  describe('response', () => {
    it('should translate the response correctly', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: 'Some detail',
          cctvNotes: 'notes',
        },
        applicationFactory.build({ person }),
      )

      expect(page.response()).toEqual({
        'Which behaviours has John Wayne demonstrated that require enhanced CCTV provision to monitor?': [
          'Physically assaulted other people in prison',
        ],
        'Have partnership agencies requested the sharing of intelligence captured via enhanced CCTV?': 'Yes',
        'Provide details': 'Some detail',
        'Provide any supporting information about why John Wayne requires enhanced CCTV provision': 'notes',
      })
    })
  })

  describe('errors', () => {
    it('should return an empty array when `cctvHistory` and `cctvIntelligence` are defined', () => {
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: 'Some detail',
          cctvNotes: 'notes',
        },
        application,
      )
      expect(page.errors()).toEqual([])
    })

    it('should return error messages when `cctvHistory` and `cctvIntelligence` are undefined', () => {
      const page = new EsapPlacementCCTV({}, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.cctvHistory',
          errorType: 'empty',
        },
        {
          propertyName: '$.cctvIntelligence',
          errorType: 'empty',
        },
      ])
    })

    it('should return an error message when `cctvHistory` is empty', () => {
      const page = new EsapPlacementCCTV({ cctvHistory: [], cctvIntelligence: 'no' }, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.cctvHistory',
          errorType: 'empty',
        },
      ])
    })

    it('should return an empty array when `cctvIntelligence` is yes and no details are given', () => {
      const page = new EsapPlacementCCTV(
        {
          cctvHistory: ['prisonerAssualt'],
          cctvIntelligence: 'yes',
          cctvIntelligenceDetails: '',
          cctvNotes: 'notes',
        },
        application,
      )
      expect(page.errors()).toEqual([
        {
          propertyName: '$.cctvIntelligenceDetails',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('cctvHistoryItems', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementCCTV({ cctvHistory: ['prisonerAssualt'] }, application)
      page.cctvHistoryItems()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(cctvHistory, page.body.cctvHistory)
    })
  })
})
