import { applicationFactory } from '../../../../testutils/factories'
import HistoryOfSexualOffence from './historyOfSexualOffence'
import { itShouldHavePreviousValue } from '../../../shared-examples'

const body = { historyOfSexualOffence: 'yes' as const }

describe('HistoryOfSexualOffence', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new HistoryOfSexualOffence(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new HistoryOfSexualOffence({}, application), 'dashboard')

  describe('next', () => {
    it('returns the registered sex offender page ID when the person has had a conviction', () => {
      expect(
        new HistoryOfSexualOffence(
          {
            ...body,
            historyOfSexualOffence: 'yes',
          },
          application,
        ).next(),
      ).toEqual('registered-sex-offender')
    })

    it('returns the sexual behaviour concerns page ID when the person has not had a conviction', () => {
      expect(
        new HistoryOfSexualOffence(
          {
            ...body,
            historyOfSexualOffence: 'no',
          },
          application,
        ).next(),
      ).toEqual('concerning-sexual-behaviour')
    })
  })

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new HistoryOfSexualOffence(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the sexual offence conviction field is not populated', () => {
      const page = new HistoryOfSexualOffence({ ...body, historyOfSexualOffence: undefined }, application)
      expect(page.errors()).toEqual({
        historyOfSexualOffence: 'Select yes if the person has ever been convicted of a sexual offence',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new HistoryOfSexualOffence(body, application)
      expect(page.response()).toEqual({
        'Has the person ever been convicted of a sexual offence?': 'Yes',
      })
    })
  })
})
