import { FC, ReactNode, CSSProperties } from 'react';
export interface TextProps {
    size?: 'xs' | 'sm' | 'md' | 'lg';
    weight?: 'regular' | 'medium' | 'semibold' | 'bold';
    color?: 'primary' | 'secondary' | 'muted' | string;
    style?: CSSProperties;
    children?: ReactNode;
}
export declare const Text: FC<TextProps>;
//# sourceMappingURL=Text.d.ts.map