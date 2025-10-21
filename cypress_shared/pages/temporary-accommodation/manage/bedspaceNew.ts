import type { Cas3NewBedspace, Cas3Premises } from '@approved-premises/api'
import BedspaceEditablePage from './bedspaceEditable'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class BedspaceNewPage extends BedspaceEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Cas3Premises) {
    super('Add a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
  }

  static visit(premises: Cas3Premises): BedspaceNewPage {
    cy.visit(paths.premises.bedspaces.new({ premisesId: premises.id }))
    return new BedspaceNewPage(premises)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  completeForm(bedspace: Cas3NewBedspace): void {
    super.completeEditableForm(bedspace)
  }
}
