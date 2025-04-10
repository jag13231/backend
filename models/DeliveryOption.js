const deliveryOptions = [
  {
    id: "1",
    deliveryDays: 7,
    priceCents: 0
  },
  {
    id: "2",
    deliveryDays: 3,
    priceCents: 499
  },
  {
    id: "3",
    deliveryDays: 1,
    priceCents: 999
  }
];

export const getAllDeliveryOptions = () => deliveryOptions;
export const findDeliveryOptionById = (id) => deliveryOptions.find(option => option.id === id);

export default deliveryOptions;

