import type { Booking, BookingDto } from 'approved-premises'
import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'

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
}
