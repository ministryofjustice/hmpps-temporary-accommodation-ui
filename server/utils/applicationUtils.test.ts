import applicationFactory from '../testutils/factories/application'
import { tierEnvelopeFactory } from '../testutils/factories/risks'
import paths from '../paths/apply'
import Apply from '../form-pages/apply'
import Assess from '../form-pages/assess'
import { DateFormats } from './dateUtils'
import { tierBadge, isApplicableTier } from './personUtils'

import {
  getResponses,
  getPage,
  getArrivalDate,
  dashboardTableRows,
  firstPageOfApplicationJourney,
  isUnapplicable,
  getStatus,
} from './applicationUtils'
import { SessionDataError, UnknownPageError } from './errors'

const FirstApplyPage = jest.fn()
const SecondApplyPage = jest.fn()
const AssessPage = jest.fn()

jest.mock('../form-pages/apply', () => {
  return {
    pages: { 'basic-information': {}, 'type-of-ap': {} },
  }
})

jest.mock('../form-pages/assess', () => {
  return {
    pages: { 'assess-page': {} },
  }
})

jest.mock('./personUtils')

Apply.pages['basic-information'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

Assess.pages['assess-page'] = {
  first: AssessPage,
}

describe('applicationUtils', () => {
  describe('getResponses', () => {
    it('returns the responses from all answered questions', () => {
      FirstApplyPage.mockReturnValue({
        response: () => {
          return { foo: 'bar' }
        },
      })

      SecondApplyPage.mockReturnValue({
        response: () => {
          return { bar: 'foo' }
        },
      })

      const application = applicationFactory.build()
      application.data = { 'basic-information': { first: '', second: '' } }

      expect(getResponses(application)).toEqual({ 'basic-information': [{ foo: 'bar' }, { bar: 'foo' }] })
    })
  })

  describe('getPage', () => {
    it('should return a page from Apply if it exists', () => {
      expect(getPage('basic-information', 'first')).toEqual(FirstApplyPage)
      expect(getPage('basic-information', 'second')).toEqual(SecondApplyPage)
    })

    it('should return a page from assess if passed the option', () => {
      expect(getPage('assess-page', 'first', true)).toEqual(AssessPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('basic-information', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('getArrivalDate', () => {
    it('returns the arrival date when the release date is known and is the same as the start date', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
            'placement-date': { startDateSameAsReleaseDate: 'yes' },
          },
        },
      })
      expect(getArrivalDate(application)).toEqual('2022-11-14')
    })

    it('returns the arrival date when the release date is known but there is a different start date', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'yes', releaseDate: '2022-11-14' },
            'placement-date': { startDateSameAsReleaseDate: 'no', startDate: '2023-10-13' },
          },
        },
      })

      expect(getArrivalDate(application)).toEqual('2023-10-13')
    })

    it('throws an error or returns null when the release date is not known', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': {
            'release-date': { knowReleaseDate: 'no' },
          },
        },
      })

      expect(() => getArrivalDate(application)).toThrow(new SessionDataError('No known release date'))
      expect(getArrivalDate(application, false)).toEqual(null)
    })
  })

  describe('dashboardTableRows', () => {
    it('returns an array of applications as table rows', async () => {
      ;(tierBadge as jest.Mock).mockReturnValue('TIER_BADGE')
      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const applicationA = applicationFactory.build({
        person: { name: 'A' },
        data: {},
        submittedAt: null,
        risks: { tier: tierEnvelopeFactory.build({ value: { level: 'A1' } }) },
      })
      const applicationB = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'A' },
        risks: { tier: tierEnvelopeFactory.build({ value: { level: null } }) },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(tierBadge).toHaveBeenCalledWith('A1')

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>${applicationA.person.name}</a>`,
          },
          {
            text: applicationA.person.crn,
          },
          {
            html: 'TIER_BADGE',
          },
          {
            text: 'N/A',
          },
          {
            html: getStatus(applicationB),
          },
        ],
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationB.id })}>${applicationB.person.name}</a>`,
          },
          {
            text: applicationB.person.crn,
          },
          {
            html: 'TIER_BADGE',
          },
          {
            text: DateFormats.isoDateToUIDate(arrivalDate, { format: 'short' }),
          },
          {
            html: getStatus(applicationB),
          },
        ],
      ])
    })
  })

  describe('getStatus', () => {
    it('returns the correct tag for each status', () => {
      const inProgressApplication = applicationFactory.build({ status: 'inProgress' })
      const submittedApplication = applicationFactory.build({ status: 'submitted' })
      const informationRequestedApplication = applicationFactory.build({ status: 'requestedFurtherInformation' })

      expect(getStatus(inProgressApplication)).toEqual('<strong class="govuk-tag govuk-tag--blue">In Progress</strong>')
      expect(getStatus(submittedApplication)).toEqual('<strong class="govuk-tag">Submitted</strong>')
      expect(getStatus(informationRequestedApplication)).toEqual(
        '<strong class="govuk-tag govuk-tag--yellow">Info Request</strong>',
      )
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page for an applicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'sentence-type' }),
      )
    })

    it('returns the is exceptional case page for an unapplicable application', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(false)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(
        paths.applications.pages.show({ id: application.id, task: 'basic-information', page: 'is-exceptional-case' }),
      )
    })
  })

  describe('isUnapplicable', () => {
    const application = applicationFactory.build()

    it('should return true if the applicant has answered no to the isExceptionalCase question', () => {
      application.data = {
        'basic-information': {
          'is-exceptional-case': {
            isExceptionalCase: 'no',
          },
        },
      }

      expect(isUnapplicable(application)).toEqual(true)
    })

    it('should return false if the applicant has answered yes to the isExceptionalCase question', () => {
      application.data = {
        'basic-information': {
          'is-exceptional-case': {
            isExceptionalCase: 'yes',
          },
        },
      }

      expect(isUnapplicable(application)).toEqual(false)
    })

    it('should return false if the applicant has not answered the isExceptionalCase question', () => {
      expect(isUnapplicable(application)).toEqual(false)
    })
  })
})
