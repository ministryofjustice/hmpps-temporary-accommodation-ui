import { EnterCRNPage, ListPage, SelectOffencePage, StartPage } from '../../../cypress_shared/pages/apply'

import { mapApiPersonRisksForUi } from '../../../server/utils/utils'

import ApplyHelper from '../../../cypress_shared/helpers/apply'
import SubmissionConfirmation from '../../../cypress_shared/pages/apply/submissionConfirmation'
import Page from '../../../cypress_shared/pages/page'
import setupTestUser from '../../../cypress_shared/utils/setupTestUser'
import ExamplePage from '../../../server/form-pages/apply/example-page/example-task/examplePage'
import activeOffenceFactory from '../../../server/testutils/factories/activeOffence'
import applicationFactory from '../../../server/testutils/factories/application'
import personFactory from '../../../server/testutils/factories/person'
import risksFactory, { tierEnvelopeFactory } from '../../../server/testutils/factories/risks'

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

      // Then I should be on the Sentence Type page
      Page.verifyOnPage(ExamplePage, body, this.application)
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

    // And I complete the basic information step
    apply.completeExampleSection()

    // Then the API should have recieved the updated application
    cy.task('verifyApplicationUpdate', this.application.id).then(requests => {
      const firstRequestData = JSON.parse(requests[0].body).data
      // const secondRequestData = JSON.parse(requests[1].body).data

      expect(firstRequestData['example-task']['example-page'].exampleAnswer).equal('yes')
      // expect(secondRequestData['basic-information'].situation.situation).equal('bailSentence')
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
    const applications = applicationFactory.withReleaseDate().buildList(5)
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
})
