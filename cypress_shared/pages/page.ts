import 'cypress-axe'
import { Result } from 'axe-core'
import { PersonRisksUI, PlaceContext, ReferenceData } from '../../server/@types/ui'
import errorLookups from '../../server/i18n/en/errors.json'
import { DateFormats } from '../../server/utils/dateUtils'
import { exact } from '../../server/utils/utils'
import Component from '../components/component'
import PlaceContextHeaderComponent from '../components/placeContextHeader'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page extends Component {
  static verifyOnPage<T, Args extends unknown[]>(constructor: new (...args: Args) => T, ...args: Args): T {
    return new constructor(...args)
  }

  static clickDashboardLink() {
    cy.get('.govuk-breadcrumbs a').contains('Home').click()
  }

  static clickBreadCrumbUp(): void {
    cy.get('li.govuk-breadcrumbs__list-item:nth-last-child(2)').click()
  }

  constructor(private readonly title: string) {
    super()

    this.checkOnPage()
  }

  checkOnPage(): void {
    cy.get('h1').contains(this.title)
    if (!Cypress.env('SKIP_AXE')) {
      cy.injectAxe()
      cy.configureAxe({
        rules: [
          // Temporary rule whilst this issue is resolved https://github.com/w3c/aria/issues/1404
          { id: 'aria-allowed-attr', reviewOnFail: true },
          // Ignore the "All page content should be contained by landmarks", which conflicts with GOV.UK guidance (https://design-system.service.gov.uk/components/back-link/#how-it-works)
          { id: 'region', reviewOnFail: true, selector: '.govuk-back-link' },
        ],
      })
      cy.checkA11y(undefined, undefined, this.logAccessibilityViolations)
    }
  }

  signOut = (): PageElement => cy.get('[data-qa=signOut]')

  manageDetails = (): PageElement => cy.get('[data-qa=manageDetails]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerProbationRegion = (): PageElement => cy.get('.cas-primary-navigation__regional_header')

  shouldShowErrorMessagesForFields(fields: Array<string>, error = 'empty', context = 'generic'): void {
    fields.forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[context][field][error])
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[context][field][error])
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

  shouldShowEmptyDateInputs(prefix: string): void {
    cy.get(`#${prefix}-day`).should('have.value', '')
    cy.get(`#${prefix}-month`).should('have.value', '')
    cy.get(`#${prefix}-year`).should('have.value', '')
  }

  shouldShowTextareaInput(id: string, contents: string) {
    cy.get(`textarea[id="${id}"]`).should('contain', contents)
  }

  shouldShowSelectInput(id: string, contents: string) {
    cy.get(`select[id="${id}"]`).children('option').contains(exact(contents)).should('be.selected')
  }

  shouldShowRadioInput(id: string, contents: string) {
    cy.get(`input[name="${id}"]`)
      .siblings('label')
      .contains(exact(` ${contents} `))
      .siblings('input')
      .should('be.checked')
  }

  shouldShowDateInputsByLegend(legend: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)

    cy.get('legend')
      .contains(legend)
      .siblings('.govuk-date-input')
      .within(() => {
        cy.get('label').contains('Day').siblings('input').should('have.value', parsedDate.getDate().toString())
        cy.get('label')
          .contains('Month')
          .siblings('input')
          .should('have.value', `${parsedDate.getMonth() + 1}`)
        cy.get('label').contains('Year').siblings('input').should('have.value', parsedDate.getFullYear().toString())
      })
  }

  shouldShowTextInputByLabel(label: string, value: string): void {
    cy.get('label').contains(label).parent().find('input').should('have.value', value)
  }

  shouldShowSelectInputByLabel(label: string, value: string): void {
    cy.get('label').contains(label).siblings('select').children('option').contains(exact(value)).should('be.selected')
  }

  shouldShowCheckedInputByValue(value: string): void {
    cy.get(`input[type="checkbox"][value="${value}"]`).should('be.checked')
  }

  completeDateInputsByLegend(legend: string, date: string): void {
    const parsedDate = DateFormats.isoToDateObj(date)

    cy.get('legend')
      .contains(legend)
      .siblings('.govuk-date-input')
      .within(() => {
        cy.get('label').contains('Day').siblings('input').clear().type(parsedDate.getDate().toString())
        cy.get('label')
          .contains('Month')
          .siblings('input')
          .clear()
          .type(`${parsedDate.getMonth() + 1}`)
        cy.get('label').contains('Year').siblings('input').clear().type(parsedDate.getFullYear().toString())
      })
  }

  completeTextInputByLabel(label: string, value: string): void {
    cy.get('label').contains(label).closest('.govuk-form-group').find('input').clear().type(value)
  }

  completeSelectInputByLabel(label: string, value: string): void {
    cy.get('label').contains(label).closest('.govuk-form-group').find('select').select(value)
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

  checkRadioByNameAndLabel(name: string, label: string): void {
    cy.get(`input[name="${name}"]`)
      .siblings('label')
      .contains(exact(` ${label} `))
      .siblings('input')
      .check()
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

  clearTextInputByLabel(label: string): void {
    cy.get('label').contains(label).parent().find('input, textarea').clear()
  }

  completeDateInputs(prefix: string, datetime: string): void {
    const date = datetime.split('T')[0]
    const [year, month, day] = date.split('-').map(Number).map(String)
    cy.get(`#${prefix}-day`).clear().type(day)
    cy.get(`#${prefix}-month`).clear().type(month)
    cy.get(`#${prefix}-year`).clear().type(year)
  }

  clickSubmit(text = ''): void {
    if (text) {
      cy.get('button').contains(text).click()
    } else {
      cy.get('button').click()
    }
  }

  clickLink(text: string | RegExp): void {
    cy.get('a').contains(text).click()
  }

  clickBack(): void {
    cy.get('a').contains('Back').click()
  }

  clickBreadCrumbUp(): void {
    Page.clickBreadCrumbUp()
  }

  clickPrintButton(): void {
    cy.get('button').contains('Print this page').click()
  }

  shouldShowPrintButton(): void {
    cy.get('button').contains('Print this page')
  }

  shouldPrint(environment: 'integration'): void {
    if (environment === 'integration') {
      cy.window().then(win => {
        cy.stub(win, 'print').as('printStub')
      })

      this.clickPrintButton()

      cy.get('@printStub').should('be.calledOnce')
    }
  }

  expectDownload(timeout?: number) {
    // This is a workaround for a Cypress bug to prevent it waiting
    // indefinitely for a new page to load after clicking the download link
    // See https://github.com/cypress-io/cypress/issues/14857
    cy.window()
      .document()
      .then(doc => {
        doc.addEventListener('click', () => {
          setTimeout(
            () => {
              doc.location?.reload()
            },
            timeout || Cypress.config('defaultCommandTimeout'),
          )
        })
      })
  }

  shouldShowMappa = (): void => {
    cy.get('h2').contains('MAPPA')
    cy.get('h2').contains('CAT 2 / LEVEL 1')
  }

  shouldShowRosh = (risks: PersonRisksUI['roshRisks']): void => {
    const roshRisksValue = risks.value

    cy.get('h2').contains(`${roshRisksValue.overallRisk.toLocaleUpperCase()} RoSH`)
    cy.get('p').contains(`Last updated: ${DateFormats.isoDateToUIDate(roshRisksValue.lastUpdated)}`)

    cy.get('.rosh-widget__table').within($row => {
      cy.wrap($row)
        .get('th')
        .contains('Children')
        .get('td')
        .contains(roshRisksValue.riskToChildren, { matchCase: false })
      cy.wrap($row).get('th').contains('Public').get('td').contains(roshRisksValue.riskToPublic, { matchCase: false })
      cy.wrap($row)
        .get('th')
        .contains('Known adult')
        .get('td')
        .contains(roshRisksValue.riskToKnownAdult, { matchCase: false })
      cy.wrap($row).get('th').contains('Staff').get('td').contains(roshRisksValue.riskToStaff, { matchCase: false })
    })
  }

  shouldShowTier = (tier: PersonRisksUI['tier']): void => {
    const tierValue = tier.value

    cy.get('h2').contains(`TIER ${tierValue.level}`)
    cy.get('p').contains(`Last updated: ${DateFormats.isoDateToUIDate(tierValue.lastUpdated)}`)
  }

  shouldShowDeliusRiskFlags = (flags: PersonRisksUI['flags']): void => {
    const flagsValue = flags.value

    cy.get('h2').contains(`NDelius risk flags (registers)`)
    cy.get('.risk-flag-widget > ul').within($item => {
      flagsValue.forEach(flag => {
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

  shouldShowPlaceContextHeader(placeContext: PlaceContext) {
    const component = new PlaceContextHeaderComponent(placeContext)
    component.shouldShowPlaceContextDetails()
  }

  shouldNotShowPlaceContextHeader() {
    PlaceContextHeaderComponent.shouldNotShowPlaceContextDetails()
  }

  getSelectOptionsAsReferenceData(label: string, alias: string): void {
    cy.get('label')
      .contains(label)
      .siblings('select')
      .children('option')
      .then(elements => {
        const items: ReferenceData[] = elements
          .toArray()
          .filter(element => element.value !== '')
          .map(element => ({
            id: element.value,
            name: element.text,
            isActive: true,
            serviceScope: 'temporary-accommodation',
          }))
        cy.wrap(items).as(alias)
      })
  }

  getCheckboxItemsAsReferenceData(legend: string, alias: string): void {
    cy.get('legend')
      .contains(legend)
      .siblings('.govuk-checkboxes')
      .children('.govuk-checkboxes__item')
      .then(elements => {
        const items: ReferenceData[] = elements.toArray().map(element => {
          const id = Cypress.$(element).children('input').attr('value')
          const name = Cypress.$(element).children('label').text().trim()

          return { id, name, isActive: true, serviceScope: 'temporary-accommodation' }
        })
        cy.wrap(items).as(alias)
      })
  }

  logAccessibilityViolations(violations: Result[]): void {
    cy.task('logAccessibilityViolationsSummary', `Accessibility violations detected: ${violations.length}`)

    const violationData = violations.map(({ id, impact, description, nodes }) => ({
      id,
      impact,
      description,
      nodes: nodes.length,
      nodeTargets: nodes.map(node => node.target).join(' - '),
    }))

    cy.task('logAccessibilityViolationsTable', violationData)
  }

  clickPaginationLink(label: number | 'Previous' | 'Next') {
    if (typeof label === 'number') {
      cy.get('main nav[aria-label="Pagination navigation"] a')
        .contains(new RegExp(`^${label}$`))
        .click()
    } else {
      cy.get('main nav[aria-label="Pagination navigation"] a').contains(label).click()
    }
  }

  shouldHaveURLSearchParam(qsFragment: string) {
    qsFragment.split('&').forEach(fragment => cy.location('search', { timeout: 10000 }).should('include', fragment))
  }

  shouldShowPageNumber(number: number) {
    if (number !== 1) {
      this.shouldHaveURLSearchParam(`page=${number}`)
    }
    cy.get('main nav[aria-label="Pagination navigation"]')
      .contains(new RegExp(`^${number}$`))
      .should('have.class', 'moj-pagination__item--active')
      .should('have.attr', 'aria-current', 'page')
  }

  sortColumn(label: string) {
    cy.get('main table thead').contains(label).click()
  }

  checkColumnOrder(label: string, order: 'ascending' | 'descending' | 'none') {
    cy.get('main table thead').contains(label).closest('th').should('have.attr', 'aria-sort', order)
  }
}
