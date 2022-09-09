import type { TasklistPage } from 'approved-premises'

// TODO: The options that appear will depend on the response to the previous question.
// For now we'll return all options
export enum ReleaseTypes {
  rotl = 'Release on Temporary Licence (ROTL)',
  hdc = 'Home detention curfew (HDC)',
  licence = 'Licence',
  pss = 'Post Sentence Supervision (PSS)',
  reRelase = 'Re-release following recall',
}

export default class ReleaseType implements TasklistPage {
  name = 'release-type'

  title = 'What type of release will the application support'

  body: { releaseType: keyof ReleaseTypes }

  constructor(body: Record<string, unknown>) {
    this.body = {
      releaseType: body.releaseType as keyof ReleaseTypes,
    }
  }

  next() {
    return 'release-date'
  }

  previous() {
    return 'sentence-type'
  }

  errors() {
    const errors = []

    if (!this.body.releaseType) {
      errors.push({
        propertyName: 'releaseType',
        errorType: 'blank',
      })
    }

    return errors
  }

  items() {
    return Object.keys(ReleaseTypes).map(key => {
      return {
        value: key,
        text: ReleaseTypes[key],
        checked: this.body.releaseType === key,
      }
    })
  }
}
