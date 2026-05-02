import crypto from 'crypto'


const order_id = "order_Sk6doWgg8VpRyY";

const payment_id = "pay_test_123";

const signature = crypto
  .createHmac('sha256','fLPa3IS1oN8vO4ionIquPaRd')
  .update(`${order_id}|${payment_id}`)
  .digest('hex');

console.log("GENERATED:", signature);
