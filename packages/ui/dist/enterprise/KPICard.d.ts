import { FC, ReactNode } from 'react';
export interface KPICardProps {
    title: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: ReactNode;
}
export declare const KPICard: FC<KPICardProps>;
//# sourceMappingURL=KPICard.d.ts.map