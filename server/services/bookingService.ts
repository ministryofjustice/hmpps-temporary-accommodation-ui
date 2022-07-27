import { parseISO, isSameDay, isWithinInterval, addDays } from 'date-fns'

import type { Booking, BookingDto, TableRow, GroupedListofBookings } from 'approved-premises'

import type { RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { convertDateString } from '../utils/utils'

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(private readonly bookingClientFactory: RestClientBuilder<BookingClient>) {}

  async postBooking(premisesId: string, booking: BookingDto): Promise<Booking> {
    // TODO: We need to do some more work on authentication to work
    // out how to get this token, so let's stub for now
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const confirmedBooking = await bookingClient.postBooking(premisesId, booking)

    return confirmedBooking
  }

  async getBooking(premisesId: string, bookingId: string): Promise<Booking> {
    // TODO: We need to do some more work on authentication to work
    // out how to get this token, so let's stub for now
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const booking = await bookingClient.getBooking(premisesId, bookingId)

    return {
      ...booking,
      arrivalDate: parseISO(booking.arrivalDate).toLocaleDateString('en-GB'),
      expectedDepartureDate: parseISO(booking.expectedDepartureDate).toLocaleDateString('en-GB'),
    }
  }

  async listOfBookingsForPremisesId(premisesId: string): Promise<Array<TableRow>> {
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    return this.bookingsToTableRows(bookings, premisesId, 'arrival')
  }

  async groupedListOfBookingsForPremisesId(premisesId: string): Promise<GroupedListofBookings> {
    const token = 'FAKE_TOKEN'
    const bookingClient = this.bookingClientFactory(token)

    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)
    const today = new Date(new Date().setHours(0, 0, 0, 0))

    return {
      arrivingToday: this.bookingsToTableRows(this.bookingsArrivingToday(bookings, today), premisesId, 'arrival'),
      departingToday: this.bookingsToTableRows(this.bookingsDepartingToday(bookings, today), premisesId, 'departure'),
      upcomingArrivals: this.bookingsToTableRows(this.upcomingArrivals(bookings, today), premisesId, 'arrival'),
      upcomingDepartures: this.bookingsToTableRows(this.upcomingDepartures(bookings, today), premisesId, 'departure'),
    }
  }

  bookingsToTableRows(bookings: Array<Booking>, premisesId: string, type: 'arrival' | 'departure'): Array<TableRow> {
    return bookings.map(booking => [
      {
        text: booking.CRN,
      },
      {
        text: convertDateString(
          type === 'arrival' ? booking.arrivalDate : booking.expectedDepartureDate,
        ).toLocaleDateString('en-GB'),
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

  private bookingsArrivingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking =>
      isSameDay(convertDateString(booking.arrivalDate), today),
    )
  }

  private bookingsDepartingToday(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking =>
      isSameDay(convertDateString(booking.expectedDepartureDate), today),
    )
  }

  private upcomingArrivals(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.bookingsAwaitingArrival(bookings).filter(booking => this.isUpcoming(booking.arrivalDate, today))
  }

  private upcomingDepartures(bookings: Array<Booking>, today: Date): Array<Booking> {
    return this.arrivedBookings(bookings).filter(booking => this.isUpcoming(booking.expectedDepartureDate, today))
  }

  private arrivedBookings(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'arrived')
  }

  private bookingsAwaitingArrival(bookings: Array<Booking>): Array<Booking> {
    return bookings.filter(booking => booking.status === 'awaiting-arrival')
  }

  private isUpcoming(date: string, today: Date) {
    return isWithinInterval(convertDateString(date), {
      start: addDays(today, 1),
      end: addDays(today, this.UPCOMING_WINDOW_IN_DAYS + 1),
    })
  }
}
