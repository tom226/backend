import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import AppNavigator from './src/navigation/AppNavigator';
import ErrorBoundary from './src/components/ErrorBoundary';
import { flushErrorLogs, installGlobalErrorHandler, logError } from './src/utils/errorLogger';

// Keep the splash screen visible while we load resources
SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  useEffect(() => {
    // Hide splash screen after a brief delay to ensure smooth transition
    const timer = setTimeout(() => {
      SplashScreen.hideAsync().catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const uninstall = installGlobalErrorHandler();

    logError({
      source: 'app-start',
      level: 'info',
      isFatal: false,
      error: 'App launched',
    }).finally(() => flushErrorLogs(true));

    const flushTimer = setInterval(() => {
      flushErrorLogs();
    }, 30000);

    return () => {
      clearInterval(flushTimer);
      if (typeof uninstall === 'function') uninstall();
    };
  }, []);

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
        <AuthProvider>
          <CartProvider>
            <StatusBar
              style="dark"
              backgroundColor="#FAFEF2"
              translucent={Platform.OS === 'android'}
            />
            <AppNavigator />
          </CartProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}
