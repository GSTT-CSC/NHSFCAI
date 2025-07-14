---
layout: page
permalink: /publications/
title: Fellows' Publications
---

Fellows have opportunities to publish academically during NHS Fellowship in Clinical AI, particularly relating to their AI project.
Explore the fellowship-related publications of our fellows below.


<!-- Fellows' Publications -->
<table class="table table-hover">
  <thead>
    <tr>
      <th scope="col">Publication</th>
      <th scope="col">Fellow</th>
    </tr>
  </thead>
  <tbody>
  {% for resource in site.data.fellowship_publications %}
  <tr>
    <td>{% if resource.link %}<a href="{{ resource.link }}">{{ resource.title }}</a>{% else %} {{ resource.title }}{% endif %}</td>
    <td>
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
    </td>
  </tr>
{% endfor %}
  </tbody>
</table>
<!-- Fellows' Publications -->

<i> Last updated: July 2025 </i>