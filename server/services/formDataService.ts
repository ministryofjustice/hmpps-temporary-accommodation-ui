import FormDataClient from '../data/formDataClient'
import { RestClientBuilder } from '../data'
import { JourneyType, TaskData } from '@approved-premises/ui'

export default class FormDataService {
  constructor(private readonly formClientBuilder: RestClientBuilder<FormDataClient>) {}

  private getId(id: string, journey?: JourneyType): string {
    return journey ? `${id}-${journey}` : id
  }

  async getFormData(token: string, id: string, journey?: JourneyType): Promise<TaskData> {
    const formClient = this.formClientBuilder({token})

    try {
      return await formClient.get(this.getId(id, journey))
    } catch (error) {
      return {}
    }
  }

  async updateFormData(token: string, id: string, journey: JourneyType, formData: TaskData): Promise<{ id: string }> {
    const formClient = this.formClientBuilder({token})

    return formClient.update(this.getId(id, journey), formData)
  }
}
