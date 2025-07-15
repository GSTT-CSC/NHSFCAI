---
layout: page
permalink: /fellows/
title: Fellows & Alumni
---

<!-- Filters -->
<div id="filters" class="mb-3">
  <label for="cohort-filter">Cohort:</label>
  <select id="cohort-filter">
    <option value="">All</option>
    <option value="4">4 (2025-26)</option>
    <option value="3">3 (2024-25)</option>
    <option value="2">2 (2023-24)</option>
    <option value="1">1 (2022-23)</option>
    <!-- Add more cohort options if needed -->
  </select>
  <br>

  <label for="region-filter">Region:</label>
  <select id="region-filter">
    <option value="">All</option>
    <option value="East of England">East of England</option>
    <option value="London">London</option>
    <option value="Midlands">Midlands</option>
    <option value="North West">North West</option>
    <option value="Scotland">Scotland</option>
    <option value="South East- Kent, Surrey, Sussex">South East- Kent, Surrey, Sussex</option>
    <option value="South East- Thames Valley">South East- Thames Valley</option>
    <option value="South East- Wessex">South East- Wessex</option>
    <option value="South West">South West</option>
    <option value="Wales">Wales</option>
    <option value="International">International</option>
    <!-- Add more region options if needed -->
  </select>
  <br>
    <label for="profession-filter">Profession:</label>
  <select id="profession-filter">
    <option value="">All</option>
    <option value="Anaesthetics & Intensive Care">Anaesthetics & Intensive Care</option>
    <option value="Dentistry">Dentistry</option>
    <option value="Emergency Medicine">Emergency Medicine</option>
    <option value="General Practice">General Practice</option>
    <option value="Healthcare Science">Healthcare Science</option>
    <option value="Obstetrics & Gynaecology">Obstetrics & Gynaecology</option>
    <option value="Ophthalmology">Ophthalmology</option>
    <option value="Optometry">Optometry</option>
    <option value="Paediatrics">Paediatrics</option>
    <option value="Pathology">Pathology</option>
    <option value="Pharmacy">Pharmacy</option>
    <option value="Physiotherapy">Physiotherapy</option>
    <option value="Public Health">Public Health</option>
    <option value="Medicine">Medicine</option>
    <option value="Radiology">Radiology</option>
    <option value="Surgery">Surgery</option>
    <!-- Add more cohort options if needed -->
  </select>
  <br>
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
          <img class="mx-auto p-1" style="width: 250px; border-radius: 50%;" src="{{ image_path }}" alt="">
        </a>

        <h4>{{ person.name }}</h4>
        <p class="text-muted">{{ person.role }}</p>

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
    {% endfor %}

  </div>
</div>
<!-- End Team -->

<script>
function initializeFilters() {
  const cohortFilter = document.getElementById('cohort-filter');
  const regionFilter = document.getElementById('region-filter');
  const professionFilter = document.getElementById('profession-filter');
  const members = document.querySelectorAll('.team-member');

  if (!cohortFilter || !regionFilter || !professionFilter || members.length === 0) {
    return;
  }

  function getQueryParam(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  // Set filters based on URL parameters
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
      const matchCohort = !cohort || member.dataset.cohort === cohort;
      const matchRegion = !region || member.dataset.region === region;
      const matchProfession = !profession || member.dataset.profession === profession;

      member.style.display = (matchCohort && matchRegion && matchProfession) ? '' : 'none';
    });

    // Update URL parameters
    const params = new URLSearchParams();
    if (cohort) params.set('cohort', cohort);
    if (region) params.set('region', region);
    if (profession) params.set('profession', profession);
    const newUrl = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
    window.history.replaceState({}, '', newUrl);
  }

  cohortFilter.addEventListener('change', filterMembers);
  regionFilter.addEventListener('change', filterMembers);
  professionFilter.addEventListener('change', filterMembers);

  filterMembers(); // Run once on page load
}

initializeFilters();
</script>

<style>
.social-button-cluster {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 0;
}

.social-button-cluster a {
  display: inline-block;
  width: 35px;
  height: 35px;
  line-height: 35px;
  border-radius: 50%;
  background-color: #666;
  color: #fff;
  text-align: center;
  font-size: 17px;
}
</style>
