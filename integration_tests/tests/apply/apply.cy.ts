import { fakerEN_GB as faker } from '@faker-js/faker'
import { TemporaryAccommodationUser } from '@approved-premises/api'
import {
  ApplicationFullPage,
  CheckYourAnswersPage,
  EnterCRNPage,
  ListPage,
  MoveOnPlanPage,
  ReleaseTypePage,
  SelectOffencePage,
  StartPage,
  TaskListPage,
} from '../../../cypress_shared/pages/apply'

import { mapApiPersonRisksForUi } from '../../../server/utils/utils'

import ApplyHelper from '../../../cypress_shared/helpers/apply'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'
import Page from '../../../cypress_shared/pages/page'
import { setupTestUser } from '../../../cypress_shared/utils/setupTestUser'
import paths from '../../../server/paths/api'
import {
  activeOffenceFactory,
  cas3ApplicationFactory,
  personFactory,
  referralHistorySystemNoteFactory,
  risksFactory,
  tierEnvelopeFactory,
  userProfileFactory,
} from '../../../server/testutils/factories'
import { DateFormats } from '../../../server/utils/dateUtils'

context('Apply', () => {
  context('with default user', () => {
    beforeEach(() => {
      cy.task('reset')
      setupTestUser('referrer')
    })

    beforeEach(() => {
      // Given there are applications in the database
      cy.task('stubApplications', [])

      // And given I am logged in
      cy.signIn()

      cy.fixture('applicationData.json').then(applicationData => {
        const releaseDate = faker.date.soon({ days: 90 })
        const accommodationRequiredFromDate = faker.date.soon({ days: 90 })

        const person = personFactory.build()
        const application = cas3ApplicationFactory.build({ person })
        const risks = risksFactory.retrived().build({
          crn: person.crn,
          tier: tierEnvelopeFactory.build({ status: 'retrieved', value: { level: 'A3' } }),
        })
        const offences = activeOffenceFactory.buildList(1)
        application.data = applicationData
        cy.get<TemporaryAccommodationUser | TemporaryAccommodationUser[]>('@actingUser').then(actingUser => {
          const user = actingUser[0] ?? actingUser
          application.data['placement-location'] = {
            ...application.data['placement-location'],
            'alternative-region': {
              alternativeRegion: 'yes',
              regionName: user.region.name,
            },
          }
        })
        application.data.eligibility = {
          ...application.data.eligibility,
          'release-date': {
            releaseDate: DateFormats.dateObjToIsoDate(releaseDate),
            'releaseDate-year': releaseDate.getFullYear().toString(),
            'releaseDate-month': (releaseDate.getMonth() + 1).toString(),
            'releaseDate-day': releaseDate.getDate().toString(),
          },
          'accommodation-required-from-date': {
            accommodationRequiredFromDate: DateFormats.dateObjToIsoDate(accommodationRequiredFromDate),
            'accommodationRequiredFromDate-year': accommodationRequiredFromDate.getFullYear().toString(),
            'accommodationRequiredFromDate-month': (accommodationRequiredFromDate.getMonth() + 1).toString(),
            'accommodationRequiredFromDate-day': accommodationRequiredFromDate.getDate().toString(),
          },
        }
        application.risks = risks

        cy.wrap(person).as('person')
        cy.wrap(offences).as('offences')
        cy.wrap(application).as('application')
        cy.wrap(applicationData).as('applicationData')
      })
    })

    it('allows the user to select an index offence if there is more than one offence', function test() {
      // And that person has more than one offence listed under their CRN
      const offences = activeOffenceFactory.buildList(4)

      const apply = new ApplyHelper(this.application, this.person, offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()
      apply.startApplication()

      // Then I should be forwarded to select an offence
      const selectOffencePage = Page.verifyOnPage(SelectOffencePage, this.person, offences)
      selectOffencePage.shouldDisplayOffences()

      // When I select an offence
      const selectedOffence = offences[0]
      selectOffencePage.selectOffence(selectedOffence)

      // And I click submit
      selectOffencePage.clickSubmit()

      // Then the API should have created the application with my selected offence
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)

        expect(body.crn).equal(this.person.crn)
        expect(body.convictionId).equal(selectedOffence.convictionId)
        expect(body.deliusEventNumber).equal(selectedOffence.deliusEventNumber)
        expect(body.offenceId).equal(selectedOffence.offenceId)

        // Then I should be on the task list page
        Page.verifyOnPage(TaskListPage, this.application)
      })
    })

    it("creates and updates an application given a person's CRN", function test() {
      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()
      apply.startApplication()

      // Then the API should have created the application
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)
        const offence = this.offences[0]

        expect(body.crn).equal(this.person.crn)
        expect(body.convictionId).equal(offence.convictionId)
        expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
        expect(body.offenceId).equal(offence.offenceId)
      })

      // And I complete the offence and behaviour summary task
      apply.completePlacementLocation()

      // Then the API should have received the updated application
      cy.task('verifyApplicationUpdate', this.application.id).then(requests => {
        const firstRequestData = JSON.parse(requests[0].body).data
        expect(firstRequestData['placement-location']['alternative-region'].alternativeRegion).equal('yes')
      })
    })

    it('shows an error message if the person is not found', function test() {
      // And the person I am about to search for is not in Delius
      const person = personFactory.build()
      cy.task('stubPersonNotFound', { person })

      // And I have started an application
      const startPage = StartPage.visit()
      startPage.startApplication()

      // When I enter a CRN
      const crnPage = new EnterCRNPage()
      crnPage.enterCrn(person.crn)
      crnPage.clickSubmit()

      // Then I should see an error message
      crnPage.shouldShowErrorMessage(person)
    })

    it('allows completion of the form', function test() {
      // And I complete the application
      const uiRisks = mapApiPersonRisksForUi(this.application.risks)
      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs(uiRisks)
      apply.startApplication()
      apply.completeApplication()

      // Then the application should be submitted to the API
      cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
        expect(requests).to.have.length.greaterThan(apply.numberOfPages())
        const requestBody = JSON.parse(requests[requests.length - 1].body)

        // We expect these fields to vary with date, so we effectively omit from testing
        this.applicationData['placement-considerations']['risk-management-plan'].oasysImported =
          requestBody.data['placement-considerations']['risk-management-plan'].oasysImported

        this.applicationData['placement-considerations']['risk-management-plan'].oasysCompleted =
          requestBody.data['placement-considerations']['risk-management-plan'].oasysCompleted

        cy.task('log', requestBody.data)
        cy.task('log', this.applicationData)

        expect(requestBody.data).to.deep.equal(this.applicationData)

        cy.task('validateBodyAgainstApplySchema', requestBody.data).then(result => {
          expect(result).to.equal(true)
        })
      })

      cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
        expect(requests).to.have.length(1)

        expect(requests[0].url).to.equal(paths.cas3.applications.submission({ id: this.application.id }))
      })

      // And I should be taken to the confirmation page
      const confirmationPage = new SubmissionConfirmation()

      // And I should see a link to provide feedback
      confirmationPage.linkToFeedbackSurvey()

      // Given there are applications in the database
      const applications = cas3ApplicationFactory.buildList(5)
      cy.task('stubApplications', applications)

      // And there are risks in the database
      const risks = risksFactory.buildList(5)
      applications.forEach((stubbedApplication, i) => {
        cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
      })

      // When I click 'Back to dashboard'
      confirmationPage.clickBackToDashboard()

      // Then I am taken back to the dashboard
      Page.verifyOnPage(ListPage, applications, [], [])
    })

    it('shows an error if the application is submitted without checking the confirm checkbox', function test() {
      // Given there is a complete but not submitted application in the database
      cy.task('stubApplications', [this.application])

      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()

      // When I visit the application listing page
      const listPage = ListPage.visit([this.application], [], [])

      // And I click on the application
      listPage.clickApplication(this.application)

      // And I click submit without checking the confirm checkbox
      const taskListPage = Page.verifyOnPage(TaskListPage, this.application)
      taskListPage.clickSubmit()

      // Then I should see an error message asking me to checck the checkbox
      taskListPage.shouldShowErrorMessagesForFields(['confirmation'], 'invalid', 'application')
    })

    it('does not show the confirm checkbox and submit button while the application is incomplete', function test() {
      // Given there is an incomplete application in the database
      const application = { ...this.application, data: { ...this.application.data, 'move-on-plan': undefined } }
      cy.task('stubApplications', [application])

      const apply = new ApplyHelper(application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()

      // When I visit the application listing page
      const listPage = ListPage.visit([application], [], [])

      // And I click on the application
      listPage.clickApplication(application)

      // Then I should not see confirm checkbox and submit button
      const taskListPage = Page.verifyOnPage(TaskListPage, this.application)
      taskListPage.shouldNotShowSubmitComponents()
    })

    it('marks check your answers as incomplete if the user changes answers for an existing page', function test() {
      // Given there is a complete but not submitted application in the database
      cy.task('stubApplications', [this.application])

      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()

      // When I visit the application listing page
      const listPage = ListPage.visit([this.application], [], [])

      // And I click on the application
      listPage.clickApplication(this.application)

      // Then I check your answers should be marked as completed
      const taskListPage = Page.verifyOnPage(TaskListPage, this.application)
      taskListPage.shouldShowTaskStatus('check-your-answers', 'Completed')

      // And the I click on the move on plan section
      taskListPage.clickTask('move-on-plan')

      // And complete the move on section again
      const moveOnPlanPage = new MoveOnPlanPage({
        ...this.application,
        data: {
          ...this.application.data,
          'move-on-plan': {
            'move-on-plan': {
              plan: 'Some other plan',
            },
          },
        },
      })
      moveOnPlanPage.completeForm()
      moveOnPlanPage.clickSubmit()

      // Then I check your answers should be marked as not started
      taskListPage.shouldShowTaskStatus('check-your-answers', 'Not started')
    })

    it('does not mark check your answers as incomplete if the user re-enters the same answers for an existing page', function test() {
      // Given there is a complete but not submitted application in the database
      cy.task('stubApplications', [this.application])

      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()

      // When I visit the application listing page
      const listPage = ListPage.visit([this.application], [], [])

      // And I click on the application
      listPage.clickApplication(this.application)

      // Then I check your answers should be marked as completed
      const taskListPage = Page.verifyOnPage(TaskListPage, this.application)
      taskListPage.shouldShowTaskStatus('check-your-answers', 'Completed')

      // And the I click on the move on plan section
      taskListPage.clickTask('move-on-plan')

      // And complete the move on section again
      const moveOnPlanPage = new MoveOnPlanPage(this.application)
      moveOnPlanPage.clickSubmit()

      // Then I check your answers should be marked as completed
      taskListPage.shouldShowTaskStatus('check-your-answers', 'Completed')
    })

    it('shows the full submitted application', function test() {
      // Given there is a complete and submitted application
      const application = { ...this.application, status: 'submitted', assessmentId: faker.string.uuid() }
      const referralNotes = [referralHistorySystemNoteFactory.build({ category: 'submitted' })]

      cy.task('stubApplications', [application])
      cy.task('stubApplicationGet', { application })
      cy.task('stubApplicationReferralHistoryGet', { application, referralNotes })

      // When I visit the application listing page
      const listPage = ListPage.visit([], [application], [])

      // And I click on the submitted tab
      listPage.clickSubmittedTab()

      // And I click on an application
      listPage.clickApplication(application)

      // And I can print the full application
      const applicationFullPage = Page.verifyOnPage(ApplicationFullPage, application)

      applicationFullPage.shouldShowPrintButton()
      applicationFullPage.shouldHaveATimeline()
      applicationFullPage.shouldPrint('integration')

      // Then I should see the full application
      applicationFullPage.shouldShowApplication(application.document)
    })

    it('handles old release type data, shows as in progress, allows completion and submission', function test() {
      const application = {
        ...this.application,
        data: {
          ...this.application.data,
          'sentence-information': {
            ...this.application.data['sentence-information'],
            'release-type': {
              releaseTypes: ['crdLicence', 'fourteenDayFixedTermRecall'],
              'crdLicenceStartDate-year': '2122',
              'crdLicenceStartDate-month': '4',
              'crdLicenceStartDate-day': '1',
              'crdLicenceEndDate-year': '2122',
              'crdLicenceEndDate-month': '7',
              'crdLicenceEndDate-day': '18',
              'fourteenDayFixedTermRecallStartDate-year': '2024',
              'fourteenDayFixedTermRecallStartDate-month': '1',
              'fourteenDayFixedTermRecallStartDate-day': '19',
              'fourteenDayFixedTermRecallEndDate-year': '2024',
              'fourteenDayFixedTermRecallEndDate-month': '7',
              'fourteenDayFixedTermRecallEndDate-day': '9',
            },
          },
        },
      }

      // Given there is a complete but not submitted application in the database
      cy.task('stubApplications', [application])

      const apply = new ApplyHelper(application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()

      // When I visit the application listing page
      const listPage = ListPage.visit([application], [], [])

      // And I click on the application
      listPage.clickApplication(application)

      // Then the release type task should be shown as "In progress"
      const taskListPage = Page.verifyOnPage(TaskListPage, application)
      taskListPage.shouldShowTaskStatus('sentence-information', 'In progress')

      // When I click on the sentence information task
      taskListPage.clickTask('sentence-information')

      // And I click through the pages to release type
      cy.get('button[type="submit"]').click()
      cy.get('button[type="submit"]').click()
      cy.get('button[type="submit"]').click()
      cy.get('button[type="submit"]').click()

      // And I complete the release type question with a valid value using the helper
      const releaseTypePage = new ReleaseTypePage({
        ...application,
        data: {
          ...this.application.data,
          'sentence-information': {
            ...this.application.data['sentence-information'],
            'release-type': {
              releaseTypes: ['crdLicence'],
              'crdLicenceStartDate-year': '2024',
              'crdLicenceStartDate-month': '1',
              'crdLicenceStartDate-day': '19',
              'crdLicenceEndDate-year': '2024',
              'crdLicenceEndDate-month': '7',
              'crdLicenceEndDate-day': '9',
            },
          },
        },
      })

      releaseTypePage.completeForm()
      releaseTypePage.clickSubmit()

      // Then the release type task should be shown as "Completed"
      taskListPage.shouldShowTaskStatus('sentence-information', 'Completed')

      // Then the check your answers task should be shown as "Not started"
      taskListPage.shouldShowTaskStatus('check-your-answers', 'Not started')
      taskListPage.clickTask('check-your-answers')

      // And check your answers should show the sentence information answers
      const checkYourAnswersPage = Page.verifyOnPage(CheckYourAnswersPage, application)
      checkYourAnswersPage.shouldShowSentenceInformationAnswers([releaseTypePage])
    })
    context('placement location', () => {
      it('placement location route 1: same region, same pdu', function test() {
        // Setup application and stubs
        const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
        apply.setupApplicationStubs()
        apply.startApplication()

        // Then the API should have created the application
        cy.task('verifyApplicationCreate').then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          const offence = this.offences[0]

          expect(body.crn).equal(this.person.crn)
          expect(body.convictionId).equal(offence.convictionId)
          expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
          expect(body.offenceId).equal(offence.offenceId)
        })

        this.application.data['placement-location']['alternative-pdu'] = { alternativePdu: 'no' }

        // And I complete the offence and behaviour summary task
        apply.completePlacementLocationNonAlternativePdu()

        // Assert API update contains expected answers
        cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
          const { data } = JSON.parse(requests[requests.length - 1].body)
          expect(data['placement-location']['alternative-region'].alternativeRegion).to.equal('yes')
          expect(data['placement-location']['alternative-pdu'].alternativePdu).to.equal('no')
        })
      })

      it('placement location route 2: same region, different pdu', function test() {
        // Setup application and stubs
        const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
        apply.setupApplicationStubs()
        apply.startApplication()

        // Then the API should have created the application
        cy.task('verifyApplicationCreate').then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          const offence = this.offences[0]

          expect(body.crn).equal(this.person.crn)
          expect(body.convictionId).equal(offence.convictionId)
          expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
          expect(body.offenceId).equal(offence.offenceId)
        })

        // And I complete the offence and behaviour summary task
        apply.completePlacementLocation()

        // Assert API update contains expected answers
        cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
          const { data } = JSON.parse(requests[requests.length - 1].body)
          expect(data['placement-location']['alternative-region'].alternativeRegion).to.equal('yes')
          expect(data['placement-location']['alternative-pdu'].alternativePdu).to.equal('yes')
          expect(data['placement-location']['alternative-pdu'].pduName).to.equal(
            this.application.data['placement-location']['alternative-pdu'].pduName,
          )
          expect(data['placement-location']['alternative-pdu-reason'].reason).to.equal(
            this.application.data['placement-location']['alternative-pdu-reason'].reason,
          )
        })
      })

      it('placement location route 3: different region -> same region, same pdu', function test() {
        // Setup application and stubs
        const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
        apply.setupApplicationStubs()
        apply.startApplication()

        // Then the API should have created the application
        cy.task('verifyApplicationCreate').then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          const offence = this.offences[0]

          expect(body.crn).equal(this.person.crn)
          expect(body.convictionId).equal(offence.convictionId)
          expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
          expect(body.offenceId).equal(offence.offenceId)
        })

        this.application.data['placement-location']['alternative-pdu'] = { alternativePdu: 'no' }

        // And I complete the offence and behaviour summary task
        apply.completePlacementLocationNonAlternativePdu()

        // Assert API update contains expected answers
        cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
          const { data } = JSON.parse(requests[requests.length - 1].body)
          expect(data['placement-location']['alternative-region'].alternativeRegion).to.equal('yes')
          expect(data['placement-location']['alternative-pdu'].alternativePdu).to.equal('no')
        })
      })

      it('placement location route 4: different region, pdu selected, no evidence provided', function test() {
        // Setup application and stubs
        const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
        apply.setupApplicationStubs()
        apply.startApplication()

        // Then the API should have created the application
        cy.task('verifyApplicationCreate').then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          const offence = this.offences[0]

          expect(body.crn).equal(this.person.crn)
          expect(body.convictionId).equal(offence.convictionId)
          expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
          expect(body.offenceId).equal(offence.offenceId)
        })

        this.application.data['placement-location']['alternative-region'].alternativeRegion = 'no'
        this.application.data['placement-location']['different-region'] = { regionName: 'North West', regionId: '2' }
        this.application.data['placement-location']['placement-pdu'] = {
          pduName: this.application.data['placement-location']['alternative-pdu'].pduName,
          pduId: this.application.data['placement-location']['alternative-pdu'].pduId,
        }
        this.application.data['placement-location']['pdu-evidence'] = { pduEvidence: 'no' }

        // And I complete the offence and behaviour summary task
        apply.completePlacementLocationAlternativeRegionWithNoEvidence()

        // Assert API update contains expected answers
        cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
          const { data } = JSON.parse(requests[requests.length - 1].body)
          expect(data['placement-location']['alternative-region'].alternativeRegion).to.equal('no')
          expect(data['placement-location']['different-region'].regionName).to.equal('North West')
          expect(data['placement-location']['placement-pdu'].pduName).to.equal(
            this.application.data['placement-location']['alternative-pdu'].pduName,
          )
          expect(data['placement-location']['pdu-evidence']).to.deep.equal({ pduEvidence: 'no' })
        })
      })

      it('placement location route 5: different region, pdu selected, evidence provided', function test() {
        // Setup application and stubs
        const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
        apply.setupApplicationStubs()
        apply.startApplication()

        // Then the API should have created the application
        cy.task('verifyApplicationCreate').then(requests => {
          expect(requests).to.have.length(1)

          const body = JSON.parse(requests[0].body)
          const offence = this.offences[0]

          expect(body.crn).equal(this.person.crn)
          expect(body.convictionId).equal(offence.convictionId)
          expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
          expect(body.offenceId).equal(offence.offenceId)
        })

        this.application.data['placement-location']['alternative-region'].alternativeRegion = 'no'
        this.application.data['placement-location']['different-region'] = { regionName: 'North West', regionId: '2' }
        this.application.data['placement-location']['placement-pdu'] = {
          pduName: this.application.data['placement-location']['alternative-pdu'].pduName,
          pduId: this.application.data['placement-location']['alternative-pdu'].pduId,
        }
        this.application.data['placement-location']['pdu-evidence'] = { pduEvidence: 'yes' }

        apply.completePlacementLocationAlternativeRegionWithEvidence()
        cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
          const { data } = JSON.parse(requests[requests.length - 1].body)
          expect(data['placement-location']['alternative-region'].alternativeRegion).to.equal('no')
          expect(data['placement-location']['different-region'].regionName).to.equal('North West')
          expect(data['placement-location']['placement-pdu'].pduName).to.equal(
            this.application.data['placement-location']['alternative-pdu'].pduName,
          )
          expect(data['placement-location']['pdu-evidence'].pduEvidence).to.equal('yes')
        })
      })
    })
  })
  context('with National region user', () => {
    beforeEach(() => {
      cy.task('reset')
      setupTestUser('referrer')
      cy.get<TemporaryAccommodationUser | TemporaryAccommodationUser[]>('@actingUser').then(actingUser => {
        const nationalUser = { ...actingUser, region: { name: 'National', id: '9' } }
        cy.wrap(nationalUser).as('actingUser')

        const userProfile = userProfileFactory.build({ user: nationalUser })

        cy.wrap(nationalUser).as('actingUser')
        cy.wrap({ name: 'National', id: '9' }).as('actingUserProbationRegion')

        cy.task('stubUserProfile', userProfile)
      })
    })

    beforeEach(() => {
      // Given there are applications in the database
      cy.task('stubApplications', [])

      // And given I am logged in
      cy.signIn()

      cy.fixture('applicationData.json').then(applicationData => {
        const person = personFactory.build()
        const application = cas3ApplicationFactory.build({ person })

        const offences = activeOffenceFactory.buildList(1)
        application.data = applicationData
        cy.get<TemporaryAccommodationUser | TemporaryAccommodationUser[]>('@actingUser').then(actingUser => {
          const user = actingUser[0] ?? actingUser
          application.data['placement-location'] = {
            ...application.data['placement-location'],
            'alternative-region': {
              alternativeRegion: 'yes',
              regionName: user.region.name,
            },
          }
        })

        cy.wrap(person).as('person')
        cy.wrap(offences).as('offences')
        cy.wrap(application).as('application')
        cy.wrap(applicationData).as('applicationData')
      })
    })

    it('placement location route 6: National region, region selected, pdu selected, evidence provided', function test() {
      // Setup application and stubs
      const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration', this.actingUser)
      apply.setupApplicationStubs()
      apply.startApplication()

      // Then the API should have created the application
      cy.task('verifyApplicationCreate').then(requests => {
        expect(requests).to.have.length(1)

        const body = JSON.parse(requests[0].body)
        const offence = this.offences[0]

        expect(body.crn).equal(this.person.crn)
        expect(body.convictionId).equal(offence.convictionId)
        expect(body.deliusEventNumber).equal(offence.deliusEventNumber)
        expect(body.offenceId).equal(offence.offenceId)
      })

      this.application.data['placement-location']['different-region'] = { regionName: 'North West', regionId: '2' }
      this.application.data['placement-location']['placement-pdu'] = {
        pduName: this.application.data['placement-location']['alternative-pdu'].pduName,
        pduId: this.application.data['placement-location']['alternative-pdu'].pduId,
      }

      this.application.data['placement-location']['pdu-evidence'] = { pduEvidence: 'yes' }
      apply.completePlacementLocationAsNationalUser()
      cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
        const { data } = JSON.parse(requests[requests.length - 1].body)
        expect(data['placement-location']['different-region'].regionName).to.equal('North West')
        expect(data['placement-location']['placement-pdu'].pduName).to.equal(
          this.application.data['placement-location']['alternative-pdu'].pduName,
        )
        expect(data['placement-location']['pdu-evidence'].pduEvidence).to.equal('yes')
      })
    })
  })
})
