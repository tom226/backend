/**
 * Application entry point.
 *
 * We import globals.js FIRST to install browser-compat shims (window,
 * self, document) before any other module is evaluated. This prevents
 * ReferenceErrors in third-party packages that assume a browser
 * environment at load time (React DevTools, whatwg-fetch, etc.).
 */
import './globals';
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
