export const categories = [
  { name: 'رجالي', items: [
    { name: 'قميص', price: 22, icon: 'shirt' }, { name: 'بنطلون', price: 28, icon: 'pants' },
    { name: 'بدلة كاملة', price: 95, icon: 'suit' }, { name: 'تيشيرت', price: 18, icon: 'shirt' },
  ] },
  { name: 'حريمي', items: [
    { name: 'فستان', price: 65, icon: 'dress' }, { name: 'عباية', price: 48, icon: 'dress' },
    { name: 'بلوزة', price: 22, icon: 'shirt' }, { name: 'طرحة', price: 14, icon: 'shirt' },
  ] },
  { name: 'مفروشات', items: [
    { name: 'سجادة', price: 120, icon: 'rug' }, { name: 'بطانية', price: 75, icon: 'blanket' },
    { name: 'ستارة', price: 90, icon: 'curtain' }, { name: 'مفرش سرير', price: 55, icon: 'blanket' },
  ] },
]

export const serviceTypes = [
  { id: 'wash-iron', name: 'غسيل ومكواة', detail: 'تنظيف متكامل وعناية يومية', extra: 0 },
  { id: 'iron', name: 'مكواة فقط', detail: 'كيّ احترافي يحافظ على شكل القطعة', extra: -6 },
  { id: 'dry-clean', name: 'دراي كلين', detail: 'تنظيف جاف للأقمشة الحساسة', extra: 18 },
  { id: 'stain', name: 'إزالة بقع', detail: 'معالجة مركزة للبقع الصعبة', extra: 12 },
]

export const initialOrders = [
  { id: 'OX-24081', date: 'اليوم، ١٠:٣٠ ص', total: 184, status: 'جاري الغسيل', statusType: 'warning', items: 'قميصان، بنطلون، عباية', step: 2 },
  { id: 'OX-23942', date: '١٨ أكتوبر ٢٠٢٦', total: 96, status: 'تم التسليم', statusType: 'success', items: 'فستان، قميصان', step: 4 },
  { id: 'OX-23877', date: '١٢ أكتوبر ٢٠٢٦', total: 245, status: 'تم التسليم', statusType: 'success', items: 'بدلة، بطانية، ٣ قمصان', step: 4 },
]