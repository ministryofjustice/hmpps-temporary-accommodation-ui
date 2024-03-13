import { Then, When } from '@badeball/cypress-cucumber-preprocessor'
import Page from '../../../../cypress_shared/pages/page'
import BookingSearchPage from '../../../../cypress_shared/pages/temporary-accommodation/manage/bookingSearch'
import DashboardPage from '../../../../cypress_shared/pages/temporary-accommodation/dashboardPage'

When(`I'm searching bookings`, () => {
  cy.then(function _() {
    cy.visit('/')
    const dashboardPage = Page.verifyOnPage(DashboardPage)
    dashboardPage.clickViewBookingsLink()
  })
})

Then('I should see a summary of the booking on the provisional bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the confirmed bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('confirmed')
    bookingSearchPage.checkBookingStatus('confirmed')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the active bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('active')
    bookingSearchPage.checkBookingStatus('active')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see a summary of the booking on the departed bookings page', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('departed')
    bookingSearchPage.checkBookingStatus('departed')

    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

When('I search for a CRN that does not exist in provisional bookings', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.searchByCRN('N000000', 'provisional')
  })
})

Then('I should see a message that the provisional booking is not found', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.checkNoResultsByCRN('provisional', 'N000000')
  })
})

When('I click on the Departed bookings tab', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.clickOtherBookingStatusLink('departed')
  })
})

Then('I should see a message that the departed booking is not found', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'departed')
    bookingSearchPage.checkNoResultsByCRN('departed', 'N000000')
  })
})

When('I click on the Provisional bookings tab', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'departed')
    bookingSearchPage.clickOtherBookingStatusLink('provisional')
  })
})

When('I search for a valid CRN in provisional bookings', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.searchByCRN(this.booking.person.crn, 'provisional')
  })
})

Then('I see the provisional booking I was searching for', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage, 'provisional')
    bookingSearchPage.checkBookingDetailsAndClickView(this.premises, this.booking)
  })
})

Then('I should see pagination functionality', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkForPagination()
  })
})

When('I see results for the first page', () => {
  cy.then(function _() {
    cy.get('tbody >tr').should('exist')
    cy.get('tbody >tr').invoke('html').as('results')
  })
})

When('I navigate to the second page', () => {
  cy.then(function _() {
    cy.get('a.moj-pagination__link').contains(/^2$/).click()
    cy.url({ timeout: 10000 }).should('include', 'page=2')
    cy.get('.moj-pagination__item').contains(/^2$/).should('have.class', 'moj-pagination__item--active')
  })
})

Then('I should see different results', () => {
  cy.then(function _() {
    cy.get('tbody >tr').should('exist')
    cy.get('tbody >tr').invoke('html').should('not.equal', this.results)
  })
})

When('I navigate to the first page', () => {
  cy.then(function _() {
    cy.get('a.moj-pagination__link').contains(/^1$/).click()
    cy.url({ timeout: 10000 }).should('include', 'page=1')
    cy.get('.moj-pagination__item').contains(/^1$/).should('have.class', 'moj-pagination__item--active')
  })
})

Then('I should see the original results', () => {
  cy.then(function _() {
    cy.get('tbody >tr').invoke('html').should('equal', this.results)
  })
})

When('the results are ordered by end date in descending order', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkOrderOfDates(4, false)
  })
})

When('I navigate to order by end date', () => {
  cy.then(function _() {
    cy.get('.govuk-table >thead th').eq(4).children().eq(0).click()
  })
})

Then('the results are ordered by end date in ascending order', () => {
  cy.url({ timeout: 10000 }).should('include', 'sortBy=endDate&sortDirection=asc')

  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkOrderOfDates(4, true)
  })
})

When('I navigate to order by start date', () => {
  cy.then(function _() {
    cy.get('.govuk-table >thead th').eq(3).children().eq(0).click()
  })
})

Then('the results order by start date in descending order', () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkOrderOfDates(3, false)
  })
})

Then('the results order by start date in ascending order', () => {
  cy.url({ timeout: 10000 }).should('include', 'sortBy=startDate&sortDirection=asc')

  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkOrderOfDates(3, true)
  })
})
