import type { Booking, LostBed, Room, UpdateLostBed } from '@approved-premises/api'

import { Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import { DateFormats } from '../../../../server/utils/dateUtils'
import LocationHeaderComponent from '../../../components/locationHeader'
import Page from '../../page'

export default class BedspaceShowPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly premises: Premises

  constructor(premises: Premises, private readonly room: Room) {
    super('View a bedspace')

    this.premises = premises
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

  shouldShowPremisesAttributes(): void {
    cy.get('.attributes-header').within(() => {
      cy.get('h2').contains('Property attributes')
      this.premises.characteristics?.forEach(characteristic => {
        cy.get('h2').contains('Property attributes').siblings('ul').children().should('contain', characteristic.name)
      })
    })
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
          cy.get('td').eq(3).contains('Departed')
        }

        cy.get('td').eq(4).contains('View')
      })
  }

  shouldShowLostBedDetails(lostBedOrLostBedUpdate: LostBed | UpdateLostBed): void {
    cy.get('tr')
      .contains('Void')
      .parent()
      .parent()
      .within(() => {
        cy.get('td')
          .eq(1)
          .contains(DateFormats.isoDateToUIDate(lostBedOrLostBedUpdate.startDate, { format: 'short' }))
        cy.get('td')
          .eq(2)
          .contains(DateFormats.isoDateToUIDate(lostBedOrLostBedUpdate.endDate, { format: 'short' }))
      })
  }

  shouldShowAsActive(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').should('contain', 'Book bedspace')
      cy.get('a').should('contain', 'Void bedspace')
    })

    cy.root().should('not.contain', 'This bedspace is in an archived property.')
  }

  shouldShowAsArchived(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Actions')
    })

    cy.root().should('contain', 'This bedspace is in an archived property.')
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
