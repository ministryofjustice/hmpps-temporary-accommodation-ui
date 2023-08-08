import { embeddedSummaryListItem } from './embeddedSummaryListItem'
import { escape } from '../viewUtils'

jest.mock('../viewUtils')

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
