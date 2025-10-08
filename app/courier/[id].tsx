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
import { useLocalSearchParams, Stack } from 'expo-router';
import { Plus, X, DollarSign, Calendar, ChevronDown } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

type DateFilter = 'all' | 'month' | 'year' | string;

export default function CourierDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { couriers, deliveries, payments, addDelivery, addPayment } = useData();
  const [deliveryModalVisible, setDeliveryModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [quantity, setQuantity] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const [filterModalVisible, setFilterModalVisible] = useState(false);

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

  const courier = couriers.find((c) => c.id === id);
  const courierDeliveries = deliveries.filter((d) => d.courierId === id);
  const courierPayments = payments.filter((p) => p.courierId === id);

  if (!courier) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>שליח לא נמצא</Text>
      </View>
    );
  }

  const handleAddDelivery = async () => {
    if (!quantity) {
      Alert.alert('שגיאה', 'אנא הכנס כמות משלוחים');
      return;
    }

    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס כמות תקינה');
      return;
    }

    const totalAmount = qty * courier.pricePerDelivery;

    await addDelivery({
      courierId: courier.id,
      quantity: qty,
      totalAmount,
      date: new Date().toISOString().split('T')[0],
      notes,
      createdBy: user?.id || '',
    });

    setDeliveryModalVisible(false);
    setQuantity('');
    setNotes('');
  };

  const handleAddPayment = async () => {
    if (!paymentAmount) {
      Alert.alert('שגיאה', 'אנא הכנס סכום תשלום');
      return;
    }

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס סכום תקין');
      return;
    }

    await addPayment({
      courierId: courier.id,
      amount,
      date: new Date().toISOString().split('T')[0],
      notes: paymentNotes,
      createdBy: user?.id || '',
    });

    setPaymentModalVisible(false);
    setPaymentAmount('');
    setPaymentNotes('');
  };

  const formatCurrency = (value: number) => {
    return `₪${value.toLocaleString('he-IL')}`;
  };

  const formatDate = (dateString: string) => {
    const d = new Date(dateString);
    return d.toLocaleDateString('he-IL');
  };

  const getFilterLabel = () => {
    const option = filterOptions.find(opt => opt.value === dateFilter);
    return option?.label || 'הכל';
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

  const sortedDeliveries = [...courierDeliveries]
    .filter(item => filterByDate(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const sortedPayments = [...courierPayments]
    .filter(item => filterByDate(item.date))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <>
      <Stack.Screen
        options={{
          title: courier.name,
          headerBackTitle: 'חזור',
        }}
      />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <TouchableOpacity 
            style={styles.filterContainer}
            onPress={() => setFilterModalVisible(true)}
          >
            <Calendar size={20} color="#6B7280" />
            <Text style={styles.filterLabel}>{getFilterLabel()}</Text>
            <ChevronDown size={20} color="#6B7280" />
          </TouchableOpacity>

          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>מאזן נוכחי</Text>
            <Text
              style={[
                styles.balanceAmount,
                courier.balance > 0 && styles.balanceAmountPositive,
              ]}
            >
              {formatCurrency(courier.balance)}
            </Text>
            <Text style={styles.balanceSubtext}>
              {formatCurrency(courier.pricePerDelivery)} למשלוח
            </Text>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.deliveryButton]}
              onPress={() => setDeliveryModalVisible(true)}
            >
              <Plus size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>הוסף משלוחים</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.actionButton,
                styles.paymentButton,
              ]}
              onPress={() => setPaymentModalVisible(true)}
            >
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>תשלום</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>משלוחים אחרונים</Text>
            {sortedDeliveries.length === 0 ? (
              <Text style={styles.emptyText}>אין משלוחים עדיין</Text>
            ) : (
              <View style={styles.list}>
                {sortedDeliveries.map((delivery) => (
                  <View key={delivery.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>
                        {delivery.quantity} משלוחים
                      </Text>
                      {delivery.notes && (
                        <Text style={styles.listItemNotes}>{delivery.notes}</Text>
                      )}
                      <Text style={styles.listItemDate}>
                        {formatDate(delivery.date)}
                      </Text>
                    </View>
                    <Text style={styles.listItemAmount}>
                      +{formatCurrency(delivery.totalAmount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>תשלומים</Text>
            {sortedPayments.length === 0 ? (
              <Text style={styles.emptyText}>אין תשלומים עדיין</Text>
            ) : (
              <View style={styles.list}>
                {sortedPayments.map((payment) => (
                  <View key={payment.id} style={styles.listItem}>
                    <View style={styles.listItemContent}>
                      <Text style={styles.listItemTitle}>תשלום</Text>
                      {payment.notes && (
                        <Text style={styles.listItemNotes}>{payment.notes}</Text>
                      )}
                      <Text style={styles.listItemDate}>
                        {formatDate(payment.date)}
                      </Text>
                    </View>
                    <Text style={[styles.listItemAmount, styles.paymentAmount]}>
                      -{formatCurrency(payment.amount)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        <Modal
          visible={deliveryModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setDeliveryModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setDeliveryModalVisible(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={styles.modalContent}
              >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>הוספת משלוחים</Text>
                <TouchableOpacity onPress={() => setDeliveryModalVisible(false)}>
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
                  <Text style={styles.label}>כמות משלוחים</Text>
                  <TextInput
                    style={styles.input}
                    value={quantity}
                    onChangeText={setQuantity}
                    placeholder="0"
                    keyboardType="numeric"
                    textAlign="right"
                  />
                  {quantity && !isNaN(parseInt(quantity, 10)) && (
                    <Text style={styles.hint}>
                      {'סה"כ: '}{formatCurrency(parseInt(quantity, 10) * courier.pricePerDelivery)}
                    </Text>
                  )}
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>הערות (אופציונלי)</Text>
                  <TextInput
                    style={styles.input}
                    value={notes}
                    onChangeText={setNotes}
                    placeholder="הערות"
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddDelivery}
                >
                  <Text style={styles.saveButtonText}>הוסף</Text>
                </TouchableOpacity>
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={paymentModalVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setPaymentModalVisible(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setPaymentModalVisible(false)}
            >
              <TouchableOpacity
                activeOpacity={1}
                onPress={(e) => e.stopPropagation()}
                style={styles.modalContent}
              >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>תשלום לשליח</Text>
                <TouchableOpacity onPress={() => setPaymentModalVisible(false)}>
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
                    value={paymentAmount}
                    onChangeText={setPaymentAmount}
                    placeholder="0"
                    keyboardType="numeric"
                    textAlign="right"
                  />
                  <Text style={styles.hint}>
                    מאזן נוכחי: {formatCurrency(courier.balance)}
                  </Text>
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>הערות (אופציונלי)</Text>
                  <TextInput
                    style={styles.input}
                    value={paymentNotes}
                    onChangeText={setPaymentNotes}
                    placeholder="הערות"
                    textAlign="right"
                  />
                </View>

                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleAddPayment}
                >
                  <Text style={styles.saveButtonText}>שלם</Text>
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
    </>
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
  errorText: {
    fontSize: 18,
    color: '#EF4444',
    textAlign: 'center',
    marginTop: 32,
  },
  balanceCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  balanceLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 40,
    fontWeight: '700' as const,
    color: '#6B7280',
    marginBottom: 4,
  },
  balanceAmountPositive: {
    color: '#EF4444',
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
  },
  deliveryButton: {
    backgroundColor: '#8B5CF6',
  },
  paymentButton: {
    backgroundColor: '#10B981',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#FFFFFF',
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
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 24,
  },
  list: {
    gap: 8,
  },
  listItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemContent: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'right',
  },
  listItemNotes: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
    textAlign: 'right',
  },
  listItemDate: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
  },
  listItemAmount: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#10B981',
  },
  paymentAmount: {
    color: '#EF4444',
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
  hint: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'right',
  },
  saveButton: {
    backgroundColor: '#8B5CF6',
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
    marginBottom: 16,
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
    backgroundColor: '#EDE9FE',
  },
  filterModalOptionText: {
    fontSize: 16,
    color: '#4B5563',
    textAlign: 'right',
  },
  filterModalOptionTextActive: {
    color: '#8B5CF6',
    fontWeight: '600' as const,
  },
});
