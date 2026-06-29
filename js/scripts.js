(() => {
    const button = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('mobile-navigation');

    if (!button || !navigation) {
        return;
    }

    let scrollLockY = 0;
    let isScrollLocked = false;

    const lockPageScroll = () => {
        if (isScrollLocked) {
            return;
        }

        scrollLockY = window.scrollY || window.pageYOffset || 0;
        document.documentElement.classList.add('mobile-menu-open');
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollLockY}px`;
        document.body.style.left = '0';
        document.body.style.right = '0';
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
        isScrollLocked = true;
    };

    const unlockPageScroll = () => {
        if (!isScrollLocked) {
            return;
        }

        document.documentElement.classList.remove('mobile-menu-open');
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.right = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        isScrollLocked = false;
        window.scrollTo(0, scrollLockY);
    };

    const setMenuState = (open) => {
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navigation.classList.toggle('is-open', open);
        navigation.setAttribute('aria-hidden', String(!open));

        if (open) {
            lockPageScroll();
        } else {
            unlockPageScroll();
        }
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

    window.addEventListener('resize', () => {
        if (window.matchMedia('(min-width: 801px)').matches) {
            setMenuState(false);
        }
    });
})();
