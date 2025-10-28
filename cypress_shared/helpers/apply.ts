import {
  ActiveOffence,
  Adjudication,
  OASysQuestion,
  OASysSupportingInformationQuestion,
  Person,
  PersonAcctAlert,
  TemporaryAccommodationApplication,
  TemporaryAccommodationUser,
} from '@approved-premises/api'
import { PersonRisksUI } from '@approved-premises/ui'
import {
  offenceDetailSummariesFromJson,
  riskManagementPlanFromJson,
  riskToSelfSummariesFromJson,
  roshSummariesFromJson,
  supportInformationFromJson,
} from '.'
import { hasSubmittedDtr } from '../../server/form-pages/utils'
import {
  acctAlertFactory,
  adjudicationFactory,
  localAuthorityFactory,
  oasysSectionsFactory,
  referenceDataFactory,
} from '../../server/testutils/factories'
import applicationDataJson from '../fixtures/applicationData.json'
import Page from '../pages'
import {
  AccommodationRequiredFromDatePage,
  AccommodationSharingPage,
  AcctAlertsPage,
  AdditionalLicenceConditionsPage,
  AdjudicationsPage,
  AlternativePduPage,
  AlternativePduReasonPage,
  AlternativeRegionPage,
  AntiSocialBehaviourPage,
  ApprovalsForSpecificRisksPage,
  BackupContactPage,
  CaringResponsibilitiesPage,
  CheckYourAnswersPage,
  ConcerningArsonBehaviourPage,
  ConcerningSexualBehaviourPage,
  ConfirmDetailsPage,
  ConsentGivenPage,
  CooperationPage,
  CrsSubmittedPage,
  DifferentRegionPage,
  DtrDetailsPage,
  DtrSubmittedPage,
  EligibilityReasonPage,
  EnterCRNPage,
  FoodAllergiesPage,
  HistoryOfArsonOffencePage,
  HistoryOfSexualOffencePage,
  LocalConnectionsPage,
  MoveOnPlanPage,
  NeedsPage,
  OffendingSummaryPage,
  OtherAccommodationOptionsPage,
  PduEvidencePage,
  PlacementPduPage,
  PopPhoneNumberPage,
  PreviousStaysDetailsPage,
  PreviousStaysPage,
  ProbationPractitionerPage,
  PropertyAttributesOrAdaptationsPage,
  ReleaseDatePage,
  ReleaseTypePage,
  ReligiousOrCulturalNeedsPage,
  RiskManagementPlanPage,
  RoshLevelPage,
  SafeguardingAndVulnerabilityPage,
  SentenceExpiryPage,
  SentenceLengthPage,
  SentenceTypePage,
  StartPage,
  SubstanceMisusePage,
  SupportInTheCommunityPage,
  TaskListPage,
} from '../pages/apply'
import ApplyPage from '../pages/apply/applyPage'

export default class ApplyHelper {
  pages = {
    offenceAndBehaviourSummary: [] as Array<ApplyPage>,
    sentenceInformation: [] as Array<ApplyPage>,
    contactDetails: [] as Array<ApplyPage>,
    eligibility: [] as Array<ApplyPage>,
    consent: [] as Array<ApplyPage>,
    licenceConditions: [] as Array<ApplyPage>,
    prisonInformation: [] as Array<ApplyPage>,
    placementConsiderations: [] as Array<ApplyPage>,
    approvalsForSpecificRisks: [] as Array<ApplyPage>,
    behaviourInCas: [] as Array<ApplyPage>,
    placementLocation: [] as Array<ApplyPage>,
    disabilityCulturalAndSpecificNeeds: [] as Array<ApplyPage>,
    safeguardingAndSupport: [] as Array<ApplyPage>,
    requirementsFromPlacement: [] as Array<ApplyPage>,
    moveOnPlan: [] as Array<ApplyPage>,
    accommodationReferralDetails: [] as Array<ApplyPage>,
  }

