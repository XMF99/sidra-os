import { PromptTemplate, MessagePrompt } from './types';

export class PromptTemplateRegistry {
  private static instance: PromptTemplateRegistry;
  private templates = new Map<string, PromptTemplate>();

  private constructor() {
    this.registerDefaultTemplates();
  }

  public static getInstance(): PromptTemplateRegistry {
    if (!PromptTemplateRegistry.instance) {
      PromptTemplateRegistry.instance = new PromptTemplateRegistry();
    }
    return PromptTemplateRegistry.instance;
  }

  private registerDefaultTemplates(): void {
    this.register({
      id: 'agent.system_directive',
      version: '1.0.0',
      systemMessage: 'You are an autonomous Sidra OS agent. Act in strict accordance with firm security rules and budget ceilings.',
      userMessageTemplate: 'Objective: {{objective}}',
      variables: ['objective'],
    });
  }

  public register(template: PromptTemplate): void {
    this.templates.set(template.id, template);
  }

  public render(templateId: string, variables: Record<string, string>): MessagePrompt[] {
    const template = this.templates.get(templateId);
    if (!template) {
      throw new Error(`Prompt template '${templateId}' not registered.`);
    }

    const messages: MessagePrompt[] = [];

    if (template.systemMessage) {
      messages.push({ role: 'system', content: template.systemMessage });
    }

    if (template.developerMessage) {
      messages.push({ role: 'developer', content: template.developerMessage });
    }

    let userContent = template.userMessageTemplate;
    for (const varName of template.variables) {
      const val = variables[varName] || '';
      userContent = userContent.replace(new RegExp(`{{${varName}}}`, 'g'), val);
    }

    messages.push({ role: 'user', content: userContent });

    return messages;
  }
}
