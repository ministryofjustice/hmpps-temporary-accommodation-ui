import { applicationFactory, personFactory } from '../../../../testutils/factories'
import { itShouldHaveNextValue, itShouldHavePreviousValue } from '../../../shared-examples'
import { yesOrNoResponseWithDetail } from '../../../utils'
import RoomSharing from './roomSharing'

jest.mock('../../../utils')

const body = { roomSharing: 'yes' as const, roomSharingDetail: 'Detail' }

describe('RoomSharing', () => {
  const application = applicationFactory.build({
    person: personFactory.build({
      name: 'John Smith',
    }),
  })

  describe('body', () => {
    it('sets the body', () => {
      const page = new RoomSharing(body, application)

      expect(page.body).toEqual(body)
    })
  })

  itShouldHavePreviousValue(new RoomSharing({}, application), 'dashboard')
  itShouldHaveNextValue(new RoomSharing({}, application), 'food-allergies')

  describe('errors', () => {
    it('returns an empty object if the room sharing fields are populated', () => {
      const page = new RoomSharing(body, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an empty object if the room sharing answer is no', () => {
      const page = new RoomSharing({ roomSharing: 'no' }, application)
      expect(page.errors()).toEqual({})
    })

    it('returns an error if the room sharing answer not populated', () => {
      const page = new RoomSharing({ ...body, roomSharing: undefined }, application)
      expect(page.errors()).toEqual({
        roomSharing: 'You must specifiy if John Smith would be able to share accommodation with others',
      })
    })

    it('returns an error if the room sharing answer is yes but details are not populated', () => {
      const page = new RoomSharing({ ...body, roomSharingDetail: undefined }, application)
      expect(page.errors()).toEqual({
        roomSharingDetail:
          'You must provide details of how you will manage risk if John Smith is placed in shared accommodation',
      })
    })
  })

  describe('response', () => {
    it('returns a translated version of the response', () => {
      ;(yesOrNoResponseWithDetail as jest.Mock).mockReturnValue('Response with optional detail')

      const page = new RoomSharing(body, application)
      expect(page.response()).toEqual({
        'Would John Smith be able to share accommodation with others?': 'Response with optional detail',
      })
      expect(yesOrNoResponseWithDetail).toHaveBeenCalledWith('roomSharing', body)
    })
  })
})
