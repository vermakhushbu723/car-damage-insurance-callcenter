import { useEffect, useState } from 'react';

/** Subscribe to a CSS media query from React. */
export function useMediaQuery(query) {
    const [matches, setMatches] = useState(
        () => typeof window !== 'undefined' && window.matchMedia(query).matches
    );

    useEffect(() => {
        const mql = window.matchMedia(query);
        const onChange = (event) => setMatches(event.matches);
        setMatches(mql.matches);
        mql.addEventListener('change', onChange);
        return () => mql.removeEventListener('change', onChange);
    }, [query]);

    return matches;
}

/** Tailwind-aligned breakpoints so JS and CSS agree. */
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1280px)');

export default useMediaQuery;
