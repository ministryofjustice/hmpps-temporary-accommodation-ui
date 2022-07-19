declare module 'approved-premises' {
  export type Premises = schemas['Premises']

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
