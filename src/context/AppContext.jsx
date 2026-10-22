import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { api } from '../api/client.js';
import { can as canDo, getUser, onSessionChange } from '../auth/session.js';

/**
 * Two pieces of app-wide state:
 *  - the signed-in user (role + permissions from the Admin portal);
 *  - the "active claim" every claim screen works on. It is chosen on the
 *    dashboard (or by ?claim=ID in the URL) and remembered for the next visit.
 */
const AppContext = createContext(null);
const ACTIVE_KEY = 'cc-active-claim';

const readActive = () => {
    try {
        return localStorage.getItem(ACTIVE_KEY) || null;
    } catch {
        return null;
    }
};

export function AppProvider({ children }) {
    const [user, setUser] = useState(getUser);
    const [params] = useSearchParams();
    const [claimId, setClaimId] = useState(() => params.get('claim') || readActive());
    const [claim, setClaim] = useState(null);
    const [claimError, setClaimError] = useState(null);
    const [loading, setLoading] = useState(false);

    // The claim id the latest request is for: an older, slower response must not win.
    const latest = useRef(claimId);
    latest.current = claimId;

    useEffect(() => onSessionChange(setUser), []);

    // ?claim=ID in a shared link wins over the remembered claim.
    const fromUrl = params.get('claim');
    useEffect(() => {
        if (fromUrl && fromUrl !== claimId) setClaimId(fromUrl);
    }, [fromUrl]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        try {
            if (claimId) localStorage.setItem(ACTIVE_KEY, claimId);
            else localStorage.removeItem(ACTIVE_KEY);
        } catch {
            /* storage blocked */
        }
    }, [claimId]);

    const reload = useCallback(async () => {
        if (!claimId || !user) {
            setClaim(null);
            return null;
        }
        setLoading(true);
        try {
            const data = await api.get(`/claims/${encodeURIComponent(claimId)}`);
            if (latest.current !== claimId) return null;
            setClaim(data);
            setClaimError(null);
            return data;
        } catch (err) {
            if (latest.current !== claimId) return null;
            setClaim(null);
            setClaimError(err.message);
            if (err.status === 404) setClaimId(null);
            return null;
        } finally {
            setLoading(false);
        }
    }, [claimId, user]);

    useEffect(() => {
        reload();
    }, [reload]);

    const value = useMemo(
        () => ({
            user,
            can: (module, action) => canDo(user, module, action),
            claimId,
            claim,
            claimError,
            claimLoading: loading,
            reloadClaim: reload,
            /** Make `id` the active claim (or `data` when the caller already has it). */
            selectClaim: (id, data) => {
                setClaimId(id);
                if (data) setClaim(data);
            },
            setClaim,
        }),
        [user, claimId, claim, claimError, loading, reload]
    );

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useAppState = () => useContext(AppContext);
