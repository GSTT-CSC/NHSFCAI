---
layout: page
permalink: /media/
title: Fellows' Media Appearances
description: Media appearances by fellows of the NHS Fellowship in Clinical AI, newest first.
---

Fellows have been featured in the media in the course of their fellowship. Explore the fellowship-related media of our fellows below, newest first.

<!-- Fellows' Media -->
<div class="data-table-wrap">
<table class="data-table data-table--people" role="table">
  <thead role="rowgroup">
    <tr role="row">
      <th scope="col" role="columnheader">Fellow</th>
      <th scope="col" role="columnheader">Media</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
  {% for resource in site.data.media %}
  <tr role="row">
    <td role="cell">{% include fellow-chips.html value=resource.fellow %}</td>
    <td role="cell">{% include data-title.html title=resource.title link=resource.link %}</td>
  </tr>
  {% endfor %}
  </tbody>
</table>
</div>
<!-- Fellows' Media -->

{% include last-updated.html source="media" %}
