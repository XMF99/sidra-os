"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
(0, vitest_1.describe)('@sidra/ui design system platform exports', () => {
    (0, vitest_1.it)('exports core layout, typography, and interactive components', async () => {
        const UIExports = await import('./index.js');
        (0, vitest_1.expect)(UIExports.Box).toBeDefined();
        (0, vitest_1.expect)(UIExports.Stack).toBeDefined();
        (0, vitest_1.expect)(UIExports.Grid).toBeDefined();
        (0, vitest_1.expect)(UIExports.Divider).toBeDefined();
        (0, vitest_1.expect)(UIExports.Heading).toBeDefined();
        (0, vitest_1.expect)(UIExports.Text).toBeDefined();
        (0, vitest_1.expect)(UIExports.Button).toBeDefined();
        (0, vitest_1.expect)(UIExports.TextInput).toBeDefined();
        (0, vitest_1.expect)(UIExports.Switch).toBeDefined();
        (0, vitest_1.expect)(UIExports.Alert).toBeDefined();
        (0, vitest_1.expect)(UIExports.KPICard).toBeDefined();
        (0, vitest_1.expect)(UIExports.StatusBadge).toBeDefined();
        (0, vitest_1.expect)(UIExports.ChatBubble).toBeDefined();
        (0, vitest_1.expect)(UIExports.ThinkingIndicator).toBeDefined();
        (0, vitest_1.expect)(UIExports.Sparkline).toBeDefined();
        (0, vitest_1.expect)(UIExports.BarChart).toBeDefined();
        (0, vitest_1.expect)(UIExports.Icon).toBeDefined();
    });
});
//# sourceMappingURL=index.test.js.map