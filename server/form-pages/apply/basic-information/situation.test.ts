import { itShouldHavePreviousValue, itShouldHaveNextValue } from '../../shared-examples'

import Situation from './situation'

describe('Situation', () => {
  let session = { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } }
  beforeEach(() => {
    session = { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } }
  })

  describe('body', () => {
    it('should strip unknown attributes from the body', () => {
      const page = new Situation({ situation: 'riskManagement', something: 'else' }, session)

      expect(page.body).toEqual({ situation: 'riskManagement' })
    })
  })

  itShouldHavePreviousValue(new Situation({}, session), 'sentence-type')
  itShouldHaveNextValue(new Situation({}, session), 'release-date')

  describe('errors', () => {
    it('should return an empty array if the situation is populated', () => {
      const page = new Situation({ situation: 'riskManagement' }, session)
      expect(page.errors()).toEqual([])
    })

    it('should return an errors if the situation is not populated', () => {
      const page = new Situation({ situation: '' }, session)
      expect(page.errors()).toEqual([
        {
          propertyName: '$.situation',
          errorType: 'blank',
        },
      ])
    })
  })

  describe('items', () => {
    describe('sentenceType', () => {
      it('if the sentence type is "communityOrder" then the items should be correct', () => {
        const items = new Situation(
          { situation: 'riskManagement' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'communityOrder' } } },
        ).items()

        expect(items.length).toEqual(2)
        expect(items[0]).toEqual({ text: 'Referral for risk management', value: 'riskManagement', checked: true })
        expect(items[1]).toEqual({ text: 'Residency management', value: 'residencyManagement', checked: false })
      })

      it('if the sentence type is "bailPlacement" then the items should be correct', () => {
        const items = new Situation(
          { situation: 'bailAssessment' },
          { 'basic-information': { 'sentence-type': { sentenceType: 'bailPlacement' } } },
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
      const page = new Situation({ situation: 'riskManagement' }, session)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(1)
      expect(selectedOptions[0].value).toEqual('riskManagement')
    })

    it('marks no options as selected when the releaseType is not set', () => {
      const page = new Situation({}, session)

      const selectedOptions = page.items().filter(item => item.checked)

      expect(selectedOptions.length).toEqual(0)
    })
  })
})
