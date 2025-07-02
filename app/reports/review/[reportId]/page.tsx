"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import {
  ChevronLeft,
  Download,
  MessageSquare,
  ChevronUp,
  ChevronDown,
  X,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface ReviewPageProps {
  params: {
    reportId: string
  }
}

interface Annotation {
  id: string
  page: number
  section: string
  content: string
  position: { start: number; end: number }
  createdAt: Date
  status: "active" | "resolved"
  selectedText: string
}

interface ButtonPosition {
  x: number
  y: number
}

// 报告状态枚举
const ReportStatus = {
  GENERATING: "generating",
  PENDING_REVIEW: "pending_review",
  REVIEWING: "reviewing",
  OPTIMIZING: "optimizing",
  OPTIMIZED: "optimized",
  APPROVED: "approved",
} as const

type ReportStatusType = (typeof ReportStatus)[keyof typeof ReportStatus]

// 模拟报告数据
const mockReportData = {
  report1: {
    title: "九江市数字经济工程可研报告",
    status: "pending_review" as ReportStatusType,
    content: `# 1. 项目概述

基于《关于推进数字经济发展的指导意见》，结合九江市产业基础和区位优势，本项目拟建设5个数字产业园区，总投资规模500亿元，打造长江中游地区重要的数字经济高地。

项目将分三期实施，第一期投资200亿元建设九江经开区数字产业园和濂溪区智慧制造园，第二期投资200亿元建设共青城数字文创园和德安县数字农业园，第三期投资100亿元建设九江港数字物流园。

# 2. 建设必要性

数字经济已成为推动经济高质量发展的重要引擎。九江市作为长江经济带重要节点城市，具备发展数字经济的良好基础条件。但目前仍存在数字产业规模偏小、创新能力不强、产业链不完整等问题，需要通过建设专业化数字产业园区来集聚资源、完善生态。

本项目的建设将有效承接长三角地区数字产业转移，推动九江市传统产业数字化转型，培育新的经济增长点。同时，项目符合国家数字经济发展战略和江西省数字经济"一号工程"要求，具有重要的战略意义。

# 3. 投资估算

## 3.1 总投资构成

项目总投资500亿元，其中：
- 土地费用：80亿元
- 基础设施建设：120亿元  
- 产业载体建设：200亿元
- 设备采购：60亿元
- 其他费用：40亿元

## 3.2 资金来源

- 政府投资：200亿元（40%）
- 社会投资：300亿元（60%）

政府投资主要用于土地整理、基础设施建设等公共部分，社会投资主要用于产业载体建设和设备采购。

# 4. 效益分析

## 4.1 经济效益

预计到2027年，项目将实现：
- 年产值突破1000亿元
- 年税收收入超过50亿元
- 带动相关产业产值2000亿元

## 4.2 社会效益

- 直接就业岗位：5万个
- 间接带动就业：10万个
- 培育上市企业：10家以上
- 引进高层次人才：1000人以上

# 5. 实施进度

项目建设期为4年（2024-2027年），具体安排如下：

**2024年**：完成项目前期工作，启动土地征收和基础设施建设
**2025年**：完成第一期园区建设，开始招商引资
**2026年**：完成第二期园区建设，第一期园区投入运营
**2027年**：完成第三期园区建设，项目全面建成投产

# 6. 风险分析

## 6.1 主要风险

1. **政策风险**：国家和地方政策调整可能影响项目实施
2. **市场风险**：数字经济市场竞争激烈，存在招商不达预期风险
3. **技术风险**：技术更新换代快，存在技术路线选择风险
4. **资金风险**：项目投资规模大，存在资金筹措风险

## 6.2 风险防控措施

1. 密切跟踪政策动向，及时调整项目方案
2. 加强市场调研，制定差异化招商策略
3. 建立技术专家委员会，定期评估技术路线
4. 多元化融资渠道，确保资金供应

# 7. 结论与建议

本项目符合国家数字经济发展战略，具有良好的建设条件和发展前景。建议：

1. 尽快启动项目前期工作，争取早日开工建设
2. 加强与长三角地区对接，积极承接产业转移
3. 完善配套政策，营造良好的发展环境
4. 强化人才引进和培养，为项目提供智力支撑

综上所述，九江市数字经济工程项目具有重要的战略意义和良好的发展前景，建议予以实施。`,
  },
}

// 高亮文本组件
function HighlightedText({
  children,
  annotationId,
  onClick,
}: {
  children: React.ReactNode
  annotationId: string
  onClick?: () => void
}) {
  return (
    <span
      className="bg-yellow-100 px-1 rounded cursor-pointer hover:bg-yellow-200 transition-colors"
      onClick={onClick}
      data-annotation-id={annotationId}
    >
      {children}
    </span>
  )
}

// 批注指示器组件
function AnnotationIndicator({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center justify-center w-5 h-5 bg-yellow-400 text-white text-xs rounded-full ml-2">
      {count}
    </span>
  )
}

// 批注卡片组件
function AnnotationCard({
  annotation,
  onDelete,
  onClick,
}: {
  annotation: Annotation
  onDelete: (id: string) => void
  onClick: (id: string) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="border rounded-lg p-3 hover:border-blue-300 transition-colors cursor-pointer"
      onClick={() => onClick(annotation.id)}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-sm font-medium">
          P{annotation.page} - {annotation.section}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-red-50 hover:text-red-600"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(annotation.id)
          }}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <div className="text-xs text-gray-500 mb-1 bg-gray-50 px-2 py-1 rounded">"{annotation.selectedText}"</div>
      <p className="text-sm text-gray-600">{annotation.content}</p>
      <p className="text-xs text-gray-400 mt-2">{annotation.createdAt.toLocaleString()}</p>
    </motion.div>
  )
}

// 状态徽章组件
function StatusBadge({ status }: { status: ReportStatusType }) {
  const statusConfig = {
    [ReportStatus.GENERATING]: { label: "生成中", variant: "secondary" as const, icon: Clock },
    [ReportStatus.PENDING_REVIEW]: { label: "待审核", variant: "outline" as const, icon: AlertCircle },
    [ReportStatus.REVIEWING]: { label: "审核中", variant: "secondary" as const, icon: Clock },
    [ReportStatus.OPTIMIZING]: { label: "优化中", variant: "secondary" as const, icon: Clock },
    [ReportStatus.OPTIMIZED]: { label: "已优化", variant: "default" as const, icon: CheckCircle },
    [ReportStatus.APPROVED]: { label: "已通过", variant: "default" as const, icon: CheckCircle },
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

export default function ReviewPage({ params }: ReviewPageProps) {
  const router = useRouter()
  const [annotations, setAnnotations] = useState<Annotation[]>([])
  const [showAnnotations, setShowAnnotations] = useState(true)
  const [showAnnotationButton, setShowAnnotationButton] = useState(false)
  const [buttonPosition, setButtonPosition] = useState<ButtonPosition>({ x: 0, y: 0 })
  const [selectedText, setSelectedText] = useState("")
  const [selectedRange, setSelectedRange] = useState<Range | null>(null)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [optimizationType, setOptimizationType] = useState("expert")
  const [optimizationNote, setOptimizationNote] = useState("")
  const [showAnnotationInput, setShowAnnotationInput] = useState(false)
  const [annotationContent, setAnnotationContent] = useState("")
  const contentRef = useRef<HTMLDivElement>(null)

  // 获取报告数据
  const reportData = mockReportData[params.reportId as keyof typeof mockReportData] || {
    title: "报告标题",
    status: "pending_review" as ReportStatusType,
    content: "报告内容...",
  }

  // 处理文本选择
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      const containerRect = contentRef.current?.getBoundingClientRect()

      if (containerRect) {
        setButtonPosition({
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top - 40,
        })
        setSelectedText(selection.toString().trim())
        setSelectedRange(range.cloneRange())
        setShowAnnotationButton(true)
      }
    } else {
      setShowAnnotationButton(false)
      setSelectedText("")
      setSelectedRange(null)
    }
  }

  // 添加批注
  const handleAddAnnotation = () => {
    setShowAnnotationButton(false)
    setShowAnnotationInput(true)
  }

  // 保存批注
  const handleSaveAnnotation = () => {
    if (!annotationContent.trim() || !selectedRange) return

    const newAnnotation: Annotation = {
      id: `anno-${Date.now()}`,
      page: 1,
      section: "项目概述", // 这里可以根据实际位置动态确定
      content: annotationContent,
      position: { start: 0, end: selectedText.length }, // 简化处理
      createdAt: new Date(),
      status: "active",
      selectedText: selectedText,
    }

    setAnnotations((prev) => [...prev, newAnnotation])
    setAnnotationContent("")
    setShowAnnotationInput(false)
    setSelectedText("")
    setSelectedRange(null)
  }

  // 删除批注
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((anno) => anno.id !== id))
  }

  // 点击批注卡片
  const handleAnnotationClick = (id: string) => {
    // 这里可以实现滚动到对应位置的逻辑
    console.log("点击批注:", id)
  }

  // 提交优化
  const handleSubmitOptimization = () => {
    setShowSubmitDialog(false)
    // 跳转到优化处理页面
    router.push("/reports/optimizing")
  }

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "m") {
        e.preventDefault()
        if (selectedText) {
          handleAddAnnotation()
        }
      }
      if (e.ctrlKey && e.key === "Enter") {
        e.preventDefault()
        if (annotations.length > 0) {
          setShowSubmitDialog(true)
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [selectedText, annotations.length])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部操作栏 - 固定 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">报告审核</h1>
              <p className="text-sm text-gray-500">{reportData.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={reportData.status} />
            <Button variant="outline" disabled={annotations.length > 0}>
              <Download className="h-4 w-4 mr-2" />
              下载
            </Button>
            <Button disabled={annotations.length === 0} onClick={() => setShowSubmitDialog(true)}>
              提交优化 ({annotations.length})
            </Button>
          </div>
        </div>
      </header>

      {/* 主体区域 - 左右布局 */}
      <div className="max-w-6xl mx-auto flex gap-4 p-4">
        {/* 左侧 - 报告预览 */}
        <div className="flex-1">
          <div className="bg-white rounded-lg shadow-sm relative">
            {/* 报告内容区 */}
            <div ref={contentRef} className="p-6 prose max-w-none" onMouseUp={handleTextSelection}>
              <div
                className="text-gray-700 leading-relaxed whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: reportData.content.replace(/\n/g, "<br/>") }}
              />
            </div>

            {/* 添加批注的浮动按钮 */}
            <AnimatePresence>
              {showAnnotationButton && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute z-10"
                  style={{
                    top: buttonPosition.y,
                    left: buttonPosition.x,
                    transform: "translateX(-50%)",
                  }}
                >
                  <Button size="sm" onClick={handleAddAnnotation}>
                    <MessageSquare className="h-3 w-3 mr-1" />
                    批注
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 批注输入框 */}
            <AnimatePresence>
              {showAnnotationInput && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute z-20 bg-white border rounded-lg shadow-lg p-4 w-80"
                  style={{
                    top: buttonPosition.y + 40,
                    left: Math.max(10, buttonPosition.x - 160),
                  }}
                >
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">选中文本：</div>
                      <div className="text-sm bg-gray-50 p-2 rounded border">"{selectedText}"</div>
                    </div>
                    <Textarea
                      placeholder="请输入批注内容..."
                      value={annotationContent}
                      onChange={(e) => setAnnotationContent(e.target.value)}
                      rows={3}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <Button size="sm" onClick={handleSaveAnnotation} disabled={!annotationContent.trim()}>
                        保存
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setShowAnnotationInput(false)
                          setAnnotationContent("")
                        }}
                      >
                        取消
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* 右侧 - 批注面板 */}
        <div className="w-80">
          <div className="bg-white rounded-lg shadow-sm sticky top-20">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-medium">批注 ({annotations.length})</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowAnnotations(!showAnnotations)}>
                {showAnnotations ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>

            <AnimatePresence>
              {showAnnotations && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
                    {annotations.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">暂无批注</p>
                        <p className="text-xs mt-1">选中文本后点击"批注"按钮添加</p>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {annotations.map((annotation) => (
                          <AnnotationCard
                            key={annotation.id}
                            annotation={annotation}
                            onDelete={handleDeleteAnnotation}
                            onClick={handleAnnotationClick}
                          />
                        ))}
                      </AnimatePresence>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 快捷键提示 */}
          {annotations.length === 0 && (
            <div className="mt-4 bg-blue-50 rounded-lg p-3">
              <h4 className="text-sm font-medium text-blue-900 mb-2">快捷键</h4>
              <div className="space-y-1 text-xs text-blue-700">
                <div>Ctrl + M：快速添加批注</div>
                <div>Ctrl + Enter：提交优化</div>
                <div>Delete：删除选中批注</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 提交优化确认弹窗 */}
      <Dialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>提交优化确认</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* 批注列表 */}
            <div>
              <p className="text-sm text-gray-600 mb-2">您添加了 {annotations.length} 条批注：</p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {annotations.map((anno, index) => (
                  <div key={anno.id} className="text-sm">
                    <span className="font-medium">
                      {index + 1}. {anno.section}
                    </span>
                    <span className="text-gray-600"> - {anno.content}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 优化方式选择 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">优化方式：</label>
              <RadioGroup value={optimizationType} onValueChange={setOptimizationType}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ai" id="ai" />
                  <label htmlFor="ai" className="text-sm cursor-pointer">
                    快速优化（AI自动处理，约10分钟）
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expert" id="expert" />
                  <label htmlFor="expert" className="text-sm cursor-pointer">
                    专家优化（人工介入，约2小时）
                  </label>
                </div>
              </RadioGroup>
            </div>

            {/* 备注输入 */}
            <div>
              <label className="text-sm font-medium">备注说明（选填）：</label>
              <Textarea
                placeholder="请输入其他需要说明的内容..."
                className="mt-1"
                rows={3}
                value={optimizationNote}
                onChange={(e) => setOptimizationNote(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSubmitDialog(false)}>
              取消
            </Button>
            <Button onClick={handleSubmitOptimization}>确认提交</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
