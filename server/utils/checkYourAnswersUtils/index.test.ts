import { createMock } from '@golevelup/ts-jest'
import { applicationFactory } from '../../testutils/factories'
import { forPagesInTask } from '../applicationUtils'

import TasklistPage from '../../form-pages/tasklistPage'
import paths from '../../paths/apply'
import { checkYourAnswersSections, getTaskResponsesAsSummaryListItems } from '.'
import reviewSections from '../reviewUtils'
import { formatLines } from '../viewUtils'

jest.mock('../reviewUtils')
jest.mock('../applicationUtils')
jest.mock('../viewUtils')

describe('checkYourAnswersUtils', () => {
  describe('checkYourAnswersSections', () => {
    it('calls reviewSections with the correct arguments', () => {
      const application = applicationFactory.build()

      checkYourAnswersSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems)
    })
  })

  describe('getTaskResponsesAsSummaryListItems', () => {
    beforeEach(() => {
      ;(formatLines as jest.Mock).mockReset()
      ;(formatLines as jest.Mock).mockImplementation((value: string) => `Formatted "${value}"`)
    })

    it('returns the task responses as Summary List items and adds the actions object', () => {
      const application = applicationFactory.build()
      ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
        const page = createMock<TasklistPage>()

        page.response.mockReturnValue({
          'A question': 'An answer',
        })

        callback(page, 'some-page')
      })

      expect(
        getTaskResponsesAsSummaryListItems(
          { id: 'some-task', title: 'Some task', actionText: 'Complete some task', pages: {} },
          application,
        ),
      ).toEqual([
        {
          actions: {
            items: [
              {
                classes: 'exclude-from-print',
                href: paths.applications.pages.show({ id: application.id, task: 'some-task', page: 'some-page' }),
                text: 'Change',
                visuallyHiddenText: 'A question',
              },
            ],
          },
          key: {
            text: 'A question',
          },
          value: {
            html: 'Formatted "An answer"',
          },
        },
      ])

      expect(formatLines).toHaveBeenCalledWith('An answer')
    })

    describe('when the item is offence ID', () => {
      it('returns the task response as a Summary List item without the actions object', () => {
        const application = applicationFactory.build()
        ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
          const page = createMock<TasklistPage>()

          page.response.mockReturnValue({
            'Offence ID': '1234455',
          })

          callback(page, 'some-page')
        })

        expect(
          getTaskResponsesAsSummaryListItems(
            { id: 'some-task', title: 'Some task', actionText: 'Complete some task', pages: {} },
            application,
          ),
        ).toEqual([
          {
            key: {
              text: 'Offence ID',
            },
            value: {
              html: 'Formatted "1234455"',
            },
          },
        ])

        expect(formatLines).toHaveBeenCalledWith('1234455')
      })
    })
  })
})
