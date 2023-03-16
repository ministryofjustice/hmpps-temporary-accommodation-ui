import {
  ActiveOffence,
  Adjudication,
  ApprovedPremisesApplication as Application,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  Document,
  OASysSection,
  Person,
} from '@approved-premises/api'
import { PersonRisksUI } from '@approved-premises/ui'
import documentFactory from '../../server/testutils/factories/document'
import oasysSectionsFactory from '../../server/testutils/factories/oasysSections'
import oasysSelectionFactory from '../../server/testutils/factories/oasysSelection'
import { documentsFromApplication } from '../../server/utils/assessments/documentUtils'
import Page from '../pages'
import {
  AttachDocumentsPage,
  CheckYourAnswersPage,
  ConfirmDetailsPage,
  EnterCRNPage,
  OffenceDetailsPage,
  OptionalOasysSectionsPage,
  RiskManagementPlanPage,
  RiskToSelfPage,
  RoshSummaryPage,
  SentenceTypePage,
  StartPage,
  SupportingInformationPage,
  TaskListPage,
} from '../pages/apply'
import ApplyPage from '../pages/apply/applyPage'
import {
  offenceDetailSummariesFromApplication,
  riskManagementPlanFromApplication,
  riskToSelfSummariesFromApplication,
  roshSummariesFromApplication,
  supportInformationFromApplication,
} from './index'

export default class ApplyHelper {
  pages = {
    reasonsForPlacement: [] as Array<ApplyPage>,
    riskAndNeedFactors: [] as Array<ApplyPage>,
    addDocuments: [] as Array<ApplyPage>,
  }

  uiRisks?: PersonRisksUI

  oasysSectionsLinkedToReoffending: Array<OASysSection> = []

  otherOasysSections: Array<OASysSection> = []

  roshSummaries: ArrayOfOASysRiskOfSeriousHarmSummaryQuestions = []

  offenceDetailSummaries: ArrayOfOASysOffenceDetailsQuestions = []

  supportingInformationSummaries: ArrayOfOASysSupportingInformationQuestions = []

  riskManagementPlanSummaries: ArrayOfOASysRiskManagementPlanQuestions = []

  riskToSelfSummaries: ArrayOfOASysRiskToSelfQuestions = []

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
    this.completeOasysImport()
    this.completeAttachDocuments()
    this.completeCheckYourAnswersSection()
    this.submitApplication()
  }

  numberOfPages() {
    return [...this.pages.reasonsForPlacement, ...this.pages.riskAndNeedFactors, this.pages.addDocuments].length
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

    const oasysSections = oasysSectionsFactory.build()

    this.roshSummaries = roshSummariesFromApplication(this.application)
    this.offenceDetailSummaries = offenceDetailSummariesFromApplication(this.application)
    this.supportingInformationSummaries = supportInformationFromApplication(this.application)
    this.riskManagementPlanSummaries = riskManagementPlanFromApplication(this.application)
    this.riskToSelfSummaries = riskToSelfSummariesFromApplication(this.application)

    cy.task('stubOasysSections', {
      person: this.person,
      oasysSections: {
        ...oasysSections,
        roshSummary: this.roshSummaries,
        offenceDetails: this.offenceDetailSummaries,
        riskManagementPlan: this.riskManagementPlanSummaries,
        riskToSelf: this.riskToSelfSummaries,
      },
    })
    cy.task('stubOasysSectionsWithSelectedSections', {
      person: this.person,
      oasysSections: {
        ...oasysSections,
        roshSummary: this.roshSummaries,
        offenceDetails: this.offenceDetailSummaries,
        supportingInformation: this.supportingInformationSummaries,
      },
      selectedSections: [1, 2, 3, 4],
    })
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
    tasklistPage.shouldShowTaskStatus('oasys-import', 'Not started')

    // And the risk widgets should be visible
    if (this.uiRisks) {
      tasklistPage.shouldShowRiskWidgets(this.uiRisks)
    }
  }

  private completeOasysImport() {
    // Given I click the 'Import Oasys' task
    cy.get('[data-cy-task-name="oasys-import"]').click()
    const optionalOasysImportPage = new OptionalOasysSectionsPage(this.application)

    // When I complete the form
    optionalOasysImportPage.completeForm(this.oasysSectionsLinkedToReoffending, this.otherOasysSections)
    optionalOasysImportPage.clickSubmit()

    const roshSummaryPage = new RoshSummaryPage(this.application, this.roshSummaries)

    if (this.uiRisks) {
      roshSummaryPage.shouldShowRiskWidgets(this.uiRisks)
    }

    roshSummaryPage.completeForm()

    roshSummaryPage.clickSubmit()

    const offenceDetailsPage = new OffenceDetailsPage(this.application, this.offenceDetailSummaries)

    if (this.uiRisks) {
      offenceDetailsPage.shouldShowRiskWidgets(this.uiRisks)
    }

    offenceDetailsPage.completeForm()
    offenceDetailsPage.clickSubmit()

    const supportingInformationPage = new SupportingInformationPage(
      this.application,
      this.supportingInformationSummaries,
    )
    supportingInformationPage.completeForm()
    supportingInformationPage.clickSubmit()

    const riskManagementPlanPage = new RiskManagementPlanPage(this.application, this.riskManagementPlanSummaries)
    riskManagementPlanPage.completeForm()
    riskManagementPlanPage.clickSubmit()

    const riskToSelfPage = new RiskToSelfPage(this.application, this.riskToSelfSummaries)
    riskToSelfPage.completeForm()
    riskToSelfPage.clickSubmit()

    this.pages.riskAndNeedFactors = [
      optionalOasysImportPage,
      roshSummaryPage,
      offenceDetailsPage,
      supportingInformationPage,
      riskManagementPlanPage,
      riskToSelfPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // Then I should be taken back to the tasklist
    tasklistPage.shouldShowTaskStatus('oasys-import', 'Completed')

    // And the Attach Documents task should show as not started
    tasklistPage.shouldShowTaskStatus('attach-required-documents', 'Not started')
  }

  private completeAttachDocuments() {
    // Given I click on the Attach Documents task
    cy.get('[data-cy-task-name="attach-required-documents"]').click()
    const attachDocumentsPage = new AttachDocumentsPage(this.documents, this.selectedDocuments, this.application)

    // Then I should be able to download the documents
    attachDocumentsPage.shouldBeAbleToDownloadDocuments(this.documents)

    // And I attach the relevant documents
    attachDocumentsPage.shouldDisplayDocuments()
    attachDocumentsPage.completeForm()
    attachDocumentsPage.clickSubmit()

    this.pages.addDocuments = [attachDocumentsPage]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the Attach Documents task should show a completed status
    tasklistPage.shouldShowTaskStatus('attach-required-documents', 'Completed')

    // And the Check Your Answers task should show as not started
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Not started')
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
