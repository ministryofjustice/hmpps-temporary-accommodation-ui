import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PipeReferral from './pipeReferral'
import applicationFactory from '../../../testutils/factories/application'
import personFactory from '../../../testutils/factories/person'

describe('PipeReferral', () => {
  let application = applicationFactory.build()

  describe('title', () => {
    it('shold add the name of the person', () => {
      const person = personFactory.build({ name: 'John Wayne' })
      application = applicationFactory.build({ person })

      const page = new PipeReferral({}, application)

      expect(page.title).toEqual('Has John Wayne been screened into the OPD pathway?')
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'yes',
          'opdPathwayDate-year': 2022,
          'opdPathwayDate-month': 3,
          'opdPathwayDate-day': 3,
          something: 'else',
        },
        application,
      )

      expect(page.body).toEqual({
        opdPathway: 'yes',
        'opdPathwayDate-year': 2022,
        'opdPathwayDate-month': 3,
        'opdPathwayDate-day': 3,
      })
    })
  })

  itShouldHaveNextValue(new PipeReferral({}, application), 'pipe-opd-screening')

  itShouldHavePreviousValue(new PipeReferral({}, application), 'ap-type')

  describe('errors', () => {
    describe('if opdPathway is yes', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
            'opdPathwayDate-year': 2022,
            'opdPathwayDate-month': 3,
            'opdPathwayDate-day': 3,
          },
          application,
        )
        expect(page.errors()).toEqual([])
      })

      it('should return an error if  the date is not populated', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
          },
          application,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.opdPathwayDate',
            errorType: 'empty',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new PipeReferral(
          {
            opdPathway: 'yes',
            'opdPathwayDate-year': 99,
            'opdPathwayDate-month': 99,
            'opdPathwayDate-day': 99,
          },
          application,
        )
        expect(page.errors()).toEqual([
          {
            propertyName: '$.opdPathwayDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array if opdPathway in no', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'no',
        },
        application,
      )
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the opdPathway field is not populated', () => {
      const page = new PipeReferral({}, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.opdPathway',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('response', () => {
    it('should return a translated version of the response when opdPathway is "no"', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'no',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'No',
      })
    })

    it('should return a translated version of the response when opdPathway is "yes"', () => {
      const page = new PipeReferral(
        {
          opdPathway: 'yes',
          opdPathwayDate: '2022-11-11T00:00:00.000Z',
        },
        application,
      )

      expect(page.response()).toEqual({
        [page.title]: 'Yes',
        "When was John Wayne's last consultation or formulation?": 'Friday 11 November 2022',
      })
    })
  })
})
