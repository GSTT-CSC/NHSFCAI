---
layout: page
permalink: /publications/
title: Fellows' Publications
description: Academic publications by fellows of the NHS Fellowship in Clinical AI, newest first.
---

Fellows have opportunities to publish academically during NHS Fellowship in Clinical AI, particularly relating to their AI project.
Explore the fellowship-related publications of our fellows below, newest first.

<!-- Fellows' Publications -->
<div class="data-table-wrap">
<table class="data-table data-table--people" role="table">
  <thead role="rowgroup">
    <tr role="row">
      <th scope="col" role="columnheader">Fellow</th>
      <th scope="col" role="columnheader">Publication</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
  {% for resource in site.data.fellowship_publications %}
  <tr role="row">
    <td role="cell">{% include fellow-chips.html value=resource.fellow %}</td>
    <td role="cell">{% include data-title.html title=resource.title link=resource.link %}</td>
  </tr>
  {% endfor %}
  </tbody>
</table>
</div>
<!-- Fellows' Publications -->

{% include last-updated.html source="fellowship_publications" %}
