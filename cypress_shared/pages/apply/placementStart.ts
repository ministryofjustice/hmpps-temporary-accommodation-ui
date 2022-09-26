import Page from '../page'
import { DateFormats } from '../../../server/utils/dateUtils'

export default class PlacementStartPage extends Page {
  constructor(releaseDate: string) {
    super(`Is ${DateFormats.isoDateToUIDate(releaseDate)} the date you want the placement to start? `)
  }
}
