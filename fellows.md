---
layout: page
permalink: /fellows/
title: Fellows & Alumni
description: The fellows and alumni of the NHS Fellowship in Clinical AI, filterable by cohort, region and profession.
---

<div id="filter-container" class="mb-3">
  <div class="filter-group">
    <label for="cohort-filter">Cohort</label>
    <select id="cohort-filter">
      <option value="all">All Cohorts</option>
    </select>
  </div>

  <div class="filter-group">
    <label for="fellow-region-filter">Fellow Region</label>
    <select id="fellow-region-filter">
      <option value="all">All Fellow Regions</option>
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
<p class="section-hint">Click on each fellow to find out more. You can also explore their <a href="/sites/">AI project placements</a>.</p>
<p class="filter-count" id="fellow-count" role="status"></p>
<div class="container">
  <div class="row pt-3">

    {% assign visible_fellows = site.data.fellowship_fellows.en.team.people | where_exp: "person", "person.hidden != true" %}
    {% for person in visible_fellows %}
      {% assign url_name = person.name | slugify %}
      {% assign page_url = "/fellow/" | append: url_name %}
      {% assign image_path = "/images/fellow/" | append: url_name | append: ".jpg" %}
      {% assign socials = site.data.social_links_fellows[url_name] %}

      <div class="col-6 col-md-4 col-lg-3 team-member"
           data-cohort="{{ person.cohort }}"
           data-fellow-region="{{ person.fellow_region }}"
           data-profession="{{ person.profession }}">
        <div class="people-card">
          <div class="people-card__photo">
            <img
              src="{{ image_path }}"
              onerror="this.onerror=null;this.src='/images/fellow/placeholderfellow.jpg';"
              alt=""
              width="170"
              height="170"
              decoding="async"
              {% if forloop.index <= 4 %}
                loading="eager" fetchpriority="high"
              {% else %}
                loading="lazy" fetchpriority="low"
              {% endif %}
            />
            {% if person.flag %}
              <span class="people-card__flag" aria-hidden="true">{{ person.flag }}</span>
            {% endif %}
            {% if socials.size > 0 %}
              <div class="people-card__social">
                {% for social in socials limit:3 %}
                  {% if social %}
                    <a href="{{ social.url }}" target="_blank" rel="noopener noreferrer">
                      <i class="{{ social.icon }}" aria-hidden="true"></i>
                      <span class="visually-hidden">{{ person.name }} on {{ social.name | default: "social media" }}</span>
                    </a>
                  {% endif %}
                {% endfor %}
              </div>
            {% endif %}
          </div>

          {% comment %}
            The name carries the link, and stretched-link makes the whole card
            clickable. The portrait is decorative once the name is the link
            text, so it takes an empty alt rather than repeating the name.
          {% endcomment %}
          <h2 class="people-card__name"><a class="stretched-link" href="{{ page_url }}">{{ person.name }}</a></h2>
          <p class="people-card__role">{{ person.role }}</p>
        </div>
      </div>
    {% endfor %}

  </div>
  <p class="filter-empty" id="fellow-empty" hidden>No fellows match these filters. Try widening your selection.</p>
</div>

<script>
function initializeFilters() {
  const cohortFilter = document.getElementById('cohort-filter');
  const regionFilter = document.getElementById('fellow-region-filter');
  const professionFilter = document.getElementById('profession-filter');
  const members = document.querySelectorAll('.team-member');

  if (!cohortFilter || !regionFilter || !professionFilter || members.length === 0) {
    return;
  }

  function populateFilters() {
    const cohorts = new Set();
    const regions = new Set();
    const professions = new Set();
    // Cohort 1 ran 2022-23; each later cohort starts a year after the last.
    const FIRST_COHORT_START_YEAR = 2022;
    const cohortLabel = (cohort) => {
      const n = Number(cohort);
      if (!Number.isFinite(n)) return `Cohort ${cohort}`;
      const start = FIRST_COHORT_START_YEAR + (n - 1);
      return `Cohort ${n} (${start}-${String(start + 1).slice(-2)})`;
    };

    members.forEach(member => {
      if (member.dataset.cohort) cohorts.add(member.dataset.cohort);
      if (member.dataset.fellowRegion) regions.add(member.dataset.fellowRegion);
      if (member.dataset.profession) professions.add(member.dataset.profession);
    });

    // Newest cohort first, and built from whatever is actually present so a
    // new cohort appears in the filter without a code change.
    [...cohorts]
      .sort((a, b) => Number(b) - Number(a))
      .forEach(key => {
        const option = document.createElement('option');
        option.value = key;
        option.textContent = cohortLabel(key);
        cohortFilter.appendChild(option);
      });

    // International sits at the bottom of the list, after the alphabetised UK regions.
    const sortedRegions = [...regions].sort();
    const orderedRegions = [
      ...sortedRegions.filter(value => value !== 'International'),
      ...sortedRegions.filter(value => value === 'International')
    ];

    orderedRegions.forEach(value => {
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

  function applyQueryFilters() {
    if (cohortParam && Array.from(cohortFilter.options).some(option => option.value === cohortParam)) {
      cohortFilter.value = cohortParam;
    }
    if (regionParam && Array.from(regionFilter.options).some(option => option.value === regionParam)) {
      regionFilter.value = regionParam;
    }
    if (professionParam && Array.from(professionFilter.options).some(option => option.value === professionParam)) {
      professionFilter.value = professionParam;
    }
  }

  function filterMembers() {
    const cohort = cohortFilter.value;
    const region = regionFilter.value;
    const profession = professionFilter.value;

    let visible = 0;
    members.forEach(member => {
      const matchCohort = cohort === 'all' || member.dataset.cohort === cohort;
      const matchRegion = region === 'all' || member.dataset.fellowRegion === region;
      const matchProfession = profession === 'all' || member.dataset.profession === profession;
      const show = matchCohort && matchRegion && matchProfession;

      member.style.display = show ? '' : 'none';
      if (show) visible += 1;
    });

    const emptyState = document.getElementById('fellow-empty');
    if (emptyState) emptyState.hidden = visible > 0;

    const countLabel = document.getElementById('fellow-count');
    if (countLabel) {
      countLabel.textContent = visible === members.length
        ? `Showing all ${members.length} fellows and alumni`
        : `Showing ${visible} of ${members.length} fellows and alumni`;
    }

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
  applyQueryFilters();
  filterMembers();
}

initializeFilters();
</script>
