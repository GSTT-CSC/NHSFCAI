var body = document.querySelector('body')
var menuTrigger = document.querySelector('#toggle-main-menu-mobile');
var menuContainer = document.querySelector('#main-menu-mobile');

menuTrigger.onclick = function() {
    menuContainer.classList.toggle('open');
    menuTrigger.classList.toggle('is-active')
    body.classList.toggle('lock-scroll')
}

// Click-to-load YouTube embeds (_includes/video-embed.html): nothing is requested
// from YouTube until the viewer chooses to play the video. The explicit
// referrerPolicy keeps the Referer header YouTube needs to verify embeds
// (without it the player shows "Error 153").
document.querySelectorAll('.video-embed').forEach(function(embed) {
    embed.querySelector('.video-embed-play').onclick = function() {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(embed.dataset.youtubeId) + '?autoplay=1';
        iframe.title = embed.dataset.youtubeTitle;
        iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
        iframe.referrerPolicy = 'strict-origin-when-cross-origin';
        iframe.allowFullscreen = true;
        embed.querySelector('.video-embed-frame').replaceChildren(iframe);
        iframe.focus();
    }
});

// Open a collapsed <details> section when a link targets it or something
// inside it, e.g. /apply#nominated-applicants from the sponsor page.
function openLinkedDetails() {
    var id = decodeURIComponent(location.hash.slice(1));
    var target = id && document.getElementById(id);
    if (!target) return;
    for (var el = target; el; el = el.parentElement) {
        if (el.tagName === 'DETAILS') el.open = true;
    }
    target.scrollIntoView();
}

openLinkedDetails();
window.addEventListener('hashchange', openLinkedDetails);
