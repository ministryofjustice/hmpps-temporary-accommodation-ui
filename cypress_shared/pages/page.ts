import { PersonRisksUI } from '../../server/@types/ui'
import errorLookups from '../../server/i18n/en/errors.json'
import { DateFormats } from '../../server/utils/dateUtils'
import { exact } from '../../server/utils/utils'
import Component from '../components/component'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page extends Component {
  static verifyOnPage<T, Args extends unknown[]>(constructor: new (...args: Args) => T, ...args: Args): T {
    return new constructor(...args)
  }

  constructor(private readonly title: string) {
    super()

    this.checkOnPage()
  }

  assertDefinition(term: string, value: string): void {
    cy.get('dt').should('contain', term)
    cy.get('dd').should('contain', value)
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerProbationRegion = (): PageElement => cy.get('.region-header')

  shouldShowErrorMessagesForFields(fields: Array<string>, context = 'generic'): void {
    fields.forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[context][field]?.empty)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[context][field]?.empty)
    })
  }

  shouldShowBanner(copy: string): void {
    cy.get('.govuk-notification-banner').contains(copy)
  }

  shouldShowDateInputs(prefix: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)
    cy.get(`#${prefix}-day`).should('have.value', parsedDate.getDate().toString())
    cy.get(`#${prefix}-month`).should('have.value', `${parsedDate.getMonth() + 1}`)
    cy.get(`#${prefix}-year`).should('have.value', parsedDate.getFullYear().toString())
  }

  shouldShowTextareaInput(id: string, contents: string) {
    cy.get(`textarea[id="${id}"]`).should('contain', contents)
  }

  shouldShowSelectInput(id: string, contents: string) {
    cy.get(`select[id="${id}"]`).children('option').contains(exact(contents)).should('be.selected')
  }

  getLabel(labelName: string): void {
    cy.get('label').should('contain', labelName)
  }

  getLegend(legendName: string): void {
    cy.get('legend').should('contain', legendName)
  }

  getTextInputByIdAndEnterDetails(id: string, details: string): void {
    cy.get(`#${id}`).type(details)
  }

  getTextInputByIdAndClear(id: string): void {
    cy.get(`#${id}`).clear()
  }

  getSelectInputByIdAndSelectAnEntry(id: string, entry: string): void {
    cy.get(`#${id}`).select(entry)
  }

  checkRadioByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  checkCheckboxByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  checkCheckboxByLabel(option: string): void {
    cy.get(`input[value="${option}"]`).check()
  }

  completeTextArea(name: string, value: string): void {
    cy.get(`textarea[name="${name}"]`).type(value)
  }

  clearDateInputs(prefix: string): void {
    cy.get(`#${prefix}-day`).clear()
    cy.get(`#${prefix}-month`).clear()
    cy.get(`#${prefix}-year`).clear()
  }

  completeDateInputs(prefix: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)
    cy.get(`#${prefix}-day`).type(parsedDate.getDate().toString())
    cy.get(`#${prefix}-month`).type(`${parsedDate.getMonth() + 1}`)
    cy.get(`#${prefix}-year`).type(parsedDate.getFullYear().toString())
  }

  clickSubmit(): void {
    cy.get('button').click()
  }

  clickBack(): void {
    cy.get('a').contains('Back').click()
  }

  clickBreadCrumbUp(): void {
    cy.get('li.govuk-breadcrumbs__list-item:nth-last-child(2)').click()
  }

  expectDownload(timeout?: number) {
    // This is a workaround for a Cypress bug to prevent it waiting
    // indefinitely for a new page to load after clicking the download link
    // See https://github.com/cypress-io/cypress/issues/14857
    cy.window()
      .document()
      .then(doc => {
        doc.addEventListener('click', () => {
          setTimeout(() => {
            doc.location?.reload()
          }, timeout || Cypress.config('defaultCommandTimeout'))
        })
      })
  }

  shouldShowMappa = (): void => {
    cy.get('h3').contains('MAPPA')
    cy.get('h3').contains('CAT 2 / LEVEL 1')
  }

  shouldShowRosh = (risks: PersonRisksUI['roshRisks']): void => {
    cy.get('h3').contains(`${risks.overallRisk.toLocaleUpperCase()} RoSH`)
    cy.get('p').contains(`Last updated: ${risks.lastUpdated}`)

    cy.get('.rosh-widget__table').within($row => {
      cy.wrap($row).get('th').contains('Children').get('td').contains(risks.riskToChildren, { matchCase: false })
      cy.wrap($row).get('th').contains('Public').get('td').contains(risks.riskToPublic, { matchCase: false })
      cy.wrap($row).get('th').contains('Known adult').get('td').contains(risks.riskToKnownAdult, { matchCase: false })
      cy.wrap($row).get('th').contains('Staff').get('td').contains(risks.riskToStaff, { matchCase: false })
    })
  }

  shouldShowTier = (tier: PersonRisksUI['tier']): void => {
    cy.get('h3').contains(`TIER ${tier.level}`)
    cy.get('p').contains(`Last updated: ${tier.lastUpdated}`)
  }

  shouldShowDeliusRiskFlags = (flags: Array<string>): void => {
    cy.get('h3').contains(`Delius risk flags (registers)`)
    cy.get('.risk-flag-widget > ul').within($item => {
      flags.forEach(flag => {
        cy.wrap($item).get('li').should('contain', flag)
      })
    })
  }

  shouldShowRiskWidgets(risks: PersonRisksUI): void {
    this.shouldShowMappa()
    this.shouldShowRosh(risks.roshRisks)
    this.shouldShowTier(risks.tier)
    this.shouldShowDeliusRiskFlags(risks.flags)
  }

  shouldShowCheckYourAnswersTitle(taskName: string, taskTitle: string) {
    cy.get(`[data-cy-check-your-answers-section="${taskName}"]`).within(() => {
      cy.get('.box-title').should('contain', taskTitle)
    })
  }
}
