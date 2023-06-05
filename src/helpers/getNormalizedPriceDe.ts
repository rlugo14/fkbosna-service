const getNormalizedPriceDe = (price: number) =>
  price < 0 ? '0,00' : price.toFixed(2).replace('.', ',');

export default getNormalizedPriceDe;
