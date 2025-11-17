import type { Cas3Bedspace, Cas3Premises, Cas3VoidBedspaceRequest } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import LostBedEditablePage from './lostBedEditable'

export default class LostBedNewPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Cas3Premises, bedspace: Cas3Bedspace) {
    super('Void a bedspace', premises, bedspace)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Cas3Premises, bedspace: Cas3Bedspace): LostBedNewPage {
    cy.visit(paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new LostBedNewPage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails(true)
  }

  completeForm(newLostBed: Cas3VoidBedspaceRequest): void {
    super.completeEditableForm(newLostBed)
  }
}
