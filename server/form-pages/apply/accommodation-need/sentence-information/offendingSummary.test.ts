import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import OffendingSummary from './offendingSummary'

const body = { summary: 'Offending summary' }

describe('OffendingSummary', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new OffendingSummary(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('title', () => {
    it('sets the body', () => {
      const page = new OffendingSummary(body, application)

      expect(page.title).toEqual("Provide a brief summary of John Smith's offending history")
    })
  })

  itShouldHavePreviousValue(new OffendingSummary({}, application), 'dashboard')
  itShouldHaveNextValue(new OffendingSummary({}, application), 'sentence-type')

  describe('errors', () => {
    it('returns an empty object if the summary is defined', () => {
      const page = new OffendingSummary(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the plan is not populated', () => {
      const page = new OffendingSummary({ ...body, summary: undefined }, application)
      expect(page.errors()).toEqual({ summary: "You must enter a summary of John Smith's offending history" })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new OffendingSummary(body, application)

      expect(page.response()).toEqual({
        'Offence ID': application.offenceId,
        'Summary of offending history': 'Offending summary',
      })
    })
  })
})
