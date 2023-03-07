import type { Booking, TemporaryAccommodationLostBed as LostBed, Room } from '@approved-premises/api'

import { Premises } from '../../../../server/@types/shared'
import config from '../../../../server/config'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BedspaceShowPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, private readonly room: Room) {
    super('View a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
  }

  static visit(premises: Premises, room: Room): BedspaceShowPage {
    cy.visit(paths.premises.bedspaces.show({ premisesId: premises.id, roomId: room.id }))
    return new BedspaceShowPage(premises, room)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()

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

  shouldShowLostBedDetails(lostBed: LostBed): void {
    cy.get('tr')
      .contains('Void')
      .parent()
      .parent()
      .within(() => {
        cy.get('td')
          .eq(1)
          .contains(DateFormats.isoDateToUIDate(lostBed.startDate, { format: 'short' }))
        cy.get('td')
          .eq(2)
          .contains(DateFormats.isoDateToUIDate(lostBed.endDate, { format: 'short' }))
      })
  }

  shouldShowAsActive(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').should('contain', 'Book bedspace')
      if (!config.flags.voidsDisabled) {
        cy.get('a').should('contain', 'Void bedspace')
      }
    })
  }

  shouldShowAsArchived(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Actions')
    })
  }

  clickBedspaceEditLink(): void {
    cy.get('a').contains('Edit').click()
  }

  clickBookBedspaceLink(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').contains('Book bedspace').click()
    })
  }

  clickVoidBedspaceLink(): void {
    cy.get('.moj-page-header-actions').within(() => {
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

  clickLostBedLink(premisesId: string, roomId: string, lostBedId: string): void {
    cy.get(`[href="${paths.lostBeds.show({ premisesId, roomId, lostBedId })}"]`).click()
  }
}
