import { describe, it, expect } from 'vitest';

describe('@sidra/ui design system platform exports', () => {
  it('exports core layout, typography, and interactive components', async () => {
    const UIExports = await import('./index.js');
    expect(UIExports.Box).toBeDefined();
    expect(UIExports.Stack).toBeDefined();
    expect(UIExports.Grid).toBeDefined();
    expect(UIExports.Divider).toBeDefined();
    expect(UIExports.Heading).toBeDefined();
    expect(UIExports.Text).toBeDefined();
    expect(UIExports.Button).toBeDefined();
    expect(UIExports.TextInput).toBeDefined();
    expect(UIExports.Switch).toBeDefined();
    expect(UIExports.Alert).toBeDefined();
    expect(UIExports.KPICard).toBeDefined();
    expect(UIExports.StatusBadge).toBeDefined();
    expect(UIExports.ChatBubble).toBeDefined();
    expect(UIExports.ThinkingIndicator).toBeDefined();
    expect(UIExports.Sparkline).toBeDefined();
    expect(UIExports.BarChart).toBeDefined();
    expect(UIExports.Icon).toBeDefined();
  });
});
