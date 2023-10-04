import Apply from '../form-pages/apply'
import Assess from '../form-pages/assess'
import paths from '../paths/apply'
import { applicationFactory, personFactory } from '../testutils/factories'
import { DateFormats } from './dateUtils'
import { isApplicableTier, personName, tierBadge } from './personUtils'

import { FullPerson } from '../@types/shared'
import {
  createNameAnchorElement,
  dashboardTableRows,
  firstPageOfApplicationJourney,
  forPagesInTask,
  getArrivalDate,
  getPage,
  getResponses,
  getSectionAndTask,
  getStatus,
  retrieveQuestionResponseFromApplication,
  taskResponsesToSummaryListRowItems,
} from './applicationUtils'
import getSections from './assessments/getSections'
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
jest.mock('./assessments/getSections')

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

const applyData = {
  'first-apply-section-task-1': {
    first: 'some-data',
    second: 'some-data',
  },
}

describe('applicationUtils', () => {
  describe('getResponses', () => {
    it('returns the responses from all answered questions', () => {
      ;(getSections as jest.MockedFunction<typeof getSections>).mockReturnValue([applySection1, applySection2])

      FirstApplyPage.mockReturnValue({
        response: () => ({ foo: 'bar' }),
        next: () => 'second',
        errors: () => ({}),
      })

      SecondApplyPage.mockReturnValue({
        response: () => ({ bar: 'foo' }),
        next: () => '',
        errors: () => ({}),
      })

      const application = applicationFactory.build({ data: applyData })

      expect(getResponses(application)).toEqual({
        sections: [
          {
            title: 'First Apply section',
            tasks: [
              {
                title: 'First Apply section, task 1',
                id: 'first-apply-section-task-1',
                content: [
                  {
                    foo: 'bar',
                  },
                  { bar: 'foo' },
                ],
              },
            ],
          },
        ],
      })
      expect(getSections).toHaveBeenCalledWith(application, true)
    })
  })

  describe('forPagesInTask', () => {
    it('iterates through the pages of a task', () => {
      const firstApplyPageInstance = {
        next: () => 'second',
        errors: () => ({}),
      }
      const secondApplyPageInstance = {
        next: () => '',
        errors: () => ({}),
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      SecondApplyPage.mockReturnValue(secondApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build({ data: applyData })

      forPagesInTask(application, applySection1Task1, spy)

      expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
      expect(spy).toHaveBeenCalledWith(secondApplyPageInstance, 'second')
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('skips tasks that are not part of the user journey', () => {
      const firstApplyPageInstance = {
        next: () => '',
        errors: () => ({}),
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build({ data: applyData })
      forPagesInTask(application, applySection1Task1, spy)

      expect(spy).toHaveBeenCalledWith(firstApplyPageInstance, 'first')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('throws an error if a page has no data', () => {
      const firstApplyPageInstance = {
        next: () => '',
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build()

      expect(() => forPagesInTask(application, applySection1Task1, spy)).toThrow(
        new SessionDataError('No data for page first-apply-section-task-1:first'),
      )

      expect(spy).not.toHaveBeenCalled()
    })

    it('throws an error if a page has errors', () => {
      const firstApplyPageInstance = {
        next: () => '',
        errors: () => ({
          'some-error': 'Error message',
        }),
      }

      FirstApplyPage.mockReturnValue(firstApplyPageInstance)
      const spy = jest.fn()

      const application = applicationFactory.build({
        data: {
          'first-apply-section-task-1': {
            first: 'some-data',
          },
        },
      })

      expect(() => forPagesInTask(application, applySection1Task1, spy)).toThrow(
        new SessionDataError('Errors for page first-apply-section-task-1:first'),
      )

      expect(spy).not.toHaveBeenCalled()
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
      ;(tierBadge as jest.MockedFunction<typeof tierBadge>).mockReturnValue('TIER_BADGE')
      ;(personName as jest.MockedFunction<typeof personName>).mockImplementation(person => (person as FullPerson).name)

      const arrivalDate = DateFormats.dateObjToIsoDate(new Date(2021, 0, 3))

      const applicationA = applicationFactory.build({
        person: personFactory.build({ name: 'A' }),
        data: {},
        submittedAt: null,
      })
      const applicationB = applicationFactory.withReleaseDate(arrivalDate).build({
        person: personFactory.build({ name: 'B' }),
      })

      const result = dashboardTableRows([applicationA, applicationB])

      expect(result).toEqual([
        [
          {
            html: `<a href=${paths.applications.show({ id: applicationA.id })}>A</a>`,
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
            html: `<a href=${paths.applications.show({ id: applicationB.id })}>B</a>`,
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
      expect(personName).toHaveBeenCalledWith(applicationA.person, 'Limited access offender')
      expect(personName).toHaveBeenCalledWith(applicationB.person, 'Limited access offender')
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

  describe('retrieveQuestionResponseFromApplication', () => {
    it("throws a SessionDataError if the property doesn't exist", () => {
      const application = applicationFactory.build()
      expect(() => retrieveQuestionResponseFromApplication(application, 'basic-information', '')).toThrow(
        SessionDataError,
      )
    })

    it('returns the property if it does exist and a question is not provided', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': { 'my-page': { myPage: 'no' } },
        },
      })

      const questionResponse = retrieveQuestionResponseFromApplication(application, 'basic-information', 'myPage')
      expect(questionResponse).toBe('no')
    })

    it('returns the property if it does exist and a question is provided', () => {
      const application = applicationFactory.build({
        data: {
          'basic-information': { 'my-page': { questionResponse: 'no' } },
        },
      })

      const questionResponse = retrieveQuestionResponseFromApplication(
        application,
        'basic-information',
        'myPage',
        'questionResponse',
      )
      expect(questionResponse).toBe('no')
    })
  })

  describe('taskResponsesToSummaryListRowItems', () => {
    it('returns an array of summary list row items', () => {
      const taskResponses = [
        { 'question one': 'answer one' },
        { 'question two': 'answer two', 'question three': 'answer three' },
      ]

      expect(taskResponsesToSummaryListRowItems(taskResponses)).toEqual([
        {
          key: { text: 'question one' },
          value: { html: 'answer one' },
        },
        {
          key: { text: 'question two' },
          value: { html: 'answer two' },
        },
        {
          key: { text: 'question three' },
          value: { html: 'answer three' },
        },
      ])
    })
  })

  describe('createNameAnchorElement', () => {
    it('returns the name in an anchor tag to the application show page', () => {
      const application = applicationFactory.build({ status: 'inProgress' })

      expect(createNameAnchorElement('Limited access offender', application)).toEqual({
        html: `<a href=/referrals/${application.id}>Limited access offender</a>`,
      })
    })

    describe('when the application has submitted status', () => {
      it('returns the name in an anchor tag to the full application page', () => {
        const application = applicationFactory.build({
          status: 'submitted',
        })

        expect(createNameAnchorElement('Limited access offender', application)).toEqual({
          html: `<a href=/referrals/${application.id}/full>Limited access offender</a>`,
        })
      })
    })
  })
})
