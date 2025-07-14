---
layout: page
title: Faculty
permalink: /faculty/
---

<h5>Click on each faculty member to find out more</h5>
<div class="container">
  <div class="row pt-3">

    {% for person in site.data.faculty.en.team.people %}
      {% if person.name %}
        {% assign url_name = person.name | slugify %}
        {% assign page_url = "/faculty/" | append: url_name %}
        {% assign image_path = "/images/faculty/" | append: url_name | append: ".jpg" %}
        {% assign socials = site.data.social_links_faculty[url_name] %}

        <div class="col-md-6 col-lg-4 text-center text-lg-left team-member"
             data-role="{{ person.role }}"
             data-background="{{ person.background }}">
          <a href="{{ page_url }}">
            <img class="mx-auto p-1" style="width: 250px; border-radius: 50%;" src="{{ image_path | default: '/images/faculty/default.jpg' }}" alt="{{ person.name }}">
          </a>

          <h4>{{ person.name }}</h4>
          <p class="text-muted">{{ person.role }}</p>
          {% if person.background %}
          <p class="text-muted">{{ person.background }}</p>
          {% endif %}

          {% if socials %}
          <ul class="list-inline social-buttons">
            {% for network in socials %}
            <li class="list-inline-item text-center">
              <a href="{{ network.url }}">
                <i class="{{ network.icon }}"></i>
              </a>
            </li>
            {% endfor %}
          </ul>
          {% endif %}
        </div>
      {% endif %}
    {% endfor %}

  </div>
</div>