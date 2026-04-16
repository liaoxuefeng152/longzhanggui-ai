'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Shield,
  Plus,
  Users,
  Settings,
  Trash2,
  Edit,
  CheckCircle,
  Lock,
  ChevronRight,
  Crown,
  UserCog,
  Briefcase,
  Calculator,
  Headphones,
} from 'lucide-react';

interface Role {
  id: string;
  name: string;
  code: string;
  description: string;
  level: number;
  permissions: string[];
  is_system: boolean;
  user_count: number;
}

interface Permission {
  code: string;
  name: string;
}

interface PermissionCategory {
  category: string;
  permissions: Permission[];
}

const ROLE_ICONS: Record<string, React.ElementType> = {
  owner: Crown,
  admin: Shield,
  operator: Briefcase,
  finance: Calculator,
  customer_service: Headphones,
};

export default function RolesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // 对话框状态
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  // 创建表单
  const [createForm, setCreateForm] = useState({
    name: '',
    code: '',
    description: '',
    level: 50,
    permissions: [] as string[],
  });

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchRoles();
  }, [router]);

  const fetchRoles = async () => {
    try {
      const response = await fetch('/api/v1/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data.roles);
        setPermissionCategories(data.data.permissions);
      }
    } catch (error) {
      console.error('获取角色失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 创建角色
  const handleCreate = async () => {
    if (!createForm.name || !createForm.code) {
      toast.error('请填写完整信息');
      return;
    }

    try {
      const response = await fetch('/api/v1/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('角色创建成功');
        setIsCreateOpen(false);
        resetForm();
        fetchRoles();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('创建失败');
    }
  };

  // 删除角色
  const handleDelete = async (role: Role) => {
    if (!confirm(`确定删除角色「${role.name}」吗？`)) return;

    try {
      const response = await fetch(`/api/v1/roles?id=${role.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        toast.success('角色已删除');
        fetchRoles();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('删除失败');
    }
  };

  // 更新角色权限
  const handleUpdatePermissions = async () => {
    if (!selectedRole) return;

    try {
      const response = await fetch('/api/v1/roles', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedRole.id,
          permissions: selectedRole.permissions,
        }),
      });

      const data = await response.json();
      if (data.success) {
        toast.success('权限已更新');
        setIsConfigOpen(false);
        fetchRoles();
      } else {
        toast.error(data.error);
      }
    } catch (error) {
      toast.error('更新失败');
    }
  };

  // 切换权限
  const togglePermission = (permission: string) => {
    if (!selectedRole) return;

    const newPermissions = selectedRole.permissions.includes(permission)
      ? selectedRole.permissions.filter(p => p !== permission)
      : [...selectedRole.permissions, permission];

    setSelectedRole({
      ...selectedRole,
      permissions: newPermissions,
    });
  };

  // 全选分类权限
  const toggleCategory = (category: PermissionCategory) => {
    if (!selectedRole) return;

    const categoryPerms = category.permissions.map(p => p.code);
    const allSelected = categoryPerms.every(p => selectedRole.permissions.includes(p));

    const newPermissions = allSelected
      ? selectedRole.permissions.filter(p => !categoryPerms.includes(p))
      : [...new Set([...selectedRole.permissions, ...categoryPerms])];

    setSelectedRole({
      ...selectedRole,
      permissions: newPermissions,
    });
  };

  const resetForm = () => {
    setCreateForm({
      name: '',
      code: '',
      description: '',
      level: 50,
      permissions: [],
    });
  };

  const getRoleIcon = (code: string) => {
    return ROLE_ICONS[code] || UserCog;
  };

  const getLevelBadge = (level: number) => {
    if (level >= 90) return <Badge className="bg-[#165DFF]500/10 text-[#165DFF]500">最高权限</Badge>;
    if (level >= 70) return <Badge className="bg-[#165DFF]500/10 text-[#165DFF]500">高权限</Badge>;
    if (level >= 40) return <Badge className="bg-[#00B42A]500/10 text-[#00B42A]500">普通权限</Badge>;
    return <Badge variant="outline">基础权限</Badge>;
  };

  // 权限分组
  const groupedPermissions = permissionCategories;

  if (!user) return null;

  return (
    <MainLayout user={user} onLogout={() => router.push('/login')}>
      <div className="space-y-6">
        {/* 页面头部 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center">
              <Shield className="h-7 w-7 text-indigo-500" />
            </div>
            <div>
              <h1 className="text-[18px] font-semibold text-foreground">角色权限管理</h1>
              <p className="text-[14px] text-muted-foreground">用户角色定义 · 权限配置 · 访问控制</p>
            </div>
          </div>
          <Button onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            新建角色
          </Button>
        </div>

        {/* 角色列表 */}
        <div className="grid grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 text-center py-12 text-muted-foreground">
              加载中...
            </div>
          ) : (
            roles.map((role) => {
              const Icon = getRoleIcon(role.code);
              return (
                <Card 
                  key={role.id} 
                  className={cn(
                    "bg-white border-border shadow-sm",
                    role.is_system && "border-l-4 border-l-indigo-500"
                  )}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-indigo-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{role.name}</h3>
                            {role.is_system && (
                              <Lock className="h-3 w-3 text-muted-foreground" />
                            )}
                          </div>
                          <p className="text-[12px] text-muted-foreground">
                            {role.description}
                          </p>
                        </div>
                      </div>
                      {getLevelBadge(role.level)}
                    </div>

                    <div className="flex items-center justify-between text-[12px] text-muted-foreground mb-3">
                      <span>权限等级: Lv.{role.level}</span>
                      <span>{role.user_count} 个用户</span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {role.permissions.slice(0, 5).map((perm) => (
                        <Badge key={perm} variant="outline" className="text-[10px]">
                          {perm}
                        </Badge>
                      ))}
                      {role.permissions.length > 5 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{role.permissions.length - 5} 更多
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-border">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsConfigOpen(true);
                        }}
                      >
                        <Settings className="h-4 w-4 mr-1" />
                        配置
                      </Button>
                      {!role.is_system && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDelete(role)}
                            className="text-[#F53F3F]500 hover:text-[#F53F3F]600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* 创建角色对话框 */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>创建角色</DialogTitle>
              <DialogDescription>定义新角色的名称、权限等级和权限范围</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
              <div className="space-y-2">
                <Label htmlFor="name">角色名称</Label>
                <Input
                  id="name"
                  placeholder="例如：高级运营"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ 
                    ...createForm, 
                    name: e.target.value,
                    code: e.target.value.toLowerCase().replace(/\s+/g, '_'),
                  })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">角色代码</Label>
                <Input
                  id="code"
                  placeholder="例如：senior_operator"
                  value={createForm.code}
                  onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  代码用于系统识别，创建后不可修改
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">角色描述</Label>
                <Textarea
                  id="description"
                  placeholder="描述此角色的职责和使用场景"
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">权限等级</Label>
                <Select
                  value={String(createForm.level)}
                  onValueChange={(value) => setCreateForm({ ...createForm, level: Number(value) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">Lv.10 - 基础</SelectItem>
                    <SelectItem value="30">Lv.30 - 初级</SelectItem>
                    <SelectItem value="50">Lv.50 - 中级</SelectItem>
                    <SelectItem value="70">Lv.70 - 高级</SelectItem>
                    <SelectItem value="90">Lv.90 - 管理</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  等级越高，可授予的权限范围越大
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setIsCreateOpen(false);
                resetForm();
              }}>取消</Button>
              <Button onClick={handleCreate}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 权限配置对话框 */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>配置角色权限</DialogTitle>
              <DialogDescription>
                {selectedRole?.name} - {selectedRole?.is_system ? '系统角色（只读）' : '可自定义'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="flex-1 overflow-y-auto py-4">
              {selectedRole && groupedPermissions.map((category) => {
                const categoryPerms = category.permissions.map(p => p.code);
                const selectedCount = categoryPerms.filter(p => selectedRole.permissions.includes(p)).length;
                const allSelected = selectedCount === categoryPerms.length;

                return (
                  <div key={category.category} className="mb-4 border border-border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={allSelected}
                          onChange={() => toggleCategory(category)}
                          className="rounded"
                          disabled={selectedRole.is_system}
                        />
                        <span className="font-medium text-[14px]">{category.category}</span>
                      </div>
                      <span className="text-[12px] text-muted-foreground">
                        {selectedCount}/{categoryPerms.length}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 ml-6">
                      {category.permissions.map((perm) => (
                        <label 
                          key={perm.code} 
                          className="flex items-center gap-2 text-[13px] cursor-pointer hover:bg-muted/50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedRole.permissions.includes(perm.code)}
                            onChange={() => togglePermission(perm.code)}
                            className="rounded"
                            disabled={selectedRole.is_system}
                          />
                          <span>{perm.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <DialogFooter>
              <span className="text-[12px] text-muted-foreground mr-auto">
                已选择 {selectedRole?.permissions.length} 项权限
              </span>
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>取消</Button>
              <Button 
                onClick={handleUpdatePermissions}
                disabled={selectedRole?.is_system}
              >
                保存配置
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </MainLayout>
  );
}
