import {
  Adjudication,
  Application,
  TemporaryAccommodationApplicationSummary as ApplicationSummary,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  TemporaryAccommodationAssessment as Assessment,
  Booking,
  Document,
  LocalAuthorityArea,
  OASysSection,
  OASysSections,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
  ProbationRegion,
  TemporaryAccommodationApplication,
  TemporaryAccommodationUser,
  User,
} from '@approved-premises/api'
import type { TemporaryAccommodationUser as User } from '@approved-premises/api'

/*
 * These types extend the API types where data is augmented by locally held data.
 * The reason for this is (at time of writing) UI logic.
 */
export type RegionConfig = {
  flags: {
    properties: {
      useLAnotPDU?: boolean
    }
  }
}

export type RegionConfigData = {
  id: string
  config: RegionConfig
}

export type RegionsConfigData = Array<RegionConfigData>

export type ProbationRegionLocal = ProbationRegion & {
  config?: RegionConfig
}

export type CallConfigLocal = CallConfig & {
  probationRegion: ProbationRegionLocal
}

export type TemporaryAccommodationUserLocal = TemporaryAccommodationUser & {
  region: ProbationRegionLocal
}

// End of Augmented API types

interface TasklistPage {
  body: Record<string, unknown>
  htmlDocumentTitle: string
}
interface PersonService {}

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

export type TaskNames =
  | 'basic-information'
  | 'type-of-ap'
  | 'risk-management-features'
  | 'prison-information'
  | 'location-factors'
  | 'access-and-healthcare'
  | 'further-considerations'
  | 'move-on'
  | 'check-your-answers'

export type YesOrNoWithDetail<T extends string> = {
  [K in T]: YesOrNo
} & {
  [K in `${T}Detail`]: string
}

export type YesNoOrIDKWithDetail<T extends string> = {
  [K in T]: YesNoOrIDK
} & {
  [K in `${T}Detail`]: string
}

export type Task = {
  id: string
  title: string
  actionText: string
  pages: Record<string, unknown>
}

export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'cannot_start'

export type TaskWithStatus = Task & { status: TaskStatus }

export type FormSection = {
  title: string
  name: string
  tasks: Array<Task>
}

export type FormSections = Array<FormSection>

export type FormPages = { [key in TaskNames]: Record<string, unknown> }

export type PageResponse = Record<string, string | Array<Record<string, unknown>>>

export interface HtmlAttributes {
  [key: string]: string
}

export interface TextItem {
  text: string
}

export interface HtmlItem {
  html: string
}

export type TableCell = {
  text?: string
  attributes?: HtmlAttributes
  classes?: string
  href?: string
  html?: string
}

export interface TableRow {
  [index: number]: TableCell
}

export type RadioItem =
  | {
      text: string
      value: string
      checked?: boolean
    }
  | {
      divider: string
    }

export type CheckBoxItem =
  | {
      text: string
      value: string
      checked?: boolean
    }
  | CheckBoxDivider

export type CheckBoxDivider = { divider: string }

export interface SelectOption {
  text: string
  value: string
  selected?: boolean
}

export interface SummaryList {
  classes?: string
  attributes?: HtmlAttributes
  rows: Array<SummaryListItem>
}

export interface SummaryListActionItem {
  href: string
  text: string
  visuallyHiddenText: string
}

export interface SummaryListItem {
  key: TextItem | HtmlItem
  value: TextItem | HtmlItem
  actions?: { items: Array<SummaryListActionItem> }
}

export interface IdentityBarMenu {
  items: Array<IdentityBarMenuItem>
}

export interface IdentityBarMenuItem {
  classes: string
  href: string
  text: string
}

export interface PageHeadingBarItem {
  classes: string
  href: string
  text: string
}

export interface TimelineItem {
  label: {
    text: string
  }
  html?: string
  datetime: {
    timestamp: string
    type: 'datetime'
  }
  byline?: {
    text: string
  }
}

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

export type TierNumber = '1' | '2' | '3' | '4'
export type TierLetter = 'A' | 'B' | 'C' | 'D'
export type RiskTierLevel = `${TierLetter}${TierNumber}`

export interface ErrorMessage {
  text: string
  attributes: {
    [K: string]: boolean
  }
}

export type PaginatedResponse<T> = {
  url: {
    params: URLSearchParams
  }
  data: Array<T>
  pageNumber: number
  totalPages: number
  totalResults: number
  pageSize: number
}

export interface ErrorMessages {
  [K: string]: ErrorMessage
}

export interface ErrorSummary {
  text?: string
  html?: string
  href?: string
}

export interface ErrorsAndUserInput {
  errors: ErrorMessages
  errorSummary: Array<ErrorSummary>
  errorTitle?: string
  userInput: Record<string, unknown>
}

export interface BespokeError {
  errorTitle: string
  errorSummary: Array<ErrorSummary>
}

export type TaskListErrors<K extends TasklistPage> = Partial<Record<keyof K['body'], unknown>>

export type YesOrNo = 'yes' | 'no'
export type YesNoOrIDK = YesOrNo | 'iDontKnow'

export type PersonStatus = 'InCustody' | 'InCommunity'

export type ServerScope = 'approved-premises' | 'temporary-accommodation' | '*'

export interface ReferenceData {
  id: string
  name: string
  isActive: boolean
  serviceScope: ServerScope
  config?: RegionConfig
}

export type PersonRisksUI = PersonRisks

export type GroupedListofBookings = {
  [K in 'arrivingToday' | 'departingToday' | 'upcomingArrivals' | 'upcomingDepartures']: Array<Booking>
}

export type DataServices = Partial<{
  personService: {
    getPrisonCaseNotes: (callConfig: CallConfig, crn: string) => Promise<Array<PrisonCaseNote>>
    getAdjudications: (callConfig: CallConfig, crn: string) => Promise<Array<Adjudication>>
    getAcctAlerts: (callConfig: CallConfig, crn: string) => Promise<Array<PersonAcctAlert>>
    getOasysSelections: (callConfig: CallConfig, crn: string) => Promise<Array<OASysSection>>
    getOasysSections: (callConfig: CallConfig, crn: string, selectedSections?: Array<number>) => Promise<OASysSections>
    getPersonRisks: (callConfig: CallConfig, crn: string) => Promise<PersonRisksUI>
  }
  applicationService: {
    getDocuments: (callConfig: CallConfig, application: TemporaryAccommodationApplication) => Promise<Array<Document>>
  }
  userService: {
    getUserById: (callConfig: CallConfig, id: string) => Promise<User>
  }
  referenceDataService: {
    getLocalAuthorities: (CallConfig: CallConfig) => Promise<Array<LocalAuthorityArea>>
  }
}>

export interface GroupedAssessments {
  completed: Array<Assessment>
  awaiting: Array<Assessment>
}

export interface GroupedApplications {
  inProgress: Array<ApplicationSummary>
  submitted: Array<ApplicationSummary>
}

export interface ApplicationWithRisks extends Application {
  person: PersonWithRisks
}

export interface PersonWithRisks extends Person {
  risks: PersonRisks
}

export type OasysImportArrays =
  | ArrayOfOASysOffenceDetailsQuestions
  | ArrayOfOASysRiskOfSeriousHarmSummaryQuestions
  | ArrayOfOASysSupportingInformationQuestions
  | ArrayOfOASysRiskToSelfQuestions
  | ArrayOfOASysRiskManagementPlanQuestions

export type JourneyType = 'applications' | 'assessments'

export interface SideNavObj {
  text: string
  href: string
  active: boolean
}

export type BookingSearchApiStatus = 'provisional' | 'confirmed' | 'arrived' | 'departed' | 'closed'

export type ReportType = 'bookings' | 'bedspace-usage' | 'occupancy'

export interface OasysPage extends TasklistPage {
  risks: PersonRisksUI
  oasysSuccess: boolean
}

export type PlaceContext =
  | {
      assessment: Assessment
      arrivalDate?: string
    }
  | undefined

export type MessageContents =
  | {
      title: string
      text: string
    }
  | {
      title: string
      html: string
    }
  | string

export type ApplicationSummaryData = {
  isAbleToShare: boolean | null
  releaseType:
    | 'Rerelease'
    | 'Custody'
    | 'Approved Premises'
    | 'CAS2 (formerly Bail Accommodation Support Services)'
    | null
}
