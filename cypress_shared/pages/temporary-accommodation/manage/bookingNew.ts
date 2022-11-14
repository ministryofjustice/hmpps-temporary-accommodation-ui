import type { NewBooking } from '@approved-premises/api'
import BookingEditablePage from './bookingEditable'

export default class BookingNewPage extends BookingEditablePage {
  constructor() {
    super('Book bedspace')
  }

  completeForm(newBooking: NewBooking): void {
    super.completeEditableForm(newBooking)
  }
}
