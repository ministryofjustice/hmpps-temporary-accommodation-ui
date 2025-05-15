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

  export type Property = {
    name: string
    addressLine1: string
    addressLine2: string
    town: string
    postcode: string
    localAuthority: string
    probationRegion: string
    pdu: string
    propertyAttributesValues: Array<string>
    status: string
    notes: string
    turnaroundWorkingDayCount: number
  }

  export type TestOptions = {
    assessor: UserFullDetails
    referrer: UserLoginDetails
  }
}
