import { getContent } from './phaseBannerUtils'

describe('when there is a feedback link', () => {
  it('returns correct feedback link for path', () => {
    const content = `This is a new service. <a class="govuk-link" href="${'https://forms.office.com/e/SsWLbpUgtx'}">Give us your feedback</a> or raise a <a class="govuk-link" href="https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=4f0128741b6fd61025dc6351f54bcb31">support ticket</a> to get help or report a bug.`
    expect(getContent()).toEqual(content)
  })
})
