import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Income, Expense, Courier, Delivery, Payment, Activity } from '@/types/database';

export const [DataProvider, useData] = createContextHook(() => {
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [incomesData, expensesData, couriersData, deliveriesData, paymentsData, activitiesData] =
        await Promise.all([
          AsyncStorage.getItem('incomes'),
          AsyncStorage.getItem('expenses'),
          AsyncStorage.getItem('couriers'),
          AsyncStorage.getItem('deliveries'),
          AsyncStorage.getItem('payments'),
          AsyncStorage.getItem('activities'),
        ]);

      if (incomesData) setIncomes(JSON.parse(incomesData));
      if (expensesData) setExpenses(JSON.parse(expensesData));
      if (couriersData) setCouriers(JSON.parse(couriersData));
      if (deliveriesData) setDeliveries(JSON.parse(deliveriesData));
      if (paymentsData) setPayments(JSON.parse(paymentsData));
      if (activitiesData) setActivities(JSON.parse(activitiesData));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'createdAt'>) => {
    const newIncome: Income = {
      ...income,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...incomes, newIncome];
    setIncomes(updated);
    await AsyncStorage.setItem('incomes', JSON.stringify(updated));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      type: 'income',
      description: income.description,
      amount: income.amount,
      relatedId: newIncome.id,
      createdBy: income.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);
    await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
  }, [incomes, activities]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    const updated = incomes.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setIncomes(updated);
    await AsyncStorage.setItem('incomes', JSON.stringify(updated));
  }, [incomes]);

  const deleteIncome = useCallback(async (id: string) => {
    const updated = incomes.filter((item) => item.id !== id);
    setIncomes(updated);
    await AsyncStorage.setItem('incomes', JSON.stringify(updated));
  }, [incomes]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);
    await AsyncStorage.setItem('expenses', JSON.stringify(updated));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      type: 'expense',
      description: expense.description,
      amount: expense.amount,
      relatedId: newExpense.id,
      createdBy: expense.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);
    await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
  }, [expenses, activities]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setExpenses(updated);
    await AsyncStorage.setItem('expenses', JSON.stringify(updated));
  }, [expenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);
    await AsyncStorage.setItem('expenses', JSON.stringify(updated));
  }, [expenses]);

  const addCourier = useCallback(async (courier: Omit<Courier, 'id' | 'createdAt' | 'balance'>) => {
    const newCourier: Courier = {
      ...courier,
      id: Date.now().toString(),
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...couriers, newCourier];
    setCouriers(updated);
    await AsyncStorage.setItem('couriers', JSON.stringify(updated));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      type: 'courier_added',
      description: `שליח חדש נוסף: ${courier.name}`,
      relatedId: newCourier.id,
      createdBy: courier.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);
    await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
  }, [couriers, activities]);

  const updateCourier = useCallback(async (id: string, updates: Partial<Courier>) => {
    const updated = couriers.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setCouriers(updated);
    await AsyncStorage.setItem('couriers', JSON.stringify(updated));
  }, [couriers]);

  const deleteCourier = useCallback(async (id: string, deletedBy: string) => {
    const courier = couriers.find((c) => c.id === id);
    const updated = couriers.filter((item) => item.id !== id);
    setCouriers(updated);
    await AsyncStorage.setItem('couriers', JSON.stringify(updated));

    if (courier) {
      const activity: Activity = {
        id: Date.now().toString(),
        type: 'courier_deleted',
        description: `שליח נמחק: ${courier.name}`,
        relatedId: id,
        createdBy: deletedBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);
      await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
    }
  }, [couriers, activities]);

  const addDelivery = useCallback(async (delivery: Omit<Delivery, 'id' | 'createdAt'>) => {
    const newDelivery: Delivery = {
      ...delivery,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedDeliveries = [...deliveries, newDelivery];
    setDeliveries(updatedDeliveries);
    await AsyncStorage.setItem('deliveries', JSON.stringify(updatedDeliveries));

    const courier = couriers.find((c) => c.id === delivery.courierId);
    const updatedCouriers = couriers.map((c) =>
      c.id === delivery.courierId
        ? { ...c, balance: c.balance + delivery.totalAmount }
        : c
    );
    setCouriers(updatedCouriers);
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedCouriers));

    if (courier) {
      const activity: Activity = {
        id: (Date.now() + 1).toString(),
        type: 'delivery',
        description: `${delivery.quantity} משלוחים לשליח ${courier.name}${delivery.notes ? ` - ${delivery.notes}` : ''}`,
        amount: delivery.totalAmount,
        relatedId: newDelivery.id,
        createdBy: delivery.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);
      await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
    }
  }, [deliveries, couriers, activities]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt'>) => {
    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);
    await AsyncStorage.setItem('payments', JSON.stringify(updatedPayments));

    const updatedCouriers = couriers.map((courier) =>
      courier.id === payment.courierId
        ? { ...courier, balance: courier.balance - payment.amount }
        : courier
    );
    setCouriers(updatedCouriers);
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedCouriers));

    const courier = couriers.find((c) => c.id === payment.courierId);
    if (courier) {
      const newExpense: Expense = {
        id: (Date.now() + 1).toString(),
        amount: payment.amount,
        description: `תשלום לשליח ${courier.name}${payment.notes ? ` - ${payment.notes}` : ''}`,
        date: payment.date,
        createdBy: payment.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedExpenses));

      const activity: Activity = {
        id: (Date.now() + 2).toString(),
        type: 'payment',
        description: `תשלום לשליח ${courier.name}${payment.notes ? ` - ${payment.notes}` : ''}`,
        amount: payment.amount,
        relatedId: newPayment.id,
        createdBy: payment.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);
      await AsyncStorage.setItem('activities', JSON.stringify(updatedActivities));
    }
  }, [payments, couriers, expenses, activities]);

  return useMemo(() => ({
    incomes,
    expenses,
    couriers,
    deliveries,
    payments,
    activities,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addCourier,
    updateCourier,
    deleteCourier,
    addDelivery,
    addPayment,
  }), [
    incomes,
    expenses,
    couriers,
    deliveries,
    payments,
    activities,
    isLoading,
    addIncome,
    updateIncome,
    deleteIncome,
    addExpense,
    updateExpense,
    deleteExpense,
    addCourier,
    updateCourier,
    deleteCourier,
    addDelivery,
    addPayment,
  ]);
});
