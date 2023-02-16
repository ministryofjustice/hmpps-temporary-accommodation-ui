import applicationFactory from '../testutils/factories/application'
import { getResponseForPage } from './applicationUtils'

import {
  checkYourAnswersSections,
  embeddedSummaryListItem,
  getTaskResponsesAsSummaryListItems,
} from './checkYourAnswersUtils'
import reviewSections from './reviewUtils'

jest.mock('./reviewUtils')
jest.mock('./applicationUtils')

describe('checkYourAnswersUtils', () => {
  describe('embeddedSummaryListItem', () => {
    it('returns a summary list for an array of records', () => {
      const result = embeddedSummaryListItem([
        { foo: 'bar', bar: 'baz' },
        { foo: 'bar', bar: 'baz' },
      ]).replace(/\s+/g, ``)

      expect(result).toEqual(
        `
      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
          </dd>
        </div>
      </dl>

      <dl class="govuk-summary-list govuk-summary-list--embedded">
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            foo
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            bar
          </dd>
        </div>
        <div class="govuk-summary-list__row govuk-summary-list__row--embedded">
          <dt class="govuk-summary-list__key govuk-summary-list__key--embedded">
            bar
          </dt>
          <dd class="govuk-summary-list__value govuk-summary-list__value--embedded">
            baz
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
    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(getTaskResponsesAsSummaryListItems({ id: '42', title: '42', pages: {} }, application)).toEqual([])
    })

    it('returns the task responses as Summary List items and adds the actions object', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', pages: {} }, application)).toEqual([
        {
          actions: {
            items: [
              {
                href: `/applications/${application.id}/tasks/foo/pages/0`,
                text: 'Change',
                visuallyHiddenText: 'title',
              },
            ],
          },
          key: {
            text: 'title',
          },
          value: {
            text: 'response',
          },
        },
      ])
    })
  })
})
