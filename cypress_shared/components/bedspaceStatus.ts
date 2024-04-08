import Component from './component'
import { Room } from '../../server/@types/shared'
import { DateFormats } from '../../server/utils/dateUtils'

export default class bedspaceStatusComponent extends Component {
  private readonly bedEndDate: string

  constructor(private readonly room: Room) {
    super()
    this.bedEndDate = room.beds[0].bedEndDate
  }

  shouldShowStatusDetails(status: 'Online' | 'Archived'): void {
    this.shouldShowKeyAndValue('Bedspace status', status)

    let endDateText = 'No end date added'

    if (this.bedEndDate) {
      endDateText = DateFormats.isoDateToUIDate(this.bedEndDate)

      if (status === 'Online') {
        endDateText += ` (${DateFormats.isoDateToDaysFromNow(this.bedEndDate)})`
      }
    }

    this.shouldShowKeyAndValue('Bedspace end date', endDateText)
  }
}
