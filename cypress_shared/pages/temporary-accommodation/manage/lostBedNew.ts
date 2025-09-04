import type { Cas3Bedspace, NewLostBed, Premises } from '@approved-premises/api'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import LostBedEditablePage from './lostBedEditable'

export default class LostBedNewPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, bedspace: Cas3Bedspace) {
    super('Void a bedspace', premises, bedspace)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Premises, bedspace: Cas3Bedspace): LostBedNewPage {
    cy.visit(paths.lostBeds.new({ premisesId: premises.id, bedspaceId: bedspace.id }))
    return new LostBedNewPage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails(true)
  }

  completeForm(newLostBed: NewLostBed): void {
    super.completeEditableForm(newLostBed)
  }
}
