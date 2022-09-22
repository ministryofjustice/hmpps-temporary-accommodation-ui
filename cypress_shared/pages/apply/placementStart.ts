import Page from '../page'
import { formatDateString } from '../../../server/utils/utils'

export default class PlacementStartPage extends Page {
  constructor(releaseDate: string) {
    super(`Is ${formatDateString(releaseDate)} the date you want the placement to start? `)
  }
}
