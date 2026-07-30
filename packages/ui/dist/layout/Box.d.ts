import { FC, ReactNode, CSSProperties, ElementType } from 'react';
export interface BoxProps {
    as?: ElementType;
    padding?: string | number;
    margin?: string | number;
    bg?: string;
    color?: string;
    border?: string;
    borderRadius?: string | number;
    className?: string;
    style?: CSSProperties;
    children?: ReactNode;
}
export declare const Box: FC<BoxProps>;
//# sourceMappingURL=Box.d.ts.map