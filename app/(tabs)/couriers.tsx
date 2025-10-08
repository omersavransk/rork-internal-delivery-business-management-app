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
import { useRouter } from 'expo-router';
import { Plus, Edit2, Trash2, X, ChevronLeft } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import type { Courier } from '@/types/database';

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function CouriersScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { couriers, addCourier, updateCourier, deleteCourier } = useData();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCourier, setEditingCourier] = useState<Courier | null>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pricePerDelivery, setPricePerDelivery] = useState('');

  const handleSave = async () => {
    if (!name || !phone || !pricePerDelivery) {
      Alert.alert('שגיאה', 'אנא מלא את כל השדות');
      return;
    }

    const price = parseFloat(pricePerDelivery);
    if (isNaN(price) || price <= 0) {
      Alert.alert('שגיאה', 'אנא הכנס מחיר תקין');
      return;
    }

    if (editingCourier) {
      await updateCourier(editingCourier.id, {
        name,
        phone,
        pricePerDelivery: price,
      });
    } else {
      await addCourier({
        name,
        phone,
        pricePerDelivery: price,
        isActive: true,
        createdBy: user?.id || '',
      });
    }

    resetForm();
  };

  const handleEdit = (courier: Courier) => {
    setEditingCourier(courier);
    setName(courier.name);
    setPhone(courier.phone);
    setPricePerDelivery(courier.pricePerDelivery.toString());
    setModalVisible(true);
  };

  const handleDelete = (id: string) => {
    Alert.alert('מחיקת שליח', 'האם אתה בטוח שברצונך למחוק שליח זה?', [
      { text: 'ביטול', style: 'cancel' },
      {
        text: 'מחק',
        style: 'destructive',
        onPress: () => deleteCourier(id, user?.id || ''),
      },
    ]);
  };



  const resetForm = () => {
    setModalVisible(false);
    setEditingCourier(null);
    setName('');
    setPhone('');
    setPricePerDelivery('');
  };

  const formatCurrency = (value: number) => {
    return `₪${value.toLocaleString('he-IL')}`;
  };

  const sortedCouriers = [...couriers].sort((a, b) => {
    if (a.isActive !== b.isActive) return a.isActive ? -1 : 1;
    return b.balance - a.balance;
  });

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>שליחים</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setModalVisible(true)}
          >
            <Plus size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {sortedCouriers.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>אין שליחים עדיין</Text>
            <Text style={styles.emptySubtext}>לחץ על + להוספת שליח ראשון</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {sortedCouriers.map((courier) => (
              <TouchableOpacity
                key={courier.id}
                style={[
                  styles.card,
                  !courier.isActive && styles.cardInactive,
                ]}
                onPress={() => router.push(`/courier/${courier.id}` as any)}
              >
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{courier.name}</Text>
                    {!courier.isActive && (
                      <View style={styles.inactiveBadge}>
                        <Text style={styles.inactiveBadgeText}>לא פעיל</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.cardPhone}>{courier.phone}</Text>
                  <View style={styles.cardFooter}>
                    <Text style={styles.cardPrice}>
                      {formatCurrency(courier.pricePerDelivery)} למשלוח
                    </Text>
                    <Text
                      style={[
                        styles.cardBalance,
                        courier.balance > 0 && styles.cardBalancePositive,
                      ]}
                    >
                      מאזן: {formatCurrency(courier.balance)}
                    </Text>
                  </View>
                </View>
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleEdit(courier);
                    }}
                  >
                    <Edit2 size={20} color="#2563EB" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      handleDelete(courier.id);
                    }}
                  >
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                  <ChevronLeft size={20} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
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
                  {editingCourier ? 'עריכת שליח' : 'הוספת שליח'}
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
                  <Text style={styles.label}>שם</Text>
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="שם השליח"
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>טלפון</Text>
                  <TextInput
                    style={styles.input}
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="מספר טלפון"
                    keyboardType="phone-pad"
                    textAlign="right"
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.label}>מחיר למשלוח</Text>
                  <TextInput
                    style={styles.input}
                    value={pricePerDelivery}
                    onChangeText={setPricePerDelivery}
                    placeholder="0"
                    keyboardType="numeric"
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
    backgroundColor: '#8B5CF6',
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
  cardInactive: {
    opacity: 0.6,
  },
  cardContent: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: '#1F2937',
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  inactiveBadgeText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600' as const,
  },
  cardPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
    textAlign: 'right',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardPrice: {
    fontSize: 14,
    color: '#4B5563',
  },
  cardBalance: {
    fontSize: 16,
    fontWeight: '600' as const,
    color: '#6B7280',
  },
  cardBalancePositive: {
    color: '#EF4444',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
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
});
