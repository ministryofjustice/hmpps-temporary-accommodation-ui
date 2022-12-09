import type { Booking } from '@approved-premises/api'

import { DateFormats } from '../../server/utils/dateUtils'
import Component from './component'

export default class BookingInfoComponent extends Component {
  constructor(private readonly booking: Booking) {
    super()
  }

  shouldShowBookingDetails(): void {
    const { status } = this.booking

    if (status === 'provisional' || status === 'confirmed' || status === 'cancelled') {
      this.shouldShowKeyAndValue('Start date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
      this.shouldShowKeyAndValue('End date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    } else if (status === 'arrived') {
      this.shouldShowKeyAndValue('Arrival date', DateFormats.isoDateToUIDate(this.booking.arrivalDate))
      this.shouldShowKeyAndValue('Expected departure date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    } else if (status === 'departed') {
      this.shouldShowKeyAndValue('Departure date', DateFormats.isoDateToUIDate(this.booking.departureDate))
    }

    if (status === 'provisional') {
      this.shouldShowKeyAndValue('Status', 'Provisional')
    } else if (status === 'confirmed') {
      this.shouldShowKeyAndValue('Status', 'Confirmed')
      this.shouldShowKeyAndValues('Notes', this.booking.confirmation.notes.split('\n'))
    } else if (status === 'cancelled') {
      this.shouldShowKeyAndValue('Status', 'Cancelled')
      this.shouldShowKeyAndValue('Cancellation reason', this.booking.cancellation.reason.name)
      this.shouldShowKeyAndValues('Notes', this.booking.cancellation.notes.split('\n'))
    } else if (status === 'arrived') {
      this.shouldShowKeyAndValue('Status', 'Active')
      this.shouldShowKeyAndValues('Notes', this.booking.arrival.notes.split('\n'))
    } else if (status === 'departed') {
      this.shouldShowKeyAndValue('Status', 'Closed')
      this.shouldShowKeyAndValue('Departure reason', this.booking.departure.reason.name)
      this.shouldShowKeyAndValue('Move on category', this.booking.departure.moveOnCategory.name)
      this.shouldShowKeyAndValues('Notes', this.booking.departure.notes.split('\n'))
    }

    this.booking.extensions.forEach(extension => {
      this.shouldShowKeyAndValues('Extension notes', extension.notes.split('\n'))
    })
  }
}
