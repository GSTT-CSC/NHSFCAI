---
layout: page
permalink: /sites/
title: NHS AI Project Host Sites

---
Our [fellows](/fellows) are hosted in clinical AI project placements in teams across the NHS. Click on each fellow to find out more.

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

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

    #map {
        height: 1000px;
        width: 100%;
        border-radius: 8px;
        z-index: 1;
    }
    
    /* MODIFIED FACE PIN STYLING */
    /* Fixed 70px dimensions removed so JS can handle dynamic scaling */
    .map-pin-face {
        border-radius: 50%;
        object-fit: cover;
        border: 3px solid #005EB8;
        background-color: white;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4);
        will-change: transform;
        display: block;
        box-sizing: border-box;
        transform-origin: center center;
    }

    .map-pin-face:hover {
        transform: scale(1.2); 
        z-index: 9999 !important;
    }


    .overflow-popup-list {
        max-height: 300px;
        overflow-y: auto;
        text-align: left;
        margin-top: 8px;
        padding-right: 8px;
    }

    .overflow-popup-list .fellow-row {
        padding: 6px 0;
        border-top: 1px solid #e0e0e0;
        line-height: 1.3;
    }

    .overflow-popup-list .fellow-row:first-child {
        border-top: none;
    }

    
    .custom-face-icon { background: none !important; border: none !important; }
    .popup-content { text-align: center; font-family: Arial, sans-serif; max-width: 240px; }
    
    .role-text {
        font-size: 0.85em;
        color: #555;
        font-weight: 500;
        margin-bottom: 2px;
        display: block;
        line-height: 1.3;
    }
</style>

<div id="filter-container">
    <div class="filter-group">
        <label for="cohort-filter">Cohort</label>
        <select id="cohort-filter"><option value="all">All Cohorts</option></select>
    </div>
    <div class="filter-group">
        <label for="project-region-filter">Project Region</label>
        <select id="project-region-filter"><option value="all">All Project Regions</option></select>
    </div>
    <div class="filter-group">
        <label for="profession-filter">Profession</label>
        <select id="profession-filter"><option value="all">All Professions</option></select>
    </div>
</div>

<div id="map"></div>


