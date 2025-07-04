import React from 'react';
import prisma from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// 定义人员数据类型（包含联查字段）
interface BusinessPerson {
  business_person_id: string;
  business_person_name: string;
  business_person_type?: string | null;
  staff_id?: string | null;
  gender?: string | null;
  department?: string | null;
  position?: string | null;
  phone_number?: string | null;
  email?: string | null;
  hire_date?: Date | string | null;
  leave_date?: Date | string | null;
  manager_name?: string | null;
  position_status?: string | null;
  // 联查字段
  private_phone?: string | null;
  wechat_number?: string | null;
}

// 服务器组件获取数据（多表联查）
async function getBusinessPersons(): Promise<BusinessPerson[]> {
  try {
    // 使用Prisma raw查询进行多表联查
    const data = await prisma.$queryRaw`
      SELECT 
        p.person_photo_url, 
        p.person_name, 
        p.department, 
        p.position, 
        p.region_cn, 
        p.birth_date, 
        c.wechat_number 
      FROM 
        key_person_base_info p 
      LEFT JOIN 
        key_person_private_info c 
      ON 
        p.person_id = c.person_id
      ORDER BY 
        p.person_name ASC
    `;
    return data as BusinessPerson[];
  } catch (error) {
    console.error('获取数据失败:', error);
    // 添加详细错误信息输出
    if (error instanceof Error) {
      console.error('错误信息:', error.message);
      console.error('错误堆栈:', error.stack);
    }
    return [];
  }
}

// 格式化日期显示
const formatDate = (date?: Date | string | null): string => {
  if (!date) return '-';
  
  // 处理可能的字符串日期
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  // 检查是否为有效日期
  if (isNaN(dateObj.getTime())) return '-';
  
  // 检查是否为默认最大值日期
  if (typeof date === 'string' && date >= '9999-12-31') return '-';
  
  return dateObj.toLocaleDateString('zh-CN');
};

// 状态显示组件
const StatusBadge = ({ status }: { status?: string | null }) => {
  const isActive = status === '1';
  return (
    <span className={`px-2 py-1 rounded-full text-xs ${
      isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
    }`}>
      {isActive ? '在职' : '离职'}
    </span>
  );
};

export default async function BusinessPersonsPage() {
  const businessPersons = await getBusinessPersons();
  console.log(businessPersons,'businessPersons')
  return (
    <div className="container mx-auto py-6 overflow-x-auto">
      <Card>
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 pb-4 gap-4">
          <CardTitle className="text-xl">企业人员信息表</CardTitle>
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="搜索人员..."
              className="pl-9 w-full"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-50">
                <TableRow>
                  <TableHead className="w-[120px]">姓名</TableHead>
                  <TableHead className="w-[100px]">人员类型</TableHead>
                  <TableHead className="w-[100px]">员工ID</TableHead>
                  <TableHead className="w-[80px]">性别</TableHead>
                  <TableHead className="w-[120px]">部门</TableHead>
                  <TableHead className="w-[120px]">职位</TableHead>
                  <TableHead className="w-[120px]">联系电话</TableHead>
                  <TableHead className="w-[180px]">邮箱</TableHead>
                  <TableHead className="w-[100px]">入职日期</TableHead>
                  <TableHead className="w-[100px]">离职日期</TableHead>
                  <TableHead className="w-[120px]">经理姓名</TableHead>
                  <TableHead className="w-[100px]">私人电话</TableHead>
                  <TableHead className="w-[120px]">微信号</TableHead>
                  <TableHead className="w-[80px]">状态</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {businessPersons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={14} className="text-center py-6">
                      暂无数据
                    </TableCell>
                  </TableRow>
                ) : (
                  businessPersons.map((person) => (
                    <TableRow key={`${person.business_person_id}-${person.private_phone || Math.random().toString(36).substr(2, 9)}`} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{person.business_person_name}</TableCell>
                      <TableCell>{person.business_person_type || '-'}</TableCell>
                      <TableCell>{person.staff_id || '-'}</TableCell>
                      <TableCell>{person.gender === '1' ? '男' : person.gender === '2' ? '女' : '-'}</TableCell>
                      <TableCell>{person.department || '-'}</TableCell>
                      <TableCell>{person.position || '-'}</TableCell>
                      <TableCell>{person.phone_number || '-'}</TableCell>
                      <TableCell>{person.email || '-'}</TableCell>
                      <TableCell>{formatDate(person.hire_date)}</TableCell>
                      <TableCell>{formatDate(person.leave_date)}</TableCell>
                      <TableCell>{person.manager_name || '-'}</TableCell>
                      <TableCell>{person.private_phone || '-'}</TableCell>
                      <TableCell>{person.wechat_number || '-'}</TableCell>
                      <TableCell><StatusBadge status={person.position_status} /></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}