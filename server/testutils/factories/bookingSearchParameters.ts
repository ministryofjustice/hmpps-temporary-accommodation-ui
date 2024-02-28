import { Factory } from 'fishery'
import { faker } from '@faker-js/faker/locale/en_GB'
import { BookingSearchParameters } from '../../controllers/temporary-accommodation/manage/bookingSearchController'

export default Factory.define<BookingSearchParameters>(() => ({
  crn: `C${faker.number.int({ min: 100000, max: 999999 })}`,
}))
