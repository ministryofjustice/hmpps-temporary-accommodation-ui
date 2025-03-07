import {
  Adjudication,
  TemporaryAccommodationApplicationSummary as ApplicationSummary,
  TemporaryAccommodationAssessment as Assessment,
  AssessmentSortField,
  AssessmentStatus,
  BookingSearchSortField,
  Document,
  LocalAuthorityArea,
  OASysQuestion,
  OASysSection,
  OASysSections,
  OASysSupportingInformationQuestion,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
  ProbationDeliveryUnit,
  SortDirection,
  TemporaryAccommodationApplication,
  TemporaryAccommodationAssessmentStatus,
  User,
} from '@approved-premises/api'
import { CallConfig } from '../../data/restClient'
import { TasklistPageInterface } from '../../form-pages/tasklistPage'

interface TasklistPage {
  body: Record<string, unknown>
  htmlDocumentTitle: string
}

// A utility type that allows us to define an object with a date attribute split into
// date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
// date input
export type ObjectWithDateParts<K extends string> = {
  [P in `${K}-${'year' | 'month' | 'day'}` as string]: string
} & {
  [P in `${K}-time`]?: string
} & {
  [P in K]?: string
}

export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

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

export type TaskPages = Record<string, TasklistPageInterface>

export type Task = {
  id: string
  title: string
  actionText: string
  pages: TaskPages
}

export type TaskStatus = 'not_started' | 'in_progress' | 'complete' | 'cannot_start'

export type TaskWithStatus = Task & { status: TaskStatus }

export type FormSection = {
  title: string
  name: string
  tasks: Array<Task>
}

export type FormSections = Array<FormSection>

export type FormPages = Record<string, TaskPages>

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
      conditional?: {
        html: string
      }
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

export interface ReferenceData {
  id: string
  name: string
  isActive: boolean
  serviceScope: 'approved-premises' | 'temporary-accommodation' | '*'
}

export type PersonRisksUI = PersonRisks

export type GetPdusOptions = { regional?: boolean }
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
    getPdus: (CallConfig: CallConfig, options: GetPdusOptions = {}) => Promise<Array<ProbationDeliveryUnit>>
  }
}>

export interface GroupedApplications {
  inProgress: Array<ApplicationSummary>
  submitted: Array<ApplicationSummary>
}

export type OasysImportArrays = Array<OASysQuestion> | Array<OASysSupportingInformationQuestion>

export type JourneyType = 'applications' | 'assessments'

export interface SubNavObj {
  text: string
  href: string
  active: boolean
}

export type BookingSearchApiStatus = 'provisional' | 'confirmed' | 'arrived' | 'departed' | 'closed'

export type BookingSearchParameters = {
  crnOrName?: string
  page?: number
  sortBy?: BookingSearchSortField
  sortDirection?: SortDirection
}

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

export type AssessmentSearchApiStatus =
  | Extract<AssessmentStatus, 'unallocated' | 'in_review' | 'ready_to_place'>
  | 'archived'

export type AssessmentUpdateStatus = Exclude<TemporaryAccommodationAssessmentStatus, 'rejected'>

export type AssessmentSearchParameters = {
  page?: number
  sortBy?: AssessmentSortField
  sortDirection?: SortDirection
  crnOrName?: string
}

export type AssessmentUpdatableDateField = 'releaseDate' | 'accommodationRequiredFromDate'

export type BedspaceStatus = 'online' | 'archived'

export type PrimaryNavigationItem = {
  href: string
  text: string
  active?: boolean
}

export type BedspaceOccupancyAttributes = 'isSharedProperty' | 'isSingleOccupancy'

export type BedspaceAccessiblityAttributes = 'isWheelchairAccessible'

export type BedspaceSearchFormParameters = {
  startDate: string
  durationDays: number
  probationDeliveryUnits: Array<string>
  occupancyAttribute: 'all' | BedspaceOccupancyAttributes
  attributes?: Array<BedspaceAccessiblityAttributes>
}

export type UIPersonAcctAlert = PersonAcctAlert & {
  alertId: string | number
}
