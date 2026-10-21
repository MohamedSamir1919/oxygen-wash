import { useContext, useEffect, useState } from 'react'
import { AuthContext } from './authContext.js'
import { OrderContext } from './orderContext.js'
import { normalizeOrder } from '../data/orders.js'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const TRACKING_KEY = 'oxygen_order_tracking_tokens'
const LATEST_ORDER_KEY = 'oxygen_latest_order'

async function requestJson(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, options)
  const result = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(result.message || 'تعذر الاتصال بالخادم')
  return result && typeof result === 'object' ? result : {}
}

function readTrackingTokens() {
  try {
    const tokens = JSON.parse(localStorage.getItem(TRACKING_KEY) || '[]')
    return Array.isArray(tokens) ? tokens.filter((value) => typeof value === 'string') : []
  } catch {
    return []
  }
}

export function OrderProvider({ children }) {
  const { user, token, loading: authLoading } = useContext(AuthContext)
  const [cart, setCart] = useState([])
  const [orders, setOrders] = useState([])
  const [drivers, setDrivers] = useState([])
  const [catalogItems, setCatalogItems] = useState([])
  const [catalogServices, setCatalogServices] = useState([])
  const [catalogPrices, setCatalogPrices] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [latestOrderId, setLatestOrderId] = useState(() => localStorage.getItem(LATEST_ORDER_KEY))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedOrderServiceIds, setSelectedOrderServiceIds] = useState([])
  function getItemServicePrice(itemId, serviceId) {
    const price = catalogPrices.find((entry) => String(entry.item?._id || entry.item) === itemId
      && String(entry.service?._id || entry.service) === serviceId)?.price
    return Number.isFinite(price) ? price : null
  }

  function getCartLinePrice(line) {
    return getItemServicePrice(line.itemId, line.serviceId) ?? line.price
  }

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => sum + getCartLinePrice(item) * item.quantity, 0)
  const orderServices = catalogServices.filter((service) => service.applyTo === 'order')
  const extras = orderServices.filter((service) => selectedOrderServiceIds.includes(service._id)).reduce((sum, service) => sum + service.extra, 0)
  const latestOrder = orders.find((order) => order.id === latestOrderId) || null

  useEffect(() => {
    if (authLoading) return undefined

    let active = true
    async function loadOrders() {
      setLoading(true)
      setError('')
      try {
        if (user?.role === 'admin' || user?.role === 'driver') {
          const route = user.role === 'admin' ? '/admin/orders' : '/driver/orders'
          const result = await requestJson(route, { headers: { Authorization: `Bearer ${token}` } })
          if (active) setOrders(Array.isArray(result.orders) ? result.orders.filter((order) => order && typeof order === 'object').map(normalizeOrder) : [])
          if (user.role === 'admin') {
            const driverResult = await requestJson('/admin/orders/drivers', { headers: { Authorization: `Bearer ${token}` } })
            if (active) setDrivers(Array.isArray(driverResult.drivers) ? driverResult.drivers.filter((driver) => driver && typeof driver === 'object') : [])
          }
        } else {
          const trackingTokens = readTrackingTokens()
          const results = await Promise.allSettled(trackingTokens.map((trackingToken) => requestJson(`/orders/track/${trackingToken}`)))
          if (active) setOrders(results.filter((result) => result.status === 'fulfilled' && result.value.order).map((result) => normalizeOrder(result.value.order)))
        }
      } catch (loadError) {
        if (active) {
          setOrders([])
          setDrivers([])
          setError(loadError.message || 'تعذر تحميل الطلبات')
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrders()
    const refreshInterval = user?.role === 'admin' || user?.role === 'driver' ? window.setInterval(async () => {
      try {
        const route = user.role === 'admin' ? '/admin/orders' : '/driver/orders'
        const result = await requestJson(route, { headers: { Authorization: `Bearer ${token}` } })
        if (active) setOrders(Array.isArray(result.orders) ? result.orders.filter((order) => order && typeof order === 'object').map(normalizeOrder) : [])
      } catch {
        // Keep the last successful task list if a background refresh fails.
      }
    }, 8000) : null

    return () => {
      active = false
      if (refreshInterval) window.clearInterval(refreshInterval)
    }
  }, [authLoading, token, user?.id, user?.role])

  useEffect(() => {
    if (authLoading) return undefined

    let active = true
    const isAdmin = user?.role === 'admin'
    const catalogRoute = isAdmin ? '/admin/catalog' : '/catalog'
    const options = isAdmin ? { headers: { Authorization: `Bearer ${token}` } } : {}
    function applyCatalog(result) {
      setCatalogItems(Array.isArray(result.items) ? result.items.filter((item) => item && typeof item === 'object') : [])
      setCatalogServices(Array.isArray(result.services) ? result.services.filter((service) => service && typeof service === 'object') : [])
      setCatalogPrices(Array.isArray(result.prices) ? result.prices.filter((price) => price && typeof price === 'object') : [])
      setCatalogError('')
    }

    requestJson(catalogRoute, options)
      .then((result) => {
        if (!active) return
        applyCatalog(result)
      })
      .catch((catalogLoadError) => {
        if (active) {
          setCatalogItems([])
          setCatalogServices([])
          setCatalogPrices([])
          setCatalogError(catalogLoadError.message || 'تعذر تحميل الكتالوج')
        }
      })
      .finally(() => {
        if (active) setCatalogLoading(false)
      })

    const refreshInterval = window.setInterval(() => {
      requestJson(catalogRoute, options)
        .then((result) => { if (active) applyCatalog(result) })
        .catch(() => {})
    }, 15000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
    }
  }, [authLoading, token, user?.role])

  function addItem(item, service) {
    const pairPrice = getItemServicePrice(item._id, service._id)
    if (pairPrice === null) return
    const lineId = `${item._id}-${service._id}`
    setCart((current) => {
      const existing = current.find((line) => line.lineId === lineId)
      if (existing) return current.map((line) => line.lineId === lineId ? { ...line, quantity: line.quantity + 1 } : line)
      return [...current, { ...item, itemId: item._id, serviceId: service._id, lineId, service: service.name, price: pairPrice, quantity: 1 }]
    })
  }

  function changeQuantity(lineId, amount) {
    setCart((current) => current.map((item) => item.lineId === lineId ? { ...item, quantity: item.quantity + amount } : item).filter((item) => item.quantity > 0))
  }

  async function placeOrder(details) {
    const result = await requestJson('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customer: { name: details.name, phone: details.phone, address: details.address, landmark: details.landmark },
        items: cart.map((item) => ({ itemId: item.itemId, serviceId: item.serviceId, quantity: item.quantity })),
        total: subtotal + extras,
        extras: { serviceIds: selectedOrderServiceIds },
        paymentMethod: details.payment,
        pickupWindow: details.pickup,
        deliveryHours: details.delivery,
      }),
    })
    if (!result.order || typeof result.order.trackingToken !== 'string') throw new Error('استجابة الطلب غير مكتملة')
    const order = normalizeOrder(result.order)
    const trackingTokens = readTrackingTokens()
    localStorage.setItem(TRACKING_KEY, JSON.stringify([result.order.trackingToken, ...trackingTokens]))
    localStorage.setItem(LATEST_ORDER_KEY, order.id)
    setLatestOrderId(order.id)
    setOrders((current) => [order, ...current])
    setCart([])
    setSelectedOrderServiceIds([])
    return order
  }

  async function assignOrder(orderId, driverId, phase) {
    const result = await requestJson(`/admin/orders/${orderId}/assign`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ driverId, phase }),
    })
    if (!result.order || typeof result.order !== 'object') throw new Error('استجابة تحديث الطلب غير مكتملة')
    const updatedOrder = normalizeOrder(result.order)
    setOrders((current) => current.map((order) => order._id === orderId ? updatedOrder : order))
    return updatedOrder
  }

  async function updateOrderStatus(orderId, status) {
    const route = user?.role === 'admin' ? `/admin/orders/${orderId}/status` : `/driver/orders/${orderId}/status`
    const result = await requestJson(route, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ status }),
    })
    if (!result.order || typeof result.order !== 'object') throw new Error('استجابة تحديث الطلب غير مكتملة')
    const updatedOrder = normalizeOrder(result.order)
    setOrders((current) => current.map((order) => order._id === orderId ? updatedOrder : order))
    return updatedOrder
  }

  async function createCatalogRecord(kind, values) {
    const plural = kind === 'item' ? 'items' : 'services'
    const result = await requestJson(`/admin/catalog/${plural}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    })
    const record = kind === 'item' ? result.item : result.service
    if (!record || typeof record !== 'object') throw new Error('استجابة حفظ الكتالوج غير مكتملة')
    if (kind === 'item') {
      setCatalogItems((current) => [...current, record].sort((first, second) => (first.category || '').localeCompare(second.category || '', 'ar')))
      setCatalogPrices((current) => [...current, ...catalogServices.filter((service) => service.applyTo === 'item').map((service) => ({ item: record._id, service: service._id, price: Math.max(8, record.price + service.extra) }))])
    } else {
      setCatalogServices((current) => [...current, record].sort((first, second) => (first.name || '').localeCompare(second.name || '', 'ar')))
      if (record.applyTo === 'item') {
        setCatalogPrices((current) => [...current, ...catalogItems.map((item) => ({ item: item._id, service: record._id, price: Math.max(8, item.price + record.extra) }))])
      }
    }
    return record
  }

  async function updateCatalogRecord(kind, recordId, values) {
    const plural = kind === 'item' ? 'items' : 'services'
    const result = await requestJson(`/admin/catalog/${plural}/${recordId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(values),
    })
    const record = kind === 'item' ? result.item : result.service
    if (!record || typeof record !== 'object') throw new Error('استجابة تحديث الكتالوج غير مكتملة')
    if (kind === 'item') setCatalogItems((current) => current.map((item) => item._id === recordId ? record : item).sort((first, second) => (first.category || '').localeCompare(second.category || '', 'ar')))
    else {
      const previousService = catalogServices.find((service) => service._id === recordId)
      setCatalogServices((current) => current.map((service) => service._id === recordId ? record : service).sort((first, second) => (first.name || '').localeCompare(second.name || '', 'ar')))
      if (record.applyTo === 'item' && previousService?.applyTo !== 'item') {
        setCatalogPrices((current) => {
          const next = [...current]
          for (const item of catalogItems) {
            if (!next.some((price) => String(price.item?._id || price.item) === item._id && String(price.service?._id || price.service) === record._id)) {
              next.push({ item: item._id, service: record._id, price: Math.max(8, item.price + record.extra) })
            }
          }
          return next
        })
      }
    }
    return record
  }

  async function updateItemServicePrice(itemId, serviceId, price) {
    const result = await requestJson('/admin/catalog/prices', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ itemId, serviceId, price }),
    })
    if (!result.price || typeof result.price !== 'object') throw new Error('استجابة حفظ سعر القطعة والخدمة غير مكتملة')
    setCatalogPrices((current) => [
      ...current.filter((entry) => !(String(entry.item) === itemId && String(entry.service) === serviceId)),
      result.price,
    ])
    return result.price
  }

  function setOrderService(serviceId, enabled) {
    setSelectedOrderServiceIds((current) => enabled
      ? [...new Set([...current, serviceId])]
      : current.filter((id) => id !== serviceId))
  }

  const value = {
    cart, cartCount, subtotal, extras, total: subtotal + extras, orders, latestOrder, drivers, loading, error,
    catalogItems, catalogServices, catalogPrices, catalogLoading, catalogError, orderServices, selectedOrderServiceIds,
    addItem, changeQuantity, placeOrder, assignOrder, updateOrderStatus, createCatalogRecord, updateCatalogRecord, updateItemServicePrice, getItemServicePrice, getCartLinePrice, setOrderService,
  }

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>
}