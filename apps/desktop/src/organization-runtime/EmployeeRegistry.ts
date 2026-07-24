import { Employee } from './types';

export class EmployeeRegistry {
  private static instance: EmployeeRegistry;
  private employees = new Map<string, Employee>();

  private constructor() {
    this.registerDefaultEmployees();
  }

  public static getInstance(): EmployeeRegistry {
    if (!EmployeeRegistry.instance) {
      EmployeeRegistry.instance = new EmployeeRegistry();
    }
    return EmployeeRegistry.instance;
  }

  private registerDefaultEmployees(): void {
    const ceo: Employee = {
      id: 'emp_01',
      name: 'Sarah Connor',
      position: 'Chief Executive Officer',
      departmentId: 'dept_eng',
      reports: ['emp_02'],
      skills: ['Leadership', 'Strategy'],
      availability: 'available',
      status: 'active',
    };
    const director: Employee = {
      id: 'emp_02',
      name: 'Alex Mercer',
      position: 'Engineering Director',
      departmentId: 'dept_eng',
      managerId: 'emp_01',
      reports: [],
      skills: ['AI Architecture', 'Security'],
      availability: 'available',
      status: 'active',
    };

    [ceo, director].forEach((e) => this.register(e));
  }

  public register(emp: Employee): void {
    this.employees.set(emp.id, emp);
  }

  public get(id: string): Employee | undefined {
    return this.employees.get(id);
  }

  public getByDepartment(deptId: string): Employee[] {
    return Array.from(this.employees.values()).filter((e) => e.departmentId === deptId);
  }
}
