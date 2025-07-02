"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, FileText } from "lucide-react"

interface GeneratePageProps {
  params: {
    policyId: string
  }
}

// 模拟政策数据
const mockPolicyData = {
  policy1: {
    title: "关于推进数字经济发展的指导意见",
    source: "国务院",
    publishDate: "2025-06-20",
    content: `为深入贯彻党中央、国务院关于发展数字经济的重大决策部署，加快数字经济发展，推进数字产业化和产业数字化，推动数字经济和实体经济深度融合，打造具有国际竞争力的数字产业集群，现提出如下意见。

一、总体要求
（一）指导思想。以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神...

二、主要目标
到2025年，数字经济核心产业增加值占GDP比重达到10%，数字化转型取得明显成效...

三、重点任务
（一）加强数字基础设施建设
1. 加快5G网络建设和应用
2. 推进数据中心建设
3. 完善工业互联网基础设施

（二）推动数字产业化
1. 做强做优数字产业
2. 培育新兴数字产业
3. 打造数字产业集群

（三）加快产业数字化转型
1. 推进制造业数字化转型
2. 加快服务业数字化发展
3. 促进农业数字化转型`,
  },
}

export default function GeneratePage({ params }: GeneratePageProps) {
  const router = useRouter()
  const [selectedRegion, setSelectedRegion] = useState("")
  const [selectedReportType, setSelectedReportType] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const policyData = mockPolicyData[params.policyId as keyof typeof mockPolicyData]

  const handleGenerate = () => {
    if (!selectedRegion || !selectedReportType) {
      alert("请选择地区和报告类型")
      return
    }

    setIsGenerating(true)

    // 模拟生成过程
    setTimeout(() => {
      router.push("/reports/generating")
    }, 1000)
  }

  if (!policyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">政策文件未找到</p>
          <Button onClick={() => router.back()} className="mt-4">
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 固定顶部导航 */}
      <header className="fixed top-0 w-full bg-white border-b z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2 -ml-2">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">生成报告</h1>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 政策标题区 */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl">{policyData.title}</CardTitle>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>发布时间：{policyData.publishDate}</span>
                <span>来源：{policyData.source}</span>
              </div>
            </CardHeader>
          </Card>

          {/* 政策正文 */}
          <Card className="border-gray-200">
            <CardContent className="p-6">
              <div className="prose max-w-none">
                <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">{policyData.content}</div>
              </div>
            </CardContent>
          </Card>

          {/* 报告生成区 - 固定在底部 */}
          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                基于此政策生成报告
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">选择地区</label>
                  <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择地区" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jiujiang">九江市</SelectItem>
                      <SelectItem value="nanchang">南昌市</SelectItem>
                      <SelectItem value="yichun">宜春市</SelectItem>
                      <SelectItem value="shangrao">上饶市</SelectItem>
                      <SelectItem value="ganzhou">赣州市</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">报告类型</label>
                  <Select value={selectedReportType} onValueChange={setSelectedReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="选择报告类型" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="feasibility">工程可研报告</SelectItem>
                      <SelectItem value="stability">社会稳定风险评估</SelectItem>
                      <SelectItem value="water">水土保持报告</SelectItem>
                      <SelectItem value="environmental">环境影响评估</SelectItem>
                      <SelectItem value="investment">投资分析报告</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full md:w-auto"
                onClick={handleGenerate}
                disabled={isGenerating || !selectedRegion || !selectedReportType}
              >
                <FileText className="h-4 w-4 mr-2" />
                {isGenerating ? "正在生成..." : "生成报告"}
                {!isGenerating && <span className="text-sm ml-2 opacity-70">预计需要2-3分钟</span>}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
