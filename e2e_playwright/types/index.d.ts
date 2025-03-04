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

  export type TestOptions = {
    assessor: UserFullDetails
    referrer: UserLoginDetails
  }
}
