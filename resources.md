---
layout: page
permalink: /resources/
title: Links to educational resources
description: A curated list of educational resources for AI in the NHS, maintained by the fellowship faculty.
---

A list of curated educational resources for AI in the NHS

<!-- Educational Resources -->
<div class="data-table-wrap">
<table class="data-table data-table--resources" role="table">
  <thead role="rowgroup">
    <tr role="row">
      <th scope="col" role="columnheader">Resource</th>
      <th scope="col" role="columnheader">Description</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
  {% for resource in site.data.resources %}
  <tr role="row">
    <td role="cell">
      {%- if resource.link -%}
        <a class="entry-title" href="{{ resource.link }}" target="_blank">{{ resource.name }}</a>
      {%- else -%}
        <span class="entry-title">{{ resource.name }}</span>
      {%- endif -%}
    </td>
    <td role="cell" class="dt-desc" data-label="Description">{{ resource.description }}</td>
  </tr>
  {% endfor %}
  </tbody>
</table>
</div>
<!-- Educational Resources -->

{% include last-updated.html source="resources" %}
<br>To suggest a link for inclusion, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
