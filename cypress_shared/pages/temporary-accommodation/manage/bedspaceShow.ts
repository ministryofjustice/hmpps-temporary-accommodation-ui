import type { Room, Booking } from '@approved-premises/api'

import Page from '../../page'
import paths from '../../../../server/paths/temporary-accommodation/manage'
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

    this.shouldShowKeyAndValues(
      'Attributes',
      this.room.characteristics.map(({ name }) => name),
    )
    this.shouldShowKeyAndValues('Notes', this.room.notes.split('\n'))
  }

  shouldShowBookingDetails(booking: Booking): void {
    const { status } = booking

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

        if (status === 'provisional') {
          cy.get('td').eq(3).contains('Provisional')
        } else if (status === 'confirmed') {
          cy.get('td').eq(3).contains('Confirmed')
        } else if (status === 'arrived') {
          cy.get('td').eq(3).contains('Active')
        } else if (status === 'departed') {
          cy.get('td').eq(3).contains('Closed')
        }

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

  clickBookingLink(booking: Booking): void {
    cy.get('tr')
      .contains(booking.person.crn)
      .parent()
      .within(() => {
        cy.get('a').contains('View').click()
      })
  }
}
