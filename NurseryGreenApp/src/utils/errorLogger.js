import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as Application from 'expo-application';
import api from '../api/client';

const STORAGE_KEY = 'mobileErrorLogs';
const MAX_STORED_LOGS = 200;
const MAX_UPLOAD_BATCH = 30;
const FLUSH_COOLDOWN_MS = 15000;
let lastFlushAt = 0;
let flushInFlight = false;

const normalizeError = (error) => {
  if (!error) return { message: 'Unknown error', stack: null, name: 'Error' };
  if (typeof error === 'string') return { message: error, stack: null, name: 'Error' };
  return {
    message: error.message || 'Unknown error',
    stack: error.stack || null,
    name: error.name || 'Error',
  };
};

const buildLog = (payload = {}) => {
  const err = normalizeError(payload.error);
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: new Date().toISOString(),
    level: payload.level || 'error',
    source: payload.source || 'unknown',
    isFatal: !!payload.isFatal,
    message: err.message,
    name: err.name,
    stack: err.stack,
    extra: payload.extra || null,
    context: {
      platform: Platform.OS,
      platformVersion: Platform.Version,
      appVersion: Application.nativeApplicationVersion || Constants.expoConfig?.version || 'unknown',
      buildVersion: Application.nativeBuildVersion || 'unknown',
      runtimeVersion: Constants.expoConfig?.runtimeVersion || Constants.manifest2?.runtimeVersion || 'unknown',
      releaseChannel: Constants.expoConfig?.updates?.channel || 'default',
      executionEnvironment: Constants.executionEnvironment || 'unknown',
    },
  };
};

const readLogs = async () => {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeLogs = async (logs) => {
  const bounded = logs.slice(-MAX_STORED_LOGS);
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(bounded));
};

export const logError = async (payload) => {
  try {
    const logs = await readLogs();
    logs.push(buildLog(payload));
    await writeLogs(logs);
  } catch (e) {
    console.warn('Failed to persist error log', e?.message || e);
  }
};

export const flushErrorLogs = async (force = false) => {
  const now = Date.now();
  if (!force && (flushInFlight || now - lastFlushAt < FLUSH_COOLDOWN_MS)) return;
  flushInFlight = true;
  lastFlushAt = now;

  try {
    const logs = await readLogs();
    if (!logs.length) return;

    const batch = logs.slice(0, MAX_UPLOAD_BATCH);
    await api.reportMobileErrors(batch);

    const remaining = logs.slice(batch.length);
    await writeLogs(remaining);
  } catch (e) {
    console.warn('Failed to upload mobile error logs', e?.message || e);
  } finally {
    flushInFlight = false;
  }
};

export const installGlobalErrorHandler = () => {
  if (!global?.ErrorUtils?.getGlobalHandler || !global?.ErrorUtils?.setGlobalHandler) {
    return () => {};
  }

  const defaultHandler = global.ErrorUtils.getGlobalHandler();

  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    logError({
      source: 'global',
      isFatal,
      error,
      extra: { jsEngine: global.HermesInternal ? 'hermes' : 'jsc' },
    }).finally(() => flushErrorLogs());

    if (typeof defaultHandler === 'function') {
      defaultHandler(error, isFatal);
    }
  });

  const previousUnhandledRejection = global.onunhandledrejection;
  global.onunhandledrejection = (event) => {
    logError({
      source: 'unhandledrejection',
      isFatal: false,
      error: event?.reason || 'Unhandled promise rejection',
      extra: {
        type: event?.type || null,
      },
    }).finally(() => flushErrorLogs());

    if (typeof previousUnhandledRejection === 'function') {
      previousUnhandledRejection(event);
    }
  };

  return () => {
    global.ErrorUtils.setGlobalHandler(defaultHandler);
    global.onunhandledrejection = previousUnhandledRejection;
  };
};
