---
layout: page
title: Faculty
permalink: /faculty/
description: The faculty of the NHS Fellowship in Clinical AI, based in Clinical Scientific Computing at Guy's and St Thomas'.
---
We created this fellowship to address the workforce gap of expert healthcare leaders to adopt clinical AI tools.
The faculty is based in the [Clinical Scientific Computing department](https://gstt-csc.github.io) of Guy's and St Thomas' NHS Foundation Trust.
Contact the faculty [here](mailto:gstt.aifellowship@nhs.net).

<p class="section-hint">Click on each faculty member to find out more.</p>
<div class="container">
  <div class="row pt-3">

    {% for person in site.data.faculty.en.team.people %}
      {% if person.name %}
        {% assign url_name = person.name | slugify %}
        {% assign page_url = "/faculty/" | append: url_name %}
        {% assign image_path = "/images/faculty/" | append: url_name | append: ".jpg" %}
        {% assign socials = site.data.social_links_faculty[url_name] %}

        <div class="col-6 col-md-4 col-lg-3 team-member"
             data-role="{{ person.role }}"
             data-background="{{ person.background }}">
          <div class="people-card people-card--faculty">
            <div class="people-card__photo">
              <img src="{{ image_path }}"
                   onerror="this.onerror=null;this.src='/images/faculty/default.jpg';"
                   alt=""
                   width="170"
                   height="170"
                   decoding="async">
              {% if socials.size > 0 %}
                <div class="people-card__social">
                  {% for social in socials limit:2 %}
                    <a href="{{ social.url }}" target="_blank" rel="noopener noreferrer">
                      <i class="{{ social.icon }}" aria-hidden="true"></i>
                      <span class="visually-hidden">{{ person.name }} on {{ social.name | default: "social media" }}</span>
                    </a>
                  {% endfor %}
                </div>
              {% endif %}
            </div>

            <h2 class="people-card__name"><a class="stretched-link" href="{{ page_url }}">{{ person.name }}</a></h2>
            <p class="people-card__role">{{ person.role }}</p>
            {% if person.background %}
            <p class="people-card__role">{{ person.background }}</p>
            {% endif %}
          </div>
        </div>
      {% endif %}
    {% endfor %}

  </div>
</div>