  uiRisks?: PersonRisksUI

  roshSummaries: Array<OASysQuestion> = []

  offenceDetailSummaries: Array<OASysQuestion> = []

  supportingInformationSummaries: Array<OASysSupportingInformationQuestion> = []

  riskManagementPlanSummaries: Array<OASysQuestion> = []

  riskToSelfSummaries: Array<OASysQuestion> = []

  adjudications: Array<Adjudication> = []

  acctAlerts: Array<PersonAcctAlert> = []

  documents: Array<Document> = []

  selectedDocuments: Array<Document> = []

  constructor(
    private readonly application: TemporaryAccommodationApplication,
    private readonly person: Person,
    private readonly offences: Array<ActiveOffence>,
    private readonly environment: 'e2e' | 'integration',
    private readonly actingUser?: TemporaryAccommodationUser,
  ) {}

  setupApplicationStubs(uiRisks?: PersonRisksUI) {
    this.uiRisks = uiRisks
    this.stubPersonEndpoints()
    this.stubApplicationEndpoints()
    this.stubAdjudicationEndpoints()
    this.stubAcctAlertsEndpoint()
    this.stubOasysEndpoints()
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
    this.completePlacementLocation()
    this.completeOffenceAndBehaviourSummary()
    this.completeSentenceInformation()
    this.completeContactDetails()
    this.completeEligibility()
    this.completeConsent()
    this.completeLicenceConditions()
    this.completePrisonInformation()
    this.completePlacementConsiderations()
    this.completeApprovalsForSpecificRisks()
    this.completeBehaviourInCas()
    this.completeDisabilityCulturalAndSpecificNeeds()
    this.completeSafeguardingAndSupport()
    this.completeFoodAllergies()
    this.completeMoveOnPlan()
    this.completeAccommodationReferralDetails()

    this.completeCheckYourAnswersSection()
    this.submitApplication()
  }

  numberOfPages() {
    return [
      ...this.pages.offenceAndBehaviourSummary,
      ...this.pages.sentenceInformation,
      ...this.pages.contactDetails,
      ...this.pages.eligibility,
      ...this.pages.consent,
      ...this.pages.licenceConditions,
      ...this.pages.prisonInformation,
      ...this.pages.approvalsForSpecificRisks,
      ...this.pages.placementConsiderations,
      ...this.pages.behaviourInCas,
      ...this.pages.placementLocation,
      ...this.pages.disabilityCulturalAndSpecificNeeds,
      ...this.pages.safeguardingAndSupport,
      ...this.pages.requirementsFromPlacement,
      ...this.pages.moveOnPlan,
      ...this.pages.accommodationReferralDetails,
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
    cy.task('stubApplicationSubmit', { application: this.application })
  }

  private stubAdjudicationEndpoints() {
    this.adjudications = applicationDataJson['prison-information'].adjudications.adjudications.map(adjudicationJson =>
      adjudicationFactory.build(adjudicationJson),
    )

    cy.task('stubAdjudications', { person: this.person, adjudications: this.adjudications })
  }

  private stubAcctAlertsEndpoint() {
    this.acctAlerts = applicationDataJson['prison-information']['acct-alerts'].acctAlerts.map(acctAlertJson =>
      acctAlertFactory.build(acctAlertJson),
    )

    cy.task('stubAcctAlerts', { person: this.person, acctAlerts: this.acctAlerts })
  }

  private stubOasysEndpoints() {
    // And there are OASys sections in the db
    const oasysSections = oasysSectionsFactory.build()

    this.roshSummaries = roshSummariesFromJson()
    this.offenceDetailSummaries = offenceDetailSummariesFromJson()
    this.supportingInformationSummaries = supportInformationFromJson()
    this.riskManagementPlanSummaries = riskManagementPlanFromJson()
    this.riskToSelfSummaries = riskToSelfSummariesFromJson()

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

  completeOffenceAndBehaviourSummary() {
    // Given I click the offence and behaviour summary task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('offence-and-behaviour-summary')

    // When I complete the form
    const historyOfSexualOffencePage = new HistoryOfSexualOffencePage(this.application)
    historyOfSexualOffencePage.completeForm()
    historyOfSexualOffencePage.clickSubmit()

    const concerningSexualBehaviourPage = new ConcerningSexualBehaviourPage(this.application)
    concerningSexualBehaviourPage.completeForm()
    concerningSexualBehaviourPage.clickSubmit()

    const historyOfArsonOffence = new HistoryOfArsonOffencePage(this.application)
    historyOfArsonOffence.completeForm()
    historyOfArsonOffence.clickSubmit()

    const concerningArsonBehaviourPage = new ConcerningArsonBehaviourPage(this.application)
    concerningArsonBehaviourPage.completeForm()
    concerningArsonBehaviourPage.clickSubmit()

    this.pages.offenceAndBehaviourSummary = [
      historyOfSexualOffencePage,
      concerningSexualBehaviourPage,
      historyOfArsonOffence,
      concerningArsonBehaviourPage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('sentence-information', 'Not started')

    // And the risk widgets should be visible
    if (this.uiRisks) {
      tasklistPage.shouldShowRiskWidgets(this.uiRisks)
    }
  }

  completeSentenceInformation() {
    // Given I click the sentence information task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('sentence-information')

    // When I complete the form
    const offendingSummaryPage = new OffendingSummaryPage(this.application)
    offendingSummaryPage.completeForm()
    offendingSummaryPage.clickSubmit()

    const sentenceTypePage = new SentenceTypePage(this.application)
    sentenceTypePage.completeForm()
    sentenceTypePage.clickSubmit()

    const sentenceLengthPage = new SentenceLengthPage(this.application)
    sentenceLengthPage.completeForm()
    sentenceLengthPage.clickSubmit()

    const sentenceExpiryPage = new SentenceExpiryPage(this.application)
    sentenceExpiryPage.completeForm()
    sentenceExpiryPage.clickSubmit()

    const releaseTypePage = new ReleaseTypePage(this.application)
    releaseTypePage.completeForm()
    releaseTypePage.clickSubmit()

    this.pages.sentenceInformation = [
      offendingSummaryPage,
      sentenceTypePage,
      sentenceLengthPage,
      sentenceExpiryPage,
      releaseTypePage,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('sentence-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('contact-details', 'Not started')
  }

  private completeContactDetails() {
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build(this.application.data['contact-details']['practitioner-pdu'])
      cy.task('stubPdus', { pdus: [pdu], probationRegionId: this.actingUser.region.id })
    }

    // Given I click the contact details task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('contact-details')

    // When I complete the form
    const probationPractitionerPage = new ProbationPractitionerPage(this.application)
    probationPractitionerPage.completeForm()
    probationPractitionerPage.clickSubmit()

    const backupContactPage = new BackupContactPage(this.application)
    backupContactPage.completeForm()
    backupContactPage.clickSubmit()

    const popPhoneNumberPage = new PopPhoneNumberPage(this.application)
    popPhoneNumberPage.completeForm()
    popPhoneNumberPage.clickSubmit()

    this.pages.contactDetails = [probationPractitionerPage, backupContactPage, popPhoneNumberPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('contact-details', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('eligibility', 'Not started')
  }

  private completeEligibility() {
    // Given I click the eligibility task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('eligibility')

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
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('eligibility', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('consent', 'Not started')
  }

  private completeConsent() {
    // Given I click the eligibility task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('consent')

    // When I complete the form
    const consentGivenPage = new ConsentGivenPage(this.application)
    consentGivenPage.completeForm()
    consentGivenPage.clickSubmit()

    this.pages.consent = [consentGivenPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('consent', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('licence-conditions', 'Not started')
  }

  private completeLicenceConditions() {
    // Given I click the eligibility task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('licence-conditions')

    // When I complete the form
    const additionalLicenceConditionsPage = new AdditionalLicenceConditionsPage(this.application)
    additionalLicenceConditionsPage.completeForm()
    additionalLicenceConditionsPage.clickSubmit()

    this.pages.licenceConditions = [additionalLicenceConditionsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('licence-conditions', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('prison-information', 'Not started')
  }

  private completePrisonInformation() {
    // Given I click the eligibility task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('prison-information')

    // When I complete the form
    const adjudicationsPage = new AdjudicationsPage(this.application)
    if (this.environment === 'integration') {
      adjudicationsPage.shouldDisplayAdjudications(this.adjudications)
    }
    adjudicationsPage.clickSubmit()

    const acctAlertsPage = new AcctAlertsPage(this.application)
    if (this.environment === 'integration') {
      acctAlertsPage.shouldDisplayAcctAlerts(this.acctAlerts)
    }
    acctAlertsPage.clickSubmit()

    this.pages.prisonInformation = [adjudicationsPage, acctAlertsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('prison-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('placement-considerations', 'Not started')
  }

  private completePlacementConsiderations() {
    // Given I click the placement considerations task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-considerations')

    // When I complete the form
    const accommodationSharingPage = new AccommodationSharingPage(this.application)
    accommodationSharingPage.completeForm()
    accommodationSharingPage.clickSubmit()

    const cooperationPage = new CooperationPage(this.application)
    cooperationPage.completeForm()
    cooperationPage.clickSubmit()

    const antiSocialBehaviourPage = new AntiSocialBehaviourPage(this.application)
    antiSocialBehaviourPage.completeForm()
    antiSocialBehaviourPage.clickSubmit()

    const substanceMisusePage = new SubstanceMisusePage(this.application)
    substanceMisusePage.completeForm()
    substanceMisusePage.clickSubmit()

    const roshLevelPage = new RoshLevelPage(this.application)
    roshLevelPage.completeForm()
    roshLevelPage.clickSubmit()

    const riskManagementPlan = new RiskManagementPlanPage(
      this.application,
      this.riskManagementPlanSummaries,
      this.environment !== 'integration',
    )
    riskManagementPlan.completeForm()
    riskManagementPlan.clickSubmit()

    this.pages.placementConsiderations = [
      accommodationSharingPage,
      cooperationPage,
      antiSocialBehaviourPage,
      substanceMisusePage,
      roshLevelPage,
      riskManagementPlan,
    ]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-considerations', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('approvals-for-specific-risks', 'Not started')
  }

  private completeApprovalsForSpecificRisks() {
    // Given I click the approvals for specific risks task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('approvals-for-specific-risks')

    // Then the risk widgets are visible
    const approvalsForSpecificRisksPage = new ApprovalsForSpecificRisksPage(this.application)

    if (this.uiRisks) {
      approvalsForSpecificRisksPage.shouldShowMappa()
      approvalsForSpecificRisksPage.shouldShowRosh(this.uiRisks.roshRisks)
      approvalsForSpecificRisksPage.shouldShowDeliusRiskFlags(this.uiRisks.flags)
    }

    // And when I complete the form
    approvalsForSpecificRisksPage.completeForm()
    approvalsForSpecificRisksPage.clickSubmit()

    this.pages.approvalsForSpecificRisks = [approvalsForSpecificRisksPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('approvals-for-specific-risks', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('behaviour-in-cas', 'Not started')
  }

  private completeBehaviourInCas() {
    // Given I click the behaviour in CAS task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('behaviour-in-cas')

    // When I complete the form
    const previousStaysPage = new PreviousStaysPage(this.application)
    previousStaysPage.completeForm()
    previousStaysPage.clickSubmit()

    const previousStaysDetailsPage = new PreviousStaysDetailsPage(this.application)
    previousStaysDetailsPage.completeForm()
    previousStaysDetailsPage.clickSubmit()

    this.pages.behaviourInCas = [previousStaysPage, previousStaysDetailsPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('behaviour-in-cas', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('disability-cultural-and-specific-needs', 'Not started')
  }

  completePlacementLocation() {
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build({
        id: this.application.data['placement-location']['alternative-pdu'].pduId,
        name: this.application.data['placement-location']['alternative-pdu'].pduName,
      })
      cy.task('stubPdus', {
        pdus: [pdu, ...referenceDataFactory.pdu().buildList(5)],
        probationRegionId: this.actingUser.region.id,
      })
    }
    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-location')

    // When I complete the form
    const alternativeRegionPage = new AlternativeRegionPage(this.application)
    alternativeRegionPage.completeForm()
    alternativeRegionPage.clickSubmit()

    const alternativePduPage = new AlternativePduPage(this.application)
    alternativePduPage.completeForm()
    alternativePduPage.clickSubmit()

    const alternativePduReasonPage = new AlternativePduReasonPage(this.application)
    alternativePduReasonPage.completeForm()
    alternativePduReasonPage.clickSubmit()

    this.pages.placementLocation = [alternativeRegionPage, alternativePduPage, alternativePduReasonPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Not started')
  }

  completePlacementLocationNonAlternativePdu() {
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build({
        id: this.application.data['placement-location']['alternative-pdu'].pduId,
        name: this.application.data['placement-location']['alternative-pdu'].pduName,
      })
      cy.task('stubPdus', {
        pdus: [pdu, ...referenceDataFactory.pdu().buildList(5)],
        probationRegionId: this.actingUser.region.id,
      })
    }

    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-location')

    // When I complete the form
    const alternativeRegionPage = new AlternativeRegionPage(this.application)
    alternativeRegionPage.completeForm()
    alternativeRegionPage.clickSubmit()

    const alternativePduPage = new AlternativePduPage(this.application)
    alternativePduPage.completeForm()
    alternativePduPage.clickSubmit()

    this.pages.placementLocation = [alternativeRegionPage, alternativePduPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Not started')
  }

  completePlacementLocationAlternativeRegionWithEvidence() {
    const stubbedProbationRegions = [
      referenceDataFactory.probationRegion().build({
        id: '1',
        name: 'South West',
        hptEmail: 'southwest.test@justice.gov.uk',
      }),
      referenceDataFactory.probationRegion().build({
        id: '2',
        name: 'North West',
        hptEmail: 'northwest.test@justice.gov.uk',
      }),
    ]
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build({
        id: this.application.data['placement-location']['alternative-pdu'].pduId,
        name: this.application.data['placement-location']['alternative-pdu'].pduName,
      })
      cy.task('stubPdus', {
        pdus: [pdu, ...referenceDataFactory.pdu().buildList(5)],
        probationRegionId: '2',
      })
      cy.task('stubProbationRegions', stubbedProbationRegions)
    }

    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-location')

    // When I complete the form
    const alternativeRegionPage = new AlternativeRegionPage(this.application)
    alternativeRegionPage.completeForm()
    alternativeRegionPage.clickSubmit()

    const differentRegionPage = new DifferentRegionPage(this.application)
    differentRegionPage.completeForm()
    differentRegionPage.clickSubmit()

    const placementPduPage = new PlacementPduPage(this.application)
    placementPduPage.completeForm()
    placementPduPage.clickSubmit()

    const pduEvidencePage = new PduEvidencePage(this.application)
    pduEvidencePage.completeForm()
    pduEvidencePage.shouldHaveCorrectRegionalInformation(stubbedProbationRegions)
    pduEvidencePage.clickSubmit()

    this.pages.placementLocation = [alternativeRegionPage, placementPduPage, differentRegionPage, pduEvidencePage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Not started')
  }

  completePlacementLocationAlternativeRegionWithNoEvidence() {
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build({
        id: this.application.data['placement-location']['alternative-pdu'].pduId,
        name: this.application.data['placement-location']['alternative-pdu'].pduName,
      })
      cy.task('stubPdus', {
        pdus: [pdu, ...referenceDataFactory.pdu().buildList(5)],
        probationRegionId: '2',
      })
      cy.task('stubProbationRegions', [
        referenceDataFactory.probationRegion().build({
          id: '1',
          name: 'South West',
        }),
        referenceDataFactory.probationRegion().build({
          id: '2',
          name: 'North West',
        }),
      ])
    }

    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-location')

    // When I complete the form
    const alternativeRegionPage = new AlternativeRegionPage(this.application)
    alternativeRegionPage.completeForm()
    alternativeRegionPage.clickSubmit()

    const differentRegionPage = new DifferentRegionPage(this.application)
    differentRegionPage.completeForm()
    differentRegionPage.clickSubmit()

    const placementPduPage = new PlacementPduPage(this.application)
    placementPduPage.completeForm()
    placementPduPage.clickSubmit()

    const pduEvidencePage = new PduEvidencePage(this.application)
    pduEvidencePage.completeForm()
    pduEvidencePage.clickSubmit()
    pduEvidencePage.clickSubmit('Save and continue')

    this.pages.placementLocation = [alternativeRegionPage, placementPduPage, differentRegionPage, pduEvidencePage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'In progress')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Not started')
  }

  completePlacementLocationAsNationalUser() {
    if (this.environment === 'integration') {
      const pdu = referenceDataFactory.pdu().build({
        id: this.application.data['placement-location']['alternative-pdu'].pduId,
        name: this.application.data['placement-location']['alternative-pdu'].pduName,
      })
      cy.task('stubPdus', {
        pdus: [pdu, ...referenceDataFactory.pdu().buildList(5)],
        probationRegionId: '2',
      })
      cy.task('stubProbationRegions', [
        referenceDataFactory.probationRegion().build({
          id: '1',
          name: 'South West',
        }),
        referenceDataFactory.probationRegion().build({
          id: '2',
          name: 'North West',
        }),
      ])
    }

    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('placement-location')

    // When I complete the form
    const differentRegionPage = new DifferentRegionPage(this.application)
    differentRegionPage.completeForm()
    differentRegionPage.clickSubmit()

    const placementPduPage = new PlacementPduPage(this.application)
    placementPduPage.completeForm()
    placementPduPage.clickSubmit()

    const pduEvidencePage = new PduEvidencePage(this.application)
    pduEvidencePage.completeForm()
    pduEvidencePage.clickSubmit()

    this.pages.placementLocation = [placementPduPage, differentRegionPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('placement-location', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('offence-and-behaviour-summary', 'Not started')
  }

  private completeDisabilityCulturalAndSpecificNeeds() {
    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('disability-cultural-and-specific-needs')

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
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('disability-cultural-and-specific-needs', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('safeguarding-and-support', 'Not started')
  }

  private completeSafeguardingAndSupport() {
    // Given I click on the safeguarding and support task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('safeguarding-and-support')

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
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('safeguarding-and-support', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('food-allergies', 'Not started')
  }

  private completeFoodAllergies() {
    // Given I click on the food allergies task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('food-allergies')

    // When I complete the form
    const foodAllergiesPage = new FoodAllergiesPage(this.application)
    foodAllergiesPage.completeForm()
    foodAllergiesPage.clickSubmit()

    this.pages.requirementsFromPlacement = [foodAllergiesPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('food-allergies', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('move-on-plan', 'Not started')
  }

  private completeMoveOnPlan() {
    // Given I click on the move on plan task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('move-on-plan')

    // When I complete the form
    const moveOnPlanPage = new MoveOnPlanPage(this.application)
    moveOnPlanPage.completeForm()
    moveOnPlanPage.clickSubmit()

    this.pages.moveOnPlan = [moveOnPlanPage]

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('move-on-plan', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('accommodation-referral-details', 'Not started')
  }

  private completeAccommodationReferralDetails() {
    let localAuthority

    if (this.environment === 'integration') {
      localAuthority = localAuthorityFactory.build({ name: 'Barking and Dagenham' })
      cy.task('stubLocalAuthorities', [localAuthority])
    }

    // Given I click on the accommodation referral details task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('accommodation-referral-details')

    this.pages.accommodationReferralDetails = []

    // When I complete the form
    const dtrSubmittedPage = new DtrSubmittedPage(this.application)
    dtrSubmittedPage.completeForm()
    dtrSubmittedPage.clickSubmit()
    this.pages.accommodationReferralDetails.push(dtrSubmittedPage)

    if (hasSubmittedDtr(this.application)) {
      const dtrDetailsPage = new DtrDetailsPage(this.application)
      dtrDetailsPage.completeForm(localAuthority?.name)
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
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('accommodation-referral-details', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Not started')
  }

  private completeCheckYourAnswersSection() {
    // Given I click the check your answers task
    Page.verifyOnPage(TaskListPage, this.application).clickTask('check-your-answers')

    // Then I should be on the check your answers page
    const checkYourAnswersPage = new CheckYourAnswersPage(this.application)
    checkYourAnswersPage.shouldShowPersonDetails()

    // And the page should be populated with my answers
    checkYourAnswersPage.shouldShowSentenceInformationAnswers(this.pages.sentenceInformation)
    checkYourAnswersPage.shouldShowContactDetailsAnswers(this.pages.contactDetails)
    checkYourAnswersPage.shouldShowEligibilityAnswers(this.pages.eligibility)
    checkYourAnswersPage.shouldShowConsentAnswers(this.pages.consent)
    checkYourAnswersPage.shouldShowLicenceConditionsAnswers(this.pages.licenceConditions)

    if (this.environment === 'integration') {
      checkYourAnswersPage.shouldShowPrisonInformationAnswers(this.pages.prisonInformation)
      checkYourAnswersPage.shouldShowPlacementConsiderationsAnswers(this.pages.placementConsiderations)
      checkYourAnswersPage.shouldShowApprovalsForSpecificRisksAnswers(this.pages.approvalsForSpecificRisks)
    }

    checkYourAnswersPage.shouldShowBehaviourInCasAnswers(this.pages.behaviourInCas)
    checkYourAnswersPage.shouldShowPlacementLocationAnswers(this.pages.placementLocation)
    checkYourAnswersPage.shouldShowDisabilityCulturalAndSpecificNeedsAnswers(
      this.pages.disabilityCulturalAndSpecificNeeds,
    )
    checkYourAnswersPage.shouldShowSafeguardingAndSupportAnswers(this.pages.safeguardingAndSupport)
    checkYourAnswersPage.shouldShowFoodAllergiesAnswers(this.pages.requirementsFromPlacement)
    checkYourAnswersPage.shouldShowMoveOnPlanAnswers(this.pages.moveOnPlan)
    checkYourAnswersPage.shouldShowAccommodationReferralDetails(this.pages.accommodationReferralDetails)

    // And it should show a print button
    checkYourAnswersPage.shouldShowPrintButton()

    if (this.environment === 'integration') {
      checkYourAnswersPage.shouldPrint(this.environment)
    }

    // When I have checked my answers
    checkYourAnswersPage.clickSubmit('Continue')

    // Then I should be taken back to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)

    // And the check your answers task should show a completed status
    tasklistPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  }

  private submitApplication() {
    const tasklistPage = Page.verifyOnPage(TaskListPage, this.application)
    tasklistPage.checkCheckboxByLabel('submit')

    tasklistPage.clickSubmit()
  }
}
