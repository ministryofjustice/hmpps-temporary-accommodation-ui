import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import 'reflect-metadata'

// Use a wildcard import to allow us to use jest.spyOn on functions within this module
import { TemporaryAccommodationApplication } from '../../@types/shared'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'
import * as utils from './index'

import type { FormSection, FormSections, PageResponse, Task as TaskType } from '../../@types/ui'
import {
  acctAlertFactory,
  adjudicationFactory,
  applicationFactory,
  assessmentFactory,
  flagsFactory,
  mappaFactory,
  risksFactory,
  roshRisksFactory,
} from '../../testutils/factories'
import { SessionDataError } from '../../utils/errors'
import { Page, Section, Task } from './decorators'

describe('utils', () => {
  describe('applyYesOrNo', () => {
    it('returns a keypair of a yes/no answer and details', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(utils.applyYesOrNo('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })

    it('accepts a generic', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail', something: 'else' }

      expect(utils.applyYesOrNo<'foo' | 'bar'>('foo', body)).toEqual({ foo: 'yes', fooDetail: 'Some Detail' })
    })
  })

  describe('yesOrNoResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes' as const, fooDetail: 'Some Detail' }

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' as const }

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('No')
    })
  })

  describe('yesNoOrDontKnowResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes' as const, fooDetail: 'Some Detail' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns No if the answer is no', () => {
      const body = { foo: 'no' as const }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('No')
    })

    it("returns Don't know if the answer is iDontKnow", () => {
      const body = { foo: 'iDontKnow' as const }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual("Don't know")
    })
  })

  describe('yesNoOrDontKnowResponse', () => {
    it('returns Yes if the answer is yes', () => {
      const body = { foo: 'yes' as const, fooDetail: '' }

      expect(utils.yesNoOrDontKnowResponse('foo', body)).toEqual('Yes')
    })

    it('returns No if the answer is yes', () => {
      const body = { foo: 'no' as const }

      expect(utils.yesNoOrDontKnowResponse('foo', body)).toEqual('No')
    })

    it('returns "Don\'t know" if the answer is iDontKnow', () => {
      const body = { foo: 'iDontKnow' as const }

      expect(utils.yesNoOrDontKnowResponse('foo', body)).toEqual("Don't know")
    })
  })

  describe('Decorator metadata utils', () => {
    @Page({ bodyProperties: [], name: 'page-1' })
    class Page1 implements TasklistPage {
      title: string

      htmlDocumentTitle: string

      body: Record<string, unknown>

      previous(): string {
        throw new Error('Method not implemented.')
      }

      next(): string {
        throw new Error('Method not implemented.')
      }

      errors(): Partial<Record<keyof this['body'], unknown>> {
        throw new Error('Method not implemented.')
      }

      response(): PageResponse {
        throw new Error('Method not implemented.')
      }
    }

    @Page({ bodyProperties: [], name: 'page-2' })
    class Page2 extends Page1 {}

    @Page({ bodyProperties: [], name: 'page-3' })
    class Page3 extends Page1 {}

    @Page({ bodyProperties: [], name: 'page-4' })
    class Page4 extends Page1 {}

    @Task({ actionText: 'Task action text', name: 'Task name', pages: [Page1, Page2], slug: 'task-slug' })
    class SomeTask {}

    @Task({
      actionText: 'Other task action text',
      name: 'Other task name',
      pages: [Page3, Page4],
      slug: 'other-task-slug',
    })
    class SomeOtherTask {}

    @Section({ title: 'Section', tasks: [SomeTask] })
    class SomeSection {}

    @Section({ title: 'Another Section', tasks: [SomeOtherTask] })
    class SomeOtherSection {}

    describe('getTask', () => {
      it('fetches metadata for a specific task and pages', () => {
        expect(utils.getTask(SomeTask)).toEqual({
          id: 'task-slug',
          title: 'Task name',
          actionText: 'Task action text',
          pages: { 'page-1': Page1, 'page-2': Page2 },
        })
      })
    })

    describe('getSection', () => {
      it('fetches metadata for a specific section and tasks', () => {
        expect(utils.getSection(SomeSection)).toEqual({
          title: 'Section',
          name: 'SomeSection',
          tasks: [utils.getTask(SomeTask)],
        })
      })
    })

    describe('getPagesForSections', () => {
      it('fetches pages for all supplied sections', () => {
        expect(utils.getFormPages([SomeSection, SomeOtherSection] as unknown as FormSections)).toEqual({
          'task-slug': {
            'page-1': Page1,
            'page-2': Page2,
          },
          'other-task-slug': {
            'page-3': Page3,
            'page-4': Page4,
          },
        })
      })
    })

    describe('viewPath', () => {
      it('returns the view path for a page', () => {
        const page1 = new Page1()
        const page2 = new Page2()

        const task = {
          id: 'some-task',
        } as TaskType

        const section = {
          name: 'Some section',
        } as FormSection

        expect(utils.viewPath(section, task, page1 as TasklistPage, 'applications')).toEqual(
          'applications/pages/some-section/some-task/page-1',
        )
        expect(utils.viewPath(section, task, page2 as TasklistPage, 'assessments')).toEqual(
          'assessments/pages/some-section/some-task/page-2',
        )
      })
    })

    describe('getPageName', () => {
      it('returns the page name', () => {
        expect(utils.getPageName(Page1)).toEqual('page-1')
      })
    })

    describe('getTaskName', () => {
      it('returns the task name', () => {
        expect(utils.getTaskName(Page1)).toEqual('task-slug')
      })
    })
  })

  describe('getBody', () => {
    it('if there is userInput it returns it', () => {
      const input = { user: 'input' }

      expect(
        utils.getBody({} as TasklistPageInterface, {} as TemporaryAccommodationApplication, {} as Request, input),
      ).toEqual(input)
    })

    it('if there isnt userInput and there is a request body the request body is returned', () => {
      const request: DeepMocked<Request> = createMock<Request>()

      expect(utils.getBody({} as TasklistPageInterface, {} as TemporaryAccommodationApplication, request, {}))
    })

    it('if there is neither a request body or userInput then getPageFromApplicationData is called and returns the data for that page', () => {
      const page: DeepMocked<TasklistPageInterface> = createMock<TasklistPageInterface>()
      const pageData = { task: { page: 'returnMe' } }
      const application = applicationFactory.build({ data: pageData })

      jest.spyOn(utils, 'getPageName').mockImplementation(() => 'page')
      jest.spyOn(utils, 'getTaskName').mockImplementation(() => 'task')

      jest.spyOn(utils, 'getPageDataFromApplication').mockImplementation((_, applicationInput) => applicationInput.data)

      expect(utils.getBody(page, application, { body: {} } as Request, {})).toBe('returnMe')
    })
  })

  describe('updateAssessmentData', () => {
    const page = createMock<TasklistPage>({
      body: { foo: 'bar' },
    })

    beforeEach(() => {
      ;(utils.getPageName as jest.Mock).mockReturnValue('some-page')
      ;(utils.getTaskName as jest.Mock).mockReturnValue('some-task')
    })

    it('returns an assessment with an updated body', () => {
      const assessment = assessmentFactory.build()
      assessment.data = { 'first-task': { page: { foo: 'bar' } } }

      const updatedAssessment = utils.updateAssessmentData(page, assessment)

      expect(updatedAssessment.data).toEqual({
        'first-task': {
          page: {
            foo: 'bar',
          },
        },
        'some-task': {
          'some-page': {
            foo: 'bar',
          },
        },
      })
    })
  })

  describe('generateResponsesForYesNoAndCommentsSections ', () => {
    it('generates the responses given the sections and body', () => {
      expect(
        utils.responsesForYesNoAndCommentsSections({ questionName: 'question copy' }, { questionName: 'response' }),
      ).toEqual({
        'question copy': 'Response',
      })
    })
  })

  describe('getProbationPractitionerName', () => {
    it('returns the probation practioner name when present in the application', () => {
      const application = applicationFactory.build({
        data: {
          'contact-details': {
            'probation-practitioner': { name: 'Some Name' },
          },
        },
      })
      expect(utils.getProbationPractitionerName(application)).toEqual('Some Name')
    })

    it('throws an error when the probation practitioner name is not known', () => {
      const application = applicationFactory.build({
        data: {
          'contact-details': {},
        },
      })

      expect(() => utils.getProbationPractitionerName(application)).toThrow(
        new SessionDataError('No probation practitioner name'),
      )
    })
  })

  describe('hasSubmittedDtr', () => {
    it('returns true when the DTR has been submitted in the application', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {
            'dtr-submitted': { dtrSubmitted: 'yes' },
          },
        },
      })
      expect(utils.hasSubmittedDtr(application)).toEqual(true)
    })

    it('returns false when the DTR has not been submitted in the application', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {
            'dtr-submitted': { dtrSubmitted: 'no' },
          },
        },
      })
      expect(utils.hasSubmittedDtr(application)).toEqual(false)
    })

    it('throws an error when the DTR submitted page has not been completed', () => {
      const application = applicationFactory.build({
        data: {
          'accommodation-referral-details': {},
        },
      })

      expect(() => utils.hasSubmittedDtr(application)).toThrow(new SessionDataError('No DTR submitted value'))
    })
  })

  describe('arrivalDateFromApplication', () => {
    it('returns the arrival date when present in the application', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: { 'accommodation-required-from-date': { accommodationRequiredFromDate: 'Some Date' } },
        },
      })
      expect(utils.arrivalDateFromApplication(application)).toEqual('Some Date')
    })

    it('throws an error when the arrival date is not known', () => {
      const application = applicationFactory.build({
        data: {
          eligibility: {},
        },
      })

      expect(() => utils.arrivalDateFromApplication(application)).toThrow(new SessionDataError('No arrival date'))
    })
  })

  describe('dateBodyProperties', () => {
    it('returns date field names for use in page body properties', () => {
      expect(utils.dateBodyProperties('someDate')).toEqual([
        'someDate',
        'someDate-year',
        'someDate-month',
        'someDate-day',
      ])
    })
  })

  describe('pageBodyShallowEquals', () => {
    it('returns true when the two parameters are equal', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(true)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(true)
    })

    it('returns false when the one parameter is a subset of the other', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      const value2 = {
        'some-key': 'some-value',
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })

    it('returns false when one parameter contains a different array to the other', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2', 'value3'],
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': ['value1', 'value2'],
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })

    it('returns false when parameters contains an inner object', () => {
      const value1 = {
        'some-key': 'some-value',
        'some-key-2': { 'inner-key': 'inner-value' },
      }

      const value2 = {
        'some-key': 'some-value',
        'some-key-2': { 'inner-key': 'inner-value' },
      }

      expect(utils.pageBodyShallowEquals(value1, value2)).toEqual(false)
      expect(utils.pageBodyShallowEquals(value2, value1)).toEqual(false)
    })
  })

  describe('mapAdjudicationsForPageBody', () => {
    it('returns adjucations with any extra data removed', () => {
      const adjudication1 = adjudicationFactory.build()
      const adjudication2 = adjudicationFactory.build()
      const adjudication3 = adjudicationFactory.build()

      const adjudicationWithExtraInfo = { ...adjudication2, 'some-extra-field': 'some extra data' }

      expect(utils.mapAdjudicationsForPageBody([adjudication1, adjudicationWithExtraInfo, adjudication3])).toEqual([
        adjudication1,
        adjudication2,
        adjudication3,
      ])
    })

    it('returns adjucations with missing findings replaced with an empty string', () => {
      const adjudication1 = adjudicationFactory.build()
      const adjudication2 = adjudicationFactory.build({
        finding: null,
      })
      const adjudication3 = adjudicationFactory.build()

      expect(utils.mapAdjudicationsForPageBody([adjudication1, adjudication2, adjudication3])).toEqual([
        adjudication1,
        { ...adjudication2, finding: '' },
        adjudication3,
      ])
    })
  })

  describe('mapAcctAlertsForPageBody', () => {
    it('returns ACCT alerts with any extra data removed', () => {
      const acctAlert1 = acctAlertFactory.build()
      const acctAlert2 = acctAlertFactory.build()
      const acctAlert3 = acctAlertFactory.build()

      const acctAlertWithExtraInfo = { ...acctAlert2, 'some-extra-field': 'some extra data' }

      expect(utils.mapAcctAlertsForPageBody([acctAlert1, acctAlertWithExtraInfo, acctAlert3])).toEqual([
        acctAlert1,
        acctAlert2,
        acctAlert3,
      ])
    })

    it('returns ACCT alerts with missing comments and expiry dates replaced with an empty string', () => {
      const acctAlert1 = acctAlertFactory.build()
      const acctAlert2 = acctAlertFactory.build({
        comment: null,
      })
      const acctAlert3 = acctAlertFactory.build({
        dateExpires: null,
      })

      expect(utils.mapAcctAlertsForPageBody([acctAlert1, acctAlert2, acctAlert3])).toEqual([
        acctAlert1,
        { ...acctAlert2, comment: '' },
        { ...acctAlert3, dateExpires: '' },
      ])
    })
  })
})

