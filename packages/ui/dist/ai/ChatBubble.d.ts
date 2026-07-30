import { FC, ReactNode } from 'react';
export interface ChatBubbleProps {
    role: 'user' | 'assistant' | 'system';
    content: string | ReactNode;
    timestamp?: string;
    senderName?: string;
}
export declare const ChatBubble: FC<ChatBubbleProps>;
//# sourceMappingURL=ChatBubble.d.ts.map