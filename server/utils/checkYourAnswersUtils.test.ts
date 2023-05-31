import { applicationFactory } from '../testutils/factories'
import { getResponseForPage } from './applicationUtils'

import {
  checkYourAnswersSections,
  embeddedSummaryListItem,
  getTaskResponsesAsSummaryListItems,
} from './checkYourAnswersUtils'
import reviewSections from './reviewUtils'
import { escape } from './viewUtils'

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
    it('returns an empty array if there isnt any responses for the task', () => {
      const application = applicationFactory.build()

      expect(
        getTaskResponsesAsSummaryListItems({ id: '42', title: '42', actionText: '42', pages: {} }, application),
      ).toEqual([])
    })

    it('returns the task responses as Summary List items and adds the actions object', () => {
      const application = applicationFactory.build()
      application.data = { foo: ['bar'] }
      ;(getResponseForPage as jest.Mock).mockImplementation(() => ({
        title: 'response',
      }))

      expect(
        getTaskResponsesAsSummaryListItems({ id: 'foo', title: 'bar', actionText: '42', pages: {} }, application),
      ).toEqual([
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
