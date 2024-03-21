import type { Booking, LostBed, Room } from '@approved-premises/api'

import { Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingListingComponent from '../../../components/bookingListing'
import LocationHeaderComponent from '../../../components/locationHeader'
import LostBedListingComponent from '../../../components/lostBedListing'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BedspaceShowPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly premises: Premises

  constructor(
    premises: Premises,
    private readonly room: Room,
  ) {
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
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.shouldShowBookingDetails()
  }

  shouldShowLostBedDetails(lostBed: LostBed): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.shouldShowLostBedDetails()
  }

  shouldShowAsActive(): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.get('button').contains('Actions').click()
      cy.get('a').should('contain', 'Book bedspace')
      cy.get('a').should('contain', 'Void bedspace')
    })

    cy.root().should('not.contain', 'This bedspace is in an archived property.')

    this.shouldShowKeyAndValue('Bedspace status', 'Online')
  }

  shouldShowAsArchived(premiseIsArchived = true): void {
    cy.get('.moj-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Actions')
    })

    if (premiseIsArchived) {
      cy.root().should('contain', 'This bedspace is in an archived property.')
    }

    this.shouldShowKeyAndValue('Bedspace status', 'Archived')
  }

  shouldShowBedspaceEndDate(endDate: string | null): void {
    if (!endDate) {
      this.shouldShowKeyAndValue('Bedspace end date', 'No end date added')
    } else {
      this.shouldShowKeyAndValue('Bedspace end date', DateFormats.isoDateToUIDate(this.room.beds[0].bedEndDate))
    }
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
    const bookingListingComponent = new BookingListingComponent(booking)
    bookingListingComponent.clickLink()
  }

  clickLostBedLink(lostBed: LostBed): void {
    const lostBedListingComponent = new LostBedListingComponent(lostBed)
    lostBedListingComponent.clickLink()
  }
}
