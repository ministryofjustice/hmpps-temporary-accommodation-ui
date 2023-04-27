import { Booking, LostBed, NewLostBed, Premises, Room, UpdateLostBed } from '@approved-premises/api'
import BedspaceConflictErrorComponent from '../../../components/bedspaceConflictError'
import Page from '../../page'

export default abstract class LostBedEditablePage extends Page {
  private readonly bedspaceConflictErrorComponent: BedspaceConflictErrorComponent

  constructor(title: string, premises: Premises, room: Room) {
    super(title)

    this.bedspaceConflictErrorComponent = new BedspaceConflictErrorComponent(premises, room, 'lost-bed')
  }

  shouldShowDateConflictErrorMessages(
    conflictingEntity: Booking | LostBed,
    conflictingEntityType: 'booking' | 'lost-bed',
  ): void {
    this.bedspaceConflictErrorComponent.shouldShowDateConflictErrorMessages(
      ['startDate', 'endDate'],
      conflictingEntity,
      conflictingEntityType,
    )
  }

  protected completeEditableForm(newOrUpdateLostBed: NewLostBed | UpdateLostBed): void {
    this.getLegend('What is the start date?')
    this.completeDateInputs('startDate', newOrUpdateLostBed.startDate)

    this.getLegend('What is the expected end date?')
    this.completeDateInputs('endDate', newOrUpdateLostBed.endDate)

    this.getLabel('What is the reason for this void?')
    this.getSelectInputByIdAndSelectAnEntry('reason', newOrUpdateLostBed.reason)

    this.getLabel('Please provide further details')
    this.getTextInputByIdAndEnterDetails('notes', newOrUpdateLostBed.notes)

    this.clickSubmit()
  }
}
