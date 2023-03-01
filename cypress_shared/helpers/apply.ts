import {
  ActiveOffence,
  Adjudication,
  ApprovedPremisesApplication as Application,
  Document,
  OASysSection,
  Person,
} from '@approved-premises/api'
import { PersonRisksUI } from '@approved-premises/ui'
import documentFactory from '../../server/testutils/factories/document'
import oasysSelectionFactory from '../../server/testutils/factories/oasysSelection'
import { documentsFromApplication } from '../../server/utils/assessments/documentUtils'
import Page from '../pages'
import {
  CheckYourAnswersPage,
  ConfirmDetailsPage,
  EnterCRNPage,
  SentenceTypePage,
  StartPage,
  TaskListPage,
} from '../pages/apply'
import ApplyPage from '../pages/apply/applyPage'

export default class ApplyHelper {
  pages = {
    reasonsForPlacement: [] as Array<ApplyPage>,
  }

  uiRisks?: PersonRisksUI

  oasysSectionsLinkedToReoffending: Array<OASysSection> = []

  otherOasysSections: Array<OASysSection> = []

  adjudications: Array<Adjudication> = []

  documents: Array<Document> = []

  selectedDocuments: Array<Document> = []

  constructor(
    private readonly application: Application,
    private readonly person: Person,
    private readonly offences: Array<ActiveOffence>,
    private readonly type: 'e2e' | 'integration',
  ) {}

  initializeE2e(oasysSectionsLinkedToReoffending: Array<OASysSection>, otherOasysSections: Array<OASysSection>) {
    this.oasysSectionsLinkedToReoffending = oasysSectionsLinkedToReoffending
    this.otherOasysSections = otherOasysSections
  }

  setupApplicationStubs(uiRisks?: PersonRisksUI) {
    this.uiRisks = uiRisks
    this.stubPersonEndpoints()
    this.stubApplicationEndpoints()
    this.stubOasysEndpoints()
    this.stubDocumentEndpoints()
    this.stubOffences()
  }

  startApplication() {
    // Given I visit the start page
    const startPage = StartPage.visit()
    startPage.startApplication()

    // And I complete the first step
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(this.person.crn)
    crnPage.clickSubmit()

    // And I see the person on the confirmation page
    const confirmDetailsPage = new ConfirmDetailsPage(this.person)
    confirmDetailsPage.verifyPersonIsVisible()

    // And I confirm the person is who I expect to see
    confirmDetailsPage.clickSubmit()
  }

  completeApplication() {
    this.completeBasicInformation()
    this.completeCheckYourAnswersSection()
    this.submitApplication()
  }

  numberOfPages() {
    return [...this.pages.reasonsForPlacement].length
  }

  private stubPersonEndpoints() {
    cy.task('stubPersonRisks', { person: this.person, risks: this.application.risks })
    cy.task('stubFindPerson', { person: this.person })
  }

  private stubOffences() {
    cy.task('stubPersonOffences', { person: this.person, offences: this.offences })
  }

  private stubApplicationEndpoints() {
    // Given I can create an application
    cy.task('stubApplicationCreate', { application: this.application })
    cy.task('stubApplicationUpdate', { application: this.application })
    cy.task('stubApplicationGet', { application: this.application })
  }

  private stubOasysEndpoints() {
    // And there are OASys sections in the db
    const oasysSelectionA = oasysSelectionFactory.needsLinkedToReoffending().build({
      section: 1,
      name: 'accommodation',
    })
    const oasysSelectionB = oasysSelectionFactory.needsLinkedToReoffending().build({
      section: 2,
      name: 'relationships',
      linkedToHarm: false,
      linkedToReOffending: true,
    })
    const oasysSelectionC = oasysSelectionFactory.needsNotLinkedToReoffending().build({
      section: 3,
      name: 'emotional',
      linkedToHarm: false,
      linkedToReOffending: false,
    })
    const oasysSelectionD = oasysSelectionFactory.needsNotLinkedToReoffending().build({
      section: 4,
      name: 'thinking',
      linkedToHarm: false,
      linkedToReOffending: false,
    })

    this.oasysSectionsLinkedToReoffending = [oasysSelectionA, oasysSelectionB]
    this.otherOasysSections = [oasysSelectionC, oasysSelectionD]

    const oasysSelection = [...this.oasysSectionsLinkedToReoffending, ...this.otherOasysSections]

    cy.task('stubOasysSelection', { person: this.person, oasysSelection })
  }

  private stubDocumentEndpoints() {
    // And there are documents in the database
    this.selectedDocuments = documentsFromApplication(this.application)
    this.documents = [this.selectedDocuments, documentFactory.buildList(4)].flat()

    cy.task('stubApplicationDocuments', { application: this.application, documents: this.documents })
    this.documents.forEach(document => {
      cy.task('stubPersonDocument', { person: this.person, document })
    })

    // And the application exists in the database
    cy.task('stubApplicationSubmit', { application: this.application })
  }

  completeBasicInformation() {
    const sentenceTypePage = new SentenceTypePage(this.application)
    sentenceTypePage.completeForm()
    sentenceTypePage.clickSubmit()

    this.pages.reasonsForPlacement = [sentenceTypePage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Not started')

    // And the risk widgets should be visible
    if (this.uiRisks) {
      tasklistPage.shouldShowRiskWidgets(this.uiRisks)
    }
  }

  private completeCheckYourAnswersSection() {
    // Given I click the check your answers task
    cy.get('[data-cy-task-name="check-your-answers"]').click()

    // Then I should be on the check your answers page
    const checkYourAnswersPage = new CheckYourAnswersPage(this.application)

    // And the page should be populated with my answers
    checkYourAnswersPage.shouldShowBasicInformationAnswers(this.pages.reasonsForPlacement)

    // When I have checked my answers
    checkYourAnswersPage.clickSubmit()

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the check your answers task should show a completed status
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  }

  private submitApplication() {
    const tasklistPage = Page.verifyOnPage(TaskListPage)
    tasklistPage.checkCheckboxByLabel('submit')

    tasklistPage.clickSubmit()
  }
}
