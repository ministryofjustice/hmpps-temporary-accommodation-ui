import BookingClient from './bookingClient'
import HmppsAuthClient from './hmppsAuthClient'
import PersonClient from './personClient'
import PremisesClient from './premisesClient'
import ReferenceDataClient from './referenceDataClient'
import ApplicationClient from './applicationClient'
import AssessmentClient from './assessmentClient'
import BedspaceClient from './bedspaceClient'
import LostBedClient from './lostBedClient'
import { createRedisClient } from './redisClient'
import ReportClient from './reportClient'
import { CallConfig } from './restClient'
import TokenStore from './tokenStore'
import UserClient from './userClient'
import TimelineClient from './timelineClient'
import applicationInfoSupplier from '../applicationInfo'

const applicationInfo = applicationInfoSupplier()

type RestClientBuilder<T> = (callConfig: CallConfig) => T

export const dataAccess = () => ({
  applicationInfo,
  hmppsAuthClient: new HmppsAuthClient(new TokenStore(createRedisClient())),
  premisesClientBuilder: ((callConfig: CallConfig) =>
    new PremisesClient(callConfig)) as RestClientBuilder<PremisesClient>,
  bookingClientBuilder: ((callConfig: CallConfig) => new BookingClient(callConfig)) as RestClientBuilder<BookingClient>,
  referenceDataClientBuilder: ((callConfig: CallConfig) =>
    new ReferenceDataClient(callConfig)) as RestClientBuilder<ReferenceDataClient>,
  lostBedClientBuilder: ((callConfig: CallConfig) => new LostBedClient(callConfig)) as RestClientBuilder<LostBedClient>,
  personClientBuilder: ((callConfig: CallConfig) => new PersonClient(callConfig)) as RestClientBuilder<PersonClient>,
  applicationClientBuilder: ((callConfig: CallConfig) =>
    new ApplicationClient(callConfig)) as RestClientBuilder<ApplicationClient>,
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
  applicationInfo,
  ApplicationClient,
  AssessmentClient,
  BedspaceClient,
  BookingClient,
  HmppsAuthClient,
  LostBedClient,
  PersonClient,
  PremisesClient,
  ReferenceDataClient,
  ReportClient,
  RestClientBuilder,
  UserClient,
  TimelineClient,
}
