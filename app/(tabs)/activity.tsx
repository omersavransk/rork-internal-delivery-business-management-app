import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  I18nManager,
  TouchableOpacity,
} from 'react-native';
import { useData } from '@/contexts/DataContext';
import type { Activity } from '@/types/database';
import { Calendar } from 'lucide-react-native';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type DateFilter = 'all' | 'month' | 'year' | string;

export default function ActivityScreen() {
  const { activities } = useData();
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const filterByDate = (itemDate: string) => {
    const date = new Date(itemDate);
    const now = new Date();
    
    if (dateFilter === 'all') return true;
    if (dateFilter === 'year') {
      return date.getFullYear() === now.getFullYear();
    }
    if (dateFilter === 'month') {
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }
    
    const [year, month] = dateFilter.split('-').map(Number);
    return date.getFullYear() === year && date.getMonth() === month - 1;
  };

  const sortedActivities = useMemo(() => {
    return [...activities]
      .filter(item => filterByDate(item.createdAt))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [activities, dateFilter]);

  const formatCurrency = (value: number) => {
    return `₪${value.toLocaleString('he-IL')}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('he-IL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'income':
        return '💰';
      case 'expense':
        return '💸';
      case 'delivery':
        return '📦';
      case 'payment':
        return '💳';
      case 'courier_added':
        return '➕';
      case 'courier_deleted':
        return '➖';
      default:
        return '📝';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'income':
        return '#10B981';
      case 'expense':
      case 'payment':
        return '#EF4444';
      case 'delivery':
        return '#8B5CF6';
      case 'courier_added':
        return '#3B82F6';
      case 'courier_deleted':
        return '#6B7280';
      default:
        return '#6B7280';
    }
  };

  const getUserName = (userId: string) => {
    if (userId === '1') return 'שותף 1';
    if (userId === '2') return 'שותף 2';
    return 'משתמש';
  };

  const filterOptions: { value: DateFilter; label: string }[] = [
    { value: 'all', label: 'הכל' },
    { value: 'month', label: 'חודש נוכחי' },
    { value: 'year', label: 'שנה' },
  ];

  const now = new Date();
  for (let i = 1; i <= 12; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = monthDate.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
    const monthValue = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
    filterOptions.push({ value: monthValue, label: monthName });
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.filterContainer}>
          <Calendar size={20} color="#6B7280" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            <View style={styles.filterButtons}>
              {filterOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.filterButton,
                    dateFilter === option.value && styles.filterButtonActive,
                  ]}
                  onPress={() => setDateFilter(option.value)}
                >
                  <Text
                    style={[
                      styles.filterButtonText,
                      dateFilter === option.value && styles.filterButtonTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {sortedActivities.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyText}>אין פעילות עדיין</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedActivities.map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <View style={styles.activityIconContainer}>
                    <Text style={styles.activityIcon}>
                      {getActivityIcon(activity.type)}
                    </Text>
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityDescription}>
                      {activity.description}
                    </Text>
                    <View style={styles.activityMeta}>
                      <Text style={styles.activityUser}>
                        {getUserName(activity.createdBy)}
                      </Text>
                      <Text style={styles.activityDot}>•</Text>
                      <Text style={styles.activityDate}>
                        {formatDate(activity.createdAt)}
                      </Text>
                    </View>
                  </View>
                  {activity.amount !== undefined && (
                    <Text
                      style={[
                        styles.activityAmount,
                        { color: getActivityColor(activity.type) },
                      ]}
                    >
                      {activity.type === 'income' || activity.type === 'delivery'
                        ? '+'
                        : '-'}
                      {formatCurrency(activity.amount)}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
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
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  list: {
    gap: 12,
  },
  activityItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  activityIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityIcon: {
    fontSize: 20,
  },
  activityContent: {
    flex: 1,
  },
  activityDescription: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 6,
    textAlign: 'right',
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activityUser: {
    fontSize: 13,
    color: '#6B7280',
  },
  activityDot: {
    fontSize: 13,
    color: '#D1D5DB',
  },
  activityDate: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '700' as const,
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
  filterScroll: {
    flex: 1,
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  filterButtonActive: {
    backgroundColor: '#2563EB',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
});
