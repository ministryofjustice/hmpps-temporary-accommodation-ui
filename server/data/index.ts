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
import ReferenceDataClient from './referenceDataClient'
import PersonClient from './personClient'

import { createRedisClient } from './redisClient'
import TokenStore from './tokenStore'
import LostBedClient from './lostBedClient'
import ApplicationClient from './applicationClient'
import LocalAuthorityClient from './temporary-accommodation/localAuthorityClient'

type RestClientBuilder<T> = (token: string) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false }))),
  approvedPremisesClientBuilder: ((token: string) => new PremisesClient(token)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((token: string) => new BookingClient(token)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((token: string) =>
    new ReferenceDataClient(token)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((token: string) => new LostBedClient(token)) as RestClientBuilder<LostBedClient>,
  personClient: ((token: string) => new PersonClient(token)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((token: string) => new ApplicationClient(token)) as RestClientBuilder<ApplicationClient>,
  localAuthorityClientBuilder: ((token: string) =>
    new LocalAuthorityClient(token)) as RestClientBuilder<LocalAuthorityClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  BookingClient,
  PremisesClient,
  HmppsAuthClient,
  RestClientBuilder,
  ReferenceDataClient,
  LostBedClient,
  PersonClient,
  ApplicationClient,
}
