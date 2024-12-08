import {
  ReferralHistoryDomainEventNote as DomainEventNote,
  ReferralHistoryNote,
  ReferralHistorySystemNote as SystemNote,
  ReferralHistoryUserNote as UserNote,
} from '@approved-premises/api'
import { TimelineItem } from '@approved-premises/ui'
import { assertUnreachable, convertToTitleCase } from '../utils'

import { formatLines } from '../viewUtils'
import { DateFormats } from '../dateUtils'

export const timelineData = (events: Array<ReferralHistoryNote>): Array<TimelineItem> => {
  const notes = [...events].sort((noteA, noteB) => {
    if (noteA.createdAt === noteB.createdAt) {
      return 0
    }

    return noteA.createdAt < noteB.createdAt ? 1 : -1
  })

  return notes.map(note => {
    return {
      label: {
        text: timeLineLabelText(note),
      },
      html: renderNote(note),
      datetime: {
        timestamp: note.createdAt,
        type: 'datetime',
      },
      byline: { text: convertToTitleCase(note.createdByUserName) },
    }
  })
}

const timeLineLabelText = (note: UserNote | SystemNote | DomainEventNote): string => {
  switch (note.type) {
    case 'domainEvent':
      return domainEventLabelText(note.messageDetails as DomainEventNote['messageDetails'])
    case 'user':
      return 'Note'
    case 'system':
      return systemNoteLabelText(note as SystemNote)
    default:
      throw new Error(`Unknown type of timeline item - ${note.type}`)
  }
}

const domainEventLabelText = (note: DomainEventNote['messageDetails']): TimelineItem['label']['text'] => {
  switch (note.domainEvent.updatedFields[0].fieldName) {
    case 'accommodationRequiredFromDate':
      return 'Accommodation required from date updated'
    case 'releaseDate':
      return 'Release date updated'
    default:
      return assertUnreachable(note.domainEvent.updatedFields[0].fieldName as never)
  }
}

const systemNoteLabelText = (note: SystemNote): TimelineItem['label']['text'] => {
  switch (note.category) {
    case 'submitted':
      return 'Referral submitted'
    case 'unallocated':
      return 'Referral marked as unallocated'
    case 'in_review':
      return 'Referral marked as in review'
    case 'ready_to_place':
      return 'Referral marked as ready to place'
    case 'rejected':
      return 'Referral marked as rejected'
    case 'completed':
      return 'Referral marked as closed'
    default:
      return assertUnreachable(note.category)
  }
}

export const renderNote = (note: UserNote | SystemNote | DomainEventNote): TimelineItem['html'] => {
  if (isSystemNoteWithDetails(note)) {
    return renderSystemNote(note)
  }

  if (isUserNote(note)) {
    return formatLines(note.message)
  }

  if (isDomainEventNote(note)) {
    return renderDomainEventNote((note as DomainEventNote).messageDetails)
  }

  return undefined
}

export const renderDomainEventNote = (note: DomainEventNote['messageDetails']): TimelineItem['html'] | never => {
  const updatedField = note.domainEvent.updatedFields[0]
  switch (updatedField.fieldName) {
    case 'accommodationRequiredFromDate':
      return `<p>Accommodation required from date was changed from ${DateFormats.isoDateToUIDate(updatedField.updatedFrom)} to ${DateFormats.isoDateToUIDate(updatedField.updatedTo)}</p>`
    case 'releaseDate':
      return `<p>Release date was changed from ${DateFormats.isoDateToUIDate(updatedField.updatedFrom)} to ${DateFormats.isoDateToUIDate(updatedField.updatedTo)}</p>`
    default:
      return assertUnreachable(updatedField.fieldName as never)
  }
}

export const renderSystemNote = (note: SystemNote): TimelineItem['html'] => {
  const reason = note.messageDetails.rejectionReasonDetails || note.messageDetails.rejectionReason
  const isWithdrawn = note.messageDetails.isWithdrawn ? 'Yes' : 'No'

  const lines = [`Rejection reason: ${reason}`, `Withdrawal requested by the probation practitioner: ${isWithdrawn}`]

  return formatLines(lines.join('\n\n'))
}

const isDomainEventNote = (note: UserNote | SystemNote | DomainEventNote) => {
  return Boolean(note.type === 'domainEvent')
}

const isUserNote = (note: UserNote | SystemNote): note is UserNote => {
  return Boolean(note.type === 'user')
}

const isSystemNote = (note: UserNote | SystemNote): note is SystemNote => {
  return Boolean(note.type === 'system')
}

const isSystemNoteWithDetails = (note: UserNote | SystemNote): note is SystemNote => {
  return Boolean(isSystemNote(note) && note.messageDetails)
}
