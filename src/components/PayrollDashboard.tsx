'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  DollarSign, 
  Play, 
  CheckCircle, 
  XCircle, 
  Loader, 
  Wallet,
  ExternalLink,
  Edit,
  Save,
  X
} from 'lucide-react';

interface Employee {
  id: number;
  name: string;
  address: string;
  salary: number;
  department: string;
  position: string;
}

interface PaymentResult {
  employeeId: number;
  transactionHash: string;
  amount: string;
  success: boolean;
  error?: string;
}

interface PayrollData {
  employees: number;
  totalPayroll: string;
  payrollAccount: string;
  employees_data: Employee[];
}

interface BalanceData {
  balance: string;
  success: boolean;
  error?: string;
}

export default function PayrollDashboard() {
  const [payrollData, setPayrollData] = useState<PayrollData | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentResults, setPaymentResults] = useState<PaymentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSalary, setEditingSalary] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [lastBalanceUpdate, setLastBalanceUpdate] = useState<Date | null>(null);

  useEffect(() => {
    fetchPayrollData();
    fetchBalance();
  }, []);

  const fetchPayrollData = async () => {
    try {
      const response = await fetch('/api/payroll');
      const data = await response.json();
      if (data.success) {
        setPayrollData(data);
        setSelectedEmployees(data.employees_data.map((emp: Employee) => emp.id));
      }
    } catch (error) {
      console.error('Failed to fetch payroll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBalance = async () => {
    setBalanceLoading(true);
    try {
      // Add timestamp to force fresh data fetch and bypass any caching
      const timestamp = Date.now();
      const response = await fetch(`/api/payroll/balance?t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const data = await response.json();
      setBalanceData(data);
      setLastBalanceUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceData({ balance: '0', success: false, error: 'Failed to fetch balance' });
    } finally {
      setBalanceLoading(false);
    }
  };

  const processPayroll = async (action: 'pay-all' | 'pay-selected') => {
    setIsProcessing(true);
    setPaymentResults([]);
    
    try {
      const response = await fetch('/api/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          employeeIds: action === 'pay-selected' ? selectedEmployees : undefined,
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setPaymentResults(result.results);
        // Refresh balance after successful payments to show updated balance
        await fetchBalance();
      } else {
        console.error('Payroll processing failed:', result.error);
      }
    } catch (error) {
      console.error('Failed to process payroll:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleEmployee = (employeeId: number) => {
    setSelectedEmployees(prev => 
      prev.includes(employeeId) 
        ? prev.filter(id => id !== employeeId)
        : [...prev, employeeId]
    );
  };

  const toggleAll = () => {
    if (!payrollData) return;
    
    setSelectedEmployees(prev => 
      prev.length === payrollData.employees_data.length 
        ? [] 
        : payrollData.employees_data.map(emp => emp.id)
    );
  };

  const startEditingSalary = (employeeId: number, currentSalary: number) => {
    setEditingSalary(employeeId);
    setEditingValue(currentSalary.toString());
  };

  const cancelEditingSalary = () => {
    setEditingSalary(null);
    setEditingValue('');
  };

  const saveSalary = (employeeId: number) => {
    const newSalary = parseFloat(editingValue);
    if (isNaN(newSalary) || newSalary < 0) {
      alert('Please enter a valid salary amount');
      return;
    }

    if (payrollData) {
      const updatedEmployees = payrollData.employees_data.map(emp => 
        emp.id === employeeId ? { ...emp, salary: newSalary } : emp
      );
      
      const newTotalPayroll = updatedEmployees.reduce((sum, emp) => sum + emp.salary, 0);
      
      setPayrollData({
        ...payrollData,
        employees_data: updatedEmployees,
        totalPayroll: newTotalPayroll.toString()
      });
    }
    
    setEditingSalary(null);
    setEditingValue('');
  };

  const handleSalaryKeyPress = (e: React.KeyboardEvent, employeeId: number) => {
    if (e.key === 'Enter') {
      saveSalary(employeeId);
    } else if (e.key === 'Escape') {
      cancelEditingSalary();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="animate-spin h-8 w-8 text-blue-600" />
        <span className="ml-2 text-lg">Loading payroll data...</span>
      </div>
    );
  }

  if (!payrollData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Payroll Data</h2>
          <button 
            onClick={fetchPayrollData}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedEmployeeData = payrollData.employees_data.filter(emp => 
    selectedEmployees.includes(emp.id)
  );
  const totalSelectedPayroll = selectedEmployeeData.reduce((sum, emp) => sum + emp.salary, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Smart Payroll Dashboard</h1>
          <p className="mt-2 text-gray-600">Automated USDC payroll supported by CDP Server Wallet</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Employees</p>
                <p className="text-2xl font-bold text-gray-900">{payrollData.employees}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payroll</p>
                <p className="text-2xl font-bold text-gray-900">{parseFloat(payrollData.totalPayroll).toFixed(3)} USDC</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selected</p>
                <p className="text-2xl font-bold text-gray-900">{selectedEmployees.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Wallet className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Selected Total</p>
                <p className="text-2xl font-bold text-gray-900">{totalSelectedPayroll.toFixed(3)} USDC</p>
              </div>
            </div>
          </div>
        </div>

        {/* Payroll Account */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="mb-6">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Payroll Account</h3>
                <div className="flex-1 flex justify-center">
                  <div className="flex items-center space-x-3 ml-[220px]">
                    <h3 className="text-lg font-medium text-gray-900">Balance</h3>
                    <button
                      onClick={fetchBalance}
                      disabled={balanceLoading}
                      className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                      title="Refresh balance"
                    >
                      <Loader className={`h-4 w-4 ${balanceLoading ? 'animate-spin' : ''}`} />
                    </button>
                    {lastBalanceUpdate && (
                      <span className="text-xs text-gray-500">
                        Last updated: {lastBalanceUpdate.toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-32"></div>
              </div>
            </div>
            <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
              <div className="flex items-center">
                <Wallet className="h-5 w-5 text-gray-400 mr-3" />
                <span className="font-mono text-sm text-gray-600">{payrollData.payrollAccount}</span>
              </div>
              <div className="flex-1 flex justify-center">
                <span className="font-mono text-sm text-gray-600">
                  {balanceLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-4 w-4 text-gray-400 mr-2" />
                      Refreshing...
                    </span>
                  ) : balanceData?.success ? (
                    `${parseFloat(balanceData.balance).toFixed(3)} USDC`
                  ) : (
                    <span className="text-red-600">Failed to load balance</span>
                  )}
                </span>
              </div>
              <div className="flex items-center">
                <a 
                  href={`https://sepolia.basescan.org/address/${payrollData.payrollAccount}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-blue-600 hover:text-blue-800 hover:underline"
                >
                  View on BaseScan <ExternalLink className="h-4 w-4 ml-1" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => processPayroll('pay-all')}
              disabled={isProcessing}
              className="flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              Pay All Employees ({parseFloat(payrollData.totalPayroll).toFixed(3)} USDC)
            </button>

            <button
              onClick={() => processPayroll('pay-selected')}
              disabled={isProcessing || selectedEmployees.length === 0}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <Loader className="animate-spin h-5 w-5 mr-2" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              Pay Selected ({selectedEmployees.length}) - {totalSelectedPayroll.toFixed(3)} USDC
            </button>

            <button
              onClick={toggleAll}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
            >
              {selectedEmployees.length === payrollData.employees_data.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Payment Results */}
        {paymentResults.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Results</h3>
            <div className="space-y-2">
              {paymentResults.map((result, index) => {
                const employee = payrollData.employees_data.find(emp => emp.id === result.employeeId);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex items-center">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500 mr-3" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500 mr-3" />
                      )}
                      <div>
                        <p className="font-medium">{employee?.name}</p>
                        <p className="text-sm text-gray-600">{parseFloat(result.amount).toFixed(3)} USDC</p>
                        {result.error && <p className="text-sm text-red-600">{result.error}</p>}
                      </div>
                    </div>
                    {result.success && result.transactionHash && (
                      <a 
                        href={`https://sepolia.basescan.org/tx/${result.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        View Tx <ExternalLink className="h-4 w-4 ml-1" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Employee List */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Employee List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.length === payrollData.employees_data.length}
                      onChange={toggleAll}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Salary (USDC)
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payrollData.employees_data.map((employee) => (
                  <tr key={employee.id} className={`group ${selectedEmployees.includes(employee.id) ? 'bg-blue-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.includes(employee.id)}
                        onChange={() => toggleEmployee(employee.id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{employee.position}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        {employee.department}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-500">
                        {`${employee.address.slice(0, 8)}...${employee.address.slice(-6)}`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {editingSalary === employee.id ? (
                          <>
                            <input
                              type="number"
                              step="0.001"
                              min="0"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              onKeyDown={(e) => handleSalaryKeyPress(e, employee.id)}
                              className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              autoFocus
                            />
                            <button
                              onClick={() => saveSalary(employee.id)}
                              className="p-1 text-green-600 hover:text-green-800"
                              title="Save"
                            >
                              <Save className="h-4 w-4" />
                            </button>
                            <button
                              onClick={cancelEditingSalary}
                              className="p-1 text-red-600 hover:text-red-800"
                              title="Cancel"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-900">{employee.salary.toFixed(3)}</span>
                            <button
                              onClick={() => startEditingSalary(employee.id, employee.salary)}
                              className="p-1 text-gray-400 hover:text-gray-600"
                              title="Edit salary"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}