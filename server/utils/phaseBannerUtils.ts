export const feedbackLink = 'https://forms.office.com/e/SsWLbpUgtx'
export const supportLink =
  'https://mojprod.service-now.com/moj_sp?id=sc_cat_item&table=sc_cat_item&sys_id=4f0128741b6fd61025dc6351f54bcb31'

export const getContent = () => {
  return `This is a new service. <a class="govuk-link" href="${feedbackLink}">Give us your feedback</a> or raise a <a class="govuk-link" href="${supportLink}">support ticket</a> to get help or report a bug.`
}
