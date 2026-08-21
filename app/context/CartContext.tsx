"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartProduct = {
  id: number;
  name: string;
  price: number;
  image_url: string | null;
};

type CartContextType = {
  cart: CartProduct[];
  addToCart: (product: CartProduct) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
};

const CartContext = createContext<CartContextType | undefined>(
  undefined
);

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartProduct[]>([]);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("amr-store-cart");

      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        "amr-store-cart",
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error("Erro ao salvar carrinho:", error);
    }
  }, [cart]);

  function addToCart(product: CartProduct) {
    setCart((currentCart) => {
      const alreadyExists = currentCart.some(
        (item) => item.id === product.id
      );

      if (alreadyExists) {
        return currentCart;
      }

      return [...currentCart, product];
    });
  }

  function removeFromCart(id: number) {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  }

  function clearCart() {
    setCart([]);
  }

  const cartCount = cart.length;

  const cartTotal = cart.reduce(
    (total, product) => total + product.price,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart deve ser usado dentro de CartProvider"
    );
  }

  return context;
}
