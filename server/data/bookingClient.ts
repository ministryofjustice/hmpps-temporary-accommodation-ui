import type { Booking, BookingDto } from 'approved-premises'
import RestClient from './restClient'
import config, { ApiConfig } from '../config'

export default class BookingClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('bookingClient', config.apis.approvedPremises as ApiConfig, token)
  }

  async postBooking(premisesId: string, data: BookingDto): Promise<Booking> {
    return (await this.restClient.post({ path: `/premises/${premisesId}/bookings`, data })) as Booking
  }

  async getBooking(premisesId: string, bookingId: string): Promise<Booking> {
    return (await this.restClient.get({ path: `/premises/${premisesId}/bookings/${bookingId}` })) as Booking
  }

  async allBookingsForPremisesId(premisesId: string): Promise<Array<Booking>> {
    return (await this.restClient.get({ path: `/premises/${premisesId}/bookings` })) as Array<Booking>
  }
}
