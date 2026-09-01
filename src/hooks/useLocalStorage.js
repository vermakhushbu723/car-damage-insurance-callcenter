import { useCallback, useState } from 'react';

/**
 * useState that survives a reload.
 * Reads/writes are guarded so a blocked storage never breaks the UI.
 */
export default function useLocalStorage(key, initialValue) {
    const [value, setValue] = useState(() => {
        try {
            const stored = window.localStorage.getItem(key);
            return stored === null ? initialValue : JSON.parse(stored);
        } catch {
            return initialValue;
        }
    });

    const set = useCallback(
        (next) => {
            setValue((prev) => {
                const resolved = typeof next === 'function' ? next(prev) : next;
                try {
                    window.localStorage.setItem(key, JSON.stringify(resolved));
                } catch {
                    /* storage unavailable – keep the value in memory only */
                }
                return resolved;
            });
        },
        [key]
    );

    return [value, set];
}
