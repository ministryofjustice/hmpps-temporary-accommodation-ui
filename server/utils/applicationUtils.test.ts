import Apply from '../form-pages/apply'
import Assess from '../form-pages/assess'
import paths from '../paths/apply'
import { applicationFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import { isApplicableTier, tierBadge } from './personUtils'

import {
  dashboardTableRows,
  firstPageOfApplicationJourney,
  forPagesInTask,
  getArrivalDate,
  getPage,
  getResponses,
  getSectionAndTask,
  getStatus,
  isUnapplicable,
} from './applicationUtils'
import { SessionDataError, UnknownPageError, UnknownTaskError } from './errors'

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

const applySection1Task1 = {
  id: 'first-apply-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {
    first: FirstApplyPage,
    second: SecondApplyPage,
  },
}
const applySection1Task2 = {
  id: 'first-apply-section-task-2',
  title: 'First Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection2Task1 = {
  id: 'second-apply-section-task-1',
  title: 'Second Apply section, task 1',
  actionText: '',
  pages: {},
}

const applySection2Task2 = {
  id: 'second-apply-section-task-2',
  title: 'Second Apply section, task 2',
  actionText: '',
  pages: {},
}

const applySection1 = {
  name: 'first-apply-section',
  title: 'First Apply section',
  tasks: [applySection1Task1, applySection1Task2],
}

const applySection2 = {
  name: 'second-apply-section',
  title: 'Second Apply section',
  tasks: [applySection2Task1, applySection2Task2],
}

Apply.sections = [applySection1, applySection2]

Apply.pages['first-apply-section-task-1'] = {
  first: FirstApplyPage,
  second: SecondApplyPage,
}

const assessSection1Task1 = {
  id: 'first-assess-section-task-1',
  title: 'First Apply section, task 1',
  actionText: '',
  pages: {},
}
const assessSection1Task2 = {
  id: 'first-assess-section-task-2',
  title: 'First Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection2Task1 = {
  id: 'second-assess-section-task-1',
  title: 'Second Assess section, task 1',
  actionText: '',
  pages: {},
}

const assessSection2Task2 = {
  id: 'second-assess-section-task-2',
  title: 'Second Assess section, task 2',
  actionText: '',
  pages: {},
}

const assessSection1 = {
  name: 'first-assess-section',
  title: 'First Assess section',
  tasks: [assessSection1Task1, assessSection1Task2],
}

const assessSection2 = {
  name: 'second-assess-section',
  title: 'Second Assess section',
  tasks: [assessSection2Task1, assessSection2Task2],
}

Assess.sections = [assessSection1, assessSection2]

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

  describe('forPagesInTask', () => {
    it('iterates through the pages of a task', () => {
      const firstApplyPageInstance = {
        next: () => 'second',
      }
      const secondApplyPageInstance = {
        next: () => '',
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      SecondApplyPage.mockReturnValue(secondApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build()

      forPagesInTask(application, applySection1Task1, spy)

      expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
      expect(spy).toHaveBeenCalledWith(secondApplyPageInstance, 'second')
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('skips tasks that are not part of the user journey', () => {
      const firstApplyPageInstance = {
        next: () => '',
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build()

      forPagesInTask(application, applySection1Task1, spy)

      expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
      expect(spy).toHaveBeenCalledTimes(1)
    })
  })

  describe('getPage', () => {
    it('should return a page from Apply if it exists', () => {
      expect(getPage('first-apply-section-task-1', 'first')).toEqual(FirstApplyPage)
      expect(getPage('first-apply-section-task-1', 'second')).toEqual(SecondApplyPage)
    })

    it('should return a page from Assess if passed the option', () => {
      expect(getPage('assess-page', 'first', true)).toEqual(AssessPage)
    })

    it('should raise an error if the page is not found', async () => {
      expect(() => {
        getPage('first-apply-section-task-1', 'bar')
      }).toThrow(UnknownPageError)
    })
  })

  describe('getSectionAndTask', () => {
    it('should return a section and task from Apply if it exists', () => {
      expect(getSectionAndTask('first-apply-section-task-2')).toEqual({
        section: applySection1,
        task: applySection1Task2,
      })
    })

    it('should return a page from Assess if passed the option', () => {
      expect(getSectionAndTask('second-assess-section-task-1', true)).toEqual({
        section: assessSection2,
        task: assessSection2Task1,
      })
    })

    it('should raise an error if the task is not found', async () => {
      expect(() => {
        getSectionAndTask('unknown-task')
      }).toThrow(UnknownTaskError)
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
      })
      const applicationB = applicationFactory.withReleaseDate(arrivalDate).build({
        person: { name: 'A' },
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>${applicationA.person.name}</a>`,
          },
          {
            text: applicationA.person.crn,
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

      expect(getStatus(inProgressApplication)).toEqual('<strong class="govuk-tag govuk-tag--blue">In Progress</strong>')
      expect(getStatus(submittedApplication)).toEqual('<strong class="govuk-tag">Submitted</strong>')
    })
  })

  describe('firstPageOfApplicationJourney', () => {
    it('returns the sentence type page', () => {
      ;(isApplicableTier as jest.Mock).mockReturnValue(true)
      const application = applicationFactory.build()

      expect(firstPageOfApplicationJourney(application)).toEqual(paths.applications.show({ id: application.id }))
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
