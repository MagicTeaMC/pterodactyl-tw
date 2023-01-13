import type { ReactNode } from 'react';

import { ServerError } from '@/components/elements/ScreenBlock';
import { usePermissions } from '@/plugins/usePermissions';

interface Props {
    children?: ReactNode;

    permission?: string | string[];
}

function PermissionRoute({ children, permission }: Props): JSX.Element {
    if (permission === undefined) {
        return <>{children}</>;
    }

    const can = usePermissions(permission);

    if (can.filter(p => p).length > 0) {
        return <>{children}</>;
    }

    return <ServerError title="拒絕訪問" message="您無權訪問此頁面。" />;
}

export default PermissionRoute;
