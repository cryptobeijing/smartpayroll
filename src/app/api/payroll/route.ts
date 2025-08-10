import { NextRequest, NextResponse } from 'next/server';
import { PayrollService, Employee } from '@/lib/payroll';
import employees from '../../../../data/employees.json';

const payrollService = new PayrollService('0x549FE250ba5C12633Dc87ec7e2Ed013C3562F412');

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, employeeIds } = body;

    if (action === 'pay-all') {
      // Pay all employees
      const results = await payrollService.payAllEmployees(employees);
      
      return NextResponse.json({
        success: true,
        message: `Payroll processed for ${employees.length} employees`,
        results,
        totalAmount: employees.reduce((sum, emp) => sum + emp.salary, 0).toFixed(6),
      });
    } 
    
    if (action === 'pay-selected' && employeeIds) {
      // Pay selected employees
      const selectedEmployees = employees.filter(emp => employeeIds.includes(emp.id));
      const results = await payrollService.payAllEmployees(selectedEmployees);
      
      return NextResponse.json({
        success: true,
        message: `Payroll processed for ${selectedEmployees.length} selected employees`,
        results,
        totalAmount: selectedEmployees.reduce((sum, emp) => sum + emp.salary, 0).toFixed(6),
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid action or missing parameters',
    }, { status: 400 });

  } catch (error) {
    console.error('Payroll API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Initialize payroll service and get account info
    await payrollService.initialize();
    const accountAddress = payrollService.getAccountAddress();
    
    return NextResponse.json({
      success: true,
      employees: employees.length,
      totalPayroll: employees.reduce((sum, emp) => sum + emp.salary, 0).toFixed(6),
      payrollAccount: accountAddress,
      employees_data: employees,
    });
  } catch (error) {
    console.error('Payroll GET API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to initialize payroll service',
    }, { status: 500 });
  }
}