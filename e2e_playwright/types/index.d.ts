declare module '@temporary-accommodation-ui/e2e' {
  type UserLoginDetails = {
    username: string
    password: string
  }

  type UserFullDetails = UserLoginDetails & {
    probationRegion: ProbationRegion
  }

  type ProbationRegion = {
    id: string
    name: string
  }

  export type Premises = {
    name: string
    addressLine1: string
    addressLine2: string
    town: string
    postcode: string
    localAuthorityArea: string
    probationRegionName: string
    pdu: string
  }

  export type TestOptions = {
    assessor: UserFullDetails
    referrer: UserLoginDetails
    premises: Premises
  }
}
