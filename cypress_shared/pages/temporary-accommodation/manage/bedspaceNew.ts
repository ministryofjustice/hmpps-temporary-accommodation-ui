import type { NewRoom } from '@approved-premises/api'
import { Premises } from '../../../../server/@types/shared'
import paths from '../../../../server/paths/temporary-accommodation/manage'
import LocationHeaderComponent from '../../../components/locationHeader'
import BedspaceEditablePage from './bedspaceEditable'

export default class BedspaceNewPage extends BedspaceEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(private readonly premises: Premises) {
    super('Add a bedspace')

    this.locationHeaderComponent = new LocationHeaderComponent({ premises })
  }

  static visit(premises: Premises): BedspaceNewPage {
    cy.visit(paths.premises.bedspaces.new({ premisesId: premises.id }))
    return new BedspaceNewPage(premises)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  completeForm(newRoom: NewRoom): void {
    super.completeEditableForm(newRoom)
  }
}
