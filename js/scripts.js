(() => {
    const button = document.querySelector('.menu-toggle');
    const navigation = document.getElementById('mobile-navigation');
    const masthead = document.querySelector('.mobile-masthead');

    if (!button || !navigation || !masthead) {
        return;
    }

    let isMenuOpen = false;
    let lastTouchY = 0;

    const setMenuGeometry = () => {
        const rect = masthead.getBoundingClientRect();
        const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
        const top = Math.max(0, rect.bottom + 6);
        const availableHeight = Math.max(160, viewportHeight - top - 16);

        document.documentElement.style.setProperty('--mobile-nav-top', `${top}px`);
        document.documentElement.style.setProperty('--mobile-nav-max-height', `${availableHeight}px`);
    };

    const canScrollNavigation = (deltaY) => {
        const maxScrollTop = navigation.scrollHeight - navigation.clientHeight;

        if (maxScrollTop <= 0) {
            return false;
        }

        if (deltaY < 0) {
            return navigation.scrollTop > 0;
        }

        if (deltaY > 0) {
            return navigation.scrollTop < maxScrollTop - 1;
        }

        return false;
    };

    const preventBackgroundWheelScroll = (event) => {
        if (!isMenuOpen) {
            return;
        }

        if (!navigation.contains(event.target)) {
            event.preventDefault();
            return;
        }

        if (!canScrollNavigation(event.deltaY)) {
            event.preventDefault();
        }
    };

    const recordTouchPosition = (event) => {
        if (!isMenuOpen || event.touches.length !== 1) {
            return;
        }

        lastTouchY = event.touches[0].clientY;
    };

    const preventBackgroundTouchScroll = (event) => {
        if (!isMenuOpen || event.touches.length !== 1) {
            return;
        }

        if (!navigation.contains(event.target)) {
            event.preventDefault();
            lastTouchY = event.touches[0].clientY;
            return;
        }

        const currentTouchY = event.touches[0].clientY;
        const deltaY = lastTouchY - currentTouchY;
        lastTouchY = currentTouchY;

        if (!canScrollNavigation(deltaY)) {
            event.preventDefault();
        }
    };

    const setMenuState = (open) => {
        if (open === isMenuOpen) {
            return;
        }

        isMenuOpen = open;
        button.setAttribute('aria-expanded', String(open));
        button.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        navigation.classList.toggle('is-open', open);
        navigation.setAttribute('aria-hidden', String(!open));
        document.documentElement.classList.toggle('mobile-menu-open', open);

        if (open) {
            setMenuGeometry();
        } else {
            document.documentElement.style.removeProperty('--mobile-nav-top');
            document.documentElement.style.removeProperty('--mobile-nav-max-height');
        }
    };

    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open menu');
    navigation.classList.remove('is-open');
    navigation.setAttribute('aria-hidden', 'true');

    button.addEventListener('click', () => {
        const isOpen = button.getAttribute('aria-expanded') === 'true';
        setMenuState(!isOpen);
    });

    // Do not hide the mobile menu when a navigation link is tapped.
    // On a static multi-page site, closing the overlay before the browser
    // navigates briefly reveals the old page underneath, which reads as a
    // mobile page-load stutter. Let the next document replace this one.

    document.addEventListener('touchstart', recordTouchPosition, { passive: true, capture: true });
    document.addEventListener('touchmove', preventBackgroundTouchScroll, { passive: false, capture: true });
    document.addEventListener('wheel', preventBackgroundWheelScroll, { passive: false, capture: true });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            setMenuState(false);
            button.focus();
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
        } else if (isMenuOpen) {
            setMenuGeometry();
        }
    });

    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (isMenuOpen) {
                setMenuGeometry();
            }
        });
    }
})();
