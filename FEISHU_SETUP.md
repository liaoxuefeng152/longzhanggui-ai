# 飞书龙虾机器人配置指南

## 配置信息

### 应用信息
- **App ID**: `cli_a954ed9674789cd3`
- **App Secret**: `ig2gFSC1KU3wE00sdZOgX3aYalqtAZ2K`
- **Verification Token**: `VjIworko8nhoKL1bcDrZ6fuTKIwCRl6G`

### Webhook 配置
- **请求地址**: `https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/api/v1/feishu/webhook`
- **Content-Type**: `application/json`

## 配置步骤

### 第一步：打开飞书开放平台

1. 访问飞书开放平台：https://open.feishu.cn/
2. 进入应用管理
3. 选择"龙虾AI"应用 (cli_a954ed9674789cd3)

### 第二步：配置事件订阅

1. 进入"事件订阅"页面
2. 选择"将事件发送至开发者服务器"
3. 配置请求地址：
   ```
   https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/api/v1/feishu/webhook
   ```
4. 配置 Verification Token：
   ```
   VjIworko8nhoKL1bcDrZ6fuTKIwCRl6G
   ```

### 第三步：验证 Webhook

1. 点击"验证"按钮
2. 飞书会向你的服务器发送验证请求
3. 服务器会返回 challenge 值
4. 验证通过后，保存配置

### 第四步：订阅消息事件

1. 在事件订阅页面，点击"订阅事件"
2. 搜索并选择"im.message.receive_v1"（接收消息）
3. 保存配置

## 测试 Webhook

### 方法一：使用测试工具

访问测试页面：
```
https://abc123.dev.coze.site/feishu/test
```

点击"开始测试"按钮，查看测试结果。

### 方法二：使用 curl 命令

```bash
curl -X POST https://abc123.dev.coze.site/api/v1/feishu/webhook \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "url_verification",
    "token": "VjIworko8nhoKL1bcDrZ6fuTKIwCRl6G",
    "challenge": "test123"
  }'
```

期望返回：
```json
{"challenge":"test123"}
```

## 使用飞书机器人

### 在飞书中使用

在飞书群中@龙虾机器人，发送以下指令：

**选品**
```
@龙虾AI 帮我选3款3C手机配件的产品
```

**查询销量**
```
@龙虾AI 今天的销量
```

**查询库存**
```
@龙虾AI 库存预警
```

**查询状态**
```
@龙虾AI 系统状态
```

**帮助**
```
@龙虾AI 帮助
```

## 管理页面

访问飞书管理页面：
```
https://abc123.dev.coze.site/feishu
```

功能：
- 查看配置信息
- 测试意图识别
- 查看使用帮助

## 常见问题

### 1. Webhook 验证失败

**错误信息**: 返回数据不是合法的 JSON 格式

**解决方案**:
- 确保 Webhook URL 正确
- 确保 Verification Token 正确
- 确保服务器正常运行
- 查看服务器日志

### 2. 消息无响应

**可能原因**:
- 未订阅消息事件
- 机器人未添加到群聊
- 网络问题

**解决方案**:
- 检查事件订阅配置
- 在飞书群中@机器人
- 检查服务器日志

### 3. 意图识别不准确

**解决方案**:
- 使用更明确的指令
- 查看帮助文档了解支持的指令
- 联系开发者优化意图识别

## 技术支持

如有问题，请联系技术支持团队。

## 更新日志

### 2026-04-06
- ✅ 修复 Webhook JSON 格式问题
- ✅ 添加 CORS 支持
- ✅ 添加测试工具
- ✅ 优化错误处理
