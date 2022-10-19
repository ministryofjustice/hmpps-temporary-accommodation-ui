import type { Person } from '@approved-premises/api'
import Page from '../page'

export default class ReleaseDatePage extends Page {
  constructor(person: Person) {
    super(`Do you know ${person.name}’s release date?`)
  }
}
