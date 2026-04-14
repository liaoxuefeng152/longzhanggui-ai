# 飞书机器人调试指南

## 🔍 问题排查

### 问题：给飞书机器人发消息没有回复

#### 已修复的问题

1. **接收者 ID 错误** ✅
   - **原因**：代码中使用 `message.message_id` 作为接收者 ID，应该使用 `sender.sender_id.user_id`
   - **修复**：已更新 `client.ts` 和 `workflow.ts`，使用正确的用户 open_id
   - **影响**：这是导致不回复的主要原因

2. **缺少 receive_id_type 参数** ✅
   - **原因**：飞书 API 要求明确指定接收者类型
   - **修复**：在 `sendMessage` 中添加了 `receive_id_type: 'open_id'`
   - **影响**：飞书 API 可能拒绝请求

#### 需要检查的配置

### 1. 飞书应用配置

打开飞书开放平台：https://open.feishu.cn/

#### 确认以下配置：

1. **App ID 和 App Secret**
   - App ID: `cli_a925102a8179dbd6`
   - App Secret: `ig2gFSC1KU3wE00sdZOgX3aYalqtAZ2K`

2. **Webhook URL 配置**
   ```
   https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/api/v1/feishu/webhook
   ```

3. **Verification Token**
   ```
   VjIworko8nhoKL1bcDrZ6fuTKIwCRl6G
   ```

### 2. 权限配置

确保飞书应用已开通以下权限：

| 权限名称 | 说明 | 必需 |
|---------|------|------|
| `im:message` | 发送消息 | ✅ 必需 |
| `im:message:group_at_msg` | 群@消息 | 可选 |
| `im:chat` | 获取群信息 | 可选 |
| `contact:user.base:readonly` | 获取用户信息 | 可选 |

### 3. 事件订阅

确保已订阅以下事件：

| 事件类型 | 说明 |
|---------|------|
| `im.message.receive_v1` | 接收消息（必需） |

#### 配置步骤：

1. 进入「事件订阅」页面
2. 添加事件：选择 `im.message.receive_v1`
3. 保存配置

### 4. 机器人发布状态

确保机器人已发布到企业内部或公开：

1. 进入「版本管理与发布」
2. 检查当前版本状态
3. 如果未发布，点击「发布」

## 🧪 测试方法

### 方法 1：使用 Webhook 测试工具

访问测试页面：
```
https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/feishu/test
```

测试步骤：
1. 点击「测试 Webhook」验证 URL 配置
2. 检查返回的 challenge 是否正确

### 方法 2：模拟飞书事件

使用 curl 测试：

```bash
# 测试 URL 验证
curl -X POST https://c3471164-d4a8-459c-a047-271336351e54.dev.coze.site/api/v1/feishu/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "type": "url_verification",
    "token": "VjIworko8nhoKL1bcDrZ6fuTKIwCRl6G",
    "challenge": "test123"
  }'

# 预期返回：{"challenge":"test123"}
```

### 方法 3：查看系统日志

实时监控日志：

```bash
# 查看飞书相关日志
tail -f /app/work/logs/bypass/console.log | grep -i "feishu\|webhook"

# 查看应用日志
tail -f /app/work/logs/bypass/app.log | grep -i "feishu"
```

## 💬 支持的指令

机器人支持以下指令：

| 指令 | 说明 |
|------|------|
| `选品` / `推荐产品` / `爆款` | 执行选品分析 |
| `上架` / `发布` / `推广` | 上架产品并创建广告 |
| `创建广告` / `投放广告` | 创建广告计划 |
| `销量` / `销售` / `业绩` | 查询今日销量 |
| `库存` / `库存预警` | 查询库存状态 |
| `订单` / `物流` | 查询订单状态 |
| `状态` / `系统状态` | 查询系统运行状态 |
| `帮助` / `怎么用` | 显示使用帮助 |

## 🔧 调试步骤

### 步骤 1：检查 Webhook 配置

1. 登录飞书开放平台
2. 进入「事件与回调」→「事件回调」
3. 确认 Webhook URL 正确
4. 点击「保存」进行验证
5. 如果验证失败，检查 URL 是否可访问

### 步骤 2：检查事件订阅

1. 进入「事件订阅」页面
2. 确认已订阅 `im.message.receive_v1`
3. 如果未订阅，添加该事件

### 步骤 3：检查机器人权限

1. 进入「权限管理」
2. 确认 `im:message` 权限已开通
3. 如果未开通，申请并授权

### 步骤 4：检查机器人发布状态

1. 进入「版本管理与发布」
2. 确认机器人已发布
3. 如果未发布，点击「发布」

### 步骤 5：测试消息发送

在飞书中给机器人发送消息：

```
帮助
```

如果机器人正常回复，说明配置成功！

## 📊 日志分析

### 正常流程日志

```
收到飞书 Webhook: { type: 'event_callback', token: true, event: true }
收到事件回调: im.message.receive_v1
用户消息: { userId: 'ou_xxx', text: '帮助', messageId: 'om_xxx' }
意图识别结果: { intent: 'help', params: {} }
```

### 错误日志

#### 1. Token 验证失败
```
Token 验证失败
```
**解决**：检查 Verification Token 是否正确

#### 2. 发送消息失败
```
发送消息失败: 99991663 (no permission to send message)
```
**解决**：检查机器人权限是否已开通

#### 3. 用户 ID 错误
```
发送消息失败: 99991400 (invalid receiver id)
```
**解决**：检查 receive_id_type 参数（已修复）

## 🆘 常见问题

### Q1: Webhook 验证失败？

**A**: 检查以下几点：
1. Webhook URL 是否可访问
2. Verification Token 是否正确
3. 服务器返回的 challenge 是否正确

### Q2: 机器人收到了消息但不回复？

**A**: 检查以下几点：
1. 机器人权限是否已开通
2. 机器人是否已发布
3. 系统日志中是否有错误信息
4. receive_id_type 参数是否正确

### Q3: 如何查看详细的错误信息？

**A**: 查看系统日志：
```bash
tail -n 50 /app/work/logs/bypass/console.log
tail -n 50 /app/work/logs/bypass/app.log
```

### Q4: 飞书事件没有推送到 Webhook？

**A**: 检查以下几点：
1. 事件是否已订阅
2. Webhook URL 是否配置正确
3. 服务器是否正常运行
4. 防火墙是否允许外部访问

## 📞 联系支持

如果以上方法都无法解决问题，请提供以下信息：

1. 飞书应用 ID：`cli_a925102a8179dbd6`
2. Webhook URL
3. 系统日志中的错误信息
4. 发送的消息内容
5. 预期的回复内容

---

**最后更新时间**: 2026-04-06
