import React, { useState, useEffect, useMemo } from 'react';
import ExpensesChart from './ExpensesChart';
import { tripsAPI } from '../services/api';

const ExpenseTracker = ({ trip, onUpdateBudget, readOnly = false }) => {
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    title: '',
    amount: '',
    category: 'food',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [showAddForm, setShowAddForm] = useState(false);

  // Expense categories with icons
  const categories = [
    { id: 'food', name: 'Food & Dining', icon: '🍽️', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' },
    { id: 'transport', name: 'Transportation', icon: '🚗', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' },
    { id: 'accommodation', name: 'Accommodation', icon: '🏨', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' },
    { id: 'activities', name: 'Activities', icon: '🎯', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
    { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200' },
    { id: 'health', name: 'Health & Insurance', icon: '🏥', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎪', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200' },
    { id: 'miscellaneous', name: 'Miscellaneous', icon: '📦', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200' }
  ];

  // Load expenses from backend; fall back to itinerary costs
  useEffect(() => {
    (async () => {
      try {
        if (!trip?._id) return;
        const resp = await tripsAPI.getExpenses(trip._id);
        const arr = resp.data.data || [];
        if (arr.length) {
          setExpenses(arr.map(e => ({ id: e._id || `${e.title}-${e.amount}-${e.date}`, ...e })));
        } else if (trip?.itinerary) {
          const itineraryExpenses = trip.itinerary
            .filter(item => item.cost && item.cost > 0)
            .map((item, index) => ({
              id: `itinerary-${index}`,
              title: item.title,
              amount: item.cost,
              category: 'activities',
              date: trip.plannedDates?.startDate ? new Date(trip.plannedDates.startDate) : new Date(),
              notes: item.notes || '',
              isFromItinerary: true
            }));
          setExpenses(itineraryExpenses);
        }
      } catch (_) {
        // ignore
      }
    })();
  }, [trip]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
    const budget = trip?.budget?.totalEstimated || 0;
    const remaining = budget - totalSpent;
    
    const categoryTotals = categories.map(category => {
      const categoryExpenses = expenses.filter(expense => expense.category === category.id);
      const total = categoryExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount || 0), 0);
      return {
        ...category,
        total,
        count: categoryExpenses.length
      };
    }).filter(category => category.total > 0);

    return {
      totalSpent,
      budget,
      remaining,
      categoryTotals,
      percentSpent: budget > 0 ? (totalSpent / budget) * 100 : 0
    };
  }, [expenses, trip, categories]);

  const handleAddExpense = async () => {
    if (!newExpense.title.trim() || !newExpense.amount) return;

    const payload = {
      title: newExpense.title.trim(),
      amount: parseFloat(newExpense.amount),
      category: newExpense.category,
      date: new Date(newExpense.date),
      notes: newExpense.notes
    };

    try {
      if (trip?._id) {
        const resp = await tripsAPI.addExpense(trip._id, payload);
        const arr = resp.data.data || [];
        setExpenses(arr.map(e => ({ id: e._id || `${e.title}-${e.amount}-${e.date}`, ...e })));
      } else {
        setExpenses(prev => [...prev, { id: Date.now().toString(), ...payload }]);
      }
    } catch (_) {}

    setNewExpense({
      title: '',
      amount: '',
      category: 'food',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setShowAddForm(false);
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      if (trip?._id && expenseId) {
        const resp = await tripsAPI.deleteExpense(trip._id, expenseId);
        const arr = resp.data.data || [];
        setExpenses(arr.map(e => ({ id: e._id || `${e.title}-${e.amount}-${e.date}`, ...e })));
      } else {
        setExpenses(prev => prev.filter(expense => expense.id !== expenseId));
      }
    } catch (_) {}
  };

  const handleUpdateBudget = (newBudget) => {
    if (onUpdateBudget) {
      onUpdateBudget({
        ...trip.budget,
        totalEstimated: parseFloat(newBudget) || 0
      });
    }
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || categories[categories.length - 1];
  };

  return (
    <div className="space-y-6">
      {/* Budget Overview */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
            Budget Overview
          </h3>
          {!readOnly && (
            <button
              onClick={() => setShowAddForm(true)}
              className="btn-primary text-sm"
            >
              + Add Expense
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              ${totals.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">Spent</div>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-secondary-900 dark:text-secondary-100">
              ${totals.budget.toLocaleString()}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">Budget</div>
            {!readOnly && (
              <input
                type="number"
                className="mt-1 text-center border-none bg-transparent text-sm"
                placeholder="Update budget"
                onBlur={(e) => e.target.value && handleUpdateBudget(e.target.value)}
              />
            )}
          </div>
          
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              totals.remaining >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              ${Math.abs(totals.remaining).toLocaleString()}
            </div>
            <div className="text-sm text-secondary-600 dark:text-secondary-300">
              {totals.remaining >= 0 ? 'Remaining' : 'Over Budget'}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-secondary-600 dark:text-secondary-300 mb-1">
            <span>Budget Used</span>
            <span>{totals.percentSpent.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-secondary-200 dark:bg-secondary-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-300 ${
                totals.percentSpent > 100
                  ? 'bg-red-500'
                  : totals.percentSpent > 80
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(totals.percentSpent, 100)}%` }}
            />
          </div>
        </div>

        {/* Category Breakdown */}
        {totals.categoryTotals.length > 0 && (
          <div>
            <h4 className="font-medium text-secondary-900 dark:text-secondary-100 mb-3">
              Spending by Category
            </h4>
            <ExpensesChart data={totals.categoryTotals.map(c => ({ label: c.name, value: c.total }))} />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
              {totals.categoryTotals.map((category) => (
                <div
                  key={category.id}
                  className="text-center p-3 rounded-lg bg-secondary-50 dark:bg-secondary-800"
                >
                  <div className="text-xl mb-1">{category.icon}</div>
                  <div className="font-medium text-secondary-900 dark:text-secondary-100">
                    ${category.total.toLocaleString()}
                  </div>
                  <div className="text-xs text-secondary-600 dark:text-secondary-300">
                    {category.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add Expense Form */}
      {showAddForm && !readOnly && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100">
              Add Expense
            </h3>
            <button
              onClick={() => setShowAddForm(false)}
              className="text-secondary-400 hover:text-secondary-600 dark:hover:text-secondary-300"
            >
              ×
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Expense Title
              </label>
              <input
                type="text"
                className="input-field"
                value={newExpense.title}
                onChange={(e) => setNewExpense(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Lunch at restaurant"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                className="input-field"
                value={newExpense.amount}
                onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Category
              </label>
              <select
                className="input-field"
                value={newExpense.category}
                onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Date
              </label>
              <input
                type="date"
                className="input-field"
                value={newExpense.date}
                onChange={(e) => setNewExpense(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1">
                Notes (optional)
              </label>
              <input
                type="text"
                className="input-field"
                value={newExpense.notes}
                onChange={(e) => setNewExpense(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional details..."
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button onClick={handleAddExpense} className="btn-primary">
              Add Expense
            </button>
            <button onClick={() => setShowAddForm(false)} className="btn-secondary">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Expenses List */}
      {expenses.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-secondary-900 dark:text-secondary-100 mb-4">
            Expenses ({expenses.length})
          </h3>
          
          <div className="space-y-3">
            {expenses.map((expense) => {
              const categoryInfo = getCategoryInfo(expense.category);
              return (
                <div
                  key={expense.id}
                  className="flex items-center justify-between p-3 bg-secondary-50 dark:bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-lg">{categoryInfo.icon}</div>
                    <div>
                      <div className="font-medium text-secondary-900 dark:text-secondary-100">
                        {expense.title}
                        {expense.isFromItinerary && (
                          <span className="ml-2 text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded">
                            From Itinerary
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-secondary-600 dark:text-secondary-300">
                        {categoryInfo.name} • {new Date(expense.date).toLocaleDateString()}
                        {expense.notes && ` • ${expense.notes}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="font-bold text-secondary-900 dark:text-secondary-100">
                      ${expense.amount.toLocaleString()}
                    </div>
                    {!readOnly && !expense.isFromItinerary && (
                      <button
                        onClick={() => handleDeleteExpense(expense.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseTracker;