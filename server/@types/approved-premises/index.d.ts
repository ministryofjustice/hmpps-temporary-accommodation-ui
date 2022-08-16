declare module 'approved-premises' {
  export type Premises = schemas['Premises']
  export type Arrival = schemas['Arrival']
  export type NonArrival = schemas['NonArrival']
  export type Departure = schemas['Departure']
  export type Booking = schemas['Booking']
  export type ReferenceData = schemas['ReferenceData']
  export type Cancellation = schemas['Cancellation']

  export type BookingDto = Omit<Booking, 'id' | 'status' | 'arrival'>

  // A utility type that allows us to define an object with a date attribute split into
  // date, month, year (and optionally, time) attributes. Designed for use with the GOV.UK
  // date input
  export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
    [P in `${K}-time`]?: string
  } & {
    [P in K]?: string
  }

  export type ArrivalDto = ObjectWithDateParts<'date'> &
    ObjectWithDateParts<'expectedDepartureDate'> & { arrival: Omit<Arrival, 'id' | 'bookingId'> }

  export type NonArrivalDto = ObjectWithDateParts<'nonArrivalDate'> & {
    nonArrival: Omit<NonArrival, 'id' | 'bookingId'>
  }

  export type DepartureDto = Omit<
    Departure,
    'id' | 'bookingId' | 'reason' | 'moveOnCategory' | 'destinationProvider' | 'destinationAp'
  > &
    ObjectWithDateParts<'dateTime'> & {
      reason: string
      moveOnCategory: string
      destinationProvider: string
      destinationAp: string
    }

  export type CancellationDto = Omit<Cancellation, 'id' | 'bookingId' | 'reason'> &
    ObjectWithDateParts<'date'> & {
      reason: string
    }

  export type BookingStatus = 'arrived' | 'awaiting-arrival' | 'not-arrived' | 'departed' | 'cancelled'

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

  export interface ErrorMessages {
    [K: string]: {
      text: string
      attributes: {
        [K: string]: boolean
      }
    }
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

  export interface schemas {
    Premises: {
      id: string
      name: string
      apCode: string
      postcode: string
      bedCount: number
      apAreaId: string
    }
    Booking: {
      id: string
      name: string
      CRN: string
      arrivalDate: string
      expectedDepartureDate: string
      keyWorker: string
      status: BookingStatus
      arrival?: Arrival
      departure?: Departure
    }
    Arrival: {
      id: string
      bookingId: string
      date: string
      expectedDepartureDate: string
      notes: string
      name: string
      CRN: string
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
  }
}
