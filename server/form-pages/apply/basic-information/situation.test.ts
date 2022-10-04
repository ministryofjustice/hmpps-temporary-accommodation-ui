import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../shared-examples'
import applicationFactory from '../../../testutils/factories/application'

import Situation from './situation'

describe('Situation', () => {
  let application = applicationFactory.build({
    data: { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } },
  })
  beforeEach(() => {
    application = applicationFactory.build({
      data: { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } },
    })
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new Situation({ situation: 'riskManagement', something: 'else' }, application)

      expect(page.body).toEqual({ situation: 'riskManagement' })
    })
  })

  itShouldHavePreviousValue(new Situation({}, application), 'sentence-type')
  itShouldHaveNextValue(new Situation({}, application), 'release-date')

  describe('errors', () => {
    it('should return an empty array if the situation is populated', () => {
      const page = new Situation({ situation: 'riskManagement' }, application)
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the situation is not populated', () => {
      const page = new Situation({ situation: '' }, application)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.situation',
          errorType: 'empty',
        },
      ])
    })
  })

  describe('items', () => {
    describe('sentenceType', () => {
      it('if the sentence type is "communityOrder" then the items should be correct', () => {
        const items = new Situation(
          { situation: 'riskManagement' },
          applicationFactory.build({
            data: { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } },
          }),
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0]).toEqual({ text: 'Referral for risk management', value: 'riskManagement', checked: true })
        expect(items[1]).toEqual({ text: 'Residency management', value: 'residencyManagement', checked: false })
      })

      it('if the sentence type is "bailPlacement" then the items should be correct', () => {
        const items = new Situation(
          { situation: 'bailAssessment' },
          applicationFactory.build({
            data: { 'basic-information': { 'sentence-type': { sentenceType: 'bailPlacement' } } },
          }),
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0]).toEqual({
          text: 'Bail assessment for community penalty',
          value: 'bailAssessment',
          checked: true,
        })
        expect(items[1]).toEqual({ text: 'Bail sentence', value: 'bailSentence', checked: false })
      })
    })

    it('marks an option as selected when the releaseType is set', () => {
      const page = new Situation({ situation: 'riskManagement' }, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('riskManagement')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new Situation({}, application)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
