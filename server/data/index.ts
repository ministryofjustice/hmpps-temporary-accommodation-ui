/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
/* istanbul ignore file */

import { initialiseAppInsights, buildAppInsightsClient } from '../utils/azureAppInsights'
import BookingClient from './bookingClient'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import PremisesClient from './premisesClient'
import ArrivalClient from './arrivalClient'
import NonArrivalClient from './nonArrivalClient'
import DepartureClient from './departureClient'
import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false }))),
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((token: string) => new BookingClient(token)) as RestClientBuilder<BookingClient>,
  arrivalClientBuilder: ((token: string) => new ArrivalClient(token)) as RestClientBuilder<ArrivalClient>,
  nonArrivalClientBuilder: ((token: string) => new NonArrivalClient(token)) as RestClientBuilder<NonArrivalClient>,
  departureClientBuilder: ((token: string) => new DepartureClient(token)) as RestClientBuilder<DepartureClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  BookingClient,
  PremisesClient,
  ArrivalClient,
  HmppsAuthClient,
  RestClientBuilder,
  NonArrivalClient,
  DepartureClient,
}
