import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  I18nManager,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Plus, Edit2, Trash2, X, Calendar } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import type { Income } from '@/types/database';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type DateFilter = 'all' | 'month' | 'year' | string;

export default function IncomeScreen() {
  const { user } = useAuth();
  const { incomes, addIncome, updateIncome, deleteIncome } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIncome, setEditingIncome] = useState<Income | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');

  const handleSave = async () => {
    if (!amount || !description) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס סכום תקין');
      return;
    }

    if (editingIncome) {
      await updateIncome(editingIncome.id, {
        amount: numAmount,
        description,
        date,
      });
    } else {
      await addIncome({
        amount: numAmount,
        description,
        date,
        createdBy: user?.id || '',
      });
    }

    resetForm();
  };

  const handleEdit = (income: Income) => {
    setEditingIncome(income);
    setAmount(income.amount.toString());
    setDescription(income.description);
    setDate(income.date);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('מחיקת הכנסה', 'האם אתה בטוח שברצונך למחוק הכנסה זו?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: () => deleteIncome(id),
      },
    ]);
  };

  const resetForm = () => {
    setModalVisible(false);
    setEditingIncome(null);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  const formatCurrency = (value: number) => {
    return `₪${value.toLocaleString('he-IL')}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('he-IL');
  };

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

  const sortedIncomes = [...incomes]
    .filter(item => filterByDate(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
        <View style={styles.header}>
          <Text style={styles.title}>הכנסות</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

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

        {sortedIncomes.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>אין הכנסות עדיין</Text>
            <Text style={styles.emptySubtext}>לחץ על + להוספת הכנסה ראשונה</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedIncomes.map((income) => (
              <View key={income.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardAmount}>
                      {formatCurrency(income.amount)}
                    </Text>
                    <Text style={styles.cardDate}>{formatDate(income.date)}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{income.description}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(income)}
                  >
                    <Edit2 size={20} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(income.id)}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetForm}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={resetForm}
          >
            <TouchableOpacity
              activeOpacity={1}
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingIncome ? 'עריכת הכנסה' : 'הוספת הכנסה'}
                </Text>
                <TouchableOpacity onPress={resetForm}>
                  <X size={24} color="#6B7280" />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.formScroll}
                contentContainerStyle={styles.form}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>סכום</Text>
                  <TextInput
                    style={styles.input}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0"
                    keyboardType="numeric"
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>תיאור</Text>
                  <TextInput
                    style={styles.input}
                    value={description}
                    onChangeText={setDescription}
                    placeholder="תיאור ההכנסה"
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>תאריך</Text>
                  <TextInput
                    style={styles.input}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>שמור</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600' as const,
    color: '#6B7280',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  list: {
    gap: 12,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardAmount: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  cardDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  cardDescription: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'right',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
    width: '100%',
  },
  formScroll: {
    flexGrow: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: '#374151',
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  saveButton: {
    backgroundColor: '#10B981',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: '#FFFFFF',
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
    backgroundColor: '#10B981',
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
