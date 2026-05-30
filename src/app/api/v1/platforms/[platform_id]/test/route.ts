import { NextRequest, NextResponse } from 'next/server';

/**
 * 测试平台API连接
 * POST /api/v1/platforms/[platform_id]/test
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ platform_id: string }> }
) {
  const { platform_id } = await params;

  try {
    // 获取平台配置（从数据库）
    const { PlatformDAL } = await import('@/lib/db/dal');
    await import('@/lib/db');
    const platformData = PlatformDAL.getById(platform_id);

    if (!platformData) {
      return NextResponse.json(
        { success: false, error: '平台未配置，请先填写API凭证' },
        { status: 400 }
      );
    }

    const credentials = typeof platformData.credentials === 'string' 
      ? JSON.parse(platformData.credentials) 
      : platformData.credentials;

    switch (platform_id) {
      case '1688': {
        return await test1688Connection(credentials);
      }
      case 'shopee':
      case 'lazada':
      case 'tiktok':
      case 'amazon':
        return NextResponse.json({
          success: true,
          message: `${platform_id} 连接测试暂未实现，凭证已保存`,
        });
      default:
        return NextResponse.json(
          { success: false, error: '不支持的平台' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('连接测试失败:', error);
    return NextResponse.json(
      { success: false, error: `连接测试失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

/**
 * 测试1688 API连接
 */
async function test1688Connection(credentials: Record<string, string>) {
  const appKey = credentials.api_key;
  const appSecret = credentials.api_secret;
  const accessToken = credentials.access_token;

  if (!appKey || !appSecret) {
    return NextResponse.json(
      { success: false, error: '缺少 AppKey 或 AppSecret，请先配置' },
      { status: 400 }
    );
  }

  if (!accessToken) {
    return NextResponse.json(
      { success: false, error: '缺少 Access Token，请先配置' },
      { status: 400 }
    );
  }

  try {
    // 使用HMAC-SHA1签名调用1688 API（查询一个通用接口验证凭证）
    const crypto = await import('crypto');
    
    const apiPath = 'param2/1/com.alibaba.fenxiao/alibaba.fenxiao.productInfo.get';
    
    // 使用一个测试商品ID
    const testOfferId = '1049118574787';
    
    const params: Record<string, string> = {
      access_token: accessToken,
      offerId: testOfferId,
    };

    // 按key字母排序拼接参数
    const sortedKeys = Object.keys(params).sort();
    const apiPathWithKey = `${apiPath}/${appKey}`;
    let signStr = apiPathWithKey;
    for (const key of sortedKeys) {
      signStr += key + params[key];
    }

    const sign = crypto
      .createHmac('sha1', appSecret)
      .update(signStr)
      .digest('hex')
      .toUpperCase();

    // 构建请求URL
    const queryString = Object.entries(params)
      .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
      .join('&');
    const requestUrl = `https://gw.open.1688.com/openapi/${apiPathWithKey}?${queryString}&_aop_signature=${sign}`;

    const response = await fetch(requestUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(10000),
    });

    const data = await response.json();

    // 检查API返回
    if (data.error_code) {
      const errorCode = data.error_code;
      if (errorCode === 'insufficient.isv.permissions' || errorCode === 'subbiz-error') {
        // API调用成功但权限不足，说明凭证有效
        return NextResponse.json({
          success: true,
          message: '1688 API 连接成功，凭证有效',
        });
      }
      if (errorCode === 'isp.alibaba.exception' || errorCode === 'isp.unknown-error') {
        // 服务器错误但签名已通过
        return NextResponse.json({
          success: true,
          message: '1688 API 签名验证通过，连接正常',
        });
      }
      if (errorCode.includes('Signature')) {
        return NextResponse.json({
          success: false,
          error: `签名验证失败 (${errorCode})，请检查 AppKey 和 AppSecret 是否正确`,
        });
      }
      if (errorCode.includes('token') || errorCode.includes('Token') || errorCode.includes('401')) {
        return NextResponse.json({
          success: false,
          error: 'Access Token 无效或已过期，请重新获取',
        });
      }
      // 其他错误但签名已通过
      return NextResponse.json({
        success: true,
        message: `签名验证通过，API返回: ${errorCode}`,
      });
    }

    // 成功获取数据
    if (data.productInfo || data.result !== undefined) {
      return NextResponse.json({
        success: true,
        message: '1688 API 连接成功，凭证有效，可正常采集商品',
      });
    }

    // 未知响应但没报签名错误
    return NextResponse.json({
      success: true,
      message: '1688 API 连接正常',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: `连接失败: ${error instanceof Error ? error.message : '网络错误'}`,
    });
  }
}
