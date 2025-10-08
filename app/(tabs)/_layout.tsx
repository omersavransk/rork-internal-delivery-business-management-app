import { Tabs, useRouter } from "expo-router";
import { LayoutDashboard, TrendingUp, TrendingDown, Users, Activity, LogOut } from "lucide-react-native";
import React from "react";
import { TouchableOpacity, I18nManager } from "react-native";
import { useAuth } from "@/contexts/AuthContext";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function TabLayout() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#9CA3AF',
        headerShown: true,
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontWeight: '700' as const,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "דשבורד",
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <LogOut size={24} color="#EF4444" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="income"
        options={{
          title: "הכנסות",
          tabBarIcon: ({ color }) => <TrendingUp size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="expenses"
        options={{
          title: "הוצאות",
          tabBarIcon: ({ color }) => <TrendingDown size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="couriers"
        options={{
          title: "שליחים",
          tabBarIcon: ({ color }) => <Users size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: "פעילות",
          tabBarIcon: ({ color }) => <Activity size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
