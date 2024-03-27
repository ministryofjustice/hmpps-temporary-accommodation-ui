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
    this.shouldShowKeyAndValue(
      'Bedspace end date',
      this.bedEndDate ? DateFormats.isoDateToUIDate(this.bedEndDate) : 'No end date added',
    )
  }
}
