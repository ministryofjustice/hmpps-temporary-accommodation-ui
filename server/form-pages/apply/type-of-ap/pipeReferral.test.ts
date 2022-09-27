import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../shared-examples'

import PipeReferral from './pipeReferral'

describe('PipeReferral', () => {
  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new PipeReferral({
        opdPathway: 'yes',
        'opdPathwayDate-year': 2022,
        'opdPathwayDate-month': 3,
        'opdPathwayDate-day': 3,
        something: 'else',
      })

      expect(page.body).toEqual({
        opdPathway: 'yes',
        'opdPathwayDate-year': 2022,
        'opdPathwayDate-month': 3,
        'opdPathwayDate-day': 3,
      })
    })
  })

  itShouldHaveNextValue(new PipeReferral({}), 'pipe-opd-screening')

  itShouldHavePreviousValue(new PipeReferral({}), 'ap-type')

  describe('errors', () => {
    describe('if opdPathway is yes', () => {
      it('should return an empty array if the date is specified', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
          'opdPathwayDate-year': 2022,
          'opdPathwayDate-month': 3,
          'opdPathwayDate-day': 3,
        })
        expect(page.errors()).toEqual([])
      })

      it('should return an error if  the date is not populated', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
        })
        expect(page.errors()).toEqual([
          {
            propertyName: '$.opdPathwayDate',
            errorType: 'empty',
          },
        ])
      })

      it('should return an error if the date is invalid', () => {
        const page = new PipeReferral({
          opdPathway: 'yes',
          'opdPathwayDate-year': 99,
          'opdPathwayDate-month': 99,
          'opdPathwayDate-day': 99,
        })
        expect(page.errors()).toEqual([
          {
            propertyName: '$.opdPathwayDate',
            errorType: 'invalid',
          },
        ])
      })
    })

    it('should return an empty array if opdPathway in no', () => {
      const page = new PipeReferral({
        opdPathway: 'no',
      })
      expect(page.errors()).toEqual([])
    })

    it('should return an error if the opdPathway field is not populated', () => {
      const page = new PipeReferral({})
      expect(page.errors()).toEqual([
        {
          propertyName: '$.opdPathway',
          errorType: 'empty',
        },
      ])
    })
  })
})
