import type { Room } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { Booking } from '../../../../server/@types/shared'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BedspaceShowPage extends Page {
  constructor(private readonly room: Room) {
    super('View a bedspace')
  }

  static visit(premisesId: string, room: Room): BedspaceShowPage {
    cy.visit(paths.premises.bedspaces.show({ premisesId, roomId: room.id }))
    return new BedspaceShowPage(room)
  }

  shouldShowBedspaceDetails(): void {
    cy.get('h2').should('contain', this.room.name)

    this.room.characteristics.forEach(characteristic => {
      cy.get('.govuk-summary-list__key')
        .contains('Attributes')
        .siblings('.govuk-summary-list__value')
        .should('contain', characteristic.name)
    })

    this.room.notes.split('\n').forEach(noteLine => {
      cy.get('.govuk-summary-list__key')
        .contains('Notes')
        .siblings('.govuk-summary-list__value')
        .should('contain', noteLine)
    })
  }

  shouldShowBookingDetails(booking: Booking): void {
    cy.get('tr')
      .contains(booking.person.crn)
      .parent()
      .within(() => {
        cy.get('td').eq(0).contains(booking.person.crn)
        cy.get('td')
          .eq(1)
          .contains(DateFormats.isoDateToUIDate(booking.arrivalDate, { format: 'short' }))
        cy.get('td')
          .eq(2)
          .contains(DateFormats.isoDateToUIDate(booking.departureDate, { format: 'short' }))
        cy.get('td').eq(3).contains('Provisional')
        cy.get('td').eq(4).contains('View')
      })
  }

  clickBedspaceEditLink(): void {
    cy.get('a').contains('Edit').click()
  }

  clickBookBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Book bedspace').click()
    })
  }

  clickVoidBedspaceLink(): void {
    cy.get('.moj-identity-bar').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Void bedspace').click()
    })
  }
}
