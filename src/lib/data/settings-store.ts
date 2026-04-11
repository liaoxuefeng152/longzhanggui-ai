/**
 * 系统设置数据存储层
 * 使用全局对象存储设置数据
 */

interface Setting {
  key: string;
  value: string | number | boolean | object;
  description?: string;
  category: 'general' | 'compliance' | 'risk' | 'notification' | 'security';
  created_at: string;
  updated_at: string;
}

// 初始化默认设置
const defaultSettings: Setting[] = [
  // 通用设置
  {
    key: 'name',
    value: '龙掌柜智能运营系统',
    description: '系统名称',
    category: 'general',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'version',
    value: 'v1.0',
    description: '系统版本',
    category: 'general',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'description',
    value: '飞书AI中台驱动版，实现跨境无人店全链路自动化',
    description: '系统描述',
    category: 'general',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'contact_email',
    value: 'contact@lobster.ai',
    description: '联系邮箱',
    category: 'general',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 合规规则
  {
    key: 'tk_banned_products_enabled',
    value: true,
    description: 'TK东南亚禁售品类',
    category: 'compliance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'tk_banned_keywords_enabled',
    value: true,
    description: 'TK禁用词库',
    category: 'compliance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'amazon_banned_products_enabled',
    value: true,
    description: '亚马逊禁售品类',
    category: 'compliance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'amazon_banned_keywords_enabled',
    value: true,
    description: '亚马逊禁用词库',
    category: 'compliance',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 风控设置
  {
    key: 'ad_daily_limit',
    value: 500,
    description: '单店铺单日广告消耗上限（元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'ad_click_cost_tk',
    value: 0.5,
    description: 'TK Ads单次点击成本上限（美元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'ad_click_cost_amazon',
    value: 1.0,
    description: '亚马逊PPC单次点击成本上限（美元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'ad_min_roi',
    value: 1.0,
    description: '商品广告最低ROI',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'refund_limit',
    value: 100,
    description: '退款限额（美元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'ad_spend_alert',
    value: 500,
    description: '广告单日消耗告警阈值（元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'refund_alert',
    value: 100,
    description: '单次退款告警阈值（美元）',
    category: 'risk',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 通知设置
  {
    key: 'task_complete',
    value: true,
    description: '任务完成通知',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'error_alert',
    value: true,
    description: '异常告警通知',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'compliance_failed',
    value: true,
    description: '合规校验失败通知',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'risk_triggered',
    value: true,
    description: '风控触发通知',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'sensitive_operation',
    value: true,
    description: '敏感操作确认通知',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'daily_report',
    value: true,
    description: '日报推送',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'weekly_report',
    value: true,
    description: '周报推送',
    category: 'notification',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },

  // 安全设置
  {
    key: 'operation_log_enabled',
    value: true,
    description: '操作日志记录',
    category: 'security',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'encryption_enabled',
    value: true,
    description: '敏感数据加密存储',
    category: 'security',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'ip_whitelist_enabled',
    value: false,
    description: 'IP白名单',
    category: 'security',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    key: 'login_lockout_enabled',
    value: true,
    description: '登录失败锁定',
    category: 'security',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// 全局存储键
const SETTINGS_STORE_KEY = 'settingsStore';

// 获取全局存储
function getSettingsStore(): Map<string, Setting> {
  if (!(global as any)[SETTINGS_STORE_KEY]) {
    (global as any)[SETTINGS_STORE_KEY] = new Map<string, Setting>();
    // 初始化默认设置
    defaultSettings.forEach(setting => {
      (global as any)[SETTINGS_STORE_KEY].set(setting.key, setting);
    });
  }
  return (global as any)[SETTINGS_STORE_KEY];
}

/**
 * 获取所有设置
 */
export function getAllSettings(category?: string): Setting[] {
  const store = getSettingsStore();
  let settings = Array.from(store.values());
  if (category) {
    settings = settings.filter(s => s.category === category);
  }
  return settings.sort((a, b) => a.key.localeCompare(b.key));
}

/**
 * 获取单个设置
 */
export function getSetting(key: string): Setting | undefined {
  const store = getSettingsStore();
  return store.get(key);
}

/**
 * 更新单个设置
 */
export function updateSetting(key: string, value: string | number | boolean | object): Setting {
  const store = getSettingsStore();
  const existing = store.get(key);

  if (existing) {
    const updated: Setting = {
      ...existing,
      value,
      updated_at: new Date().toISOString(),
    };
    store.set(key, updated);
    return updated;
  } else {
    // 根据key推断category
    let category: 'general' | 'compliance' | 'risk' | 'notification' | 'security' = 'general';
    if (key.startsWith('tk_') || key.startsWith('amazon_')) {
      category = 'compliance';
    } else if (key.startsWith('ad_') || key.startsWith('refund_')) {
      category = 'risk';
    } else if (['task_complete', 'error_alert', 'compliance_failed', 'risk_triggered', 'sensitive_operation', 'daily_report', 'weekly_report'].includes(key)) {
      category = 'notification';
    } else if (key.includes('enabled') && !key.startsWith('ad_')) {
      category = 'security';
    }

    const newSetting: Setting = {
      key,
      value,
      category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    store.set(key, newSetting);
    return newSetting;
  }
}

/**
 * 批量更新设置
 */
export function updateSettings(settings: Record<string, string | number | boolean | object>): Setting[] {
  const updated: Setting[] = [];
  Object.entries(settings).forEach(([key, value]) => {
    const setting = updateSetting(key, value);
    updated.push(setting);
  });
  return updated;
}

/**
 * 删除设置
 */
export function deleteSetting(key: string): boolean {
  const store = getSettingsStore();
  return store.delete(key);
}

/**
 * 重置设置为默认值
 */
export function resetSettings(): void {
  if ((global as any)[SETTINGS_STORE_KEY]) {
    delete (global as any)[SETTINGS_STORE_KEY];
  }
}
