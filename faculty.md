---
layout: page
title: Faculty
permalink: /faculty/
---
We created this fellowship in response to the shortage of expert healthcare leaders to adopt clinical AI tools.
Each faculty member's clinical background guides the continued development of this programme year by year.
<h5>Click on each faculty member to find out more</h5>
<div class="container">
  <div class="row pt-3">

    {% for person in site.data.faculty.en.team.people %}
      {% if person.name %}
        {% assign url_name = person.name | slugify %}
        {% assign page_url = "/faculty/" | append: url_name %}
        {% assign image_path = "/images/faculty/" | append: url_name | append: ".jpg" %}
        {% assign socials = site.data.social_links_faculty[url_name] %}

        <div class="col-md-6 col-lg-3 text-center text-lg-left team-member"
             data-role="{{ person.role }}"
             data-background="{{ person.background }}">
          <div style="position: relative; display: inline-block;">
            <a href="{{ page_url }}">
              <img class="mx-auto p-1" style="width: 250px; border-radius: 40px;" src="{{ image_path | default: '/images/faculty/default.jpg' }}" alt="{{ person.name }}">
            </a>
            {% if socials.size > 0 %}
              <div class="social-button-cluster">
                {% if socials[0] %}
                  <a href="{{ socials[0].url }}">
                    <i class="{{ socials[0].icon }}"></i>
                  </a>
                {% endif %}
                {% if socials[1] %}
                  <a href="{{ socials[1].url }}">
                    <i class="{{ socials[1].icon }}"></i>
                  </a>
                {% endif %}
              </div>
            {% endif %}
          </div>

          <h4>{{ person.name }}</h4>
          <p class="text-muted">{{ person.role }}</p>
          {% if person.background %}
          <p class="text-muted">{{ person.background }}</p>
          {% endif %}

        </div>
      {% endif %}
    {% endfor %}

  </div>
</div>
