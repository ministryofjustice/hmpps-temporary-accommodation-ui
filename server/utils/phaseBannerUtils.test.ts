import { getContent } from './phaseBannerUtils'

describe('when there is a feedback link', () => {
  it('returns correct feedback link for path', () => {
    const content = `This is a new service. <a class="govuk-link" href="${'https://forms.office.com/e/SsWLbpUgtx'}">Give us your feedback</a> or <a class="govuk-link" href="mailto:cas3support@digital.justice.gov.uk">email us</a> to report a bug`
    expect(getContent()).toEqual(content)
  })
})
