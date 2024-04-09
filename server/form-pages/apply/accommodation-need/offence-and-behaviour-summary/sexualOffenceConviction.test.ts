import { applicationFactory } from '../../../../testutils/factories'
import SexualOffenceConviction from './sexualOffenceConviction'
import { itShouldHavePreviousValue } from '../../../shared-examples'

const body = { sexualOffenceConviction: 'yes' as const }

describe('SexualOffenceConviction', () => {
  const application = applicationFactory.build()

  describe('body', () => {
    it('sets the body', () => {
      const page = new SexualOffenceConviction(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new SexualOffenceConviction({}, application), 'dashboard')

  describe('next', () => {
    it('returns the registered sex offender page ID when the person has had a conviction', () => {
      expect(
        new SexualOffenceConviction(
          {
            ...body,
            sexualOffenceConviction: 'yes',
          },
          application,
        ).next(),
      ).toEqual('registered-sex-offender')
    })

    it('returns the sexual behaviour concerns page ID when the person has not had a conviction', () => {
      expect(
        new SexualOffenceConviction(
          {
            ...body,
            sexualOffenceConviction: 'no',
          },
          application,
        ).next(),
      ).toEqual('sexual-behaviour-concerns')
    })
  })

  describe('errors', () => {
    it('returns an empty object if all fields are populated', () => {
      const page = new SexualOffenceConviction(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the sexual offence conviction field is not populated', () => {
      const page = new SexualOffenceConviction({ ...body, sexualOffenceConviction: undefined }, application)
      expect(page.errors()).toEqual({
        sexualOffenceConviction: 'Select yes if the person has ever been convicted of a sexual offence',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      const page = new SexualOffenceConviction(body, application)
      expect(page.response()).toEqual({
        'Has the person ever been convicted of a sexual offence?': 'Yes',
      })
    })
  })
})
