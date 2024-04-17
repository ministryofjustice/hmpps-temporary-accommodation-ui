import { applicationFactory } from '../../../../testutils/factories'
import HistoryOfArsonOffence from './historyOfArsonOffence'

const body = {
  historyOfArsonOffence: 'yes' as const,
}

describe('HistoryOfArsonOffence', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new HistoryOfArsonOffence(body, application)

      expect(page.body).toEqual(body)
    })
  })

  describe('previous', () => {
    it('returns the registered sex offender page ID when there is history of sexual offence', () => {
      const page = new HistoryOfArsonOffence(
        body,
        applicationFactory.build({
          data: { 'offence-and-behaviour-summary': { 'history-of-sexual-offence': { historyOfSexualOffence: 'yes' } } },
        }),
      )

      expect(page.previous()).toEqual('registered-sex-offender')
    })

    it('returns the concerning sexual behaviour page ID when there is no history of sexual offence', () => {
      const page = new HistoryOfArsonOffence(
        body,
        applicationFactory.build({
          data: { 'offence-and-behaviour-summary': { 'history-of-sexual-offence': { historyOfSexualOffence: 'no' } } },
        }),
      )

      expect(page.previous()).toEqual('concerning-sexual-behaviour')
    })
  })

  describe('next', () => {
    it('returns empty when the person has had a conviction', () => {
      expect(
        new HistoryOfArsonOffence(
          {
            ...body,
            historyOfArsonOffence: 'yes',
          },
          application,
        ).next(),
      ).toEqual('')
    })

    it('returns the arson behaviour concerns page ID when the person has not had a conviction', () => {
      expect(
        new HistoryOfArsonOffence(
          {
            ...body,
            historyOfArsonOffence: 'no',
          },
          application,
        ).next(),
      ).toEqual('concerning-arson-behaviour')
    })
  })

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new HistoryOfArsonOffence(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the sexual offence conviction field is not populated', () => {
      const page = new HistoryOfArsonOffence({ ...body, historyOfArsonOffence: undefined }, application)
      expect(page.errors()).toEqual({
        historyOfArsonOffence: 'Select yes if the person has ever been convicted of arson',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new HistoryOfArsonOffence(body, application)
      expect(page.response()).toEqual({
        'Has the person ever been convicted of arson?': 'Yes',
      })
    })
  })
})
