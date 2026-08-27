---
layout: page
permalink: /literature/
title: Supporting Literature
description: Supporting literature describing the benefits and outputs of the NHS Fellowship in Clinical AI.
---

Find below the supporting literature which describes the benefits and outputs of the programme, newest first:

<!-- Supporting Literature -->
<div class="data-table-wrap">
<table class="data-table">
  <thead>
    <tr>
      <th scope="col">Title</th>
      <th scope="col">Authors</th>
      <th scope="col">Description</th>
    </tr>
  </thead>
  <tbody>
  {% for item in site.data.literature %}
  <tr>
    <td>
      {% if item.link %}
        <a href="{{ item.link }}" target="_blank">{{ item.title }}</a>
      {% else %}
        {{ item.title }}
      {% endif %}
    </td>
    <td>
      {{ item.authors }}
    </td>
    <td>
      {{ item.description }}
    </td>
  </tr>
  {% endfor %}
  </tbody>
</table>
</div>
<!-- Supporting Literature -->

{% include last-updated.html source="literature" %}
<br>To suggest an addition, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
