---
layout: page
permalink: /sites/
title: NHS AI Project Host Sites

---
Our fellows are hosted in clinical AI projects and teams across the NHS.

<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

<style>
    #filter-container {
        background-color: #f0f4f5;
        padding: 15px;
        border-radius: 8px;
        margin-bottom: 15px;
        display: flex;
        gap: 15px;
        align-items: center;
        flex-wrap: wrap;
        border: 1px solid #d8dde0;
        font-family: Arial, sans-serif;
    }

    .filter-group { display: flex; flex-direction: column; }
    .filter-group label { font-size: 0.85em; font-weight: bold; margin-bottom: 5px; }
    .filter-group select { padding: 8px; border-radius: 4px; border: 1px solid #ccc; min-width: 150px; }

    #map {
        height: 800px;
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
        transition: transform 0.2s;
        display: block;
    }

    .map-pin-face:hover {
        transform: scale(1.2); 
        z-index: 9999 !important;
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
        <label for="region-filter">Region</label>
        <select id="region-filter"><option value="all">All Regions</option></select>
    </div>
    <div class="filter-group">
        <label for="profession-filter">Profession</label>
        <select id="profession-filter"><option value="all">All Professions</option></select>
    </div>
</div>

<div id="map"></div>


<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
    // Lock the map view to the UK
    var ukBounds = L.latLngBounds(
        [49.8, -8.2],  // South-West (Cornwall / Isles of Scilly)
        [60.9, 2.2]    // North-East (Shetland-ish)
    );

    var map = L.map('map', {
        maxZoom: 14,
        minZoom: 5,
        maxBounds: ukBounds,
        maxBoundsViscosity: 1.0 // fully rigid; prevents panning outside bounds
    }).setView([52.1, -1.6], 8);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 14,
        minZoom: 5
    }).addTo(map);

    // Extra safeguard for trackpads/kinetic dragging
    map.setMaxBounds(ukBounds);

    var faceLayer = L.layerGroup().addTo(map);

    // --- Image preloading to make pin photos appear faster ---
    // Leaflet divIcons use <img> tags; preloading warms the browser cache so renders feel instant.
    var imageCache = new Map();
    var DEFAULT_AVATAR = '/images/fellow/placeholderfellow.jpg';

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

    var fellowsData = {{ site.data.fellowship_fellows.en.team.people | jsonify | default: '[]' }};

    if (fellowsData && Array.isArray(fellowsData)) {
        var cohortSelect = document.getElementById('cohort-filter');
        var regionSelect = document.getElementById('region-filter');
        var professionSelect = document.getElementById('profession-filter');

        var cohorts = [...new Set(fellowsData.map(i => i.cohort))].filter(Boolean).sort();
        var regions = [...new Set(fellowsData.map(i => i.region))].filter(Boolean).sort();
        var professions = [...new Set(fellowsData.map(i => i.profession))].filter(Boolean).sort();

        cohorts.forEach(c => cohortSelect.add(new Option("Cohort " + c, c)));
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

            // Prioritise the first few visible images after each render.
            var renderImagePriorityCount = 0;

            var locationGroups = {};
            fellowsData.forEach(function(f) {
                var lat = parseFloat(f.lat), lng = parseFloat(f.lng);
                if (isNaN(lat) || isNaN(lng)) return;

                if (selC !== 'all' && f.cohort !== selC) return;
                if (selR !== 'all' && f.region !== selR) return;
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

                group.forEach(function(item, index) {
                    var f = item.fellow;
                    var finalLat, finalLng;

                    if (group.length > 1) {
                        var testX = 0;
                        var testY = 0;

                        if (index > 0) {
                            // --- TRUE HEX LATTICE SPIRAL ---
                            var R = Math.ceil((-3 + Math.sqrt(9 + 12 * index)) / 6);
                            var posInRing = index - (3 * (R - 1) * R) - 1; 
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
                            testX = (q + r) * baseD * sqrt3over2 * overlapFactor;
                            testY = (-q + r) * (baseD / 2) * overlapFactor;
                        }

                        // UNPROJECT using the Anchor Zoom to get the locked GPS coord
                        var targetPixel = L.point(originPixel.x + testX, originPixel.y + testY);
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

                    // Warm the cache (helps especially on first load and after filter changes)
                    preloadImage(img);

                    var p_url = "/fellow/" + url_name;
                    var c_url = "https://www.nhsfellowship.ai/fellows/?cohort=" + f.cohort;

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
                            <a href="${p_url}" style="text-decoration: none; color: #005EB8; font-size: 1.1em;">
                                <strong>${f.name}</strong>
                            </a><br>
                            <a href="${c_url}" target="_blank" style="text-decoration: none; color: #005EB8; font-size: 0.85em; font-weight: bold;">
                                Cohort ${f.cohort}
                            </a><br>
                            <span class="role-text">${f.role}</span><br>
                            <span style="color: gray; font-size: 0.85em;">${f.placement}</span><br>
                            ${f.project_title ? `
                            <a href="${f.project_link}" target="_blank" style="text-decoration: none; color: #005EB8; font-weight: bold; font-size: 0.9em;">
                                ${f.project_title}
                            </a><br>
                            ` : ''}
                            <hr style="margin:8px 0;">
                        </div>
                    `;

                    L.marker([finalLat, finalLng], { icon: faceIcon }).bindPopup(popupHTML).addTo(faceLayer);
                });
            }
        }

        map.on('zoomend', renderMap);
        cohortSelect.addEventListener('change', renderMap);
        regionSelect.addEventListener('change', renderMap);
        professionSelect.addEventListener('change', renderMap);
        
        renderMap();
    }
</script>