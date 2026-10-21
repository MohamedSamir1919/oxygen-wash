const statusDetails = {
  confirmed: { label: 'تم تأكيد الطلب', step: 0 },
  assigned: { label: 'المندوب في الطريق', step: 1 },
  picked_up: { label: 'تم الاستلام', step: 2 },
  processing: { label: 'جاري الغسيل والمكواة', step: 3 },
  ready_for_delivery: { label: 'خرج للتسليم', step: 4 },
  delivered: { label: 'تم التسليم', step: 6 },
}

export function normalizeOrder(order) {
  const value = order && typeof order === 'object' ? order : {}
  const currentStatus = statusDetails[value.status] || statusDetails.confirmed
  const lineItems = Array.isArray(value.items) ? value.items.filter((item) => item && typeof item === 'object') : []
  const createdAt = value.createdAt ? new Date(value.createdAt) : null
  return {
    ...value,
    id: typeof value.orderNumber === 'string' ? value.orderNumber : 'طلب غير معروف',
    date: createdAt && !Number.isNaN(createdAt.getTime())
      ? createdAt.toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
      : '—',
    lineItems,
    items: lineItems.map((item) => `${item.quantity || 0} ${item.name || 'قطعة'}`).join('، '),
    status: currentStatus.label,
    statusType: value.status === 'delivered' ? 'success' : 'warning',
    step: currentStatus.step,
    customer: value.customer && typeof value.customer === 'object' ? value.customer : {},
    customerName: value.customer?.name || '',
  }
}

export function formatOrderDate(value) {
  if (!value) return 'لم يحدد بعد'
  return new Date(value).toLocaleString('ar-EG', { dateStyle: 'medium', timeStyle: 'short' })
}

export function getOrderStatusLabel(status) {
  return statusDetails[status]?.label || 'حالة غير معروفة'
}