declare module '@temporary-accommodation-ui/e2e' {
  type UserLoginDetails = {
    username: string
    password: string
  }

  type UserFullDetails = UserLoginDetails & {
    name: string
    email: string
  }

  export type TestOptions = {
    user: UserFullDetails
  }
}
