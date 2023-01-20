/* eslint-disable import/first */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
/* istanbul ignore file */

import { Request } from 'express'
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
import UserClient from './userClient'

type RestClientBuilder<T> = (req: Request) => T

export const dataAccess = () => ({
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient({ legacyMode: false }))),
  premisesClientBuilder: ((req: Request) => new PremisesClient(req)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((req: Request) => new BookingClient(req)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((req: Request) =>
    new ReferenceDataClient(req)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((req: Request) => new LostBedClient(req)) as RestClientBuilder<LostBedClient>,
  personClient: ((req: Request) => new PersonClient(req)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((req: Request) => new ApplicationClient(req)) as RestClientBuilder<ApplicationClient>,
  roomClientBuilder: ((req: Request) => new RoomClient(req)) as RestClientBuilder<RoomClient>,
  reportClientBuilder: ((req: Request) => new ReportClient(req)) as RestClientBuilder<ReportClient>,
  userClientBuilder: ((req: Request) => new UserClient(req)) as RestClientBuilder<UserClient>,
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
