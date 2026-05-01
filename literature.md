---
layout: page
permalink: /literature/
title: Supporting Literature

---

Find below the supporting literature which describes the benefits and outputs of the programme, newest first:

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
<!-- Supporting Literature -->
<table class="table table-hover">
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
    <td style="width: 30%; vertical-align: top;">
      {% if item.link %}
        <a href="{{ item.link }}" target="_blank">{{ item.title }}</a>
      {% else %}
        {{ item.title }}
      {% endif %}
    </td>
    <td style="width: 20%; vertical-align: top;">
      {{ item.authors }}
    </td>
    <td style="width: 50%; vertical-align: top;">
      {{ item.description }}
    </td>
  </tr>
  {% endfor %}
  </tbody>
</table>
<!-- Supporting Literature -->

<i> Last updated: April 2026</i>
<br>To suggest an addition, please [contact the faculty](mailto:gstt.aifellowship@nhs.net)
