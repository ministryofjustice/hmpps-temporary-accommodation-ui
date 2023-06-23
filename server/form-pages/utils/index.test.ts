import { DeepMocked, createMock } from '@golevelup/ts-jest'
import { Request } from 'express'
import 'reflect-metadata'

// Use a wildcard import to allow us to use jest.spyOn on functions within this module
import { TemporaryAccommodationApplication } from '../../@types/shared'
import TasklistPage, { TasklistPageInterface } from '../tasklistPage'
import * as utils from './index'

import { FormSection, Task } from '../../@types/ui'
import { adjudicationFactory, applicationFactory, assessmentFactory } from '../../testutils/factories'
import { SessionDataError } from '../../utils/errors'

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
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns no detail if the answer is no', () => {
      const body = { foo: 'no' }

      expect(utils.yesOrNoResponseWithDetail('foo', body)).toEqual('No')
    })
  })

  describe('yesNoOrDontKnowResponseWithDetail', () => {
    it('returns a response with detail if the answer is yes', () => {
      const body = { foo: 'yes', fooDetail: 'Some Detail' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('Yes - Some Detail')
    })

    it('returns No if the answer is no', () => {
      const body = { foo: 'no' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual('No')
    })

    it("returns Don't know if the answer is iDontKnow", () => {
      const body = { foo: 'iDontKnow' }

      expect(utils.yesNoOrDontKnowResponseWithDetail('foo', body)).toEqual("Don't know")
    })
  })

  describe('yesNoOrDontKnowResponse', () => {
    it('returns Yes if the answer is yes', () => {
      const body = { foo: 'yes' as const }

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
    class SomeSection {}

    class SomeTask {}

    class Page1 {}
    class Page2 {}

    beforeEach(() => {
      Reflect.defineMetadata('page:name', 'page-1', Page1)
      Reflect.defineMetadata('page:name', 'page-2', Page2)

      Reflect.defineMetadata('page:task', 'task-1', Page1)
      Reflect.defineMetadata('page:task', 'task-2', Page2)

      Reflect.defineMetadata('task:slug', 'slug', SomeTask)
      Reflect.defineMetadata('task:name', 'Name', SomeTask)
      Reflect.defineMetadata('task:actionText', 'Action text', SomeTask)
      Reflect.defineMetadata('task:pages', [Page1, Page2], SomeTask)

      Reflect.defineMetadata('section:title', 'Section', SomeSection)
      Reflect.defineMetadata('section:tasks', [SomeTask], SomeSection)
    })

    describe('getTask', () => {
      it('fetches metadata for a specific task and pages', () => {
        expect(utils.getTask(SomeTask)).toEqual({
          id: 'slug',
          title: 'Name',
          actionText: 'Action text',
          pages: { 'page-1': Page1, 'page-2': Page2 },
        })
      })
    })

    describe('getSection', () => {
      it('fetches metadata for a specific section and tasks', () => {
        expect(utils.getSection(SomeSection)).toEqual({
          title: 'Section',
          tasks: [utils.getTask(SomeTask)],
        })
      })
    })

    describe('getPagesForSections', () => {
      it('fetches pages for all supplied sections', () => {
        class Section1 {}
        class Section2 {}

        jest.spyOn(utils, 'getSection').mockImplementation((section: Section1 | Section2) => {
          if (section === Section1) {
            return {
              title: 'Section 1',
              name: 'Section1',
              tasks: [{ id: 'foo', title: 'Foo', actionText: 'Do Foo', pages: { 'page-1': Page1, 'page-2': Page2 } }],
            }
          }
          return {
            title: 'Section 2',
            name: 'Section2',
            tasks: [{ id: 'bar', title: 'Bar', actionText: 'Do Bar', pages: { 'page-3': Page1, 'page-4': Page2 } }],
          }
        })

        expect(utils.getPagesForSections([Section1, Section2])).toEqual({
          foo: {
            'page-1': Page1,
            'page-2': Page2,
          },
          bar: {
            'page-3': Page1,
            'page-4': Page2,
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
        } as Task

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
        expect(utils.getTaskName(Page1)).toEqual('task-1')
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
})
