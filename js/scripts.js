(() => {
    const button = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('mobile-navigation');

    if (!button || !navigation) {
        return;
    }

    const setMenuState = (open) => {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navigation.classList.toggle('is-open', open);
        navigation.setAttribute('aria-hidden', String(!open));
    };

    setMenuState(false);

    button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    // Do not hide the mobile menu when a navigation link is tapped.
    // On a static multi-page site, closing the overlay before the browser
    // navigates briefly reveals the old page underneath, which reads as a
    // mobile page-load stutter. Let the next document replace this one.

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });

    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            setMenuState(false);
        }
    });
})();
