import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';
import { Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { RegisterScreen } from '../screens/auth/RegisterScreen';
import { CreatePostScreen } from '../screens/create/CreatePostScreen';
import { FeedScreen } from '../screens/feed/FeedScreen';
import { PostDetailScreen } from '../screens/feed/PostDetailScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { AddressManagementScreen } from '../screens/profile/AddressManagementScreen';
import { PaymentMethodsScreen } from '../screens/profile/PaymentMethodsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SearchScreen } from '../screens/search/SearchScreen';
import { CartScreen } from '../screens/shop/CartScreen';
import { OrderDetailScreen } from '../screens/shop/OrderDetailScreen';
import { OrdersScreen } from '../screens/shop/OrdersScreen';
import { ProductDetailScreen } from '../screens/shop/ProductDetailScreen';
import { ShopScreen } from '../screens/shop/ShopScreen';
import { Colors, Typography } from '../theme';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// ── Type declarations ──────────────────────────────────────────────────────────

export type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type FeedStackParamList = {
  FeedHome: undefined;
  PostDetail: { postId: string };
};

export type ShopStackParamList = {
  ShopHome: undefined;
  ProductDetail: { productId: string };
  Cart: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Search: undefined;
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Orders: undefined;
  OrderDetail: { orderId: string };
  Addresses: undefined;
  PaymentMethods: undefined;
  Notifications: undefined;
  PostDetail: { postId: string };
};

export type TabParamList = {
  FeedTab: undefined;
  ShopTab: undefined;
  Create: undefined;
  ProfileTab: undefined;
};

// ── Stack Navigators ───────────────────────────────────────────────────────────

const RootStack = createStackNavigator<RootStackParamList>();
const AuthStack = createStackNavigator<AuthStackParamList>();
const FeedStack = createStackNavigator<FeedStackParamList>();
const ShopStack = createStackNavigator<ShopStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
    </AuthStack.Navigator>
  );
}

function FeedNavigator() {
  return (
    <FeedStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.black,
        headerTitleStyle: { fontWeight: Typography.bold },
        headerBackTitle: '',
      }}
    >
      <FeedStack.Screen name="FeedHome" component={FeedScreen} options={{ title: 'miniMule' }} />
      <FeedStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '' }} />
    </FeedStack.Navigator>
  );
}

function ShopNavigator() {
  return (
    <ShopStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.white },
        headerTintColor: Colors.black,
        headerTitleStyle: { fontWeight: Typography.bold },
        headerBackTitle: '',
      }}
    >
      <ShopStack.Screen name="ShopHome" component={ShopScreen} options={{ title: 'Shop' }} />
      <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
      <ShopStack.Screen name="Cart" component={CartScreen} options={{ title: 'Cart', headerShown: false }} />
      <ShopStack.Screen name="Orders" component={OrdersScreen} options={{ title: 'My Orders', headerShown: false }} />
      <ShopStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ title: 'Order Details', headerShown: false }} />
      <ShopStack.Screen name="Search" component={SearchScreen} options={{ headerShown: false }} />
    </ShopStack.Navigator>
  );
}

function ProfileNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileHome" component={ProfileScreen} />
      <ProfileStack.Screen name="Orders" component={OrdersScreen} />
      <ProfileStack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <ProfileStack.Screen name="Addresses" component={AddressManagementScreen} />
      <ProfileStack.Screen name="PaymentMethods" component={PaymentMethodsScreen} />
      <ProfileStack.Screen name="Notifications" component={NotificationsScreen} />
      <ProfileStack.Screen name="PostDetail" component={PostDetailScreen} />
    </ProfileStack.Navigator>
  );
}

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray500,
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: Typography.xs,
          fontWeight: Typography.medium,
        },
        tabBarIcon: ({ color, size }) => {
          const icons: Record<string, string> = {
            FeedTab: '◉',
            ShopTab: '◈',
            Create: '✚',
            ProfileTab: '◎',
          };
          return (
            <Text style={{ fontSize: size * 0.9, color }}>{icons[route.name] ?? '●'}</Text>
          );
        },
      })}
    >
      <Tab.Screen name="FeedTab" component={FeedNavigator} options={{ tabBarLabel: 'Feed' }} />
      <Tab.Screen name="ShopTab" component={ShopNavigator} options={{ tabBarLabel: 'Shop' }} />
      <Tab.Screen
        name="Create"
        component={CreatePostScreen}
        options={{
          tabBarIcon: ({ color }) => (
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: Colors.primary,
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 4,
              }}
            >
              <Text style={{ fontSize: 24, color: Colors.white, lineHeight: 28 }}>+</Text>
            </View>
          ),
          tabBarLabel: '',
        }}
      />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ tabBarLabel: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { token, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {token ? (
          <RootStack.Screen name="Main" component={TabNavigator} />
        ) : (
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
