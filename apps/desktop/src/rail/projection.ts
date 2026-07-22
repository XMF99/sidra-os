// M12 Rail Projection (Read-only UI Org Graph Renderer)
// Ref: STRUCTURE_ARCHITECTURE.md §6, IMPLEMENTATION_PLAN.md T5.2, T5.3

export interface DivisionRailItem {
  id: string;
  name: string;
  keymap: string; // ⌘1 through ⌘8
  executiveAgentId: string;
}

export const EIGHT_DIVISIONS_RAIL: DivisionRailItem[] = [
  { id: "div_core_software", name: "Core Software & Kernel", keymap: "⌘1", executiveAgentId: "agent.software" },
  { id: "div_cybersecurity", name: "Cybersecurity & Defenses", keymap: "⌘2", executiveAgentId: "agent.ciso" },
  { id: "div_ai_research", name: "AI Research & Intelligence", keymap: "⌘3", executiveAgentId: "agent.ai" },
  { id: "div_data_infra", name: "Data Infrastructure & Memory", keymap: "⌘4", executiveAgentId: "agent.data" },
  { id: "div_product_design", name: "Product & Experience Design", keymap: "⌘5", executiveAgentId: "agent.design" },
  { id: "div_business_ops", name: "Business Operations & Strategy", keymap: "⌘6", executiveAgentId: "agent.ops" },
  { id: "div_game_studio", name: "Game Studio & Concourse", keymap: "⌘7", executiveAgentId: "agent.studio" },
  { id: "div_quality_assurance", name: "Quality Assurance & Testing", keymap: "⌘8", executiveAgentId: "agent.qa" },
];

export function getDivisionByKeymap(keymap: string): DivisionRailItem | undefined {
  return EIGHT_DIVISIONS_RAIL.find((d) => d.keymap === keymap);
}
