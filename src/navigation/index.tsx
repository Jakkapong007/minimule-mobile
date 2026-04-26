import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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
import { Colors, Shadow, Typography } from '../theme';
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

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();
const ShopStack = createNativeStackNavigator<ShopStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const stackScreenOptions = {
  headerStyle: { backgroundColor: Colors.white },
  headerTintColor: Colors.gray900,
  headerTitleStyle: { fontWeight: Typography.bold, fontSize: 17 } as const,
  headerBackTitle: '',
  contentStyle: { backgroundColor: Colors.white },
};

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
    <FeedStack.Navigator screenOptions={stackScreenOptions}>
      <FeedStack.Screen name="FeedHome" component={FeedScreen} options={{ headerShown: false }} />
      <FeedStack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '' }} />
    </FeedStack.Navigator>
  );
}

function ShopNavigator() {
  return (
    <ShopStack.Navigator screenOptions={stackScreenOptions}>
      <ShopStack.Screen name="ShopHome" component={ShopScreen} options={{ headerShown: false }} />
      <ShopStack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: '' }} />
      <ShopStack.Screen name="Cart" component={CartScreen} options={{ headerShown: false }} />
      <ShopStack.Screen name="Orders" component={OrdersScreen} options={{ headerShown: false }} />
      <ShopStack.Screen name="OrderDetail" component={OrderDetailScreen} options={{ headerShown: false }} />
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

const TAB_ICONS: Record<string, { label: string; icon: string; activeIcon: string }> = {
  FeedTab:    { label: 'Feed',    icon: '⊡', activeIcon: '▣' },
  ShopTab:    { label: 'Shop',    icon: '◇', activeIcon: '◆' },
  Create:     { label: '',        icon: '+', activeIcon: '+' },
  ProfileTab: { label: 'Profile', icon: '○', activeIcon: '●' },
};

function CreateTabIcon() {
  return (
    <View style={{
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: Colors.primary,
      alignItems: 'center', justifyContent: 'center',
      marginBottom: 6,
      ...Shadow.primary,
    }}>
      <Text style={{ fontSize: 26, color: Colors.white, lineHeight: 30, fontWeight: '300' }}>+</Text>
    </View>
  );
}

function TabIcon({ routeName, color, focused }: Readonly<{ routeName: string; color: string; focused: boolean }>) {
  if (routeName === 'Create') return <CreateTabIcon />;
  const tab = TAB_ICONS[routeName];
  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', width: 32, height: 28 }}>
      <Text style={{ fontSize: 20, color, lineHeight: 24 }}>
        {focused ? tab?.activeIcon : tab?.icon}
      </Text>
    </View>
  );
}

function makeTabScreenOptions({ route }: { route: { name: string } }) {
  return {
    headerShown: false,
    tabBarActiveTintColor: Colors.primary,
    tabBarInactiveTintColor: Colors.gray400,
    tabBarStyle: {
      backgroundColor: Colors.white,
      borderTopWidth: 0,
      height: 64,
      paddingBottom: 10,
      paddingTop: 6,
      ...Shadow.md,
    },
    tabBarLabelStyle: {
      fontSize: Typography.xs,
      fontWeight: Typography.semibold,
      letterSpacing: 0.2,
    },
    tabBarIcon: ({ color, focused }: { color: string; focused: boolean }) => (
      <TabIcon routeName={route.name} color={color} focused={focused} />
    ),
  };
}

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={makeTabScreenOptions}>
      <Tab.Screen name="FeedTab" component={FeedNavigator} options={{ tabBarLabel: 'Feed' }} />
      <Tab.Screen name="ShopTab" component={ShopNavigator} options={{ tabBarLabel: 'Shop' }} />
      <Tab.Screen name="Create" component={CreatePostScreen} options={{ tabBarLabel: '' }} />
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
