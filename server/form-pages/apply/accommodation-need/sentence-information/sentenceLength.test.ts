import { applicationFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'

import SentenceLength from './sentenceLength'

const body = { years: '0', months: '', weeks: '12', days: '1' }

describe('SentenceLength', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('should set the body', () => {
      const page = new SentenceLength(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new SentenceLength({}, application), 'sentence-type')
  itShouldHaveNextValue(new SentenceLength({}, application), 'sentence-expiry')

  describe('errors', () => {
    it('should return an empty object if the sentence length is populated', () => {
      const page = new SentenceLength(body, application)
      expect(page.errors()).toEqual({})
    })

    it('should return an error if the sentence length is not populated', () => {
      const page = new SentenceLength({}, application)
      expect(page.errors()).toEqual({ lengthComponents: 'You must specify the sentence length' })
    })

    it('should return an error if the sentence length is zero', () => {
      const page = new SentenceLength({ years: '0', days: '0' }, application)
      expect(page.errors()).toEqual({ lengthComponents: 'You must specify a valid sentence length' })
    })

    it('should return an error if the sentence length is not a number', () => {
      const page = new SentenceLength({ years: '1', months: '0', weeks: 'seven', days: '12' }, application)
      expect(page.errors()).toEqual({ lengthComponents: 'The sentence length must be a number, like 2' })
    })
  })

  describe('response', () => {
    it('should return a translated version of the response', () => {
      const page = new SentenceLength(body, application)

      expect(page.response()).toEqual({ [page.title]: '12 weeks, 1 day' })
    })
  })
})
