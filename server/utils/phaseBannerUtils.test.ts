import { getContent } from './phaseBannerUtils'

describe('when there is a feedback link', () => {
  it('returns correct feedback link for path', () => {
    const content = `This is a new service. <a class="govuk-link" href="${'https://forms.office.com/Pages/ResponsePage.aspx?id=KEeHxuZx_kGp4S6MNndq2EXSevEnO7lHpH52Z5zJdrxUQjQ0OTZERFI4N0w4Q1Q5ODRYWVFIVFBGNy4u'}">Give us your feedback</a> or <a class="govuk-link" href="mailto:cas3support@digital.justice.gov.uk">email us</a> to report a bug`
    expect(getContent()).toEqual(content)
  })
})
