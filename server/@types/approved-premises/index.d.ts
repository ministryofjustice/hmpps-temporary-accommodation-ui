declare module 'approved-premises' {
  export type Premises = schemas['Premises']

  export type TableCell = { text: string; attributes?: { [key: string]: string } } | { html: string }
  export interface TableRow {
    [index: number]: TableCell
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
  }
}
