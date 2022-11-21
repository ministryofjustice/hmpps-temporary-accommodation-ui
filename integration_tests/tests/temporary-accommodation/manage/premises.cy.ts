import premisesFactory from '../../../../server/testutils/factories/premises'
import roomFactory from '../../../../server/testutils/factories/room'
import newPremisesFactory from '../../../../server/testutils/factories/newPremises'
import updatePremisesFactory from '../../../../server/testutils/factories/updatePremises'
import PremisesNewPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesNew'
import PremisesListPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesList'
import Page from '../../../../cypress_shared/pages/page'
import PremisesShowPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesShow'
import PremisesEditPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/premisesEdit'

context('Premises', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('should list all premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Then I should see all of the premises listed
    page.shouldShowPremises(premises)
  })

  it('should navigate to the new premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Add I click the add a premises button
    page.clickAddPremisesButton()

    // Then I navigate to the new premises page
    Page.verifyOnPage(PremisesNewPage)
  })

  it('should navigate to the show premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)
    cy.task('stubSinglePremises', premises[0])

    // When I visit the premises page
    const page = PremisesListPage.visit()

    // Add I click the view a premises link
    page.clickPremisesViewLink(premises[0])

    // Then I navigate to the show premises page
    Page.verifyOnPage(PremisesShowPage, premises[0])
  })

  it('should navigate to the edit premises page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // And there is a premises in the database
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    // When I visit the show premises page
    const page = PremisesShowPage.visit(premises)

    // Add I click the edit premises link
    page.clickPremisesEditLink()

    // Then I navigate to the edit premises page
    Page.verifyOnPage(PremisesEditPage, premises)
  })

  it('should allow me to create a premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // When I visit the new premises page
    const premises = premisesFactory.build()
    const newPremises = newPremisesFactory.build({
      name: premises.name,
      postcode: premises.postcode,
      localAuthorityAreaId: premises.localAuthorityArea.id,
    })

    cy.task('stubPremisesCreate', premises)
    cy.task('stubSinglePremises', premises)

    const page = PremisesNewPage.visit()

    // And I fill out the form
    page.completeForm(newPremises)

    // Then a premises should have been created in the API
    cy.task('verifyPremisesCreate').then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.name).equal(newPremises.name)
      expect(requestBody.addressLine1).equal(newPremises.addressLine1)
      expect(requestBody.postcode).equal(newPremises.postcode)
      expect(requestBody.localAuthorityAreaId).equal(newPremises.localAuthorityAreaId)
      expect(requestBody.characteristicIds).members(newPremises.characteristicIds)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(newPremises.notes)
    })

    // And I should be redirected to the show premises page
    const premisesNewPage = PremisesNewPage.verifyOnPage(PremisesShowPage, premises)
    premisesNewPage.shouldShowBanner('Property created')
  })

  it('should show errors when the create API returns an error', () => {
    // Given I am logged in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // When I visit the new premises page
    const page = PremisesNewPage.visit()

    // And I miss required fields
    cy.task('stubPremisesCreateErrors', ['name', 'addressLine1', 'postcode', 'localAuthorityAreaId', 'status'])
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['name', 'addressLine1', 'postcode', 'localAuthorityAreaId', 'status'])
  })

  it('should navigate back from the new premises page to the premises list page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // When I visit the new premises page
    const page = PremisesNewPage.visit()

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the premises list page
    Page.verifyOnPage(PremisesListPage)
  })

  it('should allow me to edit a premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // And there is a premises in the database
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    // When I visit the edit premises page
    const page = PremisesEditPage.visit(premises)

    // Then I should see the premises details
    page.shouldShowPremisesDetails()

    // And when I fill out the form
    cy.task('stubPremisesUpdate', premises)
    const updatePremises = updatePremisesFactory.build()
    page.completeForm(updatePremises)

    // Then the premises should have been update in the API
    cy.task('verifyPremisesUpdate', premises).then(requests => {
      expect(requests).to.have.length(1)
      const requestBody = JSON.parse(requests[0].body)

      expect(requestBody.addressLine1).equal(updatePremises.addressLine1)
      expect(requestBody.postcode).equal(updatePremises.postcode)
      expect(requestBody.localAuthorityAreaId).equal(updatePremises.localAuthorityAreaId)
      expect(requestBody.characteristicIds).members(updatePremises.characteristicIds)
      expect(requestBody.status).equal(updatePremises.status)
      expect(requestBody.notes.replaceAll('\r\n', '\n')).equal(updatePremises.notes)
    })

    // And I should be redirected to the show premises page
    const premisesShowPage = PremisesShowPage.verifyOnPage(PremisesShowPage, premises)
    premisesShowPage.shouldShowBanner('Property updated')
  })

  it('should show errors when the update API returns an error', () => {
    // Given I am logged in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // And there is a premises in the database
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    // When I visit the edit premises page
    const page = PremisesEditPage.visit(premises)

    // And I clear required fields
    cy.task('stubPremisesUpdateErrors', { premises, params: ['addressLine1', 'postcode', 'localAuthorityAreaId'] })
    page.clearForm()
    page.clickSubmit()

    // Then I should see error messages relating to those fields
    page.shouldShowErrorMessagesForFields(['addressLine1', 'postcode', 'localAuthorityAreaId'])
  })

  it('should navigate back from the edit premises page to the premises show page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are local authorities in the database
    cy.task('stubLocalAuthoritiesReferenceData')

    // And there are characteristics in the database
    cy.task('stubCharacteristicsReferenceData')

    // And there is a premises in the database
    const premises = premisesFactory.build()
    cy.task('stubSinglePremises', premises)

    // When I visit the edit premises page
    const page = PremisesEditPage.visit(premises)

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the premises show page
    Page.verifyOnPage(PremisesShowPage, premises)
  })

  it('should show a single premises', () => {
    // Given I am signed in
    cy.signIn()

    // And there is a premises in the database
    const premises = premisesFactory.build()
    const rooms = roomFactory.buildList(5)
    cy.task('stubPremisesWithRooms', { premises, rooms })

    // When I visit the show premises page
    const page = PremisesShowPage.visit(premises)

    // Then I should see the premises details
    page.shouldShowPremisesDetails()

    // And I should see the room details
    rooms.forEach(room => page.shouldShowRoomDetails(room))
  })

  it('should navigate back from the show page to the premises list page', () => {
    // Given I am signed in
    cy.signIn()

    // And there are premises in the database
    const premises = premisesFactory.buildList(5)
    cy.task('stubPremises', premises)
    cy.task('stubSinglePremises', premises[0])

    // When I visit the show premises page
    const page = PremisesShowPage.visit(premises[0])

    // And I click the previous bread crumb
    page.clickBreadCrumbUp()

    // Then I navigate to the premises list page
    Page.verifyOnPage(PremisesListPage)
  })
})
