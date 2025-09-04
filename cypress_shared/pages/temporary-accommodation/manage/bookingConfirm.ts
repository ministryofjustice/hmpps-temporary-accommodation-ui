import type { Person, Premises } from '@approved-premises/api'

import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import PopDetailsHeaderComponent from '../../../components/popDetailsHeader'
import Page from '../../page'
import { Cas3Bedspace } from '../../../../server/@types/shared'

export default class BookingConfirmPage extends Page {
  private readonly popDetailsHeaderComponent: PopDetailsHeaderComponent

  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, bedspace: Cas3Bedspace, person: Person) {
    super('Confirm CRN')
    this.popDetailsHeaderComponent = new PopDetailsHeaderComponent(person)
    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Premises, bedspace: Cas3Bedspace, person: Person): BookingConfirmPage {
    cy.visit(paths.bookings.confirm({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new BookingConfirmPage(premises, bedspace, person)
  }

  shouldShowBookingDetails(): void {
    this.popDetailsHeaderComponent.shouldShowPopDetails()
    this.locationHeaderComponent.shouldShowLocationDetails(true)
  }
}
