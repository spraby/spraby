export interface EmailOrderItem {
  title: string
  variantTitle?: string
  quantity: number
  price: string
  finalPrice: string
  image?: string
}

export interface EmailOrderSummary {
  brandName: string
  orderNumber: string
  trackingUrl: string
  items: EmailOrderItem[]
  totalPrice: string
  totalFinalPrice: string
  totalDiscount: string
  itemsCount: number
  // Стоимость доставки из заказа: строка — фиксированная сумма,
  // null — согласуется с продавцом, undefined — старый заказ (строка не показывается)
  shippingPrice?: string | null
  // Итог заказа с доставкой (orders.total); без него — сумма товаров
  total?: string
}
