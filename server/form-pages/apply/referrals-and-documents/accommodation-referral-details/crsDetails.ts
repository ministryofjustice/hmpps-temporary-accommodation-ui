import { Page } from '../../../utils/decorators'
import ContactDetails from '../../contactDetails'

@Page({ name: 'crs-details', bodyProperties: ['name', 'phone', 'email'] })
export default class CrsDetails extends ContactDetails {
  title = 'CRS referrer details'

  previousPageId = 'crs-submitted'

  nextPageId = 'other-accommodation-options'
}
