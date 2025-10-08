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
import { Plus, Edit2, Trash2, X, Calendar, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import type { Expense } from '@/types/database';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type DateFilter = 'all' | 'month' | 'year' | string;

export default function ExpensesScreen() {
  const { user } = useAuth();
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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

    if (editingExpense) {
      await updateExpense(editingExpense.id, {
        amount: numAmount,
        description,
        date,
      });
    } else {
      await addExpense({
        amount: numAmount,
        description,
        date,
        createdBy: user?.id || '',
      });
    }

    resetForm();
  };

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setDate(expense.date);
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('מחיקת הוצאה', 'האם אתה בטוח שברצונך למחוק הוצאה זו?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: () => deleteExpense(id),
      },
    ]);
  };

  const resetForm = () => {
    setModalVisible(false);
    setEditingExpense(null);
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

  const sortedExpenses = [...expenses]
    .filter(item => filterByDate(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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

  const filterOptions = React.useMemo(() => generateMonthOptions(), []);

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === dateFilter);
    return option?.label || 'הכל';
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>הוצאות</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.filterContainer}
          onPress={() => setFilterModalVisible(true)}
        >
          <Calendar size={20} color="#6B7280" />
          <Text style={styles.filterLabel}>{getFilterLabel()}</Text>
          <ChevronDown size={20} color="#6B7280" />
        </TouchableOpacity>

        {sortedExpenses.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>אין הוצאות עדיין</Text>
            <Text style={styles.emptySubtext}>לחץ על + להוספת הוצאה ראשונה</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedExpenses.map((expense) => (
              <View key={expense.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardAmount}>
                      {formatCurrency(expense.amount)}
                    </Text>
                    <Text style={styles.cardDate}>{formatDate(expense.date)}</Text>
                  </View>
                  <Text style={styles.cardDescription}>{expense.description}</Text>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleEdit(expense)}
                  >
                    <Edit2 size={20} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => handleDelete(expense.id)}
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
                  {editingExpense ? 'עריכת הוצאה' : 'הוספת הוצאה'}
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
                    placeholder="תיאור ההוצאה"
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
    backgroundColor: '#EF4444',
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
    color: '#EF4444',
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
    backgroundColor: '#EF4444',
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
  filterLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600' as const,
    color: '#1F2937',
    textAlign: 'right',
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
    backgroundColor: '#FEE2E2',
  },
  filterModalOptionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'right',
  },
  filterModalOptionTextActive: {
    color: '#EF4444',
    fontWeight: '600' as const,
  },
});
