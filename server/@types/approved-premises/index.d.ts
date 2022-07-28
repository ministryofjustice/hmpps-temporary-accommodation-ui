declare module 'approved-premises' {
  export type Premises = schemas['Premises']
  export type Arrival = schemas['Arrival']
  export type Booking = schemas['Booking']

  export type BookingDto = Omit<Booking, 'id'>

  export type ObjectWithDateParts<K extends string | number> = { [P in `${K}-${'year' | 'month' | 'day'}`]: string } & {
    [P in K]?: string
  }

  export type ArrivalDto = Omit<Arrival, 'id' | 'bookingId'> &
    ObjectWithDateParts<'dateTime'> &
    ObjectWithDateParts<'expectedDeparture'>

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
    }
    Arrival: {
      id: string
      bookingId: string
      dateTime: string
      expectedDeparture: string
      notes: string
      name: string
      CRN: string
    }
  }
}