describe('personRisksRoshResponse', () => {
  it('returns a page response for risks with a populated RoSH object', () => {
    const risks = risksFactory.retrived().build({
      roshRisks: roshRisksFactory.build({
        status: 'retrieved',
        value: {
          overallRisk: 'High',
          riskToChildren: '',
          riskToPublic: '',
          riskToKnownAdult: 'Low',
          riskToStaff: 'Very High',
        },
      }),
    })

    expect(utils.personRisksRoshResponse(risks)).toEqual({
      'Risk of serious harm': [
        {
          'Overall risk of serious harm': 'High',
          'Risk to children': 'Not known',
          'Risk to public': 'Not known',
          'Risk to known adult': 'Low',
          'Risk to staff': 'Very high',
        },
      ],
    })
  })

  it('returns a page response for risks with an unpopulated RoSH value', () => {
    const risks = risksFactory.retrived().build({
      roshRisks: roshRisksFactory.build({
        status: 'retrieved',
        value: null,
      }),
    })

    expect(utils.personRisksRoshResponse(risks)).toEqual({
      'Risk of serious harm': [
        {
          'Overall risk of serious harm': 'Not known',
          'Risk to children': 'Not known',
          'Risk to public': 'Not known',
          'Risk to known adult': 'Not known',
          'Risk to staff': 'Not known',
        },
      ],
    })
  })

  it('returns a page response for risks where there was an error retrieving RoSH information', () => {
    const risks = risksFactory.retrived().build({
      roshRisks: roshRisksFactory.build({
        status: 'error',
        value: null,
      }),
    })

    expect(utils.personRisksRoshResponse(risks)).toEqual({
      'Risk of serious harm':
        'We were unable to automatically import RoSH information. Check the "Placement considerations" section to find the OASys risk levels. If the risk levels are not present, they must be checked manually outside of this service.',
    })
  })
})

