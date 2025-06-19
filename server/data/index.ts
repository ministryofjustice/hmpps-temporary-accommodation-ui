/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
/* istanbul ignore file */

import { buildAppInsightsClient, initialiseAppInsights } from '../utils/azureAppInsights'
import BookingClient from './bookingClient'

initialiseAppInsights()
buildAppInsightsClient()

import HmppsAuthClient from './hmppsAuthClient'
import PersonClient from './personClient'
import PremisesClient from './premisesClient'
import PremisesClientV2 from './v2/premisesClient'
import ReferenceDataClient from './referenceDataClient'

import ApplicationClient from './applicationClient'
import AssessmentClient from './assessmentClient'
import BedspaceClient from './bedspaceClient'
import LostBedClient from './lostBedClient'
import { createRedisClient } from './redisClient'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'
import RoomClient from './roomClient'
import TokenStore from './tokenStore'
import UserClient from './userClient'
import TimelineClient from './timelineClient'

type RestClientBuilder<T> = (callConfig: CallConfig) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  premisesClientBuilder: ((callConfig: CallConfig) =>
    new PremisesClient(callConfig)) as RestClientBuilder<PremisesClient>,
  premisesClientV2Builder: ((callConfig: CallConfig) =>
    new PremisesClientV2(callConfig)) as RestClientBuilder<PremisesClientV2>,
  bookingClientBuilder: ((callConfig: CallConfig) => new BookingClient(callConfig)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((callConfig: CallConfig) =>
    new ReferenceDataClient(callConfig)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((callConfig: CallConfig) => new LostBedClient(callConfig)) as RestClientBuilder<LostBedClient>,
  personClientBuilder: ((callConfig: CallConfig) => new PersonClient(callConfig)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((callConfig: CallConfig) =>
    new ApplicationClient(callConfig)) as RestClientBuilder<ApplicationClient>,
  roomClientBuilder: ((callConfig: CallConfig) => new RoomClient(callConfig)) as RestClientBuilder<RoomClient>,
  reportClientBuilder: ((callConfig: CallConfig) => new ReportClient(callConfig)) as RestClientBuilder<ReportClient>,
  userClientBuilder: ((callConfig: CallConfig) => new UserClient(callConfig)) as RestClientBuilder<UserClient>,
  bedspaceClientBuilder: ((callConfig: CallConfig) =>
    new BedspaceClient(callConfig)) as RestClientBuilder<BedspaceClient>,
  assessmentClientBuilder: ((callConfig: CallConfig) =>
    new AssessmentClient(callConfig)) as RestClientBuilder<AssessmentClient>,
  timelineClientBuilder: ((callConfig: CallConfig) =>
    new TimelineClient(callConfig)) as RestClientBuilder<TimelineClient>,
})

export type DataAccess = ReturnType<typeof dataAccess>

export {
  ApplicationClient,
  AssessmentClient,
  BedspaceClient,
  BookingClient,
  HmppsAuthClient,
  LostBedClient,
  PersonClient,
  PremisesClient,
  PremisesClientV2,
  ReferenceDataClient,
  ReportClient,
  RestClientBuilder,
  UserClient,
  TimelineClient,
}
