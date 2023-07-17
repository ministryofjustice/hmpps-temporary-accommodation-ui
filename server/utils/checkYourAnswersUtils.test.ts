import { createMock } from '@golevelup/ts-jest'
import { applicationFactory } from '../testutils/factories'
import { forPagesInTask } from './applicationUtils'

import TasklistPage from '../form-pages/tasklistPage'
import paths from '../paths/apply'
import {
  checkYourAnswersSections,
  embeddedSummaryListItem,
  getTaskResponsesAsSummaryListItems,
} from './checkYourAnswersUtils'
import reviewSections from './reviewUtils'
import { escape, formatLines } from './viewUtils'

jest.mock('./reviewUtils')
jest.mock('./applicationUtils')
jest.mock('./viewUtils')

describe('checkYourAnswersUtils', () => {
  describe('embeddedSummaryListItem', () => {
    it('returns a summary list for an array of records', () => {
      ;(escape as jest.Mock).mockImplementation((value: string) => `Escaped "${value}"`)

      const result = embeddedSummaryListItem([
        { foo: 'bar', bar: 'baz' },
        { foo: 'bar', bar: 'baz' },
      ]).replace(/\s+/g, ``)

      expect(escape).toHaveBeenCalledWith('foo')
      expect(escape).toHaveBeenCalledWith('bar')
      expect(escape).toHaveBeenCalledWith('baz')
      expect(result).toEqual(
        `
      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            Escaped "foo"
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            Escaped "bar"
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            Escaped "bar"
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            Escaped "baz"
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            Escaped "foo"
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            Escaped "bar"
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            Escaped "bar"
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            Escaped "baz"
          </dd>
        </div>
      </dl>`.replace(/\s+/g, ``),
      )
    })
  })

  describe('checkYourAnswersSections', () => {
    it('calls reviewSections with the correct arguments', () => {
      const application = applicationFactory.build()

      checkYourAnswersSections(application)

      expect(reviewSections).toHaveBeenCalledWith(application, getTaskResponsesAsSummaryListItems)
    })
  })

  describe('getTaskResponsesAsSummaryListItems', () => {
    it('returns the task responses as Summary List items and adds the actions object', () => {
      const application = applicationFactory.build()
      ;(forPagesInTask as jest.MockedFunction<typeof forPagesInTask>).mockImplementation((_1, _2, callback) => {
        const page = createMock<TasklistPage>()

        page.response.mockReturnValue({
          'A question': 'An answer',
        })

        callback(page, 'some-page')
      })
      ;(formatLines as jest.Mock).mockImplementation((value: string) => `Formatted "${value}"`)

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
  })
})
