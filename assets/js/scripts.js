var body = document.querySelector('body')
var menuTrigger = document.querySelector('#toggle-main-menu-mobile');
var menuContainer = document.querySelector('#main-menu-mobile');

menuTrigger.onclick = function() {
    menuContainer.classList.toggle('open');
    menuTrigger.classList.toggle('is-active')
    body.classList.toggle('lock-scroll')
}

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
