---
layout: page
permalink: /media/
title: Fellows' Media Appearances
description: Media appearances by fellows of the NHS Fellowship in Clinical AI, newest first.
---

Fellows have been featured in the media in the course of their fellowship. Explore the fellowship-related media of our fellows below, newest first.

<!-- Fellows' Media -->
<div class="data-table-wrap">
<table class="data-table">
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
</div>
<!-- Fellows' Media -->

{% include last-updated.html source="media" %}
