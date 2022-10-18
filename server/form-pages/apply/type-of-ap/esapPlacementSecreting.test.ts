import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'
import { convertKeyValuePairToCheckBoxItems } from '../../../utils/formUtils'

import EsapPlacementSecreting, { secretingHistory } from './esapPlacementSecreting'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

jest.mock('../../../utils/formUtils')

describe('EsapPlacementSecreting', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new EsapPlacementSecreting(
        {
          secretingHistory: ['radicalisationLiterature'],
          secretingIntelligence: 'yes',
          secretingNotes: 'notes',
          something: 'else',
        },
        application,
      )

      expect(page.body).toEqual({
        secretingHistory: ['radicalisationLiterature'],
        secretingIntelligence: 'yes',
        secretingNotes: 'notes',
      })
    })
  })

  itShouldHavePreviousValue(new EsapPlacementSecreting({}, application), 'esap-placement-screening')

  describe('next', () => {
    describe('when the application has a previous response that includes `cctv`', () => {
      beforeEach(() => {
        application.data = {
          'type-of-ap': {
            'esap-placement-screening': {
              esapReasons: ['cctv', 'secreting'],
            },
          },
        }
      })

      itShouldHaveNextValue(new EsapPlacementSecreting({}, application), 'esap-placement-cctv')
    })

    describe('when the application has a previous response does not include `cctv`', () => {
      beforeEach(() => {
        application.data = {
          'type-of-ap': {
            'esap-placement-screening': {
              esapReasons: ['secreting'],
            },
          },
        }
      })

      itShouldHaveNextValue(new EsapPlacementSecreting({}, application), '')
    })
  })

  describe('response', () => {
    it('should translate the response correctly', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      const page = new EsapPlacementSecreting(
        {
          secretingHistory: ['radicalisationLiterature'],
          secretingIntelligence: 'yes',
          secretingIntelligenceDetails: 'Some detail',
          secretingNotes: 'notes',
        },
        applicationFactory.build({ person }),
      )

      expect(page.response()).toEqual({
        'Which items does John Wayne have a history of secreting?': [
          'Literature and materials supporting radicalisation ideals',
        ],
        'Have partnership agencies requested the sharing of intelligence captured via body worn technology?': 'Yes',
        'Provide details': 'Some detail',
        'Provide any supporting information about why John Wayne requires enhanced room searches': 'notes',
      })
    })
  })

  describe('errors', () => {
    it('should return an empty array when `secretingHistory` and `secretingIntelligence` are defined', () => {
      const page = new EsapPlacementSecreting(
        {
          secretingHistory: ['radicalisationLiterature'],
          secretingIntelligence: 'yes',
          secretingIntelligenceDetails: 'Some detail',
          secretingNotes: 'notes',
        },
        application,
      )
      expect(page.errors()).toEqual([])
    })

    it('should return error messages when `secretingHistory` and `secretingIntelligence` are undefined', () => {
      const page = new EsapPlacementSecreting({}, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.secretingHistory',
          errorType: 'empty',
        },
        {
          propertyName: '$.secretingIntelligence',
          errorType: 'empty',
        },
      ])
    })

    it('should return an error message when `secretingHistory` is empty', () => {
      const page = new EsapPlacementSecreting({ secretingHistory: [], secretingIntelligence: 'no' }, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.secretingHistory',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('secretingHistoryItems', () => {
    it('it calls convertKeyValuePairToCheckBoxItems with the correct values', () => {
      const page = new EsapPlacementSecreting({ secretingHistory: ['radicalisationLiterature'] }, application)
      page.secretingHistoryItems()

      expect(convertKeyValuePairToCheckBoxItems).toHaveBeenCalledWith(secretingHistory, page.body.secretingHistory)
    })
  })

  it('should return an empty array when `secretingIntelligence` is yes and no details are given', () => {
    const page = new EsapPlacementSecreting(
      {
        secretingHistory: ['radicalisationLiterature'],
        secretingIntelligence: 'yes',
        secretingIntelligenceDetails: '',
        secretingNotes: 'notes',
      },
      application,
    )
    expect(page.errors()).toEqual([
      {
        propertyName: '$.secretingIntelligenceDetails',
        errorType: 'empty',
      },
    ])
  })
})
