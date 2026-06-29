(() => {
    const button = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('mobile-navigation');

    if (!button || !navigation) {
        return;
    }

    const setMenuState = (open) => {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navigation.hidden = !open;
    };

    button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    navigation.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            setMenuState(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
        }
    });
})();
