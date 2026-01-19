---
layout: page
permalink: /media/
title: Fellows' Media appearances
---

Fellows have been featured in the media in the course of their fellowship. Explore the fellowship-related media of our fellows below, newest first

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
<!-- Fellows' Media -->
<table class="table table-hover">
  <thead>
    <tr>
      <th scope="col">Fellow</th>
      <th scope="col">Media</th>
    </tr>
  </thead>
  <tbody>
  {% for resource in site.data.media %}
  <tr>
    <td>
      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
      {% assign fragments = resource.fellow | split: '</a>' %}
      {% for fragment in fragments %}
        {% assign html = fragment | append: '</a>' %}
        {% assign name = html | split: '>' | last | split: '<' | first %}
        {% assign slug = name | slugify %}
        <div style="margin-bottom: 8px;">
          <a href="/fellow/{{ slug }}/">
            <img src="/images/fellow/{{ slug }}.jpg" alt="{{ name }}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 50%; display: block; margin-bottom: 4px;">
          </a>
          {{ html }}
        </div>
      {% endfor %}
      </div>
    </td>
    <td>{% if resource.link %}<a href="{{ resource.link }}">{{ resource.title }}</a>{% else %} {{ resource.title }}{% endif %}</td>
  </tr>
{% endfor %}
  </tbody>
</table>
<!-- Fellows' Media -->

<i> Last updated: January 2026 </i>