import { createSlice, PayloadAction } from "@reduxjs/toolkit";

// Purchase volume interface
export interface CartPurchaseVolume {
  id: string;
  name: string;
  min_quantity: string;
  max_quantity: string | null;
  price: string;
}

// Cart item interface
export interface CartItem {
  product_id: string;
  product_name: string;
  qty: number;
  unit_price: number; // Base product price
  category?: string;
  purchase_volumes?: CartPurchaseVolume[]; // Volume pricing tiers
}

// Helper function to calculate effective price based on quantity and purchase volumes
export const calculateEffectivePrice = (
  qty: number,
  basePrice: number,
  purchaseVolumes?: CartPurchaseVolume[],
): { price: number; volumeName: string | null; isDiscounted: boolean } => {
  if (!purchaseVolumes || purchaseVolumes.length === 0) {
    return { price: basePrice, volumeName: null, isDiscounted: false };
  }

  // Find the best matching volume tier for the quantity
  let bestMatch: CartPurchaseVolume | null = null;

  for (const volume of purchaseVolumes) {
    const minQty = parseFloat(volume.min_quantity);
    const maxQty = volume.max_quantity
      ? parseFloat(volume.max_quantity)
      : Infinity;

    if (qty >= minQty && qty <= maxQty) {
      // If we found a match, prefer the one with highest min_quantity (most specific)
      if (!bestMatch || minQty > parseFloat(bestMatch.min_quantity)) {
        bestMatch = volume;
      }
    }
  }

  if (bestMatch) {
    const volumePrice = parseFloat(bestMatch.price);
    return {
      price: volumePrice,
      volumeName: bestMatch.name,
      isDiscounted: volumePrice < basePrice,
    };
  }

  return { price: basePrice, volumeName: null, isDiscounted: false };
};

// Cart state interface
interface CartState {
  items: CartItem[];
  customer_id: string | null;
  customer_name: string | null;
  priority: "low" | "normal" | "high" | "urgent";
  notes: string;
}

// Initial state
const initialState: CartState = {
  items: [],
  customer_id: null,
  customer_name: null,
  priority: "normal",
  notes: "",
};

// Load cart from localStorage if available
const loadCartFromStorage = (): CartState => {
  if (typeof window === "undefined") return initialState;
  try {
    const stored = localStorage.getItem("sales-person-cart");
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error("Error loading cart from storage:", error);
  }
  return initialState;
};

// Save cart to localStorage
const saveCartToStorage = (state: CartState) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("sales-person-cart", JSON.stringify(state));
  } catch (error) {
    console.error("Error saving cart to storage:", error);
  }
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Initialize cart from storage
    initializeCart: (state) => {
      const stored = loadCartFromStorage();
      state.items = stored.items;
      state.customer_id = stored.customer_id;
      state.customer_name = stored.customer_name;
      state.priority = stored.priority;
      state.notes = stored.notes;
    },

    // Add item to cart
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingIndex = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id,
      );
      if (existingIndex >= 0) {
        // Update quantity if item exists
        state.items[existingIndex].qty += action.payload.qty;
      } else {
        // Add new item
        state.items.push(action.payload);
      }
      saveCartToStorage(state);
    },

    // Update item quantity
    updateItemQty: (
      state,
      action: PayloadAction<{ product_id: string; qty: number }>,
    ) => {
      const index = state.items.findIndex(
        (item) => item.product_id === action.payload.product_id,
      );
      if (index >= 0) {
        if (action.payload.qty <= 0) {
          state.items.splice(index, 1);
        } else {
          state.items[index].qty = action.payload.qty;
        }
        saveCartToStorage(state);
      }
    },

    // Remove item from cart
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(
        (item) => item.product_id !== action.payload,
      );
      saveCartToStorage(state);
    },

    // Set customer
    setCustomer: (
      state,
      action: PayloadAction<{ id: string; name: string } | null>,
    ) => {
      if (action.payload) {
        state.customer_id = action.payload.id;
        state.customer_name = action.payload.name;
      } else {
        state.customer_id = null;
        state.customer_name = null;
      }
      saveCartToStorage(state);
    },

    // Set priority
    setPriority: (
      state,
      action: PayloadAction<"low" | "normal" | "high" | "urgent">,
    ) => {
      state.priority = action.payload;
      saveCartToStorage(state);
    },

    // Set notes
    setNotes: (state, action: PayloadAction<string>) => {
      state.notes = action.payload;
      saveCartToStorage(state);
    },

    // Clear cart
    clearCart: (state) => {
      state.items = [];
      state.customer_id = null;
      state.customer_name = null;
      state.priority = "normal";
      state.notes = "";
      saveCartToStorage(state);
    },
  },
});

export const {
  initializeCart,
  addToCart,
  updateItemQty,
  removeFromCart,
  setCustomer,
  setPriority,
  setNotes,
  clearCart,
} = cartSlice.actions;

// Selectors
export const selectCartItems = (state: { cart: CartState }) => state.cart.items;
export const selectCartItemCount = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => total + item.qty, 0);
export const selectCartTotal = (state: { cart: CartState }) =>
  state.cart.items.reduce((total, item) => {
    const { price } = calculateEffectivePrice(
      item.qty,
      item.unit_price,
      item.purchase_volumes,
    );
    return total + item.qty * price;
  }, 0);
export const selectCartCustomer = (state: { cart: CartState }) => ({
  id: state.cart.customer_id,
  name: state.cart.customer_name,
});
export const selectCartPriority = (state: { cart: CartState }) =>
  state.cart.priority;
export const selectCartNotes = (state: { cart: CartState }) => state.cart.notes;

export default cartSlice.reducer;
