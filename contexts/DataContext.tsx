import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect, useCallback, useMemo } from 'react';
import type { Income, Expense, Courier, Delivery, Payment, Activity } from '@/types/database';
import { useAuth } from './AuthContext';

export const [DataProvider, useData] = createContextHook(() => {
  const { user } = useAuth();
  const [incomes, setIncomes] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [couriers, setCouriers] = useState<Courier[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      if (!user?.organizationId) {
        setIsLoading(false);
        return;
      }

      const [incomesData, expensesData, couriersData, deliveriesData, paymentsData, activitiesData] =
        await Promise.all([
          AsyncStorage.getItem('incomes'),
          AsyncStorage.getItem('expenses'),
          AsyncStorage.getItem('couriers'),
          AsyncStorage.getItem('deliveries'),
          AsyncStorage.getItem('payments'),
          AsyncStorage.getItem('activities'),
        ]);

      const organizationId = user.organizationId;

      if (incomesData) {
        const allIncomes: Income[] = JSON.parse(incomesData);
        setIncomes(allIncomes.filter((item) => item.organizationId === organizationId));
      }
      if (expensesData) {
        const allExpenses: Expense[] = JSON.parse(expensesData);
        setExpenses(allExpenses.filter((item) => item.organizationId === organizationId));
      }
      if (couriersData) {
        const allCouriers: Courier[] = JSON.parse(couriersData);
        setCouriers(allCouriers.filter((item) => item.organizationId === organizationId));
      }
      if (deliveriesData) {
        const allDeliveries: Delivery[] = JSON.parse(deliveriesData);
        setDeliveries(allDeliveries.filter((item) => item.organizationId === organizationId));
      }
      if (paymentsData) {
        const allPayments: Payment[] = JSON.parse(paymentsData);
        setPayments(allPayments.filter((item) => item.organizationId === organizationId));
      }
      if (activitiesData) {
        const allActivities: Activity[] = JSON.parse(activitiesData);
        setActivities(allActivities.filter((item) => item.organizationId === organizationId));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.organizationId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'createdAt' | 'organizationId'>) => {
    if (!user?.organizationId) return;

    const newIncome: Income = {
      ...income,
      id: Date.now().toString(),
      organizationId: user.organizationId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...incomes, newIncome];
    setIncomes(updated);

    const allIncomesData = await AsyncStorage.getItem('incomes');
    const allIncomes: Income[] = allIncomesData ? JSON.parse(allIncomesData) : [];
    const updatedAll = [...allIncomes, newIncome];
    await AsyncStorage.setItem('incomes', JSON.stringify(updatedAll));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      organizationId: user.organizationId,
      type: 'income',
      description: income.description,
      amount: income.amount,
      relatedId: newIncome.id,
      createdBy: income.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);

    const allActivitiesData = await AsyncStorage.getItem('activities');
    const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
    const updatedAllActivities = [...allActivities, activity];
    await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
  }, [incomes, activities, user?.organizationId]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    const updated = incomes.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setIncomes(updated);

    const allIncomesData = await AsyncStorage.getItem('incomes');
    const allIncomes: Income[] = allIncomesData ? JSON.parse(allIncomesData) : [];
    const updatedAll = allIncomes.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await AsyncStorage.setItem('incomes', JSON.stringify(updatedAll));
  }, [incomes]);

  const deleteIncome = useCallback(async (id: string) => {
    const updated = incomes.filter((item) => item.id !== id);
    setIncomes(updated);

    const allIncomesData = await AsyncStorage.getItem('incomes');
    const allIncomes: Income[] = allIncomesData ? JSON.parse(allIncomesData) : [];
    const updatedAll = allIncomes.filter((item) => item.id !== id);
    await AsyncStorage.setItem('incomes', JSON.stringify(updatedAll));
  }, [incomes]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'organizationId'>) => {
    if (!user?.organizationId) return;

    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      organizationId: user.organizationId,
      createdAt: new Date().toISOString(),
    };
    const updated = [...expenses, newExpense];
    setExpenses(updated);

    const allExpensesData = await AsyncStorage.getItem('expenses');
    const allExpenses: Expense[] = allExpensesData ? JSON.parse(allExpensesData) : [];
    const updatedAll = [...allExpenses, newExpense];
    await AsyncStorage.setItem('expenses', JSON.stringify(updatedAll));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      organizationId: user.organizationId,
      type: 'expense',
      description: expense.description,
      amount: expense.amount,
      relatedId: newExpense.id,
      createdBy: expense.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);

    const allActivitiesData = await AsyncStorage.getItem('activities');
    const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
    const updatedAllActivities = [...allActivities, activity];
    await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
  }, [expenses, activities, user?.organizationId]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    const updated = expenses.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setExpenses(updated);

    const allExpensesData = await AsyncStorage.getItem('expenses');
    const allExpenses: Expense[] = allExpensesData ? JSON.parse(allExpensesData) : [];
    const updatedAll = allExpenses.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await AsyncStorage.setItem('expenses', JSON.stringify(updatedAll));
  }, [expenses]);

  const deleteExpense = useCallback(async (id: string) => {
    const updated = expenses.filter((item) => item.id !== id);
    setExpenses(updated);

    const allExpensesData = await AsyncStorage.getItem('expenses');
    const allExpenses: Expense[] = allExpensesData ? JSON.parse(allExpensesData) : [];
    const updatedAll = allExpenses.filter((item) => item.id !== id);
    await AsyncStorage.setItem('expenses', JSON.stringify(updatedAll));
  }, [expenses]);

  const addCourier = useCallback(async (courier: Omit<Courier, 'id' | 'createdAt' | 'balance' | 'organizationId'>) => {
    if (!user?.organizationId) return;

    const newCourier: Courier = {
      ...courier,
      id: Date.now().toString(),
      organizationId: user.organizationId,
      balance: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...couriers, newCourier];
    setCouriers(updated);

    const allCouriersData = await AsyncStorage.getItem('couriers');
    const allCouriers: Courier[] = allCouriersData ? JSON.parse(allCouriersData) : [];
    const updatedAll = [...allCouriers, newCourier];
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedAll));

    const activity: Activity = {
      id: (Date.now() + 1).toString(),
      organizationId: user.organizationId,
      type: 'courier_added',
      description: `שליח חדש נוסף: ${courier.name}`,
      relatedId: newCourier.id,
      createdBy: courier.createdBy,
      createdAt: new Date().toISOString(),
    };
    const updatedActivities = [...activities, activity];
    setActivities(updatedActivities);

    const allActivitiesData = await AsyncStorage.getItem('activities');
    const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
    const updatedAllActivities = [...allActivities, activity];
    await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
  }, [couriers, activities, user?.organizationId]);

  const updateCourier = useCallback(async (id: string, updates: Partial<Courier>) => {
    const updated = couriers.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    setCouriers(updated);

    const allCouriersData = await AsyncStorage.getItem('couriers');
    const allCouriers: Courier[] = allCouriersData ? JSON.parse(allCouriersData) : [];
    const updatedAll = allCouriers.map((item) =>
      item.id === id ? { ...item, ...updates } : item
    );
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedAll));
  }, [couriers]);

  const deleteCourier = useCallback(async (id: string, deletedBy: string) => {
    if (!user?.organizationId) return;

    const courier = couriers.find((c) => c.id === id);
    const updated = couriers.filter((item) => item.id !== id);
    setCouriers(updated);

    const allCouriersData = await AsyncStorage.getItem('couriers');
    const allCouriers: Courier[] = allCouriersData ? JSON.parse(allCouriersData) : [];
    const updatedAll = allCouriers.filter((item) => item.id !== id);
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedAll));

    if (courier) {
      const activity: Activity = {
        id: Date.now().toString(),
        organizationId: user.organizationId,
        type: 'courier_deleted',
        description: `שליח נמחק: ${courier.name}`,
        relatedId: id,
        createdBy: deletedBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);

      const allActivitiesData = await AsyncStorage.getItem('activities');
      const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
      const updatedAllActivities = [...allActivities, activity];
      await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
    }
  }, [couriers, activities, user?.organizationId]);

  const addDelivery = useCallback(async (delivery: Omit<Delivery, 'id' | 'createdAt' | 'organizationId'>) => {
    if (!user?.organizationId) return;

    const newDelivery: Delivery = {
      ...delivery,
      id: Date.now().toString(),
      organizationId: user.organizationId,
      createdAt: new Date().toISOString(),
    };
    const updatedDeliveries = [...deliveries, newDelivery];
    setDeliveries(updatedDeliveries);

    const allDeliveriesData = await AsyncStorage.getItem('deliveries');
    const allDeliveries: Delivery[] = allDeliveriesData ? JSON.parse(allDeliveriesData) : [];
    const updatedAllDeliveries = [...allDeliveries, newDelivery];
    await AsyncStorage.setItem('deliveries', JSON.stringify(updatedAllDeliveries));

    const courier = couriers.find((c) => c.id === delivery.courierId);
    const updatedCouriers = couriers.map((c) =>
      c.id === delivery.courierId
        ? { ...c, balance: c.balance + delivery.totalAmount }
        : c
    );
    setCouriers(updatedCouriers);

    const allCouriersData = await AsyncStorage.getItem('couriers');
    const allCouriers: Courier[] = allCouriersData ? JSON.parse(allCouriersData) : [];
    const updatedAllCouriers = allCouriers.map((c) =>
      c.id === delivery.courierId
        ? { ...c, balance: c.balance + delivery.totalAmount }
        : c
    );
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedAllCouriers));

    if (courier) {
      const activity: Activity = {
        id: (Date.now() + 1).toString(),
        organizationId: user.organizationId,
        type: 'delivery',
        description: `${delivery.quantity} משלוחים לשליח ${courier.name}${delivery.notes ? ` - ${delivery.notes}` : ''}`,
        amount: delivery.totalAmount,
        relatedId: newDelivery.id,
        createdBy: delivery.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);

      const allActivitiesData = await AsyncStorage.getItem('activities');
      const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
      const updatedAllActivities = [...allActivities, activity];
      await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
    }
  }, [deliveries, couriers, activities, user?.organizationId]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt' | 'organizationId'>) => {
    if (!user?.organizationId) return;

    const newPayment: Payment = {
      ...payment,
      id: Date.now().toString(),
      organizationId: user.organizationId,
      createdAt: new Date().toISOString(),
    };
    const updatedPayments = [...payments, newPayment];
    setPayments(updatedPayments);

    const allPaymentsData = await AsyncStorage.getItem('payments');
    const allPayments: Payment[] = allPaymentsData ? JSON.parse(allPaymentsData) : [];
    const updatedAllPayments = [...allPayments, newPayment];
    await AsyncStorage.setItem('payments', JSON.stringify(updatedAllPayments));

    const updatedCouriers = couriers.map((courier) =>
      courier.id === payment.courierId
        ? { ...courier, balance: courier.balance - payment.amount }
        : courier
    );
    setCouriers(updatedCouriers);

    const allCouriersData = await AsyncStorage.getItem('couriers');
    const allCouriers: Courier[] = allCouriersData ? JSON.parse(allCouriersData) : [];
    const updatedAllCouriers = allCouriers.map((courier) =>
      courier.id === payment.courierId
        ? { ...courier, balance: courier.balance - payment.amount }
        : courier
    );
    await AsyncStorage.setItem('couriers', JSON.stringify(updatedAllCouriers));

    const courier = couriers.find((c) => c.id === payment.courierId);
    if (courier) {
      const newExpense: Expense = {
        id: (Date.now() + 1).toString(),
        organizationId: user.organizationId,
        amount: payment.amount,
        description: `תשלום לשליח ${courier.name}${payment.notes ? ` - ${payment.notes}` : ''}`,
        date: payment.date,
        createdBy: payment.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);

      const allExpensesData = await AsyncStorage.getItem('expenses');
      const allExpenses: Expense[] = allExpensesData ? JSON.parse(allExpensesData) : [];
      const updatedAllExpenses = [...allExpenses, newExpense];
      await AsyncStorage.setItem('expenses', JSON.stringify(updatedAllExpenses));

      const activity: Activity = {
        id: (Date.now() + 2).toString(),
        organizationId: user.organizationId,
        type: 'payment',
        description: `תשלום לשליח ${courier.name}${payment.notes ? ` - ${payment.notes}` : ''}`,
        amount: payment.amount,
        relatedId: newPayment.id,
        createdBy: payment.createdBy,
        createdAt: new Date().toISOString(),
      };
      const updatedActivities = [...activities, activity];
      setActivities(updatedActivities);

      const allActivitiesData = await AsyncStorage.getItem('activities');
      const allActivities: Activity[] = allActivitiesData ? JSON.parse(allActivitiesData) : [];
      const updatedAllActivities = [...allActivities, activity];
      await AsyncStorage.setItem('activities', JSON.stringify(updatedAllActivities));
    }
  }, [payments, couriers, expenses, activities, user?.organizationId]);

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
