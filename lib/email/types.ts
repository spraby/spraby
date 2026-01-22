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
}
