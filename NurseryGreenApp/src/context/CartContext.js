import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      const stored = await AsyncStorage.getItem('cart');
      if (stored) setItems(JSON.parse(stored));
    } catch (e) {
      console.log('Error loading cart:', e);
    }
  };

  const saveCart = async (cartItems) => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(cartItems));
    } catch (e) {
      console.log('Error saving cart:', e);
    }
  };

  const addToCart = (product) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      let updated;
      if (existing) {
        updated = prev.map(i =>
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      } else {
        updated = [...prev, { ...product, quantity: 1 }];
      }
      saveCart(updated);
      return updated;
    });
  };

  const removeFromCart = (productId) => {
    setItems(prev => {
      const updated = prev.filter(i => i.id !== productId);
      saveCart(updated);
      return updated;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prev => {
      const updated = prev.map(i =>
        i.id === productId ? { ...i, quantity } : i
      );
      saveCart(updated);
      return updated;
    });
  };

  const clearCart = () => {
    setItems([]);
    saveCart([]);
  };

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      itemCount,
      subtotal,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
}

export default CartContext;
