const CartItem = [
  {
    id: "1",
    productId: "e43638ce-6aa0-4b85-b27f-e1d07eb678c6",
    quantity: 2,
    deliveryOptionId: "1"
  },
  {
    id: "2",
    productId: "15b6fc6f-327a-4ec4-896f-486349e85a3d",
    quantity: 1,
    deliveryOptionId: "2"
  }
];

export const getCart = () => CartItem;

export const addToCart = (item) => {
  CartItem.push(item);
};

export const updateCartItem = (productId, updatedItem) => {
  const index = CartItem.findIndex(item => item.productId === productId);
  if (index !== -1) {
    CartItem[index] = { ...CartItem[index], ...updatedItem };
  }
};

export const removeFromCart = (productId) => {
  const index = CartItem.findIndex(item => item.productId === productId);
  if (index !== -1) {
    CartItem.splice(index, 1);
  }
};

// Save defaultCart to CartItem
export const saveDefaultCart = (defaultCart) => {
  defaultCart.forEach(item => {
    if (!CartItem.find(cartItem => cartItem.productId === item.productId)) {
      CartItem.push(item);
    }
  });
};
