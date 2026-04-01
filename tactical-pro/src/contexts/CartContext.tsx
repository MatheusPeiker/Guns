import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  slug: string;
};

export type CartItem = {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  product: Product; // Joined from DB
};

type CartContextType = {
  cartId: string | null;
  items: CartItem[];
  itemCount: number;
  cartTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (slug: string) => Promise<void>;
  updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cartId, setCartId] = useState<string | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Derive counts and totals
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0);

  const fetchOrCreateCart = async () => {
    if (!user) {
      setCartId(null);
      setItems([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Find open cart
      let { data: cart } = await supabase
        .from('carts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'open')
        .single();

      if (!cart) {
        // Create new cart
        const { data: newCart, error } = await supabase
          .from('carts')
          .insert({ user_id: user.id, status: 'open' })
          .select()
          .single();
        if (error) throw error;
        cart = newCart;
      }
      
      setCartId(cart.id);

      // Fetch Items with joined Product
      const { data: cartItems, error: itemsError } = await supabase
        .from('cart_items')
        .select(`
          id, quantity, product_id, cart_id,
          products ( id, name, price, description, image, slug )
        `)
        .eq('cart_id', cart.id)
        .order('id', { ascending: true });

      if (itemsError) throw itemsError;

      // Map Supabase foreign key response correctly
      // Note: 'products' comes as an object/array depending on relation type, assuming 1:1 here it's an object
      const formattedItems: CartItem[] = (cartItems || []).map((ci: any) => ({
        id: ci.id,
        cart_id: ci.cart_id,
        product_id: ci.product_id,
        quantity: ci.quantity,
        product: Array.isArray(ci.products) ? ci.products[0] : ci.products
      }));

      setItems(formattedItems);
    } catch (err) {
      console.error('Error fetching cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrCreateCart();
  }, [user]);

  const addToCart = async (slug: string) => {
    if (!user || !cartId) {
       // Se o usuário não está logado, você pode decidir abrir o login ou gravar um local state, 
       // mas a regra pediu carrinho no Supabase via usuário logado.
       alert('Você precisa estar logado na sua Base para adicionar equipamentos.');
       return;
    }
    setIsLoading(true);

    try {
      // Achar o product_id do slug (idealmente a base faria isso, mas pegamos o UUID do produto)
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .single();
        
      if (!product) throw new Error('Produto não encontrado no sistema.');

      // Check if item exists in this cart
      const existingItem = items.find(item => item.product_id === product.id);

      if (existingItem) {
        // Increment
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
      } else {
        // Insert new
        const { error } = await supabase
          .from('cart_items')
          .insert({
            cart_id: cartId,
            product_id: product.id,
            quantity: 1
          });
        
        if (error) throw error;
        await fetchOrCreateCart(); // refetch to get the full joined item
      }
      setIsCartOpen(true);
    } catch (err) {
      console.error('Error adding to cart:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return removeFromCart(itemId);
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', itemId);
      
      if (error) throw error;
      
      setItems(prev => prev.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    } catch (err) {
      console.error('Error updating quantity:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeFromCart = async (itemId: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('id', itemId);
      
      if (error) throw error;
      setItems(prev => prev.filter(item => item.id !== itemId));
    } catch (err) {
      console.error('Error removing item:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider value={{
      cartId,
      items,
      itemCount,
      cartTotal,
      isCartOpen,
      setIsCartOpen,
      addToCart,
      updateQuantity,
      removeFromCart,
      isLoading
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
