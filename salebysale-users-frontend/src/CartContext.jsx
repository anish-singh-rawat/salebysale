import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

const STORAGE_KEY = "sbs_cart";

function loadCart() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState(loadCart);

  // persist on every change
  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  function addToCart(inventoryId, offer) {
    setCart((prev) => {
      const existing = prev.find((i) => i.inventoryId === inventoryId);
      if (existing) {
        return prev.map((i) =>
          i.inventoryId === inventoryId
            ? { ...i, qty: Math.min(i.qty + 1, offer?.availableQty || 99) }
            : i
        );
      }
      return [
        ...prev,
        {
          inventoryId,
          qty: 1,
          // snapshot for cart display
          brand: offer?.sku?.brand || "",
          model: offer?.sku?.model || "",
          variant: offer?.sku?.variant || "",
          color: offer?.sku?.color || "",
          primaryImage: offer?.primaryImage || null,
          landedPrice: offer?.pricing?.landedPrice || 0,
          availableQty: offer?.availableQty || 99,
        },
      ];
    });
  }

  function removeFromCart(inventoryId) {
    setCart((prev) => prev.filter((i) => i.inventoryId !== inventoryId));
  }

  function updateQty(inventoryId, qty) {
    if (qty < 1) return removeFromCart(inventoryId);
    setCart((prev) =>
      prev.map((i) =>
        i.inventoryId === inventoryId
          ? { ...i, qty: Math.min(qty, i.availableQty || 99) }
          : i
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  const totalItems = cart.reduce((s, i) => s + i.qty, 0);
  const totalPrice = cart.reduce((s, i) => s + i.landedPrice * i.qty, 0);

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQty, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}
