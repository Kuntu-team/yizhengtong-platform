"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, FileText, Clock, CheckCircle, AlertCircle, Eye, Download, Plus } from "lucide-react"

interface PolicyItem {
  id: string
  title: string
  source: string
  publishDate: string
  category: string
  summary: string
}

interface ReportItem {
  id: string
  title: string
  type: string
  region: string
  status: "generating" | "pending_review" | "reviewing" | "optimizing" | "completed"
  createdAt: string
  progress?: number
}

// 模拟政策数据
const mockPolicies: PolicyItem[] = [
  {
    id: "policy1",
    title: "关于推进数字经济发展的指导意见",
    source: "国务院",
    publishDate: "2025-06-20",
    category: "数字经济",
    summary: "明确数字经济发展目标，提出重点任务和保障措施，支持数字产业园区建设。",
  },
  {
    id: "policy2",
    title: "新型基础设施建设三年行动计划",
    source: "发改委",
    publishDate: "2025-06-18",
    category: "基础设施",
    summary: "加快5G、数据中心、工业互联网等新基建项目建设，总投资规模达万亿级别。",
  },
  {
    id: "policy3",
    title: "绿色低碳发展实施方案",
    source: "生态环境部",
    publishDate: "2025-06-15",
    category: "环保政策",
    summary: "推进碳达峰碳中和目标实现，支持清洁能源和节能环保产业发展。",
  },
]

// 模拟报告数据
const mockReports: ReportItem[] = [
  {
    id: "report1",
    title: "九江市数字经济工程可研报告",
    type: "工程可研报告",
    region: "九江市",
    status: "completed",
    createdAt: "2025-06-20 14:30",
  },
  {
    id: "report2",
    title: "南昌港口物流园区环评报告",
    type: "环境影响评估",
    region: "南昌市",
    status: "reviewing",
    createdAt: "2025-06-20 10:15",
  },
  {
    id: "report3",
    title: "宜春教育城项目可研报告",
    type: "工程可研报告",
    region: "宜春市",
    status: "generating",
    createdAt: "2025-06-20 16:45",
    progress: 75,
  },
]

export default function ReportsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"policies" | "reports">("policies")
  const [selectedRegion, setSelectedRegion] = useState<string>("all")
  const [selectedReportType, setSelectedReportType] = useState<string>("all")

  const getStatusBadge = (status: ReportItem["status"]) => {
    const statusConfig = {
      generating: { label: "生成中", variant: "secondary" as const, icon: Clock },
      pending_review: { label: "待审核", variant: "outline" as const, icon: AlertCircle },
      reviewing: { label: "审核中", variant: "secondary" as const, icon: Eye },
      optimizing: { label: "优化中", variant: "secondary" as const, icon: Clock },
      completed: { label: "已完成", variant: "default" as const, icon: CheckCircle },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const handleGenerateReport = (policyId: string) => {
    router.push(`/reports/generate/${policyId}`)
  }

  const handleViewReport = (reportId: string) => {
    router.push(`/reports/review/${reportId}`)
  }

  const filteredReports = mockReports.filter((report) => {
    if (selectedRegion !== "all" && !report.region.includes(selectedRegion)) return false
    if (selectedReportType !== "all" && report.type !== selectedReportType) return false
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 固定顶部导航 */}
      <header className="fixed top-0 w-full bg-white border-b z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">智能报告生成</h1>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant={activeTab === "policies" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("policies")}
            >
              政策库
            </Button>
            <Button
              variant={activeTab === "reports" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveTab("reports")}
            >
              我的报告
            </Button>
          </div>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="pt-16">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {activeTab === "policies" ? (
            <>
              {/* 政策库页面 */}
              <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">政策库</h2>
                <p className="text-gray-600">选择政策文件，快速生成专业报告</p>
              </div>

              <div className="space-y-4">
                {mockPolicies.map((policy) => (
                  <Card key={policy.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{policy.title}</CardTitle>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>来源：{policy.source}</span>
                            <span>发布时间：{policy.publishDate}</span>
                            <Badge variant="outline">{policy.category}</Badge>
                          </div>
                          <CardDescription className="text-sm">{policy.summary}</CardDescription>
                        </div>
                        <Button onClick={() => handleGenerateReport(policy.id)}>
                          <Plus className="h-4 w-4 mr-2" />
                          生成报告
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </>
          ) : (
            <>
              {/* 我的报告页面 */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">我的报告</h2>
                    <p className="text-gray-600">管理和查看您的报告生成记录</p>
                  </div>
                </div>

                {/* 筛选器 */}
                <div className="flex gap-4 mb-6">
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="选择地区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部地区</SelectItem>
                      <SelectItem value="九江">九江市</SelectItem>
                      <SelectItem value="南昌">南昌市</SelectItem>
                      <SelectItem value="宜春">宜春市</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="报告类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">全部类型</SelectItem>
                      <SelectItem value="工程可研报告">工程可研报告</SelectItem>
                      <SelectItem value="环境影响评估">环境影响评估</SelectItem>
                      <SelectItem value="社会稳定风险评估">社会稳定风险评估</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                {filteredReports.map((report) => (
                  <Card key={report.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">{report.title}</h3>
                            {getStatusBadge(report.status)}
                          </div>

                          <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                            <span>类型：{report.type}</span>
                            <span>地区：{report.region}</span>
                            <span>创建时间：{report.createdAt}</span>
                          </div>

                          {report.status === "generating" && report.progress && (
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-gray-600">生成进度</span>
                                <span className="text-blue-600">{report.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${report.progress}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {report.status === "completed" && (
                            <>
                              <Button variant="outline" size="sm">
                                <Download className="h-4 w-4 mr-1" />
                                下载
                              </Button>
                              <Button size="sm" onClick={() => handleViewReport(report.id)}>
                                <Eye className="h-4 w-4 mr-1" />
                                查看
                              </Button>
                            </>
                          )}
                          {(report.status === "pending_review" || report.status === "reviewing") && (
                            <Button size="sm" onClick={() => handleViewReport(report.id)}>
                              <Eye className="h-4 w-4 mr-1" />
                              审核
                            </Button>
                          )}
                          {report.status === "generating" && (
                            <Button variant="outline" size="sm" disabled>
                              生成中...
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredReports.length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">暂无报告记录</p>
                    <p className="text-sm text-gray-400">从政策库开始生成您的第一份报告</p>
                    <Button className="mt-4" onClick={() => setActiveTab("policies")}>
                      前往政策库
                    </Button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
