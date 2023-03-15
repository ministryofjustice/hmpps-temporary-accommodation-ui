import { TemporaryAccommodationLostBed as LostBed } from '@approved-premises/api'
import Component from './component'
import { DateFormats } from '../../server/utils/dateUtils'
import { allStatuses } from '../../server/utils/lostBedUtils'

export default class LostBedInfoComponent extends Component {
  constructor(private readonly lostBed: LostBed) {
    super()
  }

  shouldShowLostBedDetails(): void {
    const { status } = this.lostBed

    this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.lostBed.startDate))
    this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.lostBed.endDate))

    allStatuses.forEach(possibleLostBedStatus => {
      if (status === possibleLostBedStatus.id) {
        this.shouldShowKeyAndValue('Status', possibleLostBedStatus.name)
      }
    })

    if (status === 'active') {
      this.shouldShowKeyAndValue('Notes', this.lostBed.notes)
    } else if (status === 'cancelled') {
      this.shouldShowKeyAndValue('Notes', this.lostBed.cancellation.notes)
    }
  }
}
