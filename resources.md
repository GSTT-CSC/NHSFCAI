---
layout: page
permalink: /resources/
title: Links to educational resources
---

A list of curated educational resources for AI in the NHS


<style>
  table {
    border-collapse: collapse;
    width: 100%;
  }
  th, td {
    border: 1px solid #d8dde0;
    padding: 6px 10px;
    text-align: left !important;
    vertical-align: top;
  }
  th {
    background-color: #005eb8; /* NHS blue */
    color: white;
  }
  tr:nth-child(even) td {
    background-color: #e8f1f8; /* slightly darker pale NHS blue */
  }
  tr:nth-child(odd) td {
    background-color: #ffffff;
  }
  tr:hover td {
    background-color: #d4e2f0; /* hover highlight */
  }
</style>
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
