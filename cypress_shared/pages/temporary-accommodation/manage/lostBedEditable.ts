import { Cas3Bedspace, Cas3Booking, Cas3Premises, LostBed, NewLostBed, UpdateLostBed } from '@approved-premises/api'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import Page from '../../page'

export default abstract class LostBedEditablePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(title: string, premises: Cas3Premises, bedspace: Cas3Bedspace) {
    super(title)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, bedspace, 'lost-bed')
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Cas3Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['startDate', 'endDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  assignReasons(alias: string): void {
    this.getSelectOptionsAsReferenceData('What is the reason for this void?', alias)
  }

  protected completeEditableForm(newOrUpdateLostBed: NewLostBed | UpdateLostBed): void {
    this.getLegend('What is the start date?')
    this.completeDateInputs('startDate', newOrUpdateLostBed.startDate)

    this.getLegend('What is the expected end date?')
    this.completeDateInputs('endDate', newOrUpdateLostBed.endDate)

    this.getLabel('What is the reason for this void?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newOrUpdateLostBed.reason)

    this.getLegend('Who pays the cost?')
    this.checkRadioByNameAndValue('costCentre', newOrUpdateLostBed.costCentre)

    this.getLabel('Please provide further details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateLostBed.notes)

    this.clickSubmit()
  }
}
