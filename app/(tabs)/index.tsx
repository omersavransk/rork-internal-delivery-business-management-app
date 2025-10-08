import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, I18nManager, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { TrendingUp, TrendingDown, DollarSign, Users, Calendar, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  colors: [string, string, ...string[]];
  subtitle?: string;
}

function StatCard({ title, value, icon, colors, subtitle }: StatCardProps) {
  return (
    <LinearGradient colors={colors} style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>{icon}</View>
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <Text style={styles.cardValue}>{value}</Text>
      {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
    </LinearGradient>
  );
}

type DateFilter = 'all' | 'month' | 'year' | string;

export default function DashboardScreen() {
  const { user } = useAuth();
  const { incomes, expenses, couriers } = useData();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

  const filterByDate = (date: string) => {
    const itemDate = new Date(date);
    const now = new Date();
    
    if (dateFilter === 'all') return true;
    if (dateFilter === 'year') {
      return itemDate.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'month') {
      return itemDate.getMonth() === now.getMonth() && itemDate.getFullYear() === now.getFullYear();
    }
    
    const [year, month] = dateFilter.split('-').map(Number);
    return itemDate.getFullYear() === year && itemDate.getMonth() === month - 1;
  };

  const stats = useMemo(() => {
    const filteredIncomes = incomes.filter(item => filterByDate(item.date));
    const filteredExpenses = expenses.filter(item => filterByDate(item.date));
    
    const totalIncome = filteredIncomes.reduce((sum, item) => sum + item.amount, 0);
    const totalExpenses = filteredExpenses.reduce((sum, item) => sum + item.amount, 0);
    const profit = totalIncome - totalExpenses;
    const activeCouriers = couriers.filter((c) => c.isActive).length;
    const totalCourierBalance = couriers.reduce((sum, c) => sum + c.balance, 0);

    return {
      totalIncome,
      totalExpenses,
      profit,
      activeCouriers,
      totalCourierBalance,
      incomeCount: filteredIncomes.length,
      expenseCount: filteredExpenses.length,
    };
  }, [incomes, expenses, couriers, dateFilter]);

  const formatCurrency = (amount: number) => {
    return `₪${amount.toLocaleString('he-IL')}`;
  };

  const generateMonthOptions = () => {
    const options: { value: DateFilter; label: string }[] = [
      { value: 'all', label: 'הכל' },
      { value: 'month', label: 'חודש נוכחי' },
      { value: 'year', label: 'שנה' },
    ];

    const currentYear = new Date().getFullYear();
    const startYear = 2020;

    for (let year = currentYear; year >= startYear; year--) {
      const startMonth = year === currentYear ? new Date().getMonth() : 11;
      for (let month = startMonth; month >= 0; month--) {
        const monthDate = new Date(year, month, 1);
        const monthName = monthDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
        const monthValue = `${year}-${String(month + 1).padStart(2, '0')}`;
        options.push({ value: monthValue, label: monthName });
      }
    }

    return options;
  };

  const filterOptions = useMemo(() => generateMonthOptions(), []);

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === dateFilter);
    return option?.label || 'הכל';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.greeting}>שלום, {user?.name}</Text>
        <Text style={styles.subtitle}>סקירה כללית של העסק</Text>
      </View>

      <TouchableOpacity 
        style={styles.filterContainer}
        onPress={() => setFilterModalVisible(true)}
      >
        <Calendar size={20} color="#6B7280" />
        <Text style={styles.filterLabel}>{getFilterLabel()}</Text>
        <ChevronDown size={20} color="#6B7280" />
      </TouchableOpacity>

      <View style={styles.grid}>
        <StatCard
          title={'סה"כ הכנסות'}
          value={formatCurrency(stats.totalIncome)}
          icon={<TrendingUp size={24} color="#FFFFFF" />}
          colors={['#10B981', '#059669']}
          subtitle={`${stats.incomeCount} רשומות`}
        />

        <StatCard
          title={'סה"כ הוצאות'}
          value={formatCurrency(stats.totalExpenses)}
          icon={<TrendingDown size={24} color="#FFFFFF" />}
          colors={['#EF4444', '#DC2626']}
          subtitle={`${stats.expenseCount} רשומות`}
        />

        <StatCard
          title="רווח נקי"
          value={formatCurrency(stats.profit)}
          icon={<DollarSign size={24} color="#FFFFFF" />}
          colors={stats.profit >= 0 ? ['#2563EB', '#1E40AF'] : ['#F59E0B', '#D97706']}
          subtitle={stats.profit >= 0 ? 'רווח' : 'הפסד'}
        />

        <StatCard
          title="שליחים פעילים"
          value={stats.activeCouriers.toString()}
          icon={<Users size={24} color="#FFFFFF" />}
          colors={['#8B5CF6', '#7C3AED']}
          subtitle={`חוב: ${formatCurrency(stats.totalCourierBalance)}`}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>פעולות אחרונות</Text>
        <View style={styles.activityCard}>
          <Text style={styles.activityText}>הכנסות: {incomes.length} רשומות</Text>
          <Text style={styles.activityText}>הוצאות: {expenses.length} רשומות</Text>
          <Text style={styles.activityText}>שליחים: {couriers.length} רשומים</Text>
        </View>
      </View>

      <Modal
        visible={filterModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setFilterModalVisible(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={styles.filterModalContent}
          >
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>בחר תקופה</Text>
            </View>
            <ScrollView style={styles.filterModalScroll}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterModalOption,
                    dateFilter === option.value && styles.filterModalOptionActive,
                  ]}
                  onPress={() => {
                    setDateFilter(option.value);
                    setFilterModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.filterModalOptionText,
                      dateFilter === option.value && styles.filterModalOptionTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'right',
  },
  grid: {
    gap: 16,
    marginBottom: 24,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
  },
  cardValue: {
    fontSize: 32,
    fontWeight: '700' as const,
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'right',
  },
  cardSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'right',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'right',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'right',
  },
  filterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  filterLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    textAlign: 'right',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  filterModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
  },
  filterModalHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  filterModalTitle: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#1F2937',
    textAlign: 'center',
  },
  filterModalScroll: {
    maxHeight: 400,
  },
  filterModalOption: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  filterModalOptionActive: {
    backgroundColor: '#EFF6FF',
  },
  filterModalOptionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'right',
  },
  filterModalOptionTextActive: {
    color: '#2563EB',
    fontWeight: '600' as const,
  },
});
