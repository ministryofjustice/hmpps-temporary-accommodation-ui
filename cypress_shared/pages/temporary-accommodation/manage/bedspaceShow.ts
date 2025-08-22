import type { Booking, LostBed } from '@approved-premises/api'

import { Cas3Bedspace, Premises, Room } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import BookingListingComponent from '../../../components/bookingListing'
import LocationHeaderComponent from '../../../components/locationHeader'
import BedspaceStatusComponent from '../../../components/bedspaceStatus'
import LostBedListingComponent from '../../../components/lostBedListing'
import Page from '../../page'
import { DateFormats } from '../../../../server/utils/dateUtils'

export default class BedspaceShowPage extends Page {
  private readonly locationHeaderComponent: LocationHeaderComponent

  private readonly bedspaceStatusComponent: BedspaceStatusComponent

  private readonly premises: Premises

  constructor(
    premises: Premises,
    private readonly room: Room,
    private readonly bedspace: Cas3Bedspace,
    bedspaceReference: string,
  ) {
    super(`Bedspace reference: ${bedspaceReference}`)

    this.premises = premises
    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
    this.bedspaceStatusComponent = new BedspaceStatusComponent(this.room, this.bedspace)
  }

  static visit(premises: Premises, room: Room, bedspace: Cas3Bedspace): BedspaceShowPage {
    cy.visit(paths.premises.bedspaces.show({ premisesId: premises.id, bedspaceId: bedspace.id }))
    let bedspaceReference: string
    if (room) {
      bedspaceReference = room.name
    } else {
      bedspaceReference = bedspace.reference
    }
    return new BedspaceShowPage(premises, room, bedspace, bedspaceReference)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()

    if (this.room) {
      cy.get('h2').should('contain', this.room.name)
      this.shouldShowKeyAndValues(
        'Attributes',
        this.room.characteristics.map(({ name }) => name),
      )
      this.shouldShowKeyAndValues('Notes', this.room.notes.split('\n'))
    } else {
      cy.get('h2').should('contain', this.bedspace.reference)
      this.shouldShowKeyAndValues(
        'Attributes',
        this.bedspace.characteristics.map(({ name }) => name),
      )
      this.shouldShowKeyAndValues('Notes', this.bedspace.notes.split('\n'))
    }
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
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').should('contain.text', 'Actions').click()
      cy.get('a').should('contain.text', 'Book bedspace')
      cy.get('a').should('contain.text', 'Void bedspace')
    })

    cy.root().should('not.contain', 'This bedspace is in an archived property.')

    this.bedspaceStatusComponent.shouldShowStatusDetails('Online')
  }

  shouldShowAsArchived(premiseIsArchived = true): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.root().should('not.contain', 'Actions')
    })

    if (premiseIsArchived) {
      cy.root().should('contain', 'This bedspace is in an archived property.')
    }

    this.bedspaceStatusComponent.shouldShowStatusDetails('Archived')
  }

  shouldShowBedspaceEndDate(endDate: string | null): void {
    if (!endDate) {
      this.shouldShowKeyAndValue('Bedspace end date', 'No end date added')
    } else if (this.room) {
      this.shouldShowKeyAndValue('Bedspace end date', DateFormats.isoDateToUIDate(this.room.beds[0].bedEndDate))
    } else {
      this.shouldShowKeyAndValue('Bedspace end date', DateFormats.isoDateToUIDate(this.bedspace.endDate))
    }
  }

  clickBedspaceEditLink(): void {
    cy.get('a').contains('Edit').click()
  }

  clickBookBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').should('contain.text', 'Actions').click()
      cy.get('a').contains('Book bedspace').click()
    })
  }

  clickVoidBedspaceLink(): void {
    cy.get('.moj-cas-page-header-actions').within(() => {
      cy.get('.moj-button-menu').contains('Actions').click()
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
