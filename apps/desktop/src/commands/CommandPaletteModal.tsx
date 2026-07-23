import { FC, useState, useEffect, useRef } from 'react';
import { CommandRegistry } from './CommandRegistry';
import { CommandDispatcher } from './CommandDispatcher';
import { registerDefaultCommands } from './defaultCommands';
import { CommandSearchResult } from './commandTypes';
import { useCan } from '../app/providers/PermissionProvider';
import { Search, Command as CmdIcon, Star, ArrowRight, CornerDownLeft } from 'lucide-react';

export const CommandPaletteModal: FC = () => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const canFn = useCan;

  // Register commands on initial mount
  useEffect(() => {
    registerDefaultCommands();
  }, []);

  // Keyboard shortcut listener for ⌘K / Ctrl+K and sd:open-palette custom event
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    const handleCustomOpen = () => {
      setIsOpen(true);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('sd:open-palette', handleCustomOpen);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('sd:open-palette', handleCustomOpen);
    };
  }, [isOpen]);

  // Auto focus search input when palette opens
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const registry = CommandRegistry.getInstance();
  const dispatcher = CommandDispatcher.getInstance();
  const searchResults: CommandSearchResult[] = registry.search(query, canFn);

  const handleExecute = (commandId: string) => {
    dispatcher.dispatch(commandId);
    setIsOpen(false);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (searchResults.length > 0 ? (prev + 1) % searchResults.length : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (searchResults.length > 0 ? (prev - 1 + searchResults.length) % searchResults.length : 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleExecute(searchResults[selectedIndex].command.id);
      }
    }
  };

  return (
    <div
      onClick={() => setIsOpen(false)}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '10vh',
        pointerEvents: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '640px',
          backgroundColor: 'var(--sd-color-bg-surface-raised)',
          border: '1px solid var(--sd-color-border)',
          borderRadius: 'var(--sd-radius-xl)',
          boxShadow: 'var(--sd-shadow-2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        {/* Search Header Input */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sd-space-3)',
            padding: 'var(--sd-space-4)',
            borderBottom: '1px solid var(--sd-color-border)',
          }}
        >
          <Search size={20} style={{ color: 'var(--sd-color-primary)' }} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder="Type a command or search..."
            style={{
              flex: 1,
              background: 'none',
              border: 'none',
              outline: 'none',
              fontSize: 'var(--sd-font-size-md)',
              color: 'var(--sd-color-text)',
              fontFamily: 'var(--sd-font-sans)',
            }}
          />
          <kbd
            style={{
              padding: '2px 6px',
              borderRadius: 'var(--sd-radius-sm)',
              backgroundColor: 'var(--sd-color-bg-inset)',
              fontSize: '11px',
              color: 'var(--sd-color-text-muted)',
              fontFamily: 'var(--sd-font-mono)',
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command Results List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--sd-space-2)' }}>
          {searchResults.length === 0 ? (
            <div style={{ padding: 'var(--sd-space-6)', textAlign: 'center', color: 'var(--sd-color-text-muted)', fontSize: 'var(--sd-font-size-sm)' }}>
              No commands found matching "{query}"
            </div>
          ) : (
            searchResults.map((res, index) => {
              const cmd = res.command;
              const isSelected = index === selectedIndex;
              const isFav = dispatcher.isFavorite(cmd.id);

              return (
                <div
                  key={cmd.id}
                  onClick={() => handleExecute(cmd.id)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--sd-space-3) var(--sd-space-4)',
                    borderRadius: 'var(--sd-radius-md)',
                    backgroundColor: isSelected ? 'var(--sd-color-selection)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background var(--sd-motion-fast) var(--sd-ease-standard)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)' }}>
                    <CmdIcon size={16} style={{ color: isSelected ? 'var(--sd-color-primary)' : 'var(--sd-color-text-subtle)' }} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        style={{
                          fontSize: 'var(--sd-font-size-sm)',
                          fontWeight: isSelected ? 'var(--sd-font-weight-semibold)' : 'var(--sd-font-weight-medium)',
                          color: isSelected ? 'var(--sd-color-primary)' : 'var(--sd-color-text)',
                        }}
                      >
                        {cmd.title}
                      </span>
                      {cmd.subtitle && (
                        <span style={{ fontSize: 'var(--sd-font-size-xs)', color: 'var(--sd-color-text-muted)' }}>
                          {cmd.subtitle}
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sd-space-3)' }}>
                    {cmd.shortcut && (
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--sd-font-mono)',
                          padding: '2px 6px',
                          borderRadius: 'var(--sd-radius-sm)',
                          backgroundColor: 'var(--sd-color-bg-inset)',
                          color: 'var(--sd-color-text-muted)',
                        }}
                      >
                        {cmd.shortcut}
                      </span>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        dispatcher.toggleFavorite(cmd.id);
                      }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: isFav ? 'var(--sd-status-warning)' : 'var(--sd-color-text-subtle)', padding: 0 }}
                      title="Favorite"
                    >
                      <Star size={14} fill={isFav ? 'currentColor' : 'none'} />
                    </button>

                    {isSelected && <CornerDownLeft size={14} style={{ color: 'var(--sd-color-primary)' }} />}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer Hints */}
        <div
          style={{
            padding: 'var(--sd-space-2) var(--sd-space-4)',
            backgroundColor: 'var(--sd-color-bg-inset)',
            borderTop: '1px solid var(--sd-color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: 'var(--sd-font-size-xs)',
            color: 'var(--sd-color-text-muted)',
          }}
        >
          <span>Use ↑↓ to navigate, Enter to select</span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            Sidra Command Dispatcher <ArrowRight size={10} />
          </span>
        </div>
      </div>
    </div>
  );
};
