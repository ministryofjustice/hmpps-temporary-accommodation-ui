import ApplicationService from './applicationService'
import ApplicationClient from '../data/applicationClient'
jest.mock('../data/applicationClient.ts')
describe('ApplicationService', () => {
  const applicationClient = new ApplicationClient(null) as jest.Mocked<ApplicationClient>
  const applicationClientFactory = jest.fn()

  const service = new ApplicationService(applicationClientFactory)

  beforeEach(() => {
    jest.resetAllMocks()
    applicationClientFactory.mockReturnValue(applicationClient)
  })

  describe('createApplication', () => {
    it('calls the create method and returns a uuid', async () => {
      const uuid = 'some-uuid'
      const token = 'SOME_TOKEN'

      applicationClient.create.mockResolvedValue(uuid)

      const result = await service.createApplication(token)

      expect(result).toEqual(uuid)

      expect(applicationClientFactory).toHaveBeenCalledWith(token)
      expect(applicationClient.create).toHaveBeenCalled()
    })
  })

})
