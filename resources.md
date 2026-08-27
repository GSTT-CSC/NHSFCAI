---
layout: page
permalink: /resources/
title: Links to educational resources
description: A curated list of educational resources for AI in the NHS, maintained by the fellowship faculty.
---

A list of curated educational resources for AI in the NHS


<!-- Educational Resources -->
<div class="data-table-wrap">
<table class="data-table">
  <thead>
    <tr>
      <th scope="col">Resource</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
  {% for resource in site.data.resources %}
  <tr>
    <td>
      {% if resource.link %}
        <a href="{{ resource.link }}" target="_blank">{{ resource.name }}</a>
      {% else %}
        {{ resource.name }}
      {% endif %}
    </td>
    <td>
      {{ resource.description }}
    </td>
  </tr>
{% endfor %}
  </tbody>
</table>
</div>
<!-- Educational Resources -->

{% include last-updated.html source="resources" %}
<br>To suggest a link for inclusion, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
