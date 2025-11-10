import type { Cas3Booking, Cas3NewBooking, Cas3VoidBedspace } from '@approved-premises/api'

import type { LostBedClient, RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'

export type BookingListingEntry = {
  path: string
  body: Cas3Booking
  type: 'booking'
}

export type LostBedListingEntry = {
  path: string
  body: Cas3VoidBedspace
  type: 'lost-bed'
}

export type ListingEntry = LostBedListingEntry | BookingListingEntry

export default class BookingService {
  UPCOMING_WINDOW_IN_DAYS = 5

  constructor(
    private readonly bookingClientFactory: RestClientBuilder<BookingClient>,
    private readonly lostBedClientFactory: RestClientBuilder<LostBedClient>,
  ) {}

  async createForBedspace(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
    booking: Cas3NewBooking,
  ): Promise<Cas3Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)

    return bookingClient.create(premisesId, {
      serviceName: 'temporary-accommodation',
      enableTurnarounds: true,
      ...booking,
      bedspaceId,
    })
  }

  async getListingEntries(
    callConfig: CallConfig,
    premisesId: string,
    bedspaceId: string,
  ): Promise<Array<ListingEntry>> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const lostBedClient = this.lostBedClientFactory(callConfig)

    const [premisesBookings, premisesLostBeds] = await Promise.all([
      bookingClient.allBookingsForPremisesId(premisesId),
      lostBedClient.allLostBedsForPremisesId(premisesId),
    ])

    const bookingEntries: Array<BookingListingEntry & { sortingValue: string }> = premisesBookings
      .filter(booking => booking.bedspace.id === bedspaceId)
      .map(booking => ({
        body: booking,
        type: 'booking' as const,
        path: paths.bookings.show({ premisesId, bedspaceId, bookingId: booking.id }),
        sortingValue: booking.arrivalDate,
      }))

    const lostBedEntries: Array<LostBedListingEntry & { sortingValue: string }> = premisesLostBeds
      .filter(lostBed => lostBed.bedspaceId === bedspaceId && lostBed.status === 'active')
      .map(lostBed => ({
        body: lostBed,
        type: 'lost-bed' as const,
        path: paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed.id }),
        sortingValue: lostBed.startDate,
      }))

    return [...bookingEntries, ...lostBedEntries].sort((a, b) => a.sortingValue.localeCompare(b.sortingValue)).reverse()
  }

  async getBooking(callConfig: CallConfig, premisesId: string, bookingId: string): Promise<Cas3Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)
    return bookingClient.find(premisesId, bookingId)
  }
}
