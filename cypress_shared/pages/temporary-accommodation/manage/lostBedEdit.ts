import type { Cas3Bedspace, LostBed, Premises, UpdateLostBed } from '@approved-premises/api'
import LostBedEditablePage from './lostBedEditable'
import LocationHeaderComponent from '../../../components/locationHeader'
import paths from '../../../../server/paths/temporary-accommodation/manage'

export default class LostBedEditPage extends LostBedEditablePage {
  private readonly locationHeaderComponent: LocationHeaderComponent

  constructor(premises: Premises, bedspace: Cas3Bedspace) {
    super('Void a bedspace', premises, bedspace)

    this.locationHeaderComponent = new LocationHeaderComponent({ premises, bedspace })
  }

  static visit(premises: Premises, bedspace: Cas3Bedspace, lostBed: LostBed): LostBedEditPage {
    cy.visit(paths.lostBeds.edit({ premisesId: premises.id, bedspaceId: bedspace.id, lostBedId: lostBed.id }))
    return new LostBedEditPage(premises, bedspace)
  }

  shouldShowBedspaceDetails(): void {
    this.locationHeaderComponent.shouldShowLocationDetails()
  }

  clearForm(): void {
    super.clearDateInputs('startDate')
    super.clearDateInputs('endDate')
    super.getTextInputByIdAndClear('notes')
    super.clearRadioByName('costCentre')
  }

  completeForm(updateLostBed: UpdateLostBed): void {
    super.completeEditableForm(updateLostBed)
  }
}
