import { createContext, useContext, useEffect, useState, FC, ReactNode } from 'react';

export interface ShortcutItem {
  keyCombo: string;
  description: string;
  category: 'global' | 'navigation' | 'action';
  action: () => void;
}

interface ShortcutRegistryContextType {
  shortcuts: ShortcutItem[];
  registerShortcut: (shortcut: ShortcutItem) => () => void;
  unregisterShortcut: (keyCombo: string) => void;
}

const ShortcutRegistryContext = createContext<ShortcutRegistryContextType>({
  shortcuts: [],
  registerShortcut: () => () => {},
  unregisterShortcut: () => {},
});

export const useShortcutRegistry = (): ShortcutRegistryContextType => useContext(ShortcutRegistryContext);

interface Props {
  children: ReactNode;
}

export const ShortcutRegistryProvider: FC<Props> = ({ children }) => {
  const [shortcuts, setShortcuts] = useState<ShortcutItem[]>([]);

  const registerShortcut = (item: ShortcutItem): (() => void) => {
    setShortcuts((prev) => [...prev.filter((s) => s.keyCombo !== item.keyCombo), item]);
    return () => unregisterShortcut(item.keyCombo);
  };

  const unregisterShortcut = (keyCombo: string): void => {
    setShortcuts((prev) => prev.filter((s) => s.keyCombo !== keyCombo));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger when typing in inputs/textareas
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) {
        return;
      }

      let keyCombo = '';
      if (e.ctrlKey || e.metaKey) keyCombo += '⌘';
      if (e.shiftKey) keyCombo += '⇧';
      if (e.altKey) keyCombo += '⌥';

      const keyName = e.key.toUpperCase();
      if (keyName !== 'CONTROL' && keyName !== 'SHIFT' && keyName !== 'ALT' && keyName !== 'META') {
        keyCombo += keyName;
      }

      const matched = shortcuts.find((s) => s.keyCombo === keyCombo);
      if (matched) {
        e.preventDefault();
        matched.action();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);

  return (
    <ShortcutRegistryContext.Provider
      value={{
        shortcuts,
        registerShortcut,
        unregisterShortcut,
      }}
    >
      {children}
    </ShortcutRegistryContext.Provider>
  );
};
