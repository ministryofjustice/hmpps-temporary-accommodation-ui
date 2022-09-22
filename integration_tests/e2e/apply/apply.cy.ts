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

import personFactory from '../../../server/testutils/factories/person'
import Page from '../../../cypress_shared/pages/page'

context('Apply', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('shows the details of a person from their CRN', () => {
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
    Page.verifyOnPage(ReleaseDatePage)
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
    // Given I am logged in
    cy.signIn()

    // And a person is in Delius
    const person = personFactory.build()
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
    const releaseDatePage = new ReleaseDatePage()
    releaseDatePage.checkRadioByNameAndValue('knowReleaseDate', 'yes')
    releaseDatePage.completeDateInputs('releaseDate', releaseDate)
    situationPage.clickSubmit()

    const placementStartPage = new PlacementStartPage(releaseDate)
    placementStartPage.checkRadioByNameAndValue('startDateSameAsReleaseDate', 'yes')
    placementStartPage.clickSubmit()

    // Then I should be redirected to the task list
    const tasklistPage = Page.verifyOnPage(TaskListPage)

    // And the task should be marked as completed
    tasklistPage.shouldShowTaskStatus('basic-information', 'Completed')

    // And the next task should be marked as not started
    tasklistPage.shouldShowTaskStatus('type-of-ap', 'Not started')

    // And I should be able to start the next task
    cy.get('[data-cy-task-name="type-of-ap"]').click()
    Page.verifyOnPage(TypeOfApPage)
  })
})
