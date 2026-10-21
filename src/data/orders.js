const statusDetails = {
  confirmed: { label: 'تم تأكيد الطلب', step: 0 },
  assigned: { label: 'المندوب في الطريق', step: 1 },
  picked_up: { label: 'تم الاستلام', step: 2 },
  processing: { label: 'جاري الغسيل والمكواة', step: 3 },
  ready_for_delivery: { label: 'خرج للتسليم', step: 4 },
  delivered: { label: 'تم التسليم', step: 6 },
}

export function normalizeOrder(order) {
  const currentStatus = statusDetails[order.status] || statusDetails.confirmed
  return {
    ...order,
    id: order.orderNumber,
    date: new Date(order.createdAt).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' }),
    items: order.items.map((item) => `${item.quantity} ${item.name}`).join('، '),
    status: currentStatus.label,
    statusType: order.status === 'delivered' ? 'success' : 'warning',
    step: currentStatus.step,
    customerName: order.customer?.name || '',
  }
}

export function formatOrderDate(value) {
  if (!value) return 'لم يحدد بعد'
  return new Date(value).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}

export function getOrderStatusLabel(status) {
  return statusDetails[status]?.label || 'حالة غير معروفة'
}