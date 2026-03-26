import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      product_name,
      product_images,
      video_type = 'full',
      duration = 30,
      style = 'promotional',
      language = 'zh',
    } = body;
    
    if (!product_name) {
      return NextResponse.json(
        { success: false, error: '请提供产品名称' },
        { status: 400 }
      );
    }
    
    // 模拟AI视频生成
    await new Promise((resolve) => setTimeout(resolve, 2000));
    
    const taskId = `video-${Date.now()}`;
    
    // 根据视频类型生成不同的脚本
    const scripts: Record<string, string> = {
      script: `【${product_name}】短视频脚本

开场（0-3秒）：
"这款${product_name}太好用啦！"

产品展示（3-15秒）：
- 展示产品外观
- 演示核心功能
- 突出卖点优势

使用场景（15-25秒）：
- 日常生活应用
- 解决痛点问题
- 用户好评反馈

结尾（25-30秒）：
"限时特惠，点击购买！"
"关注我，了解更多好物~"`,
      
      voiceover: `【${product_name}】AI配音文案

亲们好！今天给大家推荐这款${product_name}！

这可是咱们店铺的爆款产品，品质超级棒！

材质好、做工细、性价比高！

很多买家都反馈特别好用，回购率超高！

现在下单还有优惠，抓紧时间哦！`,
      
      slideshow: `【${product_name}】图文轮播脚本

第1张：产品主图 + 标题"${product_name}"
第2张：产品细节展示
第3张：使用场景1
第4张：使用场景2
第5张：用户好评截图
第6张：价格优惠信息 + 购买链接`,
      
      full: `【${product_name}】完整视频脚本

=== 开场（0-5秒）===
画面：产品特写
配音："哇！这款${product_name}太好用了！"
字幕：爆款推荐

=== 产品介绍（5-20秒）===
画面：360度展示产品
配音："高品质材质，精致做工，性价比超高！"
字幕：✨ 品质保证 ✨

=== 功能演示（20-35秒）===
画面：实际使用场景
配音："日常使用超方便，解决您的痛点问题！"
字幕：💡 实用性强

=== 用户评价（35-45秒）===
画面：好评截图轮播
配音："看看买家们怎么说！"
字幕：⭐ 好评如潮

=== 结尾（45-50秒）===
画面：价格信息 + 购买链接
配音："限时特惠，点击下方链接购买！"
字幕：🛒 立即购买`,
    };
    
    const result = {
      task_id: taskId,
      status: 'completed',
      video_type,
      script: scripts[video_type] || scripts.full,
      video_url: `https://example.com/videos/${taskId}.mp4`,
      duration: video_type === 'script' ? 0 : duration,
      thumbnail_url: product_images?.[0] || `https://example.com/thumbnails/${taskId}.jpg`,
      created_at: new Date().toISOString(),
    };
    
    return NextResponse.json({
      success: true,
      data: result,
      message: '视频生成成功',
    });
  } catch (error) {
    console.error('Generate video error:', error);
    return NextResponse.json(
      { success: false, error: '视频生成失败' },
      { status: 500 }
    );
  }
}
