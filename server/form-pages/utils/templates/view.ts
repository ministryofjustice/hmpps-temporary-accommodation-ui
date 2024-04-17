/* istanbul ignore file */

const viewTemplate = () => `
{% extends "../../layout.njk" %}

{% block questions %}

  <h1 class="govuk-heading-l">
    <span class="govuk-caption-l">{{ section.title }}</span>
    {{ page.title }}
  </h1>

  // TODO: Add questions here

{% endblock %}
`

export default viewTemplate
