import { TemporaryAccommodationApplication } from '@approved-premises/api'
import TasklistPage from '../../../server/form-pages/tasklistPage'
import Page from '../page'

import Apply from '../../../server/form-pages/apply'
import { questionKeyFromNumber } from '../../../server/utils/oasysImportUtils'

export default class ApplyPage extends Page {
  tasklistPage: TasklistPage

  constructor(
    title: string,
    application: TemporaryAccommodationApplication,
    taskName: string,
    pageName: string,
    backLink?: string,
  ) {
    super(title)

    const Class = Apply.pages[taskName][pageName]

    this.tasklistPage = new Class(application.data?.[taskName]?.[pageName], application)

    if (backLink) {
      this.checkForBackButton(backLink)
    }
  }

  completeYesNoInputWithDetailFromPageBody(fieldName: string) {
    this.checkRadioButtonFromPageBody(fieldName)

    if (this.tasklistPage.body[fieldName] === 'yes') {
      this.completeTextInputFromPageBody(`${fieldName}Detail`)
    }
  }

  checkRadioButtonFromPageBody(fieldName: string) {
    this.checkRadioByNameAndValue(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  completeTextInputFromPageBody(fieldName: string) {
    this.getTextInputByIdAndEnterDetails(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  checkCheckboxesFromPageBody(fieldName: string) {
    ;(this.tasklistPage.body[fieldName] as Array<string>).forEach(value => {
      this.checkCheckboxByNameAndValue(`${fieldName}[]`, value)
    })
  }

  checkCheckboxesWithDetailsFromPageBody(fieldName: string) {
    ;(this.tasklistPage.body[fieldName] as Array<string>).forEach(value => {
      this.checkCheckboxByNameAndValue(`${fieldName}[]`, value)
      this.completeTextInputFromPageBody(`${value}Detail`)
    })
  }

  completeDateInputsFromPageBody(fieldName: string) {
    const date = this.tasklistPage.body[fieldName] as string
    this.completeDateInputs(fieldName, date)
  }

  selectSelectOptionFromPageBody(fieldName: string) {
    this.getSelectInputByIdAndSelectAnEntry(fieldName, this.tasklistPage.body[fieldName] as string)
  }

  checkForBackButton(path: string) {
    cy.get('.govuk-back-link').should('have.attr', 'href').and('include', path)
  }

  completeOasysImportQuestions(section, sectionName: string, oasysMissing: boolean): void {
    section.forEach(summary => {
      cy.get('.govuk-label').contains(summary.label)
      if (oasysMissing) {
        cy.get(`textarea[name="${sectionName}[${questionKeyFromNumber(summary.questionNumber)}]"]`).type(
          `${summary.questionNumber} content goes here`,
        )
      } else {
        cy.get(`textarea[name="${sectionName}[${questionKeyFromNumber(summary.questionNumber)}]"]`)
          .should('contain', summary.answer)
          .type(`. With an extra comment ${summary.questionNumber}`)
      }
    })
  }
}
