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
    
    /* 70px FACE PIN STYLING */
    .map-pin-face {
        width: 70px !important;
        height: 70px !important;
        max-width: 70px !important;
        max-height: 70px !important;
        min-width: 70px !important;
        min-height: 70px !important;
        border-radius: 50% !important;
        object-fit: cover !important;
        border: 3px solid #005EB8 !important; 
        background-color: white !important;
        box-shadow: 0 3px 8px rgba(0,0,0,0.4) !important;
        transition: transform 0.2s;
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
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

<script>
    // Set to Zoom 8 with the center dragged down so Liverpool is near the top
    var map = L.map('map', {
        maxZoom: 14,
        minZoom: 5
    }).setView([52.1, -1.6], 8);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 14,
        minZoom: 5
    }).addTo(map);

    var faceLayer = L.layerGroup().addTo(map);

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
            
            // THE ZOOM LOCKS
            // Math.max(10, ...) ensures that when zoomed out (e.g., zoom 6-9), the pins 
            // deliberately collapse and overlap heavily, keeping the cluster firmly in London.
            // As soon as you zoom in to 10 or closer, it perfectly preserves the kissing honeycomb.
            var effectiveZoom = Math.max(9, Math.min(zoom, 14));
            
            // This locks the snapping grid so it never groups wider than it does at zoom 8
var snapZoom = Math.max(9, zoom);
var snapResolution = 2.8 / Math.pow(2, snapZoom - 6);

            var selC = cohortSelect.value;
            var selR = regionSelect.value;
            var selP = professionSelect.value;

            var locationGroups = {};
            fellowsData.forEach(function(f) {
                var lat = parseFloat(f.lat), lng = parseFloat(f.lng);
                if (isNaN(lat) || isNaN(lng)) return;

                if (selC !== 'all' && f.cohort !== selC) return;
                if (selR !== 'all' && f.region !== selR) return;
                if (selP !== 'all' && f.profession !== selP) return;

                var snapLat = Math.round(lat / snapResolution) * snapResolution;
                var snapLng = Math.round(lng / snapResolution) * snapResolution;
                
                var key = snapLat.toFixed(4) + "," + snapLng.toFixed(4);
                if (!locationGroups[key]) locationGroups[key] = [];
                locationGroups[key].push({ fellow: f, originalLat: lat, originalLng: lng });
            });

            // 70px face size. 
            // ensuring absolutely zero gaps and a beautiful stacked effect.
            var D = 70; 
            var overlapFactor = 1; 

            for (var coords in locationGroups) {
                var group = locationGroups[coords];
                var latLng = coords.split(',').map(parseFloat);
                
                var originPixel = map.project(L.latLng(latLng[0], latLng[1]), effectiveZoom);

                group.forEach(function(item, index) {
                    var f = item.fellow;
                    var finalLat, finalLng;

                    if (group.length > 1) {
                        var testX = 0;
                        var testY = 0;

                        if (index > 0) {
                            // --- TRUE HEX LATTICE SPIRAL (ordered honeycomb) ---
                            // Maps each index to axial hex coords (q,r) on a triangular lattice,
                            // then converts to pixel offsets so circles are perfectly "kissing".

                            // Find which ring R this index belongs to (R = 1,2,3...)
                            var R = Math.ceil((-3 + Math.sqrt(9 + 12 * index)) / 6);
                            // 0-based position within that ring
                            var posInRing = index - (3 * (R - 1) * R) - 1; // 0 .. 6R-1
                            var side = Math.floor(posInRing / R);         // 0 .. 5
                            var step = posInRing % R;                     // 0 .. R-1

                            // Start of each ring at the TOP (12 o’clock) so the cluster reads as a
                            // clean, symmetric honeycomb rather than a tilted spoke.
                            // In this axial system, (q,r) = (R,-R) converts to a purely vertical-up pixel offset.
                            var q = R;
                            var r = -R;

                            // Axial directions to walk around the ring
                            var dirs = [
                                { dq: 0,  dr: 1 },   // down-right
                                { dq: -1, dr: 1 },   // down-left
                                { dq: -1, dr: 0 },   // left
                                { dq: 0,  dr: -1 },  // up-left
                                { dq: 1,  dr: -1 },  // up-right
                                { dq: 1,  dr: 0 }    // right
                            ];

                            // Advance to the correct side
                            for (var s = 0; s < side; s++) {
                                q += dirs[s].dq * R;
                                r += dirs[s].dr * R;
                            }
                            // Then advance within the side
                            q += dirs[side].dq * step;
                            r += dirs[side].dr * step;

                            // Convert axial coords to pixel offsets on a triangular lattice rotated so
                            // the first point of each ring is 60° from vertical.
                            // Basis vectors (in pixels):
                            //   e_q = (D*sqrt(3)/2, -D/2)
                            //   e_r = (D*sqrt(3)/2,  D/2)
                            var sqrt3over2 = Math.sqrt(3) / 2;
                            testX = (q + r) * D * sqrt3over2 * overlapFactor;
                            testY = (-q + r) * (D / 2) * overlapFactor;
                        }

                        // Convert the calculated pixel back to GPS coordinates
                        var targetPixel = L.point(originPixel.x + testX, originPixel.y + testY);
                        var newLatLng = map.unproject(targetPixel, effectiveZoom);
                        finalLat = newLatLng.lat;
                        finalLng = newLatLng.lng;
                    } else {
                        finalLat = item.originalLat;
                        finalLng = item.originalLng;
                    }

                    var url_name = slugify(f.name);
                    var img = "/images/fellow/" + url_name + ".jpg";
                    var p_url = "/fellow/" + url_name;
                    var c_url = "https://www.nhsfellowship.ai/fellows/?cohort=" + f.cohort;

                    var faceIcon = L.divIcon({
                        className: 'custom-face-icon',
                        html: `<img src="${img}" class="map-pin-face" title="${f.name}" onerror="this.src='/images/default-avatar.jpg'">`,
                        iconSize: [70, 70],
                        iconAnchor: [35, 35],
                        popupAnchor: [0, -35]
                    });

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