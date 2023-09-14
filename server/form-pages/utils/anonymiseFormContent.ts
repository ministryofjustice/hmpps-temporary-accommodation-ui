import { isFullPerson, personNameFallback } from '../../utils/personUtils'
import { Person } from '../../@types/shared'

export default function anonymiseFormContent(content: string, person: Person): string {
  if (isFullPerson(person)) {
    return content.replace(new RegExp(person.name, 'g'), personNameFallback)
  }

  return content
}
