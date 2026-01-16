import React, { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState(() => {
    const stored = localStorage.getItem("cart");
    return stored ? JSON.parse(stored) : [];
  });

  //to persist data to localstorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  //to add items to cart
  const addItem = (item) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) => {
          p.id === item.id ? { ...p, qty: p.qty + 1 } : p;
        });
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  return <CartContext.Provider>{children}</CartContext.Provider>;
}

export const useCart = () => useContext(CartContext);
