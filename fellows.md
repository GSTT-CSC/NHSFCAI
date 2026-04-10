---
layout: page
permalink: /fellows/
title: Fellows & Alumni
---

<style>
    #filter-container {
        background-color: #f0f4f5;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 20px;
        align-items: center;
        flex-wrap: wrap;
        border: 1px solid #d8dde0;
        font-family: Arial, sans-serif;
        box-shadow: 0 2px 6px rgba(0,0,0,0.05);
    }

    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.85em; font-weight: bold; margin-bottom: 5px; }
    .filter-group select { padding: 8px; border-radius: 6px; border: 1px solid #ccc; min-width: 160px; background-color: white; }
</style>

<div id="filter-container" class="mb-3">
  <div class="filter-group">
    <label for="cohort-filter">Cohort</label>
    <select id="cohort-filter">
      <option value="all">All Cohorts</option>
    </select>
  </div>

  <div class="filter-group">
    <label for="region-filter">Region</label>
    <select id="region-filter">
      <option value="all">All Regions</option>
    </select>
  </div>

  <div class="filter-group">
    <label for="profession-filter">Profession</label>
    <select id="profession-filter">
      <option value="all">All Professions</option>
    </select>
  </div>
</div>

<!-- Team -->
<h5>Click on each fellow to find out more</h5>
<div class="container">
  <div class="row pt-3">

    {% for person in site.data.fellowship_fellows.en.team.people %}
      {% assign url_name = person.name | slugify %}
      {% assign page_url = "/fellow/" | append: url_name %}
      {% assign image_path = "/images/fellow/" | append: url_name | append: ".jpg" %}
      {% assign socials = site.data.social_links_fellows[url_name] %}

      <div class="col-md-6 col-lg-3 text-center text-lg-left team-member"
           data-cohort="{{ person.cohort }}"
           data-region="{{ person.region }}"
           data-profession="{{ person.profession }}"
           style="position: relative;">

        <a href="{{ page_url }}">
          <img
            class="mx-auto p-1"
            style="width: 250px; border-radius: 50%;"
            src="{{ image_path }}"
            onerror="this.onerror=null;this.src='/images/fellow/placeholderfellow.jpg';"
            alt="{{ person.name }}"
            width="250"
            height="250"
            decoding="async"
            {% if forloop.index <= 4 %}
              loading="eager" fetchpriority="high"
            {% else %}
              loading="lazy" fetchpriority="low"
            {% endif %}
          />
        </a>

        <h4>{{ person.name }}</h4>
        <p class="text-muted">{{ person.role }}</p>

        {% if socials and socials.size > 0 %}
          <div class="social-button-cluster">
            {% for social in socials limit:3 %}
              {% if social %}
                <a href="{{ social.url }}">
                  <i class="{{ social.icon }}"></i>
                </a>
              {% endif %}
            {% endfor %}
          </div>
        {% endif %}
      </div>
    {% endfor %}

  </div>
</div>

<script>
function initializeFilters() {
  const cohortFilter = document.getElementById('cohort-filter');
  const regionFilter = document.getElementById('region-filter');
  const professionFilter = document.getElementById('profession-filter');
  const members = document.querySelectorAll('.team-member');

  if (!cohortFilter || !regionFilter || !professionFilter || members.length === 0) {
    return;
  }

  function populateFilters() {
    const cohorts = new Set();
    const regions = new Set();
    const professions = new Set();
    const cohortLabels = {
      "5": "Cohort 5 (2026-27)",
      "4": "Cohort 4 (2025-26)",
      "3": "Cohort 3 (2024-25)",
      "2": "Cohort 2 (2023-24)",
      "1": "Cohort 1 (2022-23)"
    };

    members.forEach(member => {
      if (member.dataset.cohort) cohorts.add(member.dataset.cohort);
      if (member.dataset.region) regions.add(member.dataset.region);
      if (member.dataset.profession) professions.add(member.dataset.profession);
    });

    [5, 4, 3, 2, 1].forEach(v => {
      const key = String(v);
      if (cohorts.has(key)) {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = cohortLabels[key];
        cohortFilter.appendChild(option);
      }
    });

    [...regions].sort().forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      regionFilter.appendChild(option);
    });

    [...professions].sort().forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      professionFilter.appendChild(option);
    });
  }

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  const cohortParam = getQueryParam('cohort');
  const regionParam = getQueryParam('region');
  const professionParam = getQueryParam('profession');

  if (cohortParam) cohortFilter.value = cohortParam;
  if (regionParam) regionFilter.value = regionParam;
  if (professionParam) professionFilter.value = professionParam;

  function filterMembers() {
    const cohort = cohortFilter.value;
    const region = regionFilter.value;
    const profession = professionFilter.value;

    members.forEach(member => {
      const matchCohort = cohort === 'all' || member.dataset.cohort === cohort;
      const matchRegion = region === 'all' || member.dataset.region === region;
      const matchProfession = profession === 'all' || member.dataset.profession === profession;

      member.style.display = (matchCohort && matchRegion && matchProfession) ? '' : 'none';
    });

    const params = new URLSearchParams();
    if (cohort && cohort !== 'all') params.set('cohort', cohort);
    if (region && region !== 'all') params.set('region', region);
    if (profession && profession !== 'all') params.set('profession', profession);

    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  cohortFilter.addEventListener('change', filterMembers);
  regionFilter.addEventListener('change', filterMembers);
  professionFilter.addEventListener('change', filterMembers);

  populateFilters();

  filterMembers();
}

initializeFilters();
</script>
