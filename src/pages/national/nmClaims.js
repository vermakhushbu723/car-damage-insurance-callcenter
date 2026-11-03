import { useNavigate } from 'react-router-dom';

import { STAGE_ROUTES } from '../../components/claim/ClaimShell.jsx';
import ROUTES from '../../constants/routes.js';
import { useAppState } from '../../context/AppContext.jsx';

export { fmtDate } from '../../utils/format.js';

/** Opens a claim on the screen of its next step, like the other dashboards do. */
export function useOpenClaim() {
    const navigate = useNavigate();
    const { selectClaim } = useAppState();
    return (row) => {
        selectClaim(row.id);
        navigate(STAGE_ROUTES[row.stage] ?? ROUTES.claimDetails);
    };
}

/** Time the claim has been open: "5hrs", "10mnt", "3days". */
export const tatSince = (iso) => {
    if (!iso) return '—';
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (Number.isNaN(mins) || mins < 0) return '—';
    if (mins < 60) return `${mins}mnt`;
    if (mins < 2880) return `${Math.floor(mins / 60)}hrs`;
    return `${Math.floor(mins / 1440)}days`;
};
