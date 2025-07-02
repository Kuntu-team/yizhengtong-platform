"use client"

import React, { useState, useMemo } from "react"
import { ArrowLeft, List, Grid3X3, Search, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "sonner"

// 部门岗位联动数据
const departmentJobs = {
  全部部门: ["全部岗位"],
  技术部: ["全部岗位", "前端工程师", "后端工程师", "测试工程师", "架构师", "技术经理"],
  市场部: ["全部岗位", "市场经理", "市场专员", "品牌经理", "活动策划"],
  运营部: ["全部岗位", "运营经理", "产品运营", "用户运营", "内容运营"],
  财务部: ["全部岗位", "财务经理", "会计", "出纳", "财务分析师"],
  人力资源部: ["全部岗位", "HR经理", "招聘专员", "培训专员", "薪酬专员"],
  行政部: ["全部岗位", "行政经理", "行政专员", "前台", "司机"],
}

// 模拟数据
const mockData = [
  {
    id: 1,
    name: "张三",
    department: "技术部",
    position: "前端工程师",
    project: "智策通2.0升级",
    totalTasks: 5,
    completedTasks: 3,
    deadline: "2024-12-31",
    status: "进行中",
    isFollowed: true,
  },
  {
    id: 2,
    name: "李四",
    department: "技术部",
    position: "后端工程师",
    project: "数据库优化项目",
    totalTasks: 8,
    completedTasks: 8,
    deadline: "2024-11-15",
    status: "已完成",
    isFollowed: false,
  },
  {
    id: 3,
    name: "王五",
    department: "市场部",
    position: "市场经理",
    project: "Q4营销推广",
    totalTasks: 12,
    completedTasks: 0,
    deadline: "2025-01-15",
    status: "待开始",
    isFollowed: true,
  },
  {
    id: 4,
    name: "赵六",
    department: "运营部",
    position: "产品运营",
    project: "用户增长计划",
    totalTasks: 6,
    completedTasks: 2,
    deadline: "2024-11-20",
    status: "已逾期",
    isFollowed: false,
  },
  {
    id: 5,
    name: "钱七",
    department: "财务部",
    position: "财务经理",
    project: "年度预算制定",
    totalTasks: 10,
    completedTasks: 7,
    deadline: "2024-12-20",
    status: "进行中",
    isFollowed: true,
  },
  {
    id: 6,
    name: "孙八",
    department: "人力资源部",
    position: "HR经理",
    project: "员工培训体系",
    totalTasks: 4,
    completedTasks: 4,
    deadline: "2024-10-30",
    status: "已完成",
    isFollowed: false,
  },
  {
    id: 7,
    name: "周九",
    department: "行政部",
    position: "行政经理",
    project: "办公环境改善",
    totalTasks: 3,
    completedTasks: 1,
    deadline: "2024-11-10",
    status: "已逾期",
    isFollowed: false,
  },
  {
    id: 8,
    name: "吴十",
    department: "技术部",
    position: "测试工程师",
    project: "自动化测试框架",
    totalTasks: 7,
    completedTasks: 5,
    deadline: "2025-01-10",
    status: "进行中",
    isFollowed: true,
  },
  {
    id: 9,
    name: "郑一",
    department: "市场部",
    position: "品牌经理",
    project: "品牌形象升级",
    totalTasks: 9,
    completedTasks: 0,
    deadline: "2025-02-01",
    status: "待开始",
    isFollowed: false,
  },
  {
    id: 10,
    name: "王二",
    department: "运营部",
    position: "用户运营",
    project: "用户留存优化",
    totalTasks: 5,
    completedTasks: 3,
    deadline: "2024-12-15",
    status: "进行中",
    isFollowed: false,
  },
  {
    id: 11,
    name: "李三",
    department: "财务部",
    position: "会计",
    project: "月度财务报表",
    totalTasks: 6,
    completedTasks: 6,
    deadline: "2024-11-05",
    status: "已完成",
    isFollowed: true,
  },
  {
    id: 12,
    name: "张四",
    department: "人力资源部",
    position: "招聘专员",
    project: "校园招聘计划",
    totalTasks: 8,
    completedTasks: 4,
    deadline: "2024-11-25",
    status: "已逾期",
    isFollowed: false,
  },
  {
    id: 13,
    name: "赵五",
    department: "行政部",
    position: "前台",
    project: "访客管理系统",
    totalTasks: 2,
    completedTasks: 0,
    deadline: "2025-01-20",
    status: "待开始",
    isFollowed: false,
  },
  {
    id: 14,
    name: "钱六",
    department: "技术部",
    position: "架构师",
    project: "微服务架构重构",
    totalTasks: 15,
    completedTasks: 10,
    deadline: "2025-03-01",
    status: "进行中",
    isFollowed: true,
  },
  {
    id: 15,
    name: "孙七",
    department: "市场部",
    position: "活动策划",
    project: "年会活动策划",
    totalTasks: 4,
    completedTasks: 2,
    deadline: "2024-12-10",
    status: "进行中",
    isFollowed: false,
  },
  {
    id: 16,
    name: "周八",
    department: "运营部",
    position: "内容运营",
    project: "内容营销策略",
    totalTasks: 7,
    completedTasks: 7,
    deadline: "2024-10-20",
    status: "已完成",
    isFollowed: false,
  },
  {
    id: 17,
    name: "吴九",
    department: "财务部",
    position: "出纳",
    project: "资金流管理",
    totalTasks: 3,
    completedTasks: 1,
    deadline: "2024-11-08",
    status: "已逾期",
    isFollowed: false,
  },
  {
    id: 18,
    name: "郑十",
    department: "人力资源部",
    position: "培训专员",
    project: "新员工培训",
    totalTasks: 5,
    completedTasks: 0,
    deadline: "2025-01-05",
    status: "待开始",
    isFollowed: false,
  },
  {
    id: 19,
    name: "王一",
    department: "行政部",
    position: "司机",
    project: "车辆维护计划",
    totalTasks: 2,
    completedTasks: 2,
    deadline: "2024-11-01",
    status: "已完成",
    isFollowed: false,
  },
  {
    id: 20,
    name: "李二",
    department: "技术部",
    position: "技术经理",
    project: "技术团队建设",
    totalTasks: 11,
    completedTasks: 6,
    deadline: "2024-12-25",
    status: "进行中",
    isFollowed: false,
  },
]

// 状态样式配置
const statusStyles = {
  进行中: {
    bg: "bg-blue-50",
    text: "text-blue-600",
    border: "border-blue-200",
  },
  已完成: {
    bg: "bg-green-50",
    text: "text-green-600",
    border: "border-green-200",
  },
  待开始: {
    bg: "bg-gray-50",
    text: "text-gray-600",
    border: "border-gray-200",
  },
  已逾期: {
    bg: "bg-red-50",
    text: "text-red-600",
    border: "border-red-200",
  },
}

// 列表项组件
const ListItem = React.memo(({ person, onClick }: { person: any; onClick: () => void }) => {
  const statusStyle = statusStyles[person.status as keyof typeof statusStyles]
  const progressPercentage = (person.completedTasks / person.totalTasks) * 100

  return (
    <div
      className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      <div className="flex items-start space-x-3">
        {/* 头像 */}
        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600 flex-shrink-0">
          {person.name.charAt(0)}
        </div>

        {/* 主体内容 */}
        <div className="flex-1 min-w-0">
          {/* 第一行：姓名 + 状态 */}
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-semibold text-gray-900 truncate">{person.name}</h3>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
            >
              {person.status}
            </span>
          </div>

          {/* 第二行：部门 | 岗位 */}
          <p className="text-sm text-gray-500 mb-2">
            {person.department} | {person.position}
          </p>

          {/* 第三行：负责项目 */}
          <p className="text-xs text-gray-600 mb-1">📋 负责项目：{person.project}</p>

          {/* 第四行：任务进度 */}
          <div className="mb-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-600">
                🎯 任务进度：{person.completedTasks}/{person.totalTasks} 已完成
              </span>
              <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-1.5" />
          </div>

          {/* 第五行：截止日期 */}
          <p className="text-xs text-gray-600">📅 截止日期：{person.deadline}</p>
        </div>
      </div>
    </div>
  )
})

// 卡片项组件
const CardItem = React.memo(({ person, onClick }: { person: any; onClick: () => void }) => {
  const statusStyle = statusStyles[person.status as keyof typeof statusStyles]
  const progressPercentage = (person.completedTasks / person.totalTasks) * 100

  return (
    <div
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow duration-200"
      onClick={onClick}
    >
      {/* 头像和姓名 */}
      <div className="flex items-center space-x-2 mb-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
          {person.name.charAt(0)}
        </div>
        <h3 className="text-sm font-semibold text-gray-900 truncate flex-1">{person.name}</h3>
      </div>

      {/* 状态标签 */}
      <div className="mb-2">
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium border ${statusStyle.bg} ${statusStyle.text} ${statusStyle.border}`}
        >
          {person.status}
        </span>
      </div>

      {/* 部门岗位 */}
      <p className="text-xs text-gray-500 mb-2">
        {person.department} | {person.position}
      </p>

      {/* 项目信息 */}
      <p className="text-xs text-gray-600 mb-2 line-clamp-1">📋 {person.project}</p>

      {/* 进度信息 */}
      <div className="mb-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs text-gray-600">
            🎯 {person.completedTasks}/{person.totalTasks}
          </span>
          <span className="text-xs text-gray-500">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-1" />
      </div>

      {/* 截止日期 */}
      <p className="text-xs text-gray-600">📅 {person.deadline}</p>
    </div>
  )
})

export default function RosterPage() {
  const [selectedDepartment, setSelectedDepartment] = useState("全部部门")
  const [selectedPosition, setSelectedPosition] = useState("全部岗位")
  const [viewMode, setViewMode] = useState<"list" | "card">("list")
  const [activeTab, setActiveTab] = useState("followed")
  const [filterOpen, setFilterOpen] = useState(false)

  // 获取当前部门的岗位选项
  const positionOptions = useMemo(() => {
    return departmentJobs[selectedDepartment as keyof typeof departmentJobs] || ["全部岗位"]
  }, [selectedDepartment])

  // 筛选数据
  const filteredData = useMemo(() => {
    let data = mockData

    // 根据tab筛选
    if (activeTab === "followed") {
      data = data.filter((person) => person.isFollowed)
    }

    // 根据部门和岗位筛选
    return data.filter((person) => {
      const departmentMatch = selectedDepartment === "全部部门" || person.department === selectedDepartment
      const positionMatch = selectedPosition === "全部岗位" || person.position === selectedPosition
      return departmentMatch && positionMatch
    })
  }, [selectedDepartment, selectedPosition, activeTab])

  // 处理部门选择变化
  const handleDepartmentChange = (value: string) => {
    setSelectedDepartment(value)
    setSelectedPosition("全部岗位") // 重置岗位选择
  }

  // 处理点击事件
  const handleItemClick = () => {
    toast("查看详情功能开发中")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900 ml-2">任务花名册</h1>
          </div>
          <Button variant="ghost" size="sm" className="p-2" onClick={() => setFilterOpen(!filterOpen)}>
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tab切换 */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full h-12 rounded-none bg-transparent border-0 p-0">
              <TabsTrigger
                value="followed"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                我关注的
              </TabsTrigger>
              <TabsTrigger
                value="all"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                全部人物
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 筛选栏 */}
      {filterOpen && (
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center space-x-2 mb-3">
            {/* 部门筛选 */}
            <div className="flex-1">
              <Select value={selectedDepartment} onValueChange={handleDepartmentChange}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="全部部门" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(departmentJobs).map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 岗位筛选 */}
            <div className="flex-1">
              <Select value={selectedPosition} onValueChange={setSelectedPosition}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="全部岗位" />
                </SelectTrigger>
                <SelectContent>
                  {positionOptions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 视图切换按钮 */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "list" ? "card" : "list")}
              className="p-2"
            >
              {viewMode === "list" ? <Grid3X3 className="w-4 h-4" /> : <List className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      )}

      {/* 内容区域 */}
      <div className="p-4">
        {filteredData.length === 0 ? (
          /* 空状态 */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Search className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === "followed" ? "暂无关注的人员" : "暂无符合条件的人员"}
            </h3>
            <p className="text-sm text-gray-500">
              {activeTab === "followed" ? "快去关注一些同事吧" : "请调整筛选条件试试"}
            </p>
          </div>
        ) : (
          /* 数据展示 */
          <div
            className={`transition-all duration-300 ${viewMode === "list" ? "space-y-3" : "grid grid-cols-2 gap-4"}`}
          >
            {filteredData.map((person) =>
              viewMode === "list" ? (
                <ListItem key={person.id} person={person} onClick={handleItemClick} />
              ) : (
                <CardItem key={person.id} person={person} onClick={handleItemClick} />
              ),
            )}
          </div>
        )}
      </div>
    </div>
  )
}
