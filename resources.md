---
layout: page
permalink: /resources/
title: Links to educational resources
---

A list of curated educational resources for AI in the NHS


<!-- Educational Resources -->
<table class="table table-hover">
  <thead>
    <tr>
      <th scope="col">Resource</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
  {% for resource in site.data.resources %}
  <tr>
    <td style="width: 25%; vertical-align: top;">
      {% if resource.link %}
        <a href="{{ resource.link }}" target="_blank">{{ resource.name }}</a>
      {% else %}
        {{ resource.name }}
      {% endif %}
    </td>
    <td style="width: 55%; vertical-align: top;">
      {{ resource.description }}
    </td>
  </tr>
{% endfor %}
  </tbody>
</table>
<!-- Educational Resources -->

<i> Last updated: Nov 2025 </i>
<br>To suggest a link for inclusion, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