describe('personRisksMappaResponse', () => {
  it('returns a page response for risks with a populated MAPPA object', () => {
    const risks = risksFactory.retrived().build({
      mappa: mappaFactory.build({
        status: 'retrieved',
        value: { level: 'LEVEL 1' },
      }),
    })

    expect(utils.personRisksMappaResponse(risks)).toEqual({
      'Multi-agency public protection arrangements': 'LEVEL 1',
    })
  })

  it('returns a page response for risks with an unpopulated MAPPA value', () => {
    const risks = risksFactory.retrived().build({
      mappa: mappaFactory.build({
        status: 'retrieved',
        value: null,
      }),
    })

    expect(utils.personRisksMappaResponse(risks)).toEqual({
      'Multi-agency public protection arrangements': 'Not known',
    })
  })

  it('returns a page response for risks where there was an error retrieving MAPPA information', () => {
    const risks = risksFactory.retrived().build({
      mappa: mappaFactory.build({
        status: 'error',
        value: null,
      }),
    })

    expect(utils.personRisksMappaResponse(risks)).toEqual({
      'Multi-agency public protection arrangements':
        'Something went wrong. We are unable to include MAPPA information. This risk data must be checked manually outside of this service.',
    })
  })
})

describe('personRisksFlagsResponse', () => {
  it('returns a page response for risks with a populated flags object', () => {
    const risks = risksFactory.retrived().build({
      flags: flagsFactory.build({
        status: 'retrieved',
        value: ['Flag 1', 'Flag 2', 'Flag 3'],
      }),
    })

    expect(utils.personRisksFlagsResponse(risks)).toEqual({
      'NDelius risk flags (registers)': 'Flag 1\nFlag 2\nFlag 3',
    })
  })

  it('returns a page response for risks with a populated flags object with no flags', () => {
    const risks = risksFactory.retrived().build({
      flags: flagsFactory.build({
        status: 'retrieved',
        value: [],
      }),
    })

    expect(utils.personRisksFlagsResponse(risks)).toEqual({
      'NDelius risk flags (registers)': 'No flags',
    })
  })

  it('returns a page response for risks with an unpopulated flags value', () => {
    const risks = risksFactory.retrived().build({
      flags: flagsFactory.build({
        status: 'retrieved',
        value: null,
      }),
    })

    expect(utils.personRisksFlagsResponse(risks)).toEqual({
      'NDelius risk flags (registers)': 'Not known',
    })
  })

  it('returns a page response for risks where there was an error retrieving flags information', () => {
    const risks = risksFactory.retrived().build({
      flags: flagsFactory.build({
        status: 'error',
        value: null,
      }),
    })

    expect(utils.personRisksFlagsResponse(risks)).toEqual({
      'NDelius risk flags (registers)':
        'Something went wrong. We are unable to include risk flags. This risk data must be checked manually outside of this service.',
    })
  })
})
