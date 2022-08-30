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
import NonArrivalClient from './nonArrivalClient'
import ReferenceDataClient from './referenceDataClient'

import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import LostBedClient from './lostBedClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false }))),
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((token: string) => new BookingClient(token)) as RestClientBuilder<BookingClient>,
  nonArrivalClientBuilder: ((token: string) => new NonArrivalClient(token)) as RestClientBuilder<NonArrivalClient>,
  referenceDataClientBuilder: ((token: string) =>
    new ReferenceDataClient(token)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((token: string) => new LostBedClient(token)) as RestClientBuilder<LostBedClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  BookingClient,
  PremisesClient,
  HmppsAuthClient,
  RestClientBuilder,
  NonArrivalClient,
  ReferenceDataClient,
  LostBedClient,
}
