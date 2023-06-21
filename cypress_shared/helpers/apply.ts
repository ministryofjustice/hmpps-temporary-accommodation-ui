import {
  ActiveOffence,
  Adjudication,
  TemporaryAccommodationApplication as Application,
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
import { hasSubmittedDtr } from '../../server/form-pages/utils'
import { documentFactory, oasysSectionsFactory, oasysSelectionFactory } from '../../server/testutils/factories'
import { documentsFromApplication } from '../../server/utils/assessments/documentUtils'
import Page from '../pages'
import {
  AccommodationRequiredFromDatePage,
  AdditionalLicenceConditionsPage,
  AlternativePduPage,
  AttachDocumentsPage,
  BackupContactPage,
  CaringResponsibilitiesPage,
  CheckYourAnswersPage,
  ConfirmDetailsPage,
  ConsentDetailsPage,
  ConsentGivenPage,
  CrsSubmittedPage,
  DtrDetailsPage,
  DtrSubmittedPage,
  EligibilityReasonPage,
  EnterCRNPage,
  FoodAllergiesPage,
  LocalConnectionsPage,
  MoveOnPlanPage,
  NeedsPage,
  OffenceDetailsPage,
  OptionalOasysSectionsPage,
  OtherAccommodationOptionsPage,
  PractitionerPduPage,
  ProbationPractitionerPage,
  PropertyAttributesOrAdaptationsPage,
  PropertySharingPage,
  ReferralHistoryDetailsPage,
  ReleaseDatePage,
  ReleaseTypePage,
  ReligiousOrCulturalNeedsPage,
  RiskManagementPlanPage,
  RiskToSelfPage,
  RoshSummaryPage,
  SafeguardingAndVulnerabilityPage,
  SentenceExpiryPage,
  SentenceTypePage,
  StartPage,
  SupportInTheCommunityPage,
  SupportingInformationPage,
  TaskListPage,
} from '../pages/apply'
import ReferralsPreviouslySubmittedPage from '../pages/apply/accommodation-need/accommodation-referral-history/referralsPreviouslySubmitted'
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
    sentenceInformation: [] as Array<ApplyPage>,
    contactDetails: [] as Array<ApplyPage>,
    eligibility: [] as Array<ApplyPage>,
    accommodationReferralHistory: [] as Array<ApplyPage>,
    consent: [] as Array<ApplyPage>,
    licenceConditions: [] as Array<ApplyPage>,
    oasysImport: [] as Array<ApplyPage>,
    placementLocation: [] as Array<ApplyPage>,
    disabilityCulturalAndSpecificNeeds: [] as Array<ApplyPage>,
    safeguardingAndSupport: [] as Array<ApplyPage>,
    requirementsFromPlacement: [] as Array<ApplyPage>,
    moveOnPlan: [] as Array<ApplyPage>,
    accommodationReferralDetails: [] as Array<ApplyPage>,
    attachDocuments: [] as Array<ApplyPage>,
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
    private readonly environment: 'e2e' | 'integration',
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
    confirmDetailsPage.shouldPersonDetails()

    // And I confirm the person is who I expect to see
    confirmDetailsPage.clickSubmit()
  }

  completeApplication() {
    this.completeSentenceInformation()
    this.completeContactDetails()
    this.completeEligibility()
    this.completeAccommodationReferralHistory()
    this.completeConsent()
    this.completeLicenceConditions()
    this.completeOasysImport()
    this.completePlacementLocation()
    this.completeDisabilityCulturalAndSpecificNeeds()
    this.completeSafeguardingAndSupport()
    this.completeRequirementsForPlacement()
    this.completeMoveOnPlan()
    this.completeAccommodationReferralDetails()
    this.completeAttachDocuments()

    this.completeCheckYourAnswersSection()
    this.submitApplication()
  }

  numberOfPages() {
    return [
      ...this.pages.sentenceInformation,
      ...this.pages.contactDetails,
      ...this.pages.eligibility,
      ...this.pages.accommodationReferralHistory,
      ...this.pages.consent,
      ...this.pages.licenceConditions,
      ...this.pages.oasysImport,
      ...this.pages.placementLocation,
      ...this.pages.disabilityCulturalAndSpecificNeeds,
      ...this.pages.safeguardingAndSupport,
      ...this.pages.requirementsFromPlacement,
      ...this.pages.moveOnPlan,
      ...this.pages.accommodationReferralDetails,
      ...this.pages.attachDocuments,
    ].length
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

  completeSentenceInformation() {
    // Given I click the sentence information task
    cy.get('[data-cy-task-name="sentence-information"]').click()

    // When I complete the form
    const sentenceTypePage = new SentenceTypePage(this.application)
    sentenceTypePage.completeForm()
    sentenceTypePage.clickSubmit()

    const sentenceExpiryPage = new SentenceExpiryPage(this.application)
    sentenceExpiryPage.completeForm()
    sentenceExpiryPage.clickSubmit()

    const releaseTypePage = new ReleaseTypePage(this.application)
    releaseTypePage.completeForm()
    releaseTypePage.clickSubmit()

    this.pages.sentenceInformation = [sentenceTypePage, sentenceExpiryPage, releaseTypePage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('sentence-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('contact-details', 'Not started')

    // And the risk widgets should be visible
    if (this.uiRisks) {
      tasklistPage.shouldShowRiskWidgets(this.uiRisks)
    }
  }

  private completeContactDetails() {
    // Given I click the contact details task
    cy.get('[data-cy-task-name="contact-details"]').click()

    // When I complete the form
    const probationPractitionerPage = new ProbationPractitionerPage(this.application)
    probationPractitionerPage.completeForm()
    probationPractitionerPage.clickSubmit()

    const backupContactPage = new BackupContactPage(this.application)
    backupContactPage.completeForm()
    backupContactPage.clickSubmit()

    const practitionerPduPage = new PractitionerPduPage(this.application)
    practitionerPduPage.completeForm()
    practitionerPduPage.clickSubmit()

    this.pages.contactDetails = [probationPractitionerPage, backupContactPage, practitionerPduPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('contact-details', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('eligibility', 'Not started')
  }

  private completeEligibility() {
    // Given I click the eligibility task
    cy.get('[data-cy-task-name="eligibility"]').click()

    // When I complete the form
    const eligibilityReasonPage = new EligibilityReasonPage(this.application)
    eligibilityReasonPage.completeForm()
    eligibilityReasonPage.clickSubmit()

    const releaseDatePage = new ReleaseDatePage(this.application)
    releaseDatePage.completeForm()
    releaseDatePage.clickSubmit()

    const accommodationRequiredFromDatePage = new AccommodationRequiredFromDatePage(this.application)
    accommodationRequiredFromDatePage.completeForm()
    accommodationRequiredFromDatePage.clickSubmit()

    this.pages.eligibility = [eligibilityReasonPage, releaseDatePage, accommodationRequiredFromDatePage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('eligibility', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('accommodation-referral-history', 'Not started')
  }

  private completeAccommodationReferralHistory() {
    // Given I click the accommodation referral history task
    cy.get('[data-cy-task-name="accommodation-referral-history"]').click()

    // When I complete the form
    const referralsPreviouslySumbittedPage = new ReferralsPreviouslySubmittedPage(this.application)
    referralsPreviouslySumbittedPage.completeForm()
    referralsPreviouslySumbittedPage.clickSubmit()

    const referralHistoryDetailsPage = new ReferralHistoryDetailsPage(this.application)
    referralHistoryDetailsPage.completeForm()
    referralHistoryDetailsPage.clickSubmit()

    this.pages.accommodationReferralHistory = [referralsPreviouslySumbittedPage, referralHistoryDetailsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('accommodation-referral-history', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('consent', 'Not started')
  }

  private completeConsent() {
    // Given I click the eligibility task
    cy.get('[data-cy-task-name="consent"]').click()

    // When I complete the form
    const consentGivenPage = new ConsentGivenPage(this.application)
    consentGivenPage.completeForm()
    consentGivenPage.clickSubmit()

    const consentDetailsPage = new ConsentDetailsPage(this.application)
    consentDetailsPage.completeForm()
    consentDetailsPage.clickSubmit()

    this.pages.consent = [consentGivenPage, consentDetailsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('consent', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('licence-conditions', 'Not started')
  }

  private completeLicenceConditions() {
    // Given I click the eligibility task
    cy.get('[data-cy-task-name="licence-conditions"]').click()

    // When I complete the form
    const additionalLicenceConditionsPage = new AdditionalLicenceConditionsPage(this.application)
    additionalLicenceConditionsPage.completeForm()
    additionalLicenceConditionsPage.clickSubmit()

    this.pages.licenceConditions = [additionalLicenceConditionsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('licence-conditions', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('oasys-import', 'Not started')
  }

  private completeOasysImport() {
    // Given I click the oasys import task
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

    this.pages.oasysImport = [
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

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('placement-location', 'Not started')
  }

  private completePlacementLocation() {
    // Given I click on the safeguarding and support task
    cy.get('[data-cy-task-name="placement-location"]').click()

    // When I complete the form
    const alternativePduPage = new AlternativePduPage(this.application)
    alternativePduPage.completeForm()
    alternativePduPage.clickSubmit()

    this.pages.placementLocation = [alternativePduPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('disability-cultural-and-specific-needs', 'Not started')
  }

  private completeDisabilityCulturalAndSpecificNeeds() {
    // Given I click on the safeguarding and support task
    cy.get('[data-cy-task-name="disability-cultural-and-specific-needs"]').click()

    // When I complete the form
    const needsPage = new NeedsPage(this.application)
    needsPage.completeForm()
    needsPage.clickSubmit()

    const propertyAttributesOrAdaptationsPage = new PropertyAttributesOrAdaptationsPage(this.application)
    propertyAttributesOrAdaptationsPage.completeForm()
    propertyAttributesOrAdaptationsPage.clickSubmit()

    const religiousOrCulturalNeedsPage = new ReligiousOrCulturalNeedsPage(this.application)
    religiousOrCulturalNeedsPage.completeForm()
    religiousOrCulturalNeedsPage.clickSubmit()

    this.pages.disabilityCulturalAndSpecificNeeds = [
      needsPage,
      propertyAttributesOrAdaptationsPage,
      religiousOrCulturalNeedsPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('disability-cultural-and-specific-needs', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('safeguarding-and-support', 'Not started')
  }

  private completeSafeguardingAndSupport() {
    // Given I click on the safeguarding and support task
    cy.get('[data-cy-task-name="safeguarding-and-support"]').click()

    // When I complete the form
    const safeguardingAndVulnerabilityPage = new SafeguardingAndVulnerabilityPage(this.application)
    safeguardingAndVulnerabilityPage.completeForm()
    safeguardingAndVulnerabilityPage.clickSubmit()

    const supportInTheCommunityPage = new SupportInTheCommunityPage(this.application)
    supportInTheCommunityPage.completeForm()
    supportInTheCommunityPage.clickSubmit()

    const localConnectionsPage = new LocalConnectionsPage(this.application)
    localConnectionsPage.completeForm()
    localConnectionsPage.clickSubmit()

    const careResponsibilitiesPage = new CaringResponsibilitiesPage(this.application)
    careResponsibilitiesPage.completeForm()
    careResponsibilitiesPage.clickSubmit()

    this.pages.safeguardingAndSupport = [
      safeguardingAndVulnerabilityPage,
      supportInTheCommunityPage,
      localConnectionsPage,
      careResponsibilitiesPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('safeguarding-and-support', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('requirements-for-placement', 'Not started')
  }

  private completeRequirementsForPlacement() {
    // Given I click on the requirements for placement task
    cy.get('[data-cy-task-name="requirements-for-placement"]').click()

    // When I complete the form
    const propertySharingPage = new PropertySharingPage(this.application)
    propertySharingPage.completeForm()
    propertySharingPage.clickSubmit()

    const foodAllergiesPage = new FoodAllergiesPage(this.application)
    foodAllergiesPage.completeForm()
    foodAllergiesPage.clickSubmit()

    this.pages.requirementsFromPlacement = [propertySharingPage, foodAllergiesPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('requirements-for-placement', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('move-on-plan', 'Not started')
  }

  private completeMoveOnPlan() {
    // Given I click on the move on plan task
    cy.get('[data-cy-task-name="move-on-plan"]').click()

    // When I complete the form
    const moveOnPlanPage = new MoveOnPlanPage(this.application)
    moveOnPlanPage.completeForm()
    moveOnPlanPage.clickSubmit()

    this.pages.moveOnPlan = [moveOnPlanPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('move-on-plan', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('accommodation-referral-details', 'Not started')
  }

  private completeAccommodationReferralDetails() {
    // Given I click on the accommodation referral details task
    cy.get('[data-cy-task-name="accommodation-referral-details"]').click()

    this.pages.accommodationReferralDetails = []

    // When I complete the form
    const dtrSubmittedPage = new DtrSubmittedPage(this.application)
    dtrSubmittedPage.completeForm()
    dtrSubmittedPage.clickSubmit()
    this.pages.accommodationReferralDetails.push(dtrSubmittedPage)

    if (hasSubmittedDtr(this.application)) {
      const dtrDetailsPage = new DtrDetailsPage(this.application)
      dtrDetailsPage.completeForm()
      dtrDetailsPage.clickSubmit()
      this.pages.accommodationReferralDetails.push(dtrDetailsPage)
    }

    const crsSubmittedPage = new CrsSubmittedPage(this.application)
    crsSubmittedPage.completeForm()
    crsSubmittedPage.clickSubmit()
    this.pages.accommodationReferralDetails.push(crsSubmittedPage)

    const otherAccommodationOptionsPage = new OtherAccommodationOptionsPage(this.application)
    otherAccommodationOptionsPage.completeForm()
    otherAccommodationOptionsPage.clickSubmit()
    this.pages.accommodationReferralDetails.push(otherAccommodationOptionsPage)

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('accommodation-referral-details', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('attach-documents', 'Not started')
  }

  private completeAttachDocuments() {
    // Given I click on the attach documents task
    cy.get('[data-cy-task-name="attach-documents"]').click()
    const attachDocumentsPage = new AttachDocumentsPage(this.documents, this.selectedDocuments, this.application)

    // Then I should be able to download the documents
    attachDocumentsPage.shouldBeAbleToDownloadDocuments(this.documents)

    // And I attach the relevant documents
    attachDocumentsPage.shouldDisplayDocuments()
    attachDocumentsPage.completeForm()
    attachDocumentsPage.clickSubmit()

    this.pages.attachDocuments = [attachDocumentsPage]

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the Attach Documents task should show a completed status
    tasklistPage.shouldShowTaskStatus('attach-documents', 'Completed')

    // And the Check Your Answers task should show as not started
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Not started')
  }

  private completeCheckYourAnswersSection() {
    // Given I click the check your answers task
    cy.get('[data-cy-task-name="check-your-answers"]').click()

    // Then I should be on the check your answers page
    const checkYourAnswersPage = new CheckYourAnswersPage(this.application)
    checkYourAnswersPage.shouldShowPersonDetails()

    // And the page should be populated with my answers
    checkYourAnswersPage.shouldShowSentenceInformationAnswers(this.pages.sentenceInformation)
    checkYourAnswersPage.shouldShowContactDetailsAnswers(this.pages.contactDetails)
    checkYourAnswersPage.shouldShowEligibilityAnswers(this.pages.eligibility)
    checkYourAnswersPage.shouldShowAccommodationReferralHistoryAnswers(this.pages.accommodationReferralHistory)
    checkYourAnswersPage.shouldShowConsentAnswers(this.pages.consent)
    checkYourAnswersPage.shouldShowLicenceConditionsAnswers(this.pages.licenceConditions)

    if (this.environment === 'integration') {
      checkYourAnswersPage.shouldShowOasysImportAnswers(this.pages.oasysImport)
    }

    checkYourAnswersPage.shouldShowPlacementLocationAnswers(this.pages.placementLocation)
    checkYourAnswersPage.shouldShowDisabilityCulturalAndSpecificNeedsAnswers(
      this.pages.disabilityCulturalAndSpecificNeeds,
    )
    checkYourAnswersPage.shouldShowSafeguardingAndSupportAnswers(this.pages.safeguardingAndSupport)
    checkYourAnswersPage.shouldShowRequirementsForPlacementAnswers(this.pages.requirementsFromPlacement)
    checkYourAnswersPage.shouldShowMoveOnPlanAnswers(this.pages.moveOnPlan)
    checkYourAnswersPage.shouldShowAccommodationReferralDetails(this.pages.accommodationReferralDetails)

    if (this.environment === 'integration') {
      checkYourAnswersPage.shouldShowAttachDocumentsAnswers(this.pages.attachDocuments)
    }

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
