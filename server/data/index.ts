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
import RoomClient from './roomClient'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'

type RestClientBuilder<T> = (callConfig: CallConfig) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false }))),
  premisesClientBuilder: ((callConfig: CallConfig) =>
    new PremisesClient(callConfig)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((callConfig: CallConfig) => new BookingClient(callConfig)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((callConfig: CallConfig) =>
    new ReferenceDataClient(callConfig)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((callConfig: CallConfig) => new LostBedClient(callConfig)) as RestClientBuilder<LostBedClient>,
  personClient: ((callConfig: CallConfig) => new PersonClient(callConfig)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((callConfig: CallConfig) =>
    new ApplicationClient(callConfig)) as RestClientBuilder<ApplicationClient>,
  roomClientBuilder: ((callConfig: CallConfig) => new RoomClient(callConfig)) as RestClientBuilder<RoomClient>,
  reportClientBuilder: ((callConfig: CallConfig) => new ReportClient(callConfig)) as RestClientBuilder<ReportClient>,
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
  ReportClient,
}
