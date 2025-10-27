import { cas3VoidBedspaceFactory, lostBedFactory } from '../testutils/factories'
import { isCas3VoidBedspace, lostBedActions, lostBedToCas3VoidBedspace, statusTag } from './lostBedUtils'

describe('lostBedUtils', () => {
  describe('statusTag', () => {
    it('returns a correctly formatted string', () => {
      const result = statusTag('active', 'voidsOnly')

      expect(result).toEqual('<strong class="govuk-tag govuk-tag--blue">Active</strong>')
    })
  })

  describe('lostBedActions', () => {
    it('returns actions array when lost bed status is active', () => {
      const lostBed = cas3VoidBedspaceFactory.active().build()

      const result = lostBedActions('premisesId', 'bedspaceId', lostBed)
      expect(result.length).toEqual(2)
    })

    it('returns null when lost bed status is cancelled', () => {
      const lostBed = cas3VoidBedspaceFactory.build({ status: 'cancelled' })

      const result = lostBedActions('premisesId', 'bedspaceId', lostBed)
      expect(result).toEqual(null)
    })
  })

  // TODO -- ENABLE_CAS3V2_API cleanup: remove the following casting utilities tests
  describe('Cas3 casting utilities', () => {
    describe('isCas3VoidBedspace', () => {
      it('returns true for a Cas3VoidBedspace', () => {
        const cas3VoidBedspace = cas3VoidBedspaceFactory.build()

        expect(isCas3VoidBedspace(cas3VoidBedspace)).toEqual(true)
      })

      it('returns false for a LostBed', () => {
        const lostBed = lostBedFactory.build()

        expect(isCas3VoidBedspace(lostBed)).toEqual(false)
      })
    })

    describe('lostBedToCas3VoidBedspace', () => {
      it('returns a Cas3VoidBedspace directly', () => {
        const cas3VoidBedspace = cas3VoidBedspaceFactory.build()

        const result = lostBedToCas3VoidBedspace(cas3VoidBedspace)

        expect(isCas3VoidBedspace(result)).toEqual(true)
        expect(result).toEqual(cas3VoidBedspace)
      })

      it('transforms a LostBed to a Cas3VoidBedspace', () => {
        const lostBed = lostBedFactory.build()

        const result = lostBedToCas3VoidBedspace(lostBed)

        expect(isCas3VoidBedspace(result)).toEqual(true)
        expect(result).toEqual(
          expect.objectContaining({
            bedspaceId: lostBed.bedId,
            bedspaceName: lostBed.bedName,
            cancellationDate: lostBed.cancellation.createdAt,
            cancellationNotes: lostBed.cancellation.notes,
          }),
        )
      })
    })
  })
})
