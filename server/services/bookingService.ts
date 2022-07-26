import type { Booking, BookingDto, TableRow } from 'approved-premises'
import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { convertDateString } from '../utils/utils'

export default class BookingService {
  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async postBooking(premisesId: string, booking: BookingDto): Promise<Booking> {
    // TODO: We need to do some more work on authentication to work
    // out how to get this token, so let's stub for now
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.postBooking(premisesId, booking)

    return confirmedBooking
  }

  async listOfBookingsForPremisesId(premisesId: string): Promise<Array<TableRow>> {
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    return bookings.map(booking => [
      {
        text: booking.CRN,
      },
      {
        text: convertDateString(booking.arrivalDate).toLocaleDateString('en-GB'),
      },
      {
        html: `<a href="/premises/${premisesId}/bookings/${booking.id}/arrivals/new">
          Manage
          <span class="govuk-visually-hidden">
            booking for ${booking.CRN}
          </span>
        </a>`,
      },
    ])
  }
}