<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
    // Restrict the map to a useful UK frame so users cannot pan into empty space
    var ukBounds = L.latLngBounds(
        [50.066, -5.713],
        [58.5, 1.35]
    );

    var map = L.map('map', {
        maxZoom: 14,
        minZoom: 7,
        maxBounds: ukBounds,
        maxBoundsViscosity: 1.0
    });

    var initialBounds = L.latLngBounds(
        [50.6040, -3.6000],
        [53.9590, 1.3000]
    );


    map.fitBounds(initialBounds);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 14,
        minZoom: 7
    }).addTo(map);

    var faceLayer = L.layerGroup().addTo(map);

    // --- Image preloading to make pin photos appear faster ---
    // Leaflet divIcons use <img> tags; preloading warms the browser cache so renders feel instant.
    var imageCache = new Map();
    var DEFAULT_AVATAR = '/images/fellow/placeholderfellow.jpg';
    var MAX_PRELOADS_PER_RENDER = 24;

    function preloadImage(src) {
        if (!src) return;
        if (imageCache.has(src)) return;
        var im = new Image();
        im.decoding = 'async';
        // Start fetching as soon as we ask for it; cache will be reused by <img> tags.
        im.src = src;
        imageCache.set(src, im);
    }

    // Ensure the fallback avatar is ready.
    preloadImage(DEFAULT_AVATAR);

    function slugify(text) {
        if (!text) return "";
        return text.toString().toLowerCase()
            .replace(/\s+/g, '-')
            .replace(/[^\w\-]+/g, '')
            .replace(/\-\-+/g, '-')
            .replace(/^-+/, '')
            .replace(/-+$/, '');
    }

    function cohortLink(cohort) {
        var cohortValue = String(cohort || '').trim().replace(/^Cohort\s*/i, '').split(/\s+/)[0];
        return "/fellows/?cohort=" + encodeURIComponent(cohortValue);
    }

    var fellowsData = {{ site.data.fellowship_fellows.en.team.people | where_exp: "person", "person.hidden != true" | jsonify | default: '[]' }};

    if (fellowsData && Array.isArray(fellowsData)) {
        var cohortSelect = document.getElementById('cohort-filter');
        var regionSelect = document.getElementById('project-region-filter');
        var professionSelect = document.getElementById('profession-filter');

        var cohorts = [...new Set(fellowsData.map(i => i.cohort))].filter(Boolean);
        var regions = [...new Set(fellowsData.map(i => i.project_region))].filter(Boolean).sort();
        var professions = [...new Set(fellowsData.map(i => i.profession))].filter(Boolean).sort();

        function getCurrentPriorityCohort() {
            var today = new Date();
            var year = today.getFullYear();
            var month = today.getMonth(); // January is 0, September is 8

            // Fellowship map priority rolls over each September.
            // Sep 2025-Aug 2026 starts at Cohort 3, Sep 2026-Aug 2027 at Cohort 4, and so on.
            return (month >= 8 ? year : year - 1) - 2022;
        }

        function cohortSortValue(cohort) {
            var n = parseInt(cohort, 10);
            return isNaN(n) ? Number.POSITIVE_INFINITY : n;
        }

        function compareFellowsByCohortPriority(a, b) {
            var priorityCohort = getCurrentPriorityCohort();
            var cohortA = cohortSortValue(a.fellow.cohort);
            var cohortB = cohortSortValue(b.fellow.cohort);

            function rank(cohort) {
                if (cohort <= priorityCohort) {
                    return priorityCohort - cohort;
                }
                return priorityCohort + cohort;
            }

            var rankA = rank(cohortA);
            var rankB = rank(cohortB);

            if (rankA !== rankB) return rankA - rankB;
            return String(a.fellow.name || '').localeCompare(String(b.fellow.name || ''));
        }

        var TOTAL_SLOTS = 19;
        var BADGE_SLOT = 14;

        function overflowBadgeDataUrl(count) {
            var svg = `
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="48" fill="#005EB8"/>
                    <text x="50" y="55" text-anchor="middle" dominant-baseline="middle" fill="white" font-family="Arial, sans-serif" font-size="32" font-weight="700">+${count}</text>
                </svg>
            `;
            return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
        }

        function hexOffset(index, baseD, overlapFactor) {
            var x = 0;
            var y = 0;

            if (index > 0) {
                // --- TRUE HEX LATTICE SPIRAL ---
                var R = Math.ceil((-3 + Math.sqrt(9 + 12 * index)) / 6);
                var ringSize = 6 * R;
                var posInRing = (index - (3 * (R - 1) * R) - 1 + Math.round(ringSize * 9 / 12)) % ringSize;
                var side = Math.floor(posInRing / R);
                var step = posInRing % R;

                var q = R;
                var r = -R;

                var dirs = [
                    { dq: 0,  dr: 1 }, { dq: -1, dr: 1 }, { dq: -1, dr: 0 },
                    { dq: 0,  dr: -1 }, { dq: 1,  dr: -1 }, { dq: 1,  dr: 0 }
                ];

                for (var s = 0; s < side; s++) {
                    q += dirs[s].dq * R;
                    r += dirs[s].dr * R;
                }
                q += dirs[side].dq * step;
                r += dirs[side].dr * step;

                var sqrt3over2 = Math.sqrt(3) / 2;
                // Use baseD here so the geographic spread is anchored to zoom 9 proportions
                x = (q + r) * baseD * sqrt3over2 * overlapFactor;
                y = (-q + r) * (baseD / 2) * overlapFactor;
            }

            return { x: x, y: y };
        }

        var cohortLabels = {
          "5": "Cohort 5 (2026-27)",
          "4": "Cohort 4 (2025-26)",
          "3": "Cohort 3 (2024-25)",
          "2": "Cohort 2 (2023-24)",
          "1": "Cohort 1 (2022-23)"
        };

        [5, 4, 3, 2, 1].forEach(v => {
            var key = String(v);
            if (cohorts.includes(key)) {
                cohortSelect.add(new Option(cohortLabels[key], key));
            }
        });
        regions.forEach(r => regionSelect.add(new Option(r, r)));
        professions.forEach(p => professionSelect.add(new Option(p, p)));

        function renderMap() {
            faceLayer.clearLayers();

            var zoom = map.getZoom();
            
            // 1. CALCULATE SCALE
            // If zoom is less than 9, scale it down proportionally. Otherwise, scale is 1.
            var scale = 1;
            if (zoom < 9) {
                scale = Math.pow(2, zoom - 9);
            }

            // 2. ADJUST DIMENSIONS
            var baseD = 70; // Original face size in pixels
            var currentD = baseD * scale; // Dynamic face size
            var overlapFactor = 1; 

            // Use Zoom 9 as the Anchor for geographic spread calculation
            var effectiveZoom = Math.max(9, zoom); 
            var snapResolution = 2.8 / Math.pow(2, effectiveZoom - 6);

            var selC = cohortSelect.value;
            var selR = regionSelect.value;
            var selP = professionSelect.value;

            // Prioritise and preload only the first few visible images after each render.
            var renderImagePriorityCount = 0;
            var renderPreloadCount = 0;

            var locationGroups = {};
            fellowsData.forEach(function(f) {
                var lat = parseFloat(f.lat), lng = parseFloat(f.lng);
                if (isNaN(lat) || isNaN(lng)) return;

                if (selC !== 'all' && f.cohort !== selC) return;
                if (selR !== 'all' && f.project_region !== selR) return;
                if (selP !== 'all' && f.profession !== selP) return;

                // Group by snapped grid so pins aggregate at low zooms...
                var snapLat = Math.round(lat / snapResolution) * snapResolution;
                var snapLng = Math.round(lng / snapResolution) * snapResolution;
                var key = snapLat.toFixed(4) + "," + snapLng.toFixed(4);

                // ...but track the true centroid from original coordinates to avoid centre "jumping"
                if (!locationGroups[key]) {
                    locationGroups[key] = { items: [], sumLat: 0, sumLng: 0 };
                }
                locationGroups[key].items.push({ fellow: f, originalLat: lat, originalLng: lng });
                locationGroups[key].sumLat += lat;
                locationGroups[key].sumLng += lng;
            });

            for (var coords in locationGroups) {
                var groupObj = locationGroups[coords];
                var group = groupObj.items;

                // True centroid (stable) for rendering; avoids snapped-grid centre hops
                var centerLat = groupObj.sumLat / group.length;
                var centerLng = groupObj.sumLng / group.length;

                // Project center point at the anchor zoom
                var originPixel = map.project(L.latLng(centerLat, centerLng), effectiveZoom);

                var sortedGroup = group.slice().sort(compareFellowsByCohortPriority);
                var hasOverflow = sortedGroup.length > TOTAL_SLOTS;
                sortedGroup.forEach(function(item, idx) { item.slot = idx; });
                var displayGroup = hasOverflow
                    ? sortedGroup.slice(0, TOTAL_SLOTS)
                    : sortedGroup;
                var overflowFellows = hasOverflow
                    ? sortedGroup.slice(TOTAL_SLOTS)
                    : [];

                displayGroup.forEach(function(item) {
                    var f = item.fellow;
                    var finalLat, finalLng;
                    var slot = item.slot;

                    if (group.length > 1) {
                        var off = hexOffset(slot, baseD, overlapFactor);

                        // UNPROJECT using the Anchor Zoom to get the locked GPS coord
                        var targetPixel = L.point(originPixel.x + off.x, originPixel.y + off.y);
                        var newLatLng = map.unproject(targetPixel, effectiveZoom);
                        finalLat = newLatLng.lat;
                        finalLng = newLatLng.lng;
                    } else {
                        // Single marker: always render at true location
                        finalLat = item.originalLat;
                        finalLng = item.originalLng;
                    }

                    var url_name = slugify(f.name);
                    var img = "/images/fellow/" + url_name + ".jpg";

                    // Warm the cache for the first visible pins without preloading every image on every render.
                    if (renderPreloadCount < MAX_PRELOADS_PER_RENDER) {
                        preloadImage(img);
                        renderPreloadCount++;
                    }

                    var p_url = "/fellow/" + url_name;
                    var c_url = cohortLink(f.cohort);

                    var faceIcon = L.divIcon({
                        className: 'custom-face-icon',
                        html: `<img src="${img}" class="map-pin-face" style="width:${currentD}px; height:${currentD}px;" title="${f.name}" decoding="async" fetchpriority="${renderImagePriorityCount < 12 ? 'high' : 'auto'}" onerror="this.onerror=null;this.src='/images/fellow/placeholderfellow.jpg'">`,
                        iconSize: [currentD, currentD],
                        iconAnchor: [currentD / 2, currentD / 2],
                        popupAnchor: [0, -currentD / 2]
                    });
                    renderImagePriorityCount++;

                    var popupHTML = `
                        <div class="popup-content">
                            <a href="${p_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-size: 1.1em;">
                                <strong>${f.name}</strong>
                            </a><br>
                            <a href="${c_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-size: 0.85em; font-weight: bold;">
                                Cohort ${f.cohort}
                            </a><br>
                            <span class="role-text">${f.role}</span><br>
                            <span style="color: gray; font-size: 0.85em;">Project Site: ${f.placement}</span><br>
                            ${f.project_title ? `
                                ${f.project_link && f.project_link !== 'null' ? `
                                <a href="${f.project_link.toLowerCase().includes('.pdf') ? f.project_link + '#zoom=page-width' : f.project_link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-weight: bold; font-size: 0.9em;">
                                    ${f.project_title}
                                </a><br>
                                ` : `
                                <span style="color: #000; font-weight: bold; font-size: 0.9em;">
                                    ${f.project_title}
                                </span><br>
                                `}
                            ` : ''}
                            <hr style="margin:8px 0;">
                        </div>
                    `;

                    L.marker([finalLat, finalLng], { icon: faceIcon }).bindPopup(popupHTML).addTo(faceLayer);
                });

                if (hasOverflow) {
                    var badgeSlot = BADGE_SLOT;
                    var badgeOff = hexOffset(badgeSlot, baseD, overlapFactor);
                    var badgePixel = L.point(originPixel.x + badgeOff.x, originPixel.y + badgeOff.y);
                    var badgeLatLng = map.unproject(badgePixel, effectiveZoom);
                    var overflowCount = overflowFellows.length;

                    var badgeIcon = L.divIcon({
                        className: 'custom-face-icon',
                        html: `<img src="${overflowBadgeDataUrl(overflowCount)}" class="map-pin-face" style="width:${currentD}px; height:${currentD}px;" title="${overflowCount} more fellows">`,
                        iconSize: [currentD, currentD],
                        iconAnchor: [currentD / 2, currentD / 2],
                        popupAnchor: [0, -currentD / 2]
                    });

                    var overflowRows = overflowFellows.map(function(item) {
                        var f = item.fellow;
                        var url_name = slugify(f.name);
                        var p_url = "/fellow/" + url_name;
                        var c_url = cohortLink(f.cohort);
                        return `
                            <div class="fellow-row">
                                <a href="${p_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-weight: bold;">
                                    ${f.name}
                                </a><br>
                                <a href="${c_url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-size: 0.85em; font-weight: bold;">
                                    Cohort ${f.cohort}
                                </a><br>
                                <span class="role-text">${f.role}</span>
                                <span style="color: gray; font-size: 0.85em;">Project Site: ${f.placement}</span>
                                ${f.project_title ? `
                                    ${f.project_link && f.project_link !== 'null' ? `
                                    <br><a href="${f.project_link.toLowerCase().includes('.pdf') ? f.project_link + '#zoom=page-width' : f.project_link}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: #005EB8; font-weight: bold; font-size: 0.9em;">
                                        ${f.project_title}
                                    </a>
                                    ` : `
                                    <br><span style="color: #000; font-weight: bold; font-size: 0.9em;">
                                        ${f.project_title}
                                    </span>
                                    `}
                                ` : ''}
                            </div>
                        `;
                    }).join('');

                    var overflowPopupHTML = `
                        <div class="popup-content">
                            <strong>${overflowCount} more fellows at this location</strong>
                            <div class="overflow-popup-list">
                                ${overflowRows}
                            </div>
                        </div>
                    `;

                    L.marker([badgeLatLng.lat, badgeLatLng.lng], { icon: badgeIcon }).bindPopup(overflowPopupHTML, { maxHeight: null }).addTo(faceLayer);
                }
            }
        }

        
        map.on('zoomend', renderMap);
        cohortSelect.addEventListener('change', renderMap);
        regionSelect.addEventListener('change', renderMap);
        professionSelect.addEventListener('change', renderMap);
        
        renderMap();
    }
</script>