/**
 * 系统设置API
 */
import { apiClient } from './client';
import { API_ENDPOINTS } from './config';

// 设置项类型
export interface Setting {
  key: string;
  value: string | number | boolean | object;
  description?: string;
  category: 'general' | 'compliance' | 'risk' | 'notification' | 'security';
  created_at: string;
  updated_at: string;
}

// 设置列表响应
export interface SettingsListResponse {
  settings: Setting[];
  total: number;
}

// 飞书配置
export interface FeishuConfig {
  app_id: string;
  app_secret?: string;
  bot_id?: string;
  encrypt_key?: string;
  verification_token?: string;
}

// 通知设置
export interface NotificationSettings {
  task_complete: boolean;
  error_alert: boolean;
  compliance_failed: boolean;
  risk_triggered: boolean;
  sensitive_operation: boolean;
  daily_report: boolean;
  weekly_report: boolean;
}

// 风控设置
export interface RiskSettings {
  ad_daily_limit: number;
  ad_click_cost_tk: number;
  ad_click_cost_amazon: number;
  ad_min_roi: number;
  refund_limit: number;
  ad_spend_alert: number;
  refund_alert: number;
}

// 系统信息
export interface SystemInfo {
  name: string;
  version: string;
  description: string;
  contact_email: string;
}

// 备份信息
export interface BackupInfo {
  last_backup: string;
  backup_size: string;
  backup_path: string;
}

/**
 * 获取所有设置
 */
export async function getSettings(category?: string): Promise<SettingsListResponse> {
  const searchParams = category ? `?category=${category}` : '';
  return apiClient.get<SettingsListResponse>(`${API_ENDPOINTS.settings.list}${searchParams}`);
}

/**
 * 更新设置
 */
export async function updateSetting(
  key: string,
  value: string | number | boolean | object
): Promise<{ success: boolean; message: string }> {
  return apiClient.put<{ success: boolean; message: string }>(
    `${API_ENDPOINTS.settings.list}/${key}`,
    { value }
  );
}

/**
 * 批量更新设置
 */
export async function updateSettings(
  settings: Record<string, string | number | boolean | object>
): Promise<{ success: boolean; message: string }> {
  return apiClient.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.settings.list,
    settings
  );
}

/**
 * 获取飞书配置
 */
export async function getFeishuConfig(): Promise<FeishuConfig> {
  return apiClient.get<FeishuConfig>(API_ENDPOINTS.settings.feishu);
}

/**
 * 更新飞书配置
 */
export async function updateFeishuConfig(
  config: Partial<FeishuConfig>
): Promise<{ success: boolean; message: string }> {
  return apiClient.put<{ success: boolean; message: string }>(
    API_ENDPOINTS.settings.feishu,
    config
  );
}

/**
 * 测试飞书连接
 */
export async function testFeishuConnection(): Promise<{
  success: boolean;
  message: string;
  bot_name?: string;
}> {
  return apiClient.post<{
    success: boolean;
    message: string;
    bot_name?: string;
  }>(API_ENDPOINTS.settings.testFeishu);
}

/**
 * 获取通知设置
 */
export async function getNotificationSettings(): Promise<NotificationSettings> {
  const response = await getSettings('notification');
  const settings: Record<string, boolean> = {};
  response.settings.forEach((s) => {
    settings[s.key] = Boolean(s.value);
  });
  return {
    task_complete: settings.task_complete ?? true,
    error_alert: settings.error_alert ?? true,
    compliance_failed: settings.compliance_failed ?? true,
    risk_triggered: settings.risk_triggered ?? true,
    sensitive_operation: settings.sensitive_operation ?? true,
    daily_report: settings.daily_report ?? true,
    weekly_report: settings.weekly_report ?? true,
  };
}

/**
 * 更新通知设置
 */
export async function updateNotificationSettings(
  settings: Partial<NotificationSettings>
): Promise<{ success: boolean; message: string }> {
  return updateSettings(settings as Record<string, boolean>);
}

/**
 * 获取风控设置
 */
export async function getRiskSettings(): Promise<RiskSettings> {
  const response = await getSettings('risk');
  const settings: Record<string, number> = {};
  response.settings.forEach((s) => {
    settings[s.key] = Number(s.value);
  });
  return {
    ad_daily_limit: settings.ad_daily_limit ?? 500,
    ad_click_cost_tk: settings.ad_click_cost_tk ?? 0.5,
    ad_click_cost_amazon: settings.ad_click_cost_amazon ?? 1.0,
    ad_min_roi: settings.ad_min_roi ?? 1.0,
    refund_limit: settings.refund_limit ?? 100,
    ad_spend_alert: settings.ad_spend_alert ?? 500,
    refund_alert: settings.refund_alert ?? 100,
  };
}

/**
 * 更新风控设置
 */
export async function updateRiskSettings(
  settings: Partial<RiskSettings>
): Promise<{ success: boolean; message: string }> {
  return updateSettings(settings as Record<string, number>);
}

/**
 * 获取合规规则设置
 */
export async function getComplianceSettings(): Promise<{
  tk_banned_products_enabled: boolean;
  tk_banned_keywords_enabled: boolean;
  amazon_banned_products_enabled: boolean;
  amazon_banned_keywords_enabled: boolean;
}> {
  const response = await getSettings();
  const settings: Record<string, boolean> = {};
  response.settings.forEach((s) => {
    if (['tk_banned_products_enabled', 'tk_banned_keywords_enabled', 'amazon_banned_products_enabled', 'amazon_banned_keywords_enabled'].includes(s.key)) {
      settings[s.key] = Boolean(s.value);
    }
  });
  return {
    tk_banned_products_enabled: settings.tk_banned_products_enabled ?? true,
    tk_banned_keywords_enabled: settings.tk_banned_keywords_enabled ?? true,
    amazon_banned_products_enabled: settings.amazon_banned_products_enabled ?? true,
    amazon_banned_keywords_enabled: settings.amazon_banned_keywords_enabled ?? true,
  };
}

/**
 * 更新合规规则设置
 */
export async function updateComplianceSettings(
  settings: Partial<{
    tk_banned_products_enabled: boolean;
    tk_banned_keywords_enabled: boolean;
    amazon_banned_products_enabled: boolean;
    amazon_banned_keywords_enabled: boolean;
  }>
): Promise<{ success: boolean; message: string }> {
  return updateSettings(settings as Record<string, boolean>);
}

/**
 * 获取系统信息
 */
export async function getSystemInfo(): Promise<SystemInfo> {
  const response = await getSettings('general');
  const settings: Record<string, string> = {};
  response.settings.forEach((s) => {
    settings[s.key] = String(s.value);
  });
  return {
    name: settings.name || '龙虾AI跨境无人店系统',
    version: settings.version || 'v1.0',
    description: settings.description || '飞书AI中台驱动版，实现跨境无人店全链路自动化',
    contact_email: settings.contact_email || 'contact@lobster.ai',
  };
}

/**
 * 创建备份
 */
export async function createBackup(): Promise<{ success: boolean; message: string }> {
  return apiClient.post<{ success: boolean; message: string }>(API_ENDPOINTS.settings.backup);
}

/**
 * 获取备份信息
 */
export async function getBackupInfo(): Promise<BackupInfo> {
  return apiClient.get<BackupInfo>(API_ENDPOINTS.settings.backup);
}
