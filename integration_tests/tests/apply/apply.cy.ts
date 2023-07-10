import {
  EnterCRNPage,
  ListPage,
  MoveOnPlanPage,
  SelectOffencePage,
  StartPage,
  TaskListPage,
} from '../../../cypress_shared/pages/apply'

import { mapApiPersonRisksForUi } from '../../../server/utils/utils'

import ApplyHelper from '../../../cypress_shared/helpers/apply'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'
import Page from '../../../cypress_shared/pages/page'
import setupTestUser from '../../../cypress_shared/utils/setupTestUser'
import {
  activeOffenceFactory,
  applicationFactory,
  personFactory,
  risksFactory,
  tierEnvelopeFactory,
} from '../../../server/testutils/factories'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    setupTestUser()
  })

  beforeEach(() => {
    // Given I am logged in
    cy.signIn()

    cy.fixture('applicationData.json').then(applicationData => {
      const person = personFactory.build()
      const application = applicationFactory.build({ person })
      const risks = risksFactory.build({
        crn: person.crn,
        tier: tierEnvelopeFactory.build({ value: { level: 'A3' } }),
      })
      const offences = activeOffenceFactory.buildList(1)
      application.data = applicationData
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

    const apply = new ApplyHelper(this.application, this.person, offences, 'integration')
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
      Page.verifyOnPage(TaskListPage)
    })
  })

  it("creates and updates an application given a person's CRN", function test() {
    const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration')
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

    // And I complete the sentence information task
    apply.completeSentenceInformation()

    // Then the API should have recieved the updated application
    cy.task('verifyApplicationUpdate', this.application.id).then(requests => {
      const firstRequestData = JSON.parse(requests[0].body).data

      expect(firstRequestData['sentence-information']['sentence-type'].sentenceType).equal('communityOrder')
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
    const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration')
    apply.setupApplicationStubs(uiRisks)
    apply.startApplication()
    apply.completeApplication()

    // Then the application should be submitted to the API
    cy.task('verifyApplicationUpdate', this.application.id).then((requests: Array<{ body: string }>) => {
      expect(requests).to.have.length(apply.numberOfPages() + 1)
      const requestBody = JSON.parse(requests[requests.length - 1].body)

      expect(requestBody.data).to.deep.equal(this.applicationData)

      cy.task('validateBodyAgainstApplySchema', requestBody.data).then(result => {
        expect(result).to.equal(true)
      })
    })

    cy.task('verifyApplicationSubmit', this.application.id).then(requests => {
      expect(requests).to.have.length(1)

      expect(requests[0].url).to.equal(`/applications/${this.application.id}/submission`)
    })

    // And I should be taken to the confirmation page
    const confirmationPage = new SubmissionConfirmation()

    // Given there are applications in the database
    const applications = applicationFactory.buildList(5)
    cy.task('stubApplications', applications)

    // And there are risks in the database
    const risks = risksFactory.buildList(5)
    applications.forEach((stubbedApplication, i) => {
      cy.task('stubPersonRisks', { person: stubbedApplication.person, risks: risks[i] })
    })

    // When I click 'Back to dashboard'
    confirmationPage.clickBackToDashboard()

    // Then I am taken back to the dashboard
    Page.verifyOnPage(ListPage, applications, [])
  })

  it('shows an error if the application is submitted without checking the confirm checkbox', function test() {
    // Given there is a complete but not submitted application in the database
    cy.task('stubApplications', [this.application])

    const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration')
    apply.setupApplicationStubs()

    // When I visit the application listing page
    const listPage = ListPage.visit([this.application], [])

    // And I click on the application
    listPage.clickApplication(this.application)

    // And I click submit without checking the confirm checkbox
    const taskListPage = Page.verifyOnPage(TaskListPage)
    taskListPage.clickSubmit()

    // Then I should see an error message asking me to checck the checkbox
    taskListPage.shouldShowErrorMessagesForFields(['confirmation'], 'invalid', 'application')
  })

  it('does not show the confirm checkbox and submit button while the application is incomplete', function test() {
    // Given there is an incomplete application in the database
    const application = { ...this.application, data: { ...this.application.data, 'move-on-plan': undefined } }
    cy.task('stubApplications', [application])

    const apply = new ApplyHelper(application, this.person, this.offences, 'integration')
    apply.setupApplicationStubs()

    // When I visit the application listing page
    const listPage = ListPage.visit([application], [])

    // And I click on the application
    listPage.clickApplication(application)

    // Then I should not see confirm checkbox and submit button
    const taskListPage = Page.verifyOnPage(TaskListPage)
    taskListPage.shouldNotShowSubmitComponents()
  })

  it('marks check your answers as incomplete if the user changes answers for an existing page', function test() {
    // Given there is a complete but not submitted application in the database
    cy.task('stubApplications', [this.application])

    const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration')
    apply.setupApplicationStubs()

    // When I visit the application listing page
    const listPage = ListPage.visit([this.application], [])

    // And I click on the application
    listPage.clickApplication(this.application)

    // Then I check your answers should be marked as completed
    const taskListPage = Page.verifyOnPage(TaskListPage)
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

    const apply = new ApplyHelper(this.application, this.person, this.offences, 'integration')
    apply.setupApplicationStubs()

    // When I visit the application listing page
    const listPage = ListPage.visit([this.application], [])

    // And I click on the application
    listPage.clickApplication(this.application)

    // Then I check your answers should be marked as completed
    const taskListPage = Page.verifyOnPage(TaskListPage)
    taskListPage.shouldShowTaskStatus('check-your-answers', 'Completed')

    // And the I click on the move on plan section
    taskListPage.clickTask('move-on-plan')

    // And complete the move on section again
    const moveOnPlanPage = new MoveOnPlanPage(this.application)
    moveOnPlanPage.clickSubmit()

    // Then I check your answers should be marked as completed
    taskListPage.shouldShowTaskStatus('check-your-answers', 'Completed')
  })
})
