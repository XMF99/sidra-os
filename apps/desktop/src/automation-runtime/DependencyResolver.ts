import { Automation } from './types';

export class DependencyResolver {
  public static resolveExecutionOrder(automations: Automation[]): Automation[] {
    const map = new Map<string, Automation>();
    automations.forEach((a) => map.set(a.id, a));

    const visited = new Set<string>();
    const inStack = new Set<string>();
    const result: Automation[] = [];

    const visit = (id: string) => {
      if (inStack.has(id)) {
        throw new Error(`Circular dependency detected in automation ID '${id}'`);
      }
      if (!visited.has(id)) {
        inStack.add(id);
        const auto = map.get(id);
        if (auto && auto.dependencies) {
          auto.dependencies.forEach((depId) => {
            if (map.has(depId)) {
              visit(depId);
            }
          });
        }
        inStack.delete(id);
        visited.add(id);
        if (auto) {
          result.push(auto);
        }
      }
    };

    automations.forEach((a) => {
      if (!visited.has(a.id)) {
        visit(a.id);
      }
    });

    return result;
  }
}
