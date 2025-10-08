import createContextHook from '@nkzw/create-context-hook';
import { useMemo, useCallback } from 'react';
import type { Income, Expense, Courier, Delivery, Payment } from '@/types/database';
import { useAuth } from './AuthContext';
import { trpc } from '@/lib/trpc';

export const [DataProvider, useData] = createContextHook(() => {
  const { user } = useAuth();

  const incomesQuery = trpc.income.list.useQuery(undefined, { enabled: !!user });
  const expensesQuery = trpc.expenses.list.useQuery(undefined, { enabled: !!user });
  const couriersQuery = trpc.couriers.list.useQuery(undefined, { enabled: !!user });
  const deliveriesQuery = trpc.deliveries.list.useQuery(undefined, { enabled: !!user });
  const paymentsQuery = trpc.payments.list.useQuery(undefined, { enabled: !!user });
  const activitiesQuery = trpc.activities.list.useQuery(undefined, { enabled: !!user });

  const createIncomeMutation = trpc.income.create.useMutation({
    onSuccess: () => {
      incomesQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const updateIncomeMutation = trpc.income.update.useMutation({
    onSuccess: () => {
      incomesQuery.refetch();
    },
  });

  const deleteIncomeMutation = trpc.income.delete.useMutation({
    onSuccess: () => {
      incomesQuery.refetch();
    },
  });

  const createExpenseMutation = trpc.expenses.create.useMutation({
    onSuccess: () => {
      expensesQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const updateExpenseMutation = trpc.expenses.update.useMutation({
    onSuccess: () => {
      expensesQuery.refetch();
    },
  });

  const deleteExpenseMutation = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      expensesQuery.refetch();
    },
  });

  const createCourierMutation = trpc.couriers.create.useMutation({
    onSuccess: () => {
      couriersQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const updateCourierMutation = trpc.couriers.update.useMutation({
    onSuccess: () => {
      couriersQuery.refetch();
    },
  });

  const deleteCourierMutation = trpc.couriers.delete.useMutation({
    onSuccess: () => {
      couriersQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const createDeliveryMutation = trpc.deliveries.create.useMutation({
    onSuccess: () => {
      deliveriesQuery.refetch();
      couriersQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const createPaymentMutation = trpc.payments.create.useMutation({
    onSuccess: () => {
      paymentsQuery.refetch();
      couriersQuery.refetch();
      expensesQuery.refetch();
      activitiesQuery.refetch();
    },
  });

  const incomes = incomesQuery.data || [];
  const expenses = expensesQuery.data || [];
  const couriers = couriersQuery.data || [];
  const deliveries = deliveriesQuery.data || [];
  const payments = paymentsQuery.data || [];
  const activities = activitiesQuery.data || [];
  const isLoading = incomesQuery.isLoading || expensesQuery.isLoading || couriersQuery.isLoading || deliveriesQuery.isLoading || paymentsQuery.isLoading || activitiesQuery.isLoading;

  const addIncome = useCallback(async (income: Omit<Income, 'id' | 'createdAt' | 'organizationId'>) => {
    await createIncomeMutation.mutateAsync({
      amount: income.amount,
      description: income.description,
      date: income.date,
    });
  }, [createIncomeMutation]);

  const updateIncome = useCallback(async (id: string, updates: Partial<Income>) => {
    await updateIncomeMutation.mutateAsync({
      id,
      amount: updates.amount,
      description: updates.description,
      date: updates.date,
    });
  }, [updateIncomeMutation]);

  const deleteIncome = useCallback(async (id: string) => {
    await deleteIncomeMutation.mutateAsync({ id });
  }, [deleteIncomeMutation]);

  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt' | 'organizationId'>) => {
    await createExpenseMutation.mutateAsync({
      amount: expense.amount,
      description: expense.description,
      date: expense.date,
    });
  }, [createExpenseMutation]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    await updateExpenseMutation.mutateAsync({
      id,
      amount: updates.amount,
      description: updates.description,
      date: updates.date,
    });
  }, [updateExpenseMutation]);

  const deleteExpense = useCallback(async (id: string) => {
    await deleteExpenseMutation.mutateAsync({ id });
  }, [deleteExpenseMutation]);

  const addCourier = useCallback(async (courier: Omit<Courier, 'id' | 'createdAt' | 'balance' | 'organizationId'>) => {
    await createCourierMutation.mutateAsync({
      name: courier.name,
      phone: courier.phone,
      pricePerDelivery: courier.pricePerDelivery,
      isActive: courier.isActive,
    });
  }, [createCourierMutation]);

  const updateCourier = useCallback(async (id: string, updates: Partial<Courier>) => {
    await updateCourierMutation.mutateAsync({
      id,
      name: updates.name,
      phone: updates.phone,
      pricePerDelivery: updates.pricePerDelivery,
      isActive: updates.isActive,
    });
  }, [updateCourierMutation]);

  const deleteCourier = useCallback(async (id: string, deletedBy: string) => {
    await deleteCourierMutation.mutateAsync({ id });
  }, [deleteCourierMutation]);

  const addDelivery = useCallback(async (delivery: Omit<Delivery, 'id' | 'createdAt' | 'organizationId'>) => {
    await createDeliveryMutation.mutateAsync({
      courierId: delivery.courierId,
      quantity: delivery.quantity,
      totalAmount: delivery.totalAmount,
      date: delivery.date,
      notes: delivery.notes,
    });
  }, [createDeliveryMutation]);

  const addPayment = useCallback(async (payment: Omit<Payment, 'id' | 'createdAt' | 'organizationId'>) => {
    await createPaymentMutation.mutateAsync({
      courierId: payment.courierId,
      amount: payment.amount,
      date: payment.date,
      notes: payment.notes,
    });
  }, [createPaymentMutation]);

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
