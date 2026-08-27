---
layout: page
permalink: /literature/
title: Supporting Literature
description: Supporting literature describing the benefits and outputs of the NHS Fellowship in Clinical AI.
---

Find below the supporting literature which describes the benefits and outputs of the programme, newest first:

<!-- Supporting Literature -->
<div class="data-table-wrap">
<table class="data-table data-table--literature" role="table">
  <thead role="rowgroup">
    <tr role="row">
      <th scope="col" role="columnheader">Title</th>
      <th scope="col" role="columnheader">Authors</th>
      <th scope="col" role="columnheader">Description</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
  {% for item in site.data.literature %}
  <tr role="row">
    <td role="cell">{% include data-title.html title=item.title link=item.link external=true %}</td>
    <td role="cell" class="dt-desc" data-label="Authors">{{ item.authors }}</td>
    <td role="cell" class="dt-desc" data-label="Description">{{ item.description }}</td>
  </tr>
  {% endfor %}
  </tbody>
</table>
</div>
<!-- Supporting Literature -->

{% include last-updated.html source="literature" %}
<br>To suggest an addition, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
