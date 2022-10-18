declare module 'approved-premises' {
  export type Premises = schemas['Premises']
  export type Arrival = schemas['Arrival']
  export type NonArrival = schemas['NonArrival']
  export type Departure = schemas['Departure']
  export type Booking = schemas['Booking']
  export type LostBed = schemas['LostBed']
  export type ReferenceData = schemas['ReferenceData']
  export type Cancellation = schemas['Cancellation']
  export type BookingExtension = schemas['BookingExtension']
  export type KeyWorker = schemas['KeyWorker']
  export type Person = schemas['Person']
  export type PremisesCapacityItem = schemas['PremisesCapacityItem']
  export type PremisesCapacity = Array<PremisesCapacityItem>
  export type ApplicationSummary = schemas['ApplicationSummary']
  export type Application = schemas['Application']
  export type StaffMember = schemas['StaffMember']
  export type PersonRisks = schemas['PersonRisks']
  export type PersonRisksUI = schemas['PersonRisksUI']

  // A utility type that allows us to define an object with a date attribute split into
  // date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
  // date input
  export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
    [P in `${K}-time`]?: string
  } & {
    [P in K]?: string
  }

  export type NewBooking = ObjectWithDateParts<'arrivalDate'> & ObjectWithDateParts<'departureDate'> & { crn: string }

  export type NewArrival = Omit<Arrival, 'id' | 'bookingId'> & { keyWorkerStaffId: string }

  export type NewNonArrival = ObjectWithDateParts<'nonArrivalDate'> & {
    nonArrival: Omit<NonArrival, 'id' | 'bookingId'>
  }

  export type NewDeparture = Omit<
    Departure,
    'id' | 'bookingId' | 'reason' | 'moveOnCategory' | 'destinationProvider' | 'destinationAp'
  > &
    ObjectWithDateParts<'dateTime'> & {
      reason: string
      moveOnCategory: string
      destinationProvider: string
      destinationAp: string
    }

  export type NewCancellation = Omit<Cancellation, 'id' | 'bookingId' | 'reason'> &
    ObjectWithDateParts<'date'> & {
      reason: string
    }

  export type NewLostBed = Omit<LostBed, 'id' | 'reason'> &
    ObjectWithDateParts<'startDate'> &
    ObjectWithDateParts<'endDate'> & {
      reason: string
    }

  export type NewBookingExtension = Omit<BookingExtension, 'previousDepartureDate' | 'id' | 'bookingId'>

  export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

  export type TaskNames = 'basic-information' | 'type-of-ap'

  export interface HtmlAttributes {
    [key: string]: string
  }

  export interface TextItem {
    text: string
  }

  export interface HtmlItem {
    html: string
  }

  export type TableCell = { text: string; attributes?: HtmlAttributes } | { html: string }
  export interface TableRow {
    [index: number]: TableCell
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

  export interface SummaryList {
    classes?: string
    attributes?: HtmlAttributes
    rows: Array<SummaryListItem>
  }

  export interface RadioItems {
    text: string
    value: string
    checked?: boolean
  }

  export interface SelectOptions {
    text: string
    value: string
    selected?: boolean
  }

  export interface IdentityBarMenuItem {
    classes: string
    href: string
    text: string
  }

  export interface IdentityBarMenu {
    items: Array<IdentityBarMenuItem>
  }

  export type GroupedListofBookings = {
    [K in 'arrivingToday' | 'departingToday' | 'upcomingArrivals' | 'upcomingDepartures']: Array<TableRow>
  }

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
    text: string
    href: string
  }

  export interface ErrorsAndUserInput {
    errors: ErrorMessages
    errorSummary: Array<string>
    userInput: Record<string, unknown>
  }

  export type TaskListErrors = Array<{ propertyName: string; errorType: string }>

  export type YesOrNo = 'yes' | 'no'

  export type PersonStatus = 'InCustody' | 'InCommunity'

  export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Very High'

  export type RiskEnvelopeStatus = 'retrieved' | 'not_found' | 'error'

  export type TierNumber = '1' | '2' | '3' | '4'
  export type TierLetter = 'A' | 'B' | 'C' | 'D'
  export type RiskTierLevel = `${TierLetter}${TierNumber}`
  export interface schemas {
    Premises: {
      id: string
      name: string
      apCode: string
      postcode: string
      bedCount: number
      apAreaId: string
      availableBedsForToday: number
    }
    Booking: {
      id: string
      person: Person
      arrivalDate: string
      departureDate: string
      status: BookingStatus
      arrival?: Arrival
      departure?: Departure
      nonArrival?: NonArrival
      cancellation?: Cancellation
    }
    KeyWorker: {
      id: string
      name: string
    }
    Arrival: {
      id: string
      bookingId: string
      arrivalDate: string
      expectedDepartureDate: string
      notes: string
    }
    NonArrival: {
      id: string
      date: string
      reason: string
      notes: string
    }
    Departure: {
      id: string
      bookingId: string
      dateTime: string
      reason: ReferenceData
      notes: string
      moveOnCategory: ReferenceData
      destinationProvider: ReferenceData
      destinationAp: Premises
    }
    ReferenceData: {
      id: string
      name: string
      isActive: boolean
    }
    Cancellation: {
      id: string
      bookingId: string
      date: string
      reason: ReferenceData
      notes: string
    }
    LostBed: {
      id: string
      startDate: string
      endDate: string
      numberOfBeds: number
      referenceNumber: string
      notes: string
      reason: ReferenceData
    }
    BookingExtension: {
      id: string
      bookingId: string
      previousDepartureDate: string
      newDepartureDate: string
      notes?: string
    }
    Person: {
      crn: string
      name: string
      dateOfBirth: string
      sex: string
      status: PersonStatus
      nomsNumber: string
      nationality: string
      religionOrBelief: string
      genderIdentity?: string
      prisonName: string
    }
    PremisesCapacityItem: {
      date: string
      availableBeds: number
    }
    RiskTier: {
      level: RiskTierLevel
      lastUpdated: string
    }
    ApplicationSummary: {
      id: string
      person: Person
      tier: schemas['RiskTier']
      currentLocation: string
      arrivalDate: string
      daysSinceApplicationRecieved: number
      status: 'In progress' | 'Submitted' | 'Information Requested' | 'Rejected'
    }
    Application: {
      id: string
      person: Person
      createdByProbationOfficerId: string
      schemaVersion: string
      createdAt: string
      submittedAt?: string
      data: Record<string, unknown>
    }
    StaffMember: {
      id: string
      name: string
    }
    PersonRisks: {
      crn: string
      roshRisks: schemas['RoshRisksEnvelope']
      tier: schemas['RiskTierEnvelope']
      flags: schemas['FlagsEnvelope']
      mappa: schemas['MappaEnvelope']
    }
    PersonRisksUI: {
      roshRisks: schemas['RoshRisks']
      tier: schemas['RiskTier']
      flags: schemas['FlagsEnvelope']['value']
      mappa: schemas['Mappa']
    }
    RoshRisksEnvelope: {
      status: RiskEnvelopeStatus
      value: schemas['RoshRisks']
    }
    RoshRisks: {
      overallRisk: RiskLevel
      riskToChildren: RiskLevel
      riskToPublic: RiskLevel
      riskToKnownAdult: RiskLevel
      riskToStaff: RiskLevel
      lastUpdated?: string
    }
    MappaEnvelope: {
      status: RiskEnvelopeStatus
      value: schemas['Mappa']
    }
    Mappa: {
      level: string
      lastUpdated: string
    }
    RiskTierEnvelope: {
      status: RiskEnvelopeStatus
      value: schemas['RiskTier']
    }
    FlagsEnvelope: {
      status: RiskEnvelopeStatus
      value: Array<string>
    }
  }
}
