import { NextRequest, NextResponse } from 'next/server';

// Mock物流数据
const mockLogistics = [
  {
    id: 'LOG001',
    order_id: 'ORD001',
    carrier: 'J&T Express',
    tracking_number: 'JT1234567890123',
    status: 'in_transit',
    shipped_at: '2026-03-20 10:30:00',
    delivered_at: null,
    tracking_events: [
      { time: '2026-03-21 08:00', location: 'Jakarta', status: 'In transit to destination' },
      { time: '2026-03-20 18:00', location: 'Jakarta Hub', status: 'Departed from sorting center' },
      { time: '2026-03-20 10:30', location: 'Jakarta', status: 'Shipment picked up' },
    ],
  },
  {
    id: 'LOG002',
    order_id: 'ORD002',
    carrier: 'Ninja Van',
    tracking_number: 'NV0987654321098',
    status: 'delivered',
    shipped_at: '2026-03-18 14:20:00',
    delivered_at: '2026-03-21 11:30:00',
    tracking_events: [
      { time: '2026-03-21 11:30', location: 'Los Angeles', status: 'Delivered to customer' },
      { time: '2026-03-21 09:00', location: 'Los Angeles', status: 'Out for delivery' },
      { time: '2026-03-20 20:00', location: 'Los Angeles Hub', status: 'Arrived at local facility' },
    ],
  },
  {
    id: 'LOG003',
    order_id: 'ORD003',
    carrier: 'Flash Express',
    tracking_number: 'FL1122334455667',
    status: 'out_for_delivery',
    shipped_at: '2026-03-19 16:45:00',
    delivered_at: null,
    tracking_events: [
      { time: '2026-03-21 08:30', location: 'Bangkok', status: 'Out for delivery' },
      { time: '2026-03-20 22:00', location: 'Bangkok Hub', status: 'Arrived at distribution center' },
      { time: '2026-03-19 16:45', location: 'Bangkok', status: 'Package received' },
    ],
  },
  {
    id: 'LOG004',
    order_id: 'ORD004',
    carrier: 'Amazon Logistics',
    tracking_number: 'AM7788990011223',
    status: 'delivered',
    shipped_at: '2026-03-17 09:00:00',
    delivered_at: '2026-03-20 15:45:00',
    tracking_events: [
      { time: '2026-03-20 15:45', location: 'New York', status: 'Delivered - Signed by: John' },
      { time: '2026-03-20 10:00', location: 'New York', status: 'Out for delivery' },
      { time: '2026-03-19 18:00', location: 'New York Facility', status: 'Package arrived' },
    ],
  },
  {
    id: 'LOG005',
    order_id: 'ORD005',
    carrier: 'Kerry Express',
    tracking_number: 'KE5566778899001',
    status: 'shipped',
    shipped_at: '2026-03-21 11:30:00',
    delivered_at: null,
    tracking_events: [
      { time: '2026-03-21 11:30', location: 'Ho Chi Minh', status: 'Shipment created and picked up' },
    ],
  },
  {
    id: 'LOG006',
    order_id: 'ORD006',
    carrier: 'J&T Express',
    tracking_number: 'JT9988776655443',
    status: 'exception',
    shipped_at: '2026-03-16 13:20:00',
    delivered_at: null,
    tracking_events: [
      { time: '2026-03-19 10:00', location: 'Jakarta', status: 'Delivery attempted - No one home' },
      { time: '2026-03-18 14:00', location: 'Jakarta', status: 'Out for delivery' },
      { time: '2026-03-17 08:00', location: 'Jakarta Hub', status: 'In transit' },
    ],
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const keyword = searchParams.get('keyword');
    const status = searchParams.get('status');

    let filtered = [...mockLogistics];

    if (keyword) {
      filtered = filtered.filter(l => 
        l.tracking_number.includes(keyword) || 
        l.order_id.includes(keyword)
      );
    }
    if (status) {
      filtered = filtered.filter(l => l.status === status);
    }

    return NextResponse.json({ items: filtered, total: filtered.length });
  } catch (error) {
    console.error('Get logistics error:', error);
    return NextResponse.json({ items: [], total: 0 }, { status: 500 });
  }
}
