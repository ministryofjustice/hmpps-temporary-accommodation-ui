import {
  Adjudication,
  Application,
  ArrayOfOASysOffenceDetailsQuestions,
  ArrayOfOASysRiskManagementPlanQuestions,
  ArrayOfOASysRiskOfSeriousHarmSummaryQuestions,
  ArrayOfOASysRiskToSelfQuestions,
  ArrayOfOASysSupportingInformationQuestions,
  ApprovedPremisesAssessment as Assessment,
  Booking,
  Document,
  OASysSection,
  OASysSections,
  Person,
  PersonAcctAlert,
  PersonRisks,
  PrisonCaseNote,
  TemporaryAccommodationApplication,
  User,
} from '@approved-premises/api'
import { CallConfig } from '../../data/restClient'

interface TasklistPage {
  body: Record<string, unknown>
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

export type TableCell = { text: string; attributes?: HtmlAttributes; classes?: string } | { html: string }
export interface TableRow {
  [index: number]: TableCell
}

export interface RadioItem {
  text: string
  value: string
  checked?: boolean
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
}>

export interface GroupedAssessments {
  completed: Array<Assessment>
  awaiting: Array<Assessment>
}

export interface GroupedApplications {
  inProgress: Array<Application>
  submitted: Array<Application>
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
