declare module 'approved-premises' {
  export type Premises = schemas['Premises']
  export type Arrival = schemas['Arrival']
  export type NonArrival = schemas['NonArrival']
  export type Departure = schemas['Departure']
  export type Booking = schemas['Booking']

  export type BookingDto = Omit<Booking, 'id' | 'status' | 'arrival'>

  export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
    [P in K]?: string
  }

  export type ArrivalDto = ObjectWithDateParts<'date'> &
    ObjectWithDateParts<'expectedDepartureDate'> & { arrival: Omit<Arrival, 'id' | 'bookingId'> }

  export type NonArrivalDto = ObjectWithDateParts<'nonArrivalDate'> & {
    nonArrival: Omit<NonArrival, 'id' | 'bookingId'>
  }

  export type DepartureDto = ObjectWithDateParts<'dateTime'> & { departure: Omit<Departure, 'id' | 'bookingId'> }

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
      reason: string
      notes: string
      moveOnCategory: string
      destinationProvider: string
      destinationAp: string
    }
  }
}
