// The eligibility checker on /apply.
//
// The eligibility section states the rules in four places: the entry route
// table, the routes-to-competitive-entry table, the 13x5 region/profession
// matrix, and the footnotes under it. All of that is needed as a reference, but
// an applicant working out their own answer has to cross-reference the lot, and
// the faculty gets the email when they would rather not risk getting it wrong.
//
// This reads the same rules back for one applicant. Two rules about how it is
// built, because they are what keep it maintainable:
//
//   1. It asks only for the distinctions the published criteria actually make.
//      The criteria recognise five professions, one per matrix column, and
//      two tests - hold a National Training Number with a projected CCT date
//      after 10 August 2028 once training is extended for the fellowship, or
//      hold a substantive NHS Employer post at band 7, 8a or 8b - so band 7 and
//      band 8a are one answer here, not two. Splitting a bin the criteria do
//      not split creates a second place to update when the criteria change.
//
//   2. Every string it prints is the wording from the competitive and nominated
//      applicant sections of the page, so that an answer here and an answer
//      from the tables are the same answer.
//
// Profession is asked first because it decides what the other two questions
// mean: a doctor or dentist is tested on their training and placed by training
// region, everyone else is tested on their banding and placed by the region of
// their NHS Employer.
//
// Nothing here is authoritative: it cannot check the conditions that are on the
// applicant (BSH membership, ability to travel to Dublin, whether a post is
// genuinely substantive). Those are surfaced as conditions on the card rather
// than silently assumed.
//
// This reflects the Cohort 6 cycle, matching the status box on the page.

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // The matrix
  // --------------------------------------------------------------------------
  // One entry per row of the competitive applicant eligibility table, holding
  // the chips in each of its five profession columns:
  //
  //   doctor      Doctor
  //   dentist     Dentist
  //   statutory   Statutory clinical register (non-doctor/dentist): HCPC, NMC, GPhC, GOC, GDC, GMC, PSNI
  //   voluntary   Voluntary clinical register: PSA Accredited Register
  //   socialCare  Social care register: SWE, SSSC, SCW, NISCC
  //
  // A cell lists every chip printed in it, BSH included, and nothing else: BSH
  // is not in the voluntary or social care columns, so it cannot be assumed.
  // Read a row across against the table and the two should match chip for
  // chip.
  //
  // `doctorStRule` carries the asterisk on the East of England doctor cell:
  // "Must be at least ST3 or GPVTS ST2 at start date of fellowship (East of
  // England only)."
  var REGIONS = [
    { id: 'east-of-england', name: 'East of England', doctorStRule: true,
      doctor: ['regional', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'london', name: 'London',
      doctor: ['regional', 'bsh'], dentist: ['regional', 'bsh'], statutory: ['regional', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'midlands', name: 'Midlands',
      doctor: ['tpro', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'north-east-north-cumbria', name: 'North East & Yorkshire: North East & North Cumbria',
      doctor: ['tpro', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'yorkshire-humber', name: 'North East & Yorkshire: Yorkshire & Humber',
      doctor: ['regional', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'north-west', name: 'North West',
      doctor: ['regional', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'kent-surrey-sussex', name: 'South East: Kent Surrey Sussex',
      doctor: ['regional', 'bsh'], dentist: ['regional', 'bsh'], statutory: ['regional', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'thames-valley', name: 'South East: Thames Valley',
      doctor: ['regional', 'bsh'], dentist: ['regional', 'bsh'], statutory: ['regional', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'wessex', name: 'South East: Wessex',
      doctor: ['regional', 'bsh'], dentist: ['regional', 'bsh'], statutory: ['regional', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'south-west', name: 'South West',
      doctor: ['regional', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'northern-ireland', name: 'Northern Ireland',
      doctor: ['regional', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] },
    { id: 'scotland', name: 'Scotland',
      doctor: ['regional', 'bsh'], dentist: ['regional', 'bsh'], statutory: ['regional', 'bsh'], voluntary: ['regional'], socialCare: ['tpro'] },
    { id: 'wales', name: 'Wales',
      doctor: ['tpro', 'bsh'], dentist: ['tpro', 'bsh'], statutory: ['tpro', 'bsh'], voluntary: ['tpro'], socialCare: ['tpro'] }
  ];

  // The order open routes are listed in, which is the order of the chips in a
  // cell: the regionally or T-Pro funded post first, then BSH.
  var ROUTE_ORDER = ['regional', 'tpro', 'bsh'];

  // --------------------------------------------------------------------------
  // Professions
  // --------------------------------------------------------------------------
  // One per profession column of the published matrix, named with its column
  // heading word for word. `column` is the matrix column it reads; `stages`
  // names the test it is held to; `regions` is what the region question means
  // for it. Doctors and dentists are not on Agenda for Change, so their test is
  // their training and their region is where they train.
  //
  // The last option is for anyone in none of the five columns. No competitive
  // post is open to them whatever their career stage or region, so it carries a
  // `blocker` in place of a column. It is still asked all three questions, so
  // every profession goes through the same form, though only the international
  // option on the region list changes its answer. Its career stage is the
  // nominated route's own test, providing NHS services.
  var PROFESSIONS = [
    { id: 'doctor', name: 'Doctor', column: 'doctor', stages: 'trainee', regions: 'training' },
    { id: 'dentist', name: 'Dentist', column: 'dentist', stages: 'trainee', regions: 'training' },
    { id: 'statutory', name: 'Statutory clinical register (non-doctor/dentist): HCPC, NMC, GPhC, GOC, GDC, GMC, PSNI', column: 'statutory', stages: 'banded', regions: 'employer' },
    { id: 'voluntary', name: 'Voluntary clinical register: PSA Accredited Register', column: 'voluntary', stages: 'banded', regions: 'employer' },
    { id: 'social-care', name: 'Social care register: SWE, SSSC, SCW, NISCC', column: 'socialCare', stages: 'banded', regions: 'employer' },
    { id: 'none', name: 'None of the above', stages: 'nominated', regions: 'employer', blocker: 'profession' }
  ];

  // Not a region: the last option on the region list, for anyone training or
  // working outside the NHS. They are on the wrong page, so selecting it ends
  // the question whatever else is selected.
  var INTERNATIONAL = { id: 'international', name: 'International', international: true };

  // --------------------------------------------------------------------------
  // Career stages
  // --------------------------------------------------------------------------
  // One test per profession bin, which is all the published criteria set: hold
  // a National Training Number with a projected CCT date after 10 August 2028
  // once training is extended for the fellowship, or hold a substantive NHS
  // Employer post at band 7, 8a or 8b. Which register a banded applicant is on
  // has already been answered by their profession.
  //
  // `qualifies` means the applicant meets their bin's test and so reaches its
  // matrix column; otherwise `blocker` names the explanation to print.
  // Everything the FAQ lists as ineligible - foundation trainee, core trainee,
  // will CCT on or before 10 Aug 2028, post-CCT, not in training, no confirmed
  // NTN - is one bin, because it is one answer.
  //
  // East of England's minimum training grade is not asked about here. It
  // qualifies one region's regional post rather than dividing a profession, so
  // it is printed as a condition on that card.
  //
  // Nothing is printed under the select or above the answer: the three selects
  // sit directly above it, and a shared link refills them.
  var STAGES = {
    trainee: [
      { id: 'ntn', label: 'Hold a specialty NTN, with projected CCT after 10 Aug 2028', qualifies: true },
      { id: 'none', label: 'None of the above', qualifies: false, blocker: 'trainee' }
    ],
    // The whole banded criterion is asked here, employer included, so "None of
    // the above" is also the answer for anyone without an NHS Employer. That is
    // why the region question offers no non-NHS option: by the time it is
    // asked, an NHS Employer has been established.
    banded: [
      { id: 'band7-8b', label: 'Hold a substantive post with an NHS Employer at band 7, 8a or 8b', qualifies: true },
      { id: 'none', label: 'None of the above', qualifies: false, blocker: 'band' }
    ],
    // Asked only of a profession outside the matrix, which can reach nothing
    // but the nominated route, so this tests that route's eligibility instead:
    // "Health and social care staff providing NHS services". Failing it closes
    // the fellowship, not just the competitive posts.
    nominated: [
      { id: 'nhs-services', label: 'Provide NHS services in the health and social care workforce', qualifies: true },
      { id: 'none', label: 'None of the above', qualifies: false }
    ]
  };

  // Why no competitive post is reachable: the requirement, then the route that
  // is left, in the same two sentences for both tests. The trainee one links the
  // FAQ on extending training for the fellowship, because a trainee who checks
  // their current CCT date rather than the extended one can answer "None of the
  // above" and still be eligible.
  var BLOCKERS = {
    profession: 'Competitive posts require one of the professions listed above. Otherwise, applicants are eligible only as nominated applicants.',
    trainee: 'Competitive posts for this profession require a National Training Number in a UK specialty training post leading directly to Certificate of Completion of Training (CCT), with a projected CCT date after 10 August 2028 once training is extended to account for the fellowship (see <a href="#cct-extension">FAQ</a>). Otherwise, these applicants are eligible only as nominated applicants.',
    band: 'Competitive posts for this profession require a substantive post with an <a href="#nhs-employer">NHS Employer</a> at band 7, band 8a, or band 8b. Without one, these applicants are eligible only as nominated applicants.'
  };

  // East of England is the only region that qualifies a post by training grade:
  // "Must be at least ST3 or GPVTS ST2 at start date of fellowship (East of
  // England only)." It sits with the other conditions the checker cannot verify
  // for the applicant, on the card it applies to.
  var EOE_ST_CONDITION = 'East of England only: you must be at least <strong>ST3, or GPVTS ST2</strong>, at the start date of the fellowship.';

  // The funded posts. `sponsor`, `matching` and `conditions` are the wording of
  // the routes to competitive entry table. There is no card title and no
  // description of the post: the chip names the route in the same vocabulary as
  // the matrix, and a description would only name the funder a second time.
  var ROUTES = {
    regional: {
      chip: '<span class="route-chip is-regional">Regional</span>',
      sponsor: function (region) { return 'Your NHS region: <strong>' + region + '</strong>'; },
      matching: function (region) {
        return 'Matched to AI projects <strong>in ' + region + ' only</strong>, competitively on interview score from your ranked preferences.';
      },
      conditions: []
    },
    bsh: {
      chip: '<span class="route-chip is-bsh">BSH</span>',
      sponsor: function () { return 'The <a href="https://b-s-h.org.uk">British Society for Haematology</a>'; },
      matching: function () {
        return 'Matched to AI projects in <strong>haematology</strong> only, which may be in any region, competitively on interview score from your ranked preferences.';
      },
      conditions: [
        '<a href="https://b-s-h.org.uk/membership">Full or associate membership of the BSH</a>. Applicants enter their membership number on the application form, which is checked against the BSH membership registry.',
        'Must have a <a href="#faq-bsh-any-region">feasible commute</a> to the AI project they are matched to. This is not resourced by the BSH or by the fellowship, and an offer may be withdrawn without a feasible commuting plan.'
      ]
    },
    tpro: {
      chip: '<span class="route-chip is-tpro">T-Pro</span>',
      sponsor: function () { return '<a href="https://info.tpro.io">T-Pro</a>, an industry supplier with NHS partners, working on AI-powered voice solutions for clinical workflows'; },
      matching: function () {
        return 'Matched to AI projects involving <strong>T-Pro tools</strong> only, where the work is primarily remote, competitively on interview score from your ranked preferences.';
      },
      conditions: [
        'Able to travel for 4 funded site visits to the T-Pro base in Dublin (Ireland) during the fellowship year, and other site visits within the UK.'
      ]
    }
  };

  // --------------------------------------------------------------------------
  // Wiring
  // --------------------------------------------------------------------------

  var professionSelect = document.getElementById('ec-profession');
  var stageSelect = document.getElementById('ec-stage');
  var regionSelect = document.getElementById('ec-region');
  var result = document.getElementById('ec-result');
  // Carries what the profession makes the region question mean, so it is
  // rewritten when the profession changes.
  var regionLabelEl = document.querySelector('label[for="ec-region"]');
  // A short live region that sits outside the result, so it survives the
  // rewrite and announces one sentence rather than the whole answer. The detail
  // stays in the result for the reader to navigate to.
  var announce = document.getElementById('ec-announce');

  if (!regionSelect || !professionSelect || !stageSelect || !result) return;

  function option(value, label) {
    var el = document.createElement('option');
    el.value = value;
    el.textContent = label;
    return el;
  }

  PROFESSIONS.forEach(function (profession) {
    professionSelect.appendChild(option(profession.id, profession.name));
  });

  function findProfession(id) {
    return PROFESSIONS.filter(function (p) { return p.id === id; })[0] || null;
  }

  function stagesFor(profession) {
    return profession && profession.stages ? STAGES[profession.stages] : [];
  }

  function findStage(profession, id) {
    return stagesFor(profession).filter(function (s) { return s.id === id; })[0] || null;
  }

  function regionsFor(profession) {
    if (!profession || !profession.regions) return [];
    return REGIONS.concat([INTERNATIONAL]);
  }

  function findRegion(profession, id) {
    return regionsFor(profession).filter(function (r) { return r.id === id; })[0] || null;
  }

  // The region question means different things to different professions: a
  // doctor or dentist is placed by training region, everyone else by the region
  // of their NHS Employer. That distinction belongs on the field label, which is
  // rewritten when the profession changes, rather than repeated as a prefix on
  // all thirteen options - the options are already narrow, and a prefix directly
  // under a label saying the same thing buys nothing and truncates the part that
  // does.
  function regionFieldLabel(profession) {
    return profession && profession.regions === 'training' ? 'Training region' : 'Region';
  }

  function fill(select, items, placeholder, preferredId) {
    select.innerHTML = '';
    select.appendChild(option('', placeholder));
    items.forEach(function (item) {
      select.appendChild(option(item.value, item.label));
    });
    select.disabled = items.length === 0;
    if (preferredId && items.some(function (i) { return i.value === preferredId; })) {
      select.value = preferredId;
    }
  }

  // Both dependent lists are rebuilt whenever the profession changes. Their
  // option ids are shared where the meaning is shared (every region id, and
  // `none` across both tests), so an answer that still applies survives. The
  // region label is rewritten at the same time, because it says what the
  // profession makes that question mean.
  function populateDependents(profession, preferredStage, preferredRegion) {
    if (regionLabelEl) regionLabelEl.textContent = regionFieldLabel(profession);

    if (!profession) {
      fill(stageSelect, [], 'Select a profession first');
      fill(regionSelect, [], 'Select a profession first');
      return;
    }

    fill(stageSelect, stagesFor(profession).map(function (stage) {
      return { value: stage.id, label: stage.label };
    }), 'Select your career stage…', preferredStage);

    fill(regionSelect, regionsFor(profession).map(function (region) {
      return { value: region.id, label: region.name };
    }), 'Select your region…', preferredRegion);
  }

  // --------------------------------------------------------------------------
  // Rendering
  // --------------------------------------------------------------------------

  function detailRow(label, value) {
    return '<dt>' + label + '</dt><dd>' + value + '</dd>';
  }

  function conditionsBlock(title, items) {
    if (!items.length) return '';
    return '<div class="ec-condition"><p><strong>' + title + '</strong></p>' +
      items.map(function (item) { return '<p>' + item + '</p>'; }).join('') +
      '</div>';
  }

  // "Posts for competitive applicants are fully funded for eligible groups:
  // 0.4 FTE salary is reimbursed to the fellow's Employer, and course fee
  // covered." This is true of all three competitive posts whoever funds them,
  // so it is one string printed on each card rather than three to maintain.
  var COMPETITIVE_COST = 'Fully funded. 0.4 FTE salary is reimbursed to your Employer for the 12 months of the fellowship, and the course fee is covered. Travel and subsistence for in-person workshops is paid up front and reclaimed through mechanisms specified by the funder.';

  // A route the applicant can apply to. Only open routes get a card: the card
  // is the answer, and giving a closed route the same size and structure buries
  // the answer under the routes that are not it.
  function routeCard(routeId, region, options) {
    var route = ROUTES[routeId];
    var rows = detailRow('Sponsor', route.sponsor(region.name)) +
      detailRow('Cost', COMPETITIVE_COST) +
      detailRow('AI project matching', route.matching(region.name)) +
      ((options && options.extraRows) || '');

    return '<div class="ec-route">' +
      '<p class="ec-route__head">' + route.chip + '</p>' +
      '<dl class="ec-route__detail">' + rows + '</dl>' +
      conditionsBlock('You must also be able to confirm:',
        route.conditions.concat((options && options.extraConditions) || [])) +
      '</div>';
  }

  // Why a route missing from the selected cell is closed. Every closed route
  // gets a generic statement that names no region, so it does not read as a
  // judgement on any one of them.
  function closedReason(routeId) {
    if (routeId === 'regional') {
      return 'Regional posts are not open to your combination of profession, career stage, and region. ' +
        'Regional eligibility is set at the discretion of regional funding bodies (not the faculty), and this is not a uniform process across the NHS.';
    }
    if (routeId === 'tpro') {
      return 'T-Pro posts are not open to your combination of profession, career stage, and region.';
    }
    return 'BSH posts are not open to your combination of profession, career stage, and region.';
  }

  // The routes that are closed, as one compact list rather than one card each.
  // "Why can't I apply for X?" is the other half of the question and the reason
  // has to be on the page, but it is a footnote to the answer, not a rival to
  // it. `rows` is a list of { chips, reason }; a blocked applicant is one row
  // carrying all three chips, because there is one reason for all three.
  function closedBlock(rows) {
    if (!rows.length) return '';
    return '<div class="ec-closed">' +
      '<p class="ec-closed__title">Not open to you</p>' +
      '<ul class="ec-closed__list">' +
      rows.map(function (row) {
        return '<li><span class="ec-closed__chips">' + row.chips + '</span>' +
          '<span class="ec-closed__reason">' + row.reason + '</span></li>';
      }).join('') +
      '</ul></div>';
  }

  // The nominated route, which is open to every profession, career stage
  // and region, and so never depends on the selection. Rendered every time
  // because "what else can I do?" is the question that follows a no.
  function nominatedCard() {
    return '<div class="ec-route ec-route--nominated">' +
      '<dl class="ec-route__detail">' +
      detailRow('Sponsor', 'You identify a <a href="/nhs-sponsor">Sponsor for your post</a>, or <a href="#faq-self-sponsor">fund your own post</a>. Example sources include NHS Trusts and departments, a PhD personal development budget, and existing academic funding (e.g. NIHR awards).') +
      detailRow('Cost', 'The course fee is £8000. There is no salary cover unless agreed with the Sponsor by the applicant.') +
      detailRow('AI project matching', 'Either competitive matching to the existing project pool, or a <a href="#faq-specific-project">pre-allocated project</a> with a named supervisor, ringfenced for the applicant.') +
      '</dl>' +
      conditionsBlock('You must also be able to confirm:', [
        'You can release 2 days a week of your time for the 12 months duration of the fellowship.',
        'A Sponsor confirms funding by email to the faculty by 11 Dec 2026, or you declare yourself self-funding on the application form.'
      ]) +
      '</div>';
  }

  // The answer is read off the published tables, but those tables live inside a
  // collapsed disclosure further down the page, so there is no way to check the
  // working from here without knowing where to look. This closes that loop.
  var SOURCE_ANCHOR = 'competitive-applicant-eligibility-table';

  function sourceLink() {
    return '<p class="ec-source"><a href="#' + SOURCE_ANCHOR + '" data-ec-source>' +
      'Check this against the full eligibility table</a></p>';
  }

  // A fragment link into a closed <details> lands on nothing in browsers that
  // do not auto-expand it, so the disclosure is opened before the scroll.
  result.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('[data-ec-source]') : null;
    if (!link) return;

    var target = document.getElementById(SOURCE_ANCHOR);
    if (!target) return;

    event.preventDefault();
    var disclosure = target.closest('details');
    if (disclosure) disclosure.open = true;
    // Opening the disclosure adds about 2700px of tables to the page, and
    // depending on where the reader is when they click, scroll anchoring then
    // moves the page by that much to hold what they are looking at still. That
    // adjustment lands after the current frame and overrides a scroll issued
    // before it - far enough to miss the table entirely. Two frames out it has
    // been applied and the scroll sticks.
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(function () {
        target.scrollIntoView();
      });
    });
    window.history.replaceState({}, '', window.location.pathname +
      window.location.search + '#' + SOURCE_ANCHOR);
  });

  // What holds whatever the answer, in the order the reader needs it: the
  // two sections above are either/or, then what every application needs before
  // interview, then who to ask if the answer is close.
  function notes() {
    var items = [
      'Competitive and nominated applications are <a href="#faq-switch-to-nominated">mutually exclusive</a>. You cannot switch to nominated after an unsuccessful competitive application.',
      'Your Approver (training programme director or line manager) must submit <a href="#faq-own-approver"><em>Approval in Principle</em></a> by 16 Nov 2026, 23:45 GMT, confirming your eligibility and your working pattern from 11 August 2027. You will not be interviewed without it.',
      'If you think you are borderline eligible, <a href="mailto:gstt.aifellowship@nhs.net">contact the faculty</a> before applying.'
    ];

    return '<div class="ec-notes"><p>Applies to every applicant</p><ul>' +
      items.map(function (item) { return '<li>' + item + '</li>'; }).join('') +
      '</ul></div>';
  }

  // Answered on the first question alone: this page does not apply to them, so
  // nothing else is worth printing.
  function internationalResult() {
    return '<div class="ec-section">' +
      '<h4 class="ec-section__title">International applicant</h4>' +
      '<p class="ec-section__lede">This application page is for NHS applicants only. ' +
      'International applicants should visit the international applicant page, which has its own ' +
      'eligibility criteria, sponsorship arrangements and deadlines.</p>' +
      '<p class="action-buttons"><a class="btn-action btn-action--secondary" href="/international">' +
      'Go to the international applicant page</a></p>' +
      '</div>';
  }

  // The answer when no competitive post is open: one closed row carrying every
  // route, and the pointer to the nominated route below.
  function blockedResult(reason) {
    return '<p class="ec-verdict ec-verdict--no">No competitive routes match your answers</p>' +
      closedBlock([{
        chips: ROUTE_ORDER.map(function (routeId) { return ROUTES[routeId].chip; }).join(''),
        reason: reason
      }]) +
      '<p class="ec-followon">You can still apply as a nominated applicant as below.</p>';
  }

  // The answer for someone outside the NHS health and social care workforce:
  // the fellowship is not for them, so there is no route to list.
  function ineligibleResult() {
    return '<div class="ec-section">' +
      '<p class="ec-verdict ec-verdict--no">No routes match your answers</p>' +
      '<p class="ec-section__lede">The fellowship is for health and social care staff providing NHS services, so neither competitive nor nominated posts are open to you. ' +
      'If you think you are borderline eligible, <a href="mailto:gstt.aifellowship@nhs.net">contact the faculty</a> before applying.</p>' +
      '</div>';
  }

  // The nominated section, the same for every applicant who reaches an answer.
  function nominatedSection() {
    return '<div class="ec-section">' +
      '<h4 class="ec-section__title">Nominated applicant</h4>' +
      '<p class="ec-section__lede">Applicant is nominated for a post with ringfenced funding. <strong>Non-competitive</strong> entry: must meet the Essential criteria of the Person Specification at interview.</p>' +
      // The same verdict chip the competitive section uses, in the same place,
      // so the two routes are read off the page the same way. This one is a
      // constant: the nominated route is open to every applicant.
      '<p class="ec-verdict ec-verdict--yes">Open to you</p>' +
      nominatedCard() +
      '</div>';
  }

  function competitiveSectionHead() {
    return '<div class="ec-section">' +
      '<h4 class="ec-section__title">Competitive applicant</h4>' +
      '<p class="ec-section__lede">Applicant applies competitively for a post that is already attached to funding, if they meet the eligibility criteria. Salary cover is provided. <strong>Competitive</strong> entry: shortlist and interview, with posts awarded on interview score.</p>';
  }

  function showResult(html, profession, stage, region) {
    result.innerHTML = html;
    var verdict = result.querySelector('.ec-verdict');
    setAnnouncement(verdict ? verdict.textContent + '. Full result below the controls.' : '');
    syncUrl(profession, stage, region);
  }

  function render() {
    var profession = findProfession(professionSelect.value);
    var stage = findStage(profession, stageSelect.value);
    var region = findRegion(profession, regionSelect.value);

    // Wherever they are in the form, someone outside the NHS is on the wrong
    // page, so this answer does not wait for the others.
    if (region && region.international) {
      result.innerHTML = internationalResult();
      setAnnouncement('This page is for NHS applicants. Use the international applicant page.');
      syncUrl(profession, stage, region);
      return;
    }

    if (!profession || !stage || !region) {
      result.innerHTML = '';
      setAnnouncement('');
      syncUrl(profession, stage, region);
      return;
    }

    // A profession outside every matrix column has no competitive post open
    // wherever they are, and their career stage decides only whether the
    // nominated route is.
    if (profession.blocker) {
      if (!stage.qualifies) {
        showResult(ineligibleResult(), profession, stage, region);
      } else {
        showResult(competitiveSectionHead() +
          blockedResult(BLOCKERS[profession.blocker]) +
          sourceLink() + '</div>' +
          nominatedSection() + notes(), profession, stage, region);
      }
      return;
    }

    var html = competitiveSectionHead();

    // The cell of the published matrix for this region and profession.
    // The routes in it are open, and every route not in it is closed.
    var column = profession.column;
    var cell = region[column];
    var open = ROUTE_ORDER.filter(function (routeId) { return cell.indexOf(routeId) !== -1; });

    if (!stage.qualifies) {
      html += blockedResult(BLOCKERS[stage.blocker]);
    } else if (!open.length) {
      // Not reachable from the Cohort 6 table, where every cell carries a
      // chip, but an empty cell is a no, not "0 routes match".
      html += blockedResult('There are no competitive posts open to your combination of profession, career stage, and region.');
    } else {
      var regional = open.indexOf('regional') !== -1;
      // East of England's regional post is open to specialty trainee doctors
      // from ST3 (GPVTS ST2) only. It qualifies the post rather than excluding
      // the applicant, so it rides on the card as a condition.
      var stCondition = regional && region.doctorStRule && column === 'doctor';

      // "match your answers", not "are open to you". The checker has tested
      // profession, career stage and region, and nothing else: BSH in
      // particular turns on a membership most readers do not hold. The
      // conditions are on each card; the headline should not promise past them.
      html += '<p class="ec-verdict ec-verdict--yes">' + open.length +
        (open.length === 1 ? ' competitive route matches' : ' competitive routes match') +
        ' your answers</p>';
      open.forEach(function (routeId) {
        var options = {};
        if (routeId === 'regional' && stCondition) {
          options.extraConditions = [EOE_ST_CONDITION];
        }
        // A BSH applicant who is not appointed to a BSH-funded post falls back
        // into their regional pool, which is worth saying only where there is a
        // regional pool to fall into. Where there is not, the closed Regional
        // row below already says so.
        if (routeId === 'bsh' && regional) {
          options.extraRows = detailRow('If unsuccessful at interview', 'You meet regional criteria for ' + region.name + ', and are automatically re-entered into the regional applicant pool and can be matched to a project in that region depending on interview score.');
        }
        html += routeCard(routeId, region, options);
      });

      html += closedBlock(ROUTE_ORDER.filter(function (routeId) {
        return open.indexOf(routeId) === -1;
      }).map(function (routeId) {
        return { chips: ROUTES[routeId].chip, reason: closedReason(routeId) };
      }));
    }

    html += sourceLink();
    html += '</div>';

    html += nominatedSection();
    html += notes();

    showResult(html, profession, stage, region);
  }

  function setAnnouncement(text) {
    if (announce) announce.textContent = text;
  }

  // --------------------------------------------------------------------------
  // Shareable state
  // --------------------------------------------------------------------------
  // The selection is put in the query string, following /fellows and /sites, so
  // the faculty can answer a question with a link to the result rather than
  // with a paragraph.
  //
  // The URL belongs to the whole page, not to this widget, so the three keys
  // below are the only part of it this rewrites. Anything else that arrived on
  // it - a fragment pointing at another section of /apply, a campaign parameter
  // on a link from the newsletter - is carried through untouched, and a page
  // loaded with nothing selected is left alone entirely rather than being
  // flattened to the bare path before the browser has scrolled to its anchor.

  var KEYS = ['profession', 'stage', 'region'];

  // Whether this has ever written the selection to the URL. Once it has, an
  // empty selection has to be written too, to clear what is there.
  var urlWritten = false;

  function syncUrl(profession, stage, region) {
    var selected = profession || stage || region;
    if (!selected && !urlWritten) return;
    urlWritten = true;

    var params = new URLSearchParams(window.location.search);
    KEYS.forEach(function (key) { params.delete(key); });
    if (profession) params.set('profession', profession.id);
    if (stage) params.set('stage', stage.id);
    if (region) params.set('region', region.id);

    var query = params.toString();
    var hash = selected ? '#check-your-eligibility' : window.location.hash;
    window.history.replaceState({}, '', window.location.pathname +
      (query ? '?' + query : '') + hash);
  }

  function applyUrlState() {
    var params = new URLSearchParams(window.location.search);
    var profession = findProfession(params.get('profession'));

    if (profession) professionSelect.value = profession.id;
    populateDependents(profession, params.get('stage'), params.get('region'));
  }

  professionSelect.addEventListener('change', function () {
    populateDependents(findProfession(professionSelect.value), stageSelect.value, regionSelect.value);
    render();
  });

  stageSelect.addEventListener('change', render);
  regionSelect.addEventListener('change', render);

  applyUrlState();
  render();
})();
