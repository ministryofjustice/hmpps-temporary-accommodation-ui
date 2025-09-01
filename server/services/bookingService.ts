import type { Booking, LostBed, NewBooking, Room } from '@approved-premises/api'

import type { LostBedClient, RestClientBuilder } from '../data'
import BookingClient from '../data/bookingClient'
import { CallConfig } from '../data/restClient'
import paths from '../paths/temporary-accommodation/manage'
import { DateFormats } from '../utils/dateUtils'

export type BookingListingEntry = {
  path: string
  body: Booking
  type: 'booking'
}

export type LostBedListingEntry = {
  path: string
  body: LostBed
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
    booking: NewBooking,
  ): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)

    const confirmedBooking = await bookingClient.create(premisesId, {
      serviceName: 'temporary-accommodation',
      bedId: bedspaceId,
      enableTurnarounds: true,
      ...booking,
    })

    return confirmedBooking
  }

  async getListingEntriesForBedspace(
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
      .filter(booking => booking.bed.id === bedspaceId)
      .map(booking => ({
        body: booking,
        type: 'booking' as const,
        path: paths.bookings.show({ premisesId, bedspaceId, bookingId: booking.id }),
        sortingValue: booking.arrivalDate,
      }))

    const lostBedEntries: Array<LostBedListingEntry & { sortingValue: string }> = premisesLostBeds
      .filter(lostBed => lostBed.bedId === bedspaceId && lostBed.status === 'active')
      .map(lostBed => ({
        body: lostBed,
        type: 'lost-bed' as const,
        path: paths.lostBeds.show({ premisesId, bedspaceId, lostBedId: lostBed.id }),
        sortingValue: lostBed.startDate,
      }))

    return [...bookingEntries, ...lostBedEntries].sort((a, b) => a.sortingValue.localeCompare(b.sortingValue)).reverse()
  }

  async getListingEntries(callConfig: CallConfig, premisesId: string, room: Room): Promise<Array<ListingEntry>> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const bookings = await bookingClient.allBookingsForPremisesId(premisesId)

    const lostBedClient = this.lostBedClientFactory(callConfig)
    const lostBeds = await (
      await lostBedClient.allLostBedsForPremisesId(premisesId)
    ).filter(lostBed => lostBed.status === 'active')

    const bedId = room.beds[0].id

    const bookingListingEntries = bookings
      .filter(b => b.bed.id === bedId)
      .map(b => ({
        sortingValue: DateFormats.isoToDateObj(b.arrivalDate).getTime(),
        type: 'booking' as const,
        body: b,
        path: paths.bookings.show({
          premisesId,
          bedspaceId: room.id,
          bookingId: b.id,
        }),
      }))

    const lostBedListingEntries = lostBeds
      .filter(lostBed => lostBed.bedId === bedId)
      .map(lostBed => ({
        sortingValue: DateFormats.isoToDateObj(lostBed.startDate).getTime(),
        type: 'lost-bed' as const,
        body: lostBed,
        path: paths.lostBeds.show({
          premisesId,
          bedspaceId: room.id,
          lostBedId: lostBed.id,
        }),
      }))

    return [...bookingListingEntries, ...lostBedListingEntries].sort((a, b) => {
      return b.sortingValue - a.sortingValue
    })
  }

  async getBooking(callConfig: CallConfig, premisesId: string, bookingId: string): Promise<Booking> {
    const bookingClient = this.bookingClientFactory(callConfig)
    const booking = await bookingClient.find(premisesId, bookingId)

    return booking
  }
}
