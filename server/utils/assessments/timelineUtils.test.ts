import { fakerEN_GB as faker } from '@faker-js/faker'
import {
  ReferralHistoryDomainEventNote as DomainEventNote,
  ReferralHistoryNoteMessageDetails,
} from '@approved-premises/api'
import {
  referralHistoryDomainEventNoteFactory,
  referralHistorySystemNoteFactory,
  referralHistoryUserNoteFactory,
} from '../../testutils/factories'
import { DateFormats } from '../dateUtils'
import * as viewUtils from '../viewUtils'
import * as timelineUtils from './timelineUtils'

afterEach(() => {
  jest.restoreAllMocks()
})

describe('timelineUtils', () => {
  describe('timelineData', () => {
    it('returns a notes in a format compatible with the MoJ timeline component', () => {
      const userNote1 = referralHistoryUserNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-04-01',
      })
      const userNote2 = referralHistoryUserNoteFactory.build({
        createdByUserName: 'ANOTHER USER',
        createdAt: '2024-05-01',
      })
      const systemNote1 = referralHistorySystemNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-04-02',
        category: 'in_review',
      })
      const systemNote2 = referralHistorySystemNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-05-02',
        category: 'ready_to_place',
      })

      const domainEventNote1 = referralHistoryDomainEventNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-06-02',
        messageDetails: {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
            updatedFields: [
              {
                fieldName: 'accommodationRequiredFromDate',
                updatedTo: '2025-09-02',
                updatedFrom: '2123-09-02',
              },
            ],
          },
        },
      })

      const domainEventNote2 = referralHistoryDomainEventNoteFactory.build({
        createdByUserName: 'SOME USER',
        createdAt: '2024-06-01',
        messageDetails: {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            timestamp: DateFormats.dateObjToIsoDate(faker.date.past()),
            updatedFields: [
              {
                fieldName: 'releaseDate',
                updatedTo: '2025-09-02',
                updatedFrom: '2123-09-02',
              },
            ],
          },
        },
      })

      const notes = [systemNote1, systemNote2, userNote2, userNote1, domainEventNote1, domainEventNote2]
      const userNoteHtml = 'some formatted html'

      jest.spyOn(viewUtils, 'formatLines').mockReturnValue(userNoteHtml)
      const result = timelineUtils.timelineData(notes)

      expect(result).toEqual([
        {
          label: {
            text: 'Accommodation required from date updated',
          },
          html: '<p>Accommodation required from date was changed from 2 September 2123 to 2 September 2025</p>',
          datetime: {
            timestamp: domainEventNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Release date updated',
          },
          html: '<p>Release date was changed from 2 September 2123 to 2 September 2025</p>',
          datetime: {
            timestamp: domainEventNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Referral marked as ready to place',
          },
          datetime: {
            timestamp: systemNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Note',
          },
          html: userNoteHtml,
          datetime: {
            timestamp: userNote2.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Another User',
          },
        },
        {
          label: {
            text: 'Referral marked as in review',
          },
          datetime: {
            timestamp: systemNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
        {
          label: {
            text: 'Note',
          },
          html: userNoteHtml,
          datetime: {
            timestamp: userNote1.createdAt,
            type: 'datetime',
          },
          byline: {
            text: 'Some User',
          },
        },
      ])
    })
  })

  describe('renderNote', () => {
    it('renders the contents of a user note with paragraphs and line breaks', () => {
      jest.spyOn(viewUtils, 'formatLines').mockReturnValue('formatted lines')
      const note = referralHistoryUserNoteFactory.build({
        message: 'message contents',
      })

      const result = timelineUtils.renderNote(note)

      expect(result).toEqual('formatted lines')
      expect(viewUtils.formatLines).toHaveBeenCalledWith('message contents')
    })

    it('renders the contents of a system note with message details', () => {
      jest.spyOn(timelineUtils, 'renderSystemNote').mockReturnValue('formatted message')
      const note = referralHistorySystemNoteFactory.build({
        message: '',
        messageDetails: {
          foo: 'bar',
        } as ReferralHistoryNoteMessageDetails,
      })

      const result = timelineUtils.renderNote(note)

      expect(result).toEqual('formatted message')
      expect(timelineUtils.renderSystemNote).toHaveBeenCalledWith(note)
    })

    it('renders the contents of a domain event note with details', () => {
      jest.spyOn(timelineUtils, 'renderDomainEventNote').mockReturnValue('formatted message')
      const note: DomainEventNote = {
        id: faker.string.uuid(),
        createdByUserName: faker.person.fullName(),
        createdAt: DateFormats.dateObjToIsoDate(faker.date.past()),
        type: 'domainEvent',
        message: '',
        messageDetails: {
          domainEvent: { foo: 'bar' },
        } as ReferralHistoryNoteMessageDetails,
      }

      const result = timelineUtils.renderNote(note)

      expect(result).toEqual('formatted message')
      expect(timelineUtils.renderDomainEventNote).toHaveBeenCalledWith(note.messageDetails)
    })

    it('returns undefined for a system note with no message details', () => {
      const note = referralHistorySystemNoteFactory.build({
        message: '',
        messageDetails: undefined,
      })

      expect(timelineUtils.renderNote(note)).toBeUndefined()
    })
  })

  describe('renderSystemNote', () => {
    describe('for a rejection note', () => {
      it('returns HTML for a standard rejection reason', () => {
        const note = referralHistorySystemNoteFactory.build({
          category: 'rejected',
          message: '',
          messageDetails: {
            rejectionReason: 'A standard reason',
            isWithdrawn: true,
          },
        })

        const result = timelineUtils.renderSystemNote(note)

        expect(result).toEqual(
          '<p>Rejection reason: A standard reason</p><p>Withdrawal requested by the probation practitioner: Yes</p>',
        )
      })

      it('returns HTML with user provided details for another rejection reason', () => {
        const note = referralHistorySystemNoteFactory.build({
          category: 'rejected',
          message: '',
          messageDetails: {
            rejectionReason: 'Another reason (please add)',
            rejectionReasonDetails: 'Some details',
            isWithdrawn: false,
          },
        })

        const result = timelineUtils.renderSystemNote(note)

        expect(result).toEqual(
          '<p>Rejection reason: Some details</p><p>Withdrawal requested by the probation practitioner: No</p>',
        )
      })

      describe('when referrer user is viewing another rejection reason', () => {
        it('returns HTML with user provided details for a another rejection reason', () => {
          const note = referralHistorySystemNoteFactory.build({
            category: 'rejected',
            message: '',
            messageDetails: {
              rejectionReason: 'Another reason (please add)',
              isWithdrawn: false,
            },
          })

          const result = timelineUtils.renderSystemNote(note)

          expect(result).toEqual(
            '<p>Rejection reason: Another reason</p><p>Withdrawal requested by the probation practitioner: No</p>',
          )
        })
      })
    })
  })

  describe('renderDomainEventDetails', () => {
    describe('when "Accommodation required from date" has been updated', () => {
      it('returns HTML for a standard rejection reason', () => {
        const messageDetails: DomainEventNote['messageDetails'] = {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            updatedFields: [
              {
                fieldName: 'accommodationRequiredFromDate',
                updatedTo: '2125-11-01',
                updatedFrom: '2125-01-31',
              },
            ],
          },
        }

        const result = timelineUtils.renderDomainEventNote(messageDetails)

        expect(result).toEqual(
          '<p>Accommodation required from date was changed from 31 January 2125 to 1 November 2125</p>',
        )
      })
    })

    describe('when "Release date" has been updated', () => {
      it('returns HTML for a standard rejection reason', () => {
        const messageDetails: DomainEventNote['messageDetails'] = {
          domainEvent: {
            eventType: 'accommodation.cas3.assessment.updated',
            updatedFields: [
              {
                fieldName: 'releaseDate',
                updatedTo: '2125-11-01',
                updatedFrom: '2125-01-31',
              },
            ],
          },
        }

        const result = timelineUtils.renderDomainEventNote(messageDetails)

        expect(result).toEqual('<p>Release date was changed from 31 January 2125 to 1 November 2125</p>')
      })
    })
  })
})
