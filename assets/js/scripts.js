var body = document.querySelector('body')
var menuTrigger = document.querySelector('#toggle-main-menu-mobile');
var menuContainer = document.querySelector('#main-menu-mobile');

menuTrigger.onclick = function() {
    menuContainer.classList.toggle('open');
    menuTrigger.classList.toggle('is-active')
    body.classList.toggle('lock-scroll')
}

// Click-to-load YouTube embeds (_includes/youtube.html): nothing is requested
// from YouTube until the viewer chooses to play the video.
document.querySelectorAll('.video-embed').forEach(function(embed) {
    embed.querySelector('.video-embed-play').onclick = function() {
        var iframe = document.createElement('iframe');
        iframe.src = 'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(embed.dataset.youtubeId) + '?autoplay=1';
        iframe.title = embed.dataset.youtubeTitle;
        iframe.allow = 'autoplay; picture-in-picture; fullscreen';
        iframe.allowFullscreen = true;
        embed.querySelector('.video-embed-frame').replaceChildren(iframe);
        iframe.focus();
    }
});
