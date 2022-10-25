import {
  StartPage,
  EnterCRNPage,
  ConfirmDetailsPage,
  SentenceTypePage,
  SituationPage,
  PlacementStartPage,
  ReleaseDatePage,
  TaskListPage,
  TypeOfApPage,
} from '../../../cypress_shared/pages/apply'
import PlacementPurposePage from '../../../cypress_shared/pages/apply/placementPurpose'

import Page from '../../../cypress_shared/pages/page'
import applicationFactory from '../../../server/testutils/factories/application'
import personFactory from '../../../server/testutils/factories/person'
import risksFactory from '../../../server/testutils/factories/risks'
import { mapApiPersonRisksForUi } from '../../../server/utils/utils'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the details of a person from their CRN', () => {
    const application = applicationFactory.build()
    cy.task('stubApplicationCreate', { application })
    cy.task('stubApplicationUpdate', { application })

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
    cy.task('stubFindPerson', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // When I enter a CRN
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    // Then I should see the person's detail
    const confirmDetailsPage = new ConfirmDetailsPage(person)
    confirmDetailsPage.verifyPersonIsVisible()

    // When I click submit
    confirmDetailsPage.clickSubmit()

    // Then I should be on the Sentence Type page
    const sentenceTypePage = new SentenceTypePage()

    // When I select 'Bail Placement'
    sentenceTypePage.checkRadioByNameAndValue('sentenceType', 'bailPlacement')
    sentenceTypePage.clickSubmit()

    // Then I should be on the Situation Page
    const situationPage = new SituationPage()

    // When I select 'Bail Sentence'
    situationPage.checkRadioByNameAndValue('situation', 'bailSentence')
    situationPage.clickSubmit()

    // Then I should be asked if I know the release date
    Page.verifyOnPage(ReleaseDatePage, application.person)

    // And the API should have recieved the updated application
    cy.task('verifyApplicationUpdate', application.id).then(requests => {
      expect(requests).to.have.length(2)

      const firstRequestData = JSON.parse(requests[0].body).data
      const secondRequestData = JSON.parse(requests[1].body).data

      expect(firstRequestData['basic-information']['sentence-type'].sentenceType).equal('bailPlacement')
      expect(secondRequestData['basic-information'].situation.situation).equal('bailSentence')
    })
  })

  it('shows an error message if the person is not found', () => {
    // Given I am logged in
    cy.signIn()

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

  it('shows a tasklist', () => {
    const application = applicationFactory.build()
    const person = personFactory.build({ crn: application.person.crn })
    const apiRisks = risksFactory.build({ crn: person.crn })
    const uiRisks = mapApiPersonRisksForUi(apiRisks)

    cy.task('stubApplicationCreate', { application })
    cy.task('stubApplicationUpdate', { application })

    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    cy.task('stubPersonRisks', { person, risks: apiRisks })
    cy.task('stubFindPerson', { person })

    // And I have started an application
    const startPage = StartPage.visit()
    startPage.startApplication()

    // And I complete the first step
    const crnPage = new EnterCRNPage()
    crnPage.enterCrn(person.crn)
    crnPage.clickSubmit()

    const confirmDetailsPage = new ConfirmDetailsPage(person)
    confirmDetailsPage.clickSubmit()

    const sentenceTypePage = new SentenceTypePage()
    sentenceTypePage.checkRadioByNameAndValue('sentenceType', 'bailPlacement')
    sentenceTypePage.clickSubmit()

    const situationPage = new SituationPage()
    situationPage.checkRadioByNameAndValue('situation', 'bailSentence')
    situationPage.clickSubmit()

    const releaseDate = new Date().toISOString()
    const releaseDatePage = new ReleaseDatePage(application.person)
    releaseDatePage.checkRadioByNameAndValue('knowReleaseDate', 'yes')
    releaseDatePage.completeDateInputs('releaseDate', releaseDate)
    situationPage.clickSubmit()

    const placementStartPage = new PlacementStartPage(releaseDate)
    placementStartPage.checkRadioByNameAndValue('startDateSameAsReleaseDate', 'yes')
    placementStartPage.clickSubmit()

    const placementPurposePage = new PlacementPurposePage()
    placementPurposePage.completeForm()
    placementPurposePage.clickSubmit()

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Not started')

    // And the risk widgets should be visible
    tasklistPage.shouldShowRiskWidgets(uiRisks)

    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(TypeOfApPage, application.person)
  })
})
