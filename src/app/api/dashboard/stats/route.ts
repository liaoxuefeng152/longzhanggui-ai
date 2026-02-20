import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 模拟统计数据
    const stats = {
      todayCalls: 12580,
      onlineUsers: 256,
      todayOrders: 8650,
      referralUsers: 89,
      callTrend: [
        { date: '02-14', calls: 8500 },
        { date: '02-15', calls: 9200 },
        { date: '02-16', calls: 8800 },
        { date: '02-17', calls: 10500 },
        { date: '02-18', calls: 11800 },
        { date: '02-19', calls: 11200 },
        { date: '02-20', calls: 12580 },
      ],
      recentUsers: [
        {
          id: '1',
          nickname: '王明',
          avatar: '',
          shopType: 'TK印尼',
          createdAt: '2024-02-20 14:32',
        },
        {
          id: '2',
          nickname: '李华',
          avatar: '',
          shopType: 'TK泰国',
          createdAt: '2024-02-20 13:15',
        },
        {
          id: '3',
          nickname: '张伟',
          avatar: '',
          shopType: 'TK越南',
          createdAt: '2024-02-20 11:48',
        },
        {
          id: '4',
          nickname: '刘芳',
          avatar: '',
          shopType: 'TK马来西亚',
          createdAt: '2024-02-20 10:25',
        },
        {
          id: '5',
          nickname: '陈静',
          avatar: '',
          shopType: 'TK印尼',
          createdAt: '2024-02-20 09:12',
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return NextResponse.json(
      { error: '获取统计数据失败' },
      { status: 500 }
    );
  }
}
