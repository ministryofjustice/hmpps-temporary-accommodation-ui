import errorLookups from '../../server/i18n/en/errors.json'
import { DateFormats } from '../../server/utils/dateUtils'

export type PageElement = Cypress.Chainable<JQuery>

export default abstract class Page {
  static verifyOnPage<T>(constructor: new (...args: unknown[]) => T, ...args: unknown[]): T {
    return new constructor(...args)
  }

  constructor(private readonly title: string) {
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

  shouldShowErrorMessagesForFields(fields: Array<string>): void {
    fields.forEach(field => {
      cy.get('.govuk-error-summary').should('contain', errorLookups[field]?.empty)
      cy.get(`[data-cy-error-${field}]`).should('contain', errorLookups[field]?.empty)
    })
  }

  shouldShowBanner(copy: string): void {
    cy.get('.govuk-notification-banner').contains(copy)
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

  getSelectInputByIdAndSelectAnEntry(id: string, entry: string): void {
    cy.get(`#${id}`).select(entry)
  }

  checkRadioByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  checkCheckboxByNameAndValue(name: string, option: string): void {
    cy.get(`input[name="${name}"][value="${option}"]`).check()
  }

  completeTextArea(name: string, value: string): void {
    cy.get(`textarea[name="${name}"]`).type(value)
  }

  completeDateInputs(prefix: string, date: string): void {
    const parsedDate = DateFormats.convertIsoToDateObj(date)
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
}
