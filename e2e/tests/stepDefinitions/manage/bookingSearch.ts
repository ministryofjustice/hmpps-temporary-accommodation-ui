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

When(`I'm searching departed bookings`, () => {
  cy.then(function _() {
    const bookingSearchPage = Page.verifyOnPage(BookingSearchPage)
    bookingSearchPage.checkBookingStatus('provisional')

    bookingSearchPage.clickOtherBookingStatusLink('departed')
    bookingSearchPage.checkBookingStatus('departed')
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
    cy.get('a.govuk-pagination__link').eq(1).click()
    cy.url({ timeout: 10000 }).should('include', '&page=2')
    cy.get('.govuk-pagination__item').eq(1).should('have.class', 'govuk-pagination__item--current')
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
    cy.get('a.govuk-pagination__link').eq(0).click()
    cy.url({ timeout: 10000 }).should('include', '&page=1')
    cy.get('.govuk-pagination__item').eq(0).should('have.class', 'govuk-pagination__item--current')
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
