"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, Copy, Check, Download, FileText, ChevronUp, ChevronDown, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface DetailPageProps {
  params: {
    id: string
  }
}

// 关键词高亮处理函数
const highlightKeywords = (text: string) => {
  // 定义关键词模式
  const patterns = [
    // 数字+单位（投资金额、面积等）
    /(\d+(?:\.\d+)?(?:亿|万|千|百)?元?)/g,
    /(\d+(?:\.\d+)?(?:亩|平方米|公里|米))/g,
    /(\d+(?:\.\d+)?%)/g,

    // 地名
    /(九江|南昌|赣州|长江|长三角)/g,

    // 项目相关
    /(数字产业园|智慧制造|人工智能|大数据|工业互联网|数字经济)/g,

    // 政策相关
    /(三免三减半|专项债券|产业基金|政策支持|税收优惠)/g,

    // 重要业务词汇
    /(融资方案|招商引资|入驻率|窗口期|头部企业)/g,
  ]

  let highlightedText = text

  patterns.forEach((pattern) => {
    highlightedText = highlightedText.replace(pattern, (match) => {
      return `<span class="highlight-keyword">${match}</span>`
    })
  })

  return highlightedText
}

// 模拟新闻全文数据
const mockNewsData = {
  "1": {
    title: "张三：九江将建5个数字产业园",
    description: "发改委主任谈数字经济3年规划，投资500亿",
    time: "2小时前",
    source: "九江日报",
    sourceUrl: "https://www.jjrb.com/news/2024/0620/123456.html",
    position: "主任",
    department: "发改委",
    region: "九江市",
    fullContent: `九江市发改委主任张三在今日召开的数字经济发展大会上宣布，九江市将在未来三年内投资500亿元，建设5个数字产业园区，打造长江中游地区重要的数字经济高地。

**项目概况**

此次数字产业园建设项目是九江市"十四五"规划的重点工程，总投资规模达500亿元，分三期实施：

第一期（2024-2025年）：投资200亿元，建设2个核心园区
- 九江经开区数字产业园：占地1000亩，重点发展人工智能、大数据产业
- 濂溪区智慧制造园：占地800亩，专注工业互联网、智能制造

第二期（2025-2026年）：投资200亿元，建设2个特色园区  
- 共青城数字文创园：占地600亩，发展数字文化、电竞产业
- 德安县数字农业园：占地500亩，推进农业数字化转型

第三期（2026-2027年）：投资100亿元，建设1个综合园区
- 九江港数字物流园：占地400亩，打造智慧物流枢纽

**政策支持**

张三主任表示，市政府将出台一系列优惠政策：

1. **财税支持**：入驻企业享受"三免三减半"税收优惠
2. **土地政策**：工业用地按最低标准收取，研发用地可租可售
3. **人才引进**：设立10亿元人才发展基金，提供住房、子女教育等配套
4. **金融扶持**：设立50亿元产业引导基金，支持企业发展

**招商目标**

项目计划引进企业500家，其中：
- 头部企业20家（投资额超过10亿元）
- 骨干企业80家（投资额1-10亿元）  
- 中小企业400家（投资额1000万-1亿元）

预计到2027年，5个数字产业园将实现：
- 年产值突破1000亿元
- 吸纳就业人口10万人
- 培育上市企业10家以上

**区位优势**

张三主任强调，九江发展数字经济具有独特优势：

1. **交通枢纽**：长江黄金水道、京九铁路、福银高速交汇
2. **产业基础**：石化、钢铁、纺织等传统产业转型需求强烈  
3. **人才资源**：九江学院、九江职业技术学院等高校集中
4. **政策环境**：江西省数字经济"一号工程"重点支持城市

**实施计划**

项目将采用"政府引导、市场运作、企业主体"的模式推进：

- 2024年3月：完成项目可研报告和环评
- 2024年6月：启动土地征收和基础设施建设
- 2024年12月：第一期园区基本建成，开始招商
- 2025年6月：首批企业入驻运营

张三主任表示："数字经济是未来发展的主赛道，九江要抢抓机遇，在数字化转型中实现跨越式发展。我们有信心把九江打造成为长江中游地区最具活力的数字经济城市。"

会议还邀请了华为、腾讯、阿里巴巴等知名企业代表参加，多家企业表达了投资意向。预计首批签约项目将在下月的九江投资推介会上正式发布。`,
    keyInfo: {
      person: "张三",
      position: "九江市发改委主任",
      phone: "138-0792-1234",
      wechat: "zs_jiujiang_fgw",
    },
  },
  "2": {
    title: "李四：南昌港口物流园区规划",
    description: "财政局长介绍新港区建设，预计投资200亿",
    time: "4小时前",
    source: "南昌晚报",
    sourceUrl: "https://www.ncwb.com/news/2024/0620/789012.html",
    position: "局长",
    department: "财政局",
    region: "南昌市",
    fullContent: `南昌市财政局长李四今日宣布...`,
    keyInfo: {
      person: "李四",
      position: "南昌市财政局长",
      phone: "139-0791-5678",
      wechat: "ls_nanchang_czj",
    },
  },
}

// 报告状态类型
type ReportState = "idle" | "naming" | "generating" | "completed" | "failed"

// 在组件开始处添加样式
const keywordStyles = `
  .highlight-keyword {
    color: #2563eb;
    font-weight: 600;
    font-size: 1.2em;
  }
`

// 进度条组件
const CircularProgress = ({ progress, size = 40 }: { progress: number; size?: number }) => {
  const radius = (size - 4) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (progress / 100) * circumference

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} stroke="#e5e7eb" strokeWidth="3" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#3b82f6"
          strokeWidth="3"
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-300 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xs font-medium text-gray-900">{progress}%</span>
      </div>
    </div>
  )
}

export default function DetailPage({ params }: DetailPageProps) {
  const router = useRouter()
  const [copiedScript, setCopiedScript] = useState<string | null>(null)
  const [isNewsExpanded, setIsNewsExpanded] = useState(false)
  const [activeSection, setActiveSection] = useState("scripts")
  const [activeScriptTab, setActiveScriptTab] = useState("script1")

  // 报告生成相关状态
  const [reportStates, setReportStates] = useState<Record<string, ReportState>>({})
  const [progresses, setProgresses] = useState<Record<string, number>>({})
  const [activeReport, setActiveReport] = useState<any>(null)
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false)
  const [customFileName, setCustomFileName] = useState("")
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")

  // 获取新闻数据
  const newsData = mockNewsData[params.id as keyof typeof mockNewsData] || {
    title: "新闻标题",
    description: "新闻简介",
    time: "时间",
    source: "新闻来源",
    sourceUrl: "",
    fullContent: "新闻全文内容...",
    keyInfo: {
      person: "联系人",
      position: "职位",
    },
  }

  const scripts = [
    {
      id: "script1",
      title: "推荐话术1：同级对比",
      icon: "💬",
      content: `张主任您好，我了解到您正在推进数字产业园项目，这个500亿的投资规模在全省都是领先的。

我们注意到南昌、赣州等地也在布局数字经济，但九江的区位优势更明显：
• 长江经济带核心节点
• 对接长三角的桥头堡
• 水陆空交通枢纽完备

我们在类似项目上有丰富经验，比如帮助某地级市完成了200亿数字产业园的融资方案，现在园区入驻率已达85%。

能否安排时间详细交流一下九江项目的具体规划？`,
    },
    {
      id: "script2",
      title: "推荐话术2：资金机会",
      icon: "💰",
      content: `张主任，数字产业园这类项目正好赶上了政策红利期：

国家层面：
• 数字经济"十四五"规划重点支持
• 新基建专项债券优先支持
• 产业引导基金配套投入

省级层面：
• 江西省数字经济三年行动计划
• 省级产业发展基金可申请
• 土地指标优先保障

我们可以帮您：
1. 设计多元化融资方案（专项债+产业基金+社会资本）
2. 对接头部企业入驻意向
3. 申请各类政策支持资金

这个窗口期很关键，建议我们尽快推进。`,
    },
  ]

  // 根据领导岗位和新闻内容智能生成携带材料
  const generateMaterials = (newsData: any) => {
    const { position, department, region, title } = newsData
    const materials = []

    // 第一份材料：项目分析（必有）
    let projectAnalysisTitle = ""
    let estimatedSize = "10-15MB"
    let estimatedTime = "2-3分钟"

    if (department?.includes("发改")) {
      projectAnalysisTitle = `${region}数字经济市场分析报告`
      estimatedSize = "12-18MB"
      estimatedTime = "3-4分钟"
    } else if (position?.includes("市长") || position?.includes("副市长")) {
      const projectType = title.includes("教育") ? "教育城" : title.includes("物流") ? "物流园区" : "产业园"
      projectAnalysisTitle = `${region}${projectType}项目实施方案`
      estimatedSize = "15-20MB"
      estimatedTime = "3-5分钟"
    } else if (department?.includes("财政")) {
      projectAnalysisTitle = `${region}财政投资项目分析报告`
      estimatedSize = "8-12MB"
      estimatedTime = "2-3分钟"
    } else {
      projectAnalysisTitle = `${region}重点项目投资分析`
      estimatedSize = "10-15MB"
      estimatedTime = "2-3分钟"
    }

    materials.push({
      id: "mat1",
      title: projectAnalysisTitle,
      type: "PDF",
      estimatedSize,
      estimatedTime,
      category: "market_analysis",
    })

    // 第二份材料：根据具体情况生成
    if (department?.includes("发改")) {
      materials.push({
        id: "mat2",
        title: `${region}数字经济政策汇编`,
        type: "PDF",
        estimatedSize: "8-12MB",
        estimatedTime: "1-2分钟",
        category: "policy_collection",
      })
    } else if (position?.includes("市长") || position?.includes("副市长")) {
      const materialType = title.includes("教育") ? "教育产业" : title.includes("物流") ? "物流产业" : "重点产业"
      materials.push({
        id: "mat2",
        title: `${region}${materialType}发展规划`,
        type: "PDF",
        estimatedSize: "15-20MB",
        estimatedTime: "3-4分钟",
        category: "development_plan",
      })
    } else if (department?.includes("财政")) {
      materials.push({
        id: "mat2",
        title: `${region}PPP项目投资指南`,
        type: "PDF",
        estimatedSize: "9-15MB",
        estimatedTime: "2-3分钟",
        category: "investment_guide",
      })
    }

    return materials
  }

  // 使用新的材料生成函数
  const materials = generateMaterials(newsData)

  // 模拟生成进度
  const simulateProgress = (reportId: string, onComplete: () => void) => {
    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15
      if (progress >= 100) {
        progress = 100
        clearInterval(interval)
        setProgresses((prev) => ({ ...prev, [reportId]: 100 }))
        setTimeout(() => {
          onComplete()
        }, 500)
      } else {
        setProgresses((prev) => ({ ...prev, [reportId]: Math.floor(progress) }))
      }
    }, 500)

    return () => clearInterval(interval)
  }

  // 获取进度状态文字
  const getProgressText = (progress: number) => {
    if (progress < 30) return "正在收集数据..."
    if (progress < 60) return "正在分析处理..."
    if (progress < 90) return "正在生成报告..."
    return "正在准备下载..."
  }

  // 计算剩余时间
  const getEstimatedTime = (progress: number, totalTime: string) => {
    const totalMinutes = Number.parseInt(totalTime.split("-")[1]) || 3
    const remainingMinutes = Math.ceil(((100 - progress) / 100) * totalMinutes)
    return remainingMinutes > 0 ? `预计还需 ${remainingMinutes} 分钟` : "即将完成"
  }

  // 模拟文件下载
  const downloadFile = (filename: string) => {
    const content = `这是${filename}的内容`
    const blob = new Blob([content], { type: "application/pdf" })
    const url = URL.createObjectURL(blob)

    const link = document.createElement("a")
    link.href = url
    link.download = filename + ".pdf"
    link.click()

    URL.revokeObjectURL(url)
  }

  // 处理一键生成并下载
  const handleGenerateAndDownload = (material: any) => {
    setActiveReport(material)
    setCustomFileName(material.title)
    setIsNamingDialogOpen(true)
  }

  // 确认文件名并开始生成
  const handleConfirmGenerate = () => {
    if (!activeReport || !customFileName.trim()) return

    setIsNamingDialogOpen(false)
    setReportStates((prev) => ({ ...prev, [activeReport.id]: "generating" }))
    setProgresses((prev) => ({ ...prev, [activeReport.id]: 0 }))

    // 模拟生成过程
    const cleanup = simulateProgress(activeReport.id, () => {
      // 生成完成，自动下载
      try {
        downloadFile(customFileName)
        setReportStates((prev) => ({ ...prev, [activeReport.id]: "completed" }))
        toast.success(`${customFileName}.pdf 下载成功！`)

        // 3秒后恢复初始状态
        setTimeout(() => {
          setReportStates((prev) => ({ ...prev, [activeReport.id]: "idle" }))
          setProgresses((prev) => ({ ...prev, [activeReport.id]: 0 }))
        }, 3000)
      } catch (error) {
        setReportStates((prev) => ({ ...prev, [activeReport.id]: "failed" }))
        setErrorMessage("报告生成失败，请重试")
        setIsErrorDialogOpen(true)
      }
    })
  }

  // 取消生成
  const handleCancelGenerate = (reportId: string) => {
    setReportStates((prev) => ({ ...prev, [reportId]: "idle" }))
    setProgresses((prev) => ({ ...prev, [reportId]: 0 }))
  }

  // 处理生成失败后的重试
  const handleRetryGenerate = () => {
    setIsErrorDialogOpen(false)
    if (activeReport) {
      handleGenerateAndDownload(activeReport)
    }
  }

  // 下载全部材料
  const handleDownloadAll = () => {
    materials.forEach((material, index) => {
      setTimeout(() => {
        setReportStates((prev) => ({ ...prev, [material.id]: "generating" }))
        setProgresses((prev) => ({ ...prev, [material.id]: 0 }))

        const cleanup = simulateProgress(material.id, () => {
          downloadFile(material.title)
          setReportStates((prev) => ({ ...prev, [material.id]: "completed" }))

          setTimeout(() => {
            setReportStates((prev) => ({ ...prev, [material.id]: "idle" }))
            setProgresses((prev) => ({ ...prev, [material.id]: 0 }))
          }, 3000)
        })
      }, index * 1000) // 错开1秒开始
    })

    toast.success("开始批量生成下载，请稍候...")
  }

  const handleCopy = async (text: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedScript(scriptId)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  const toggleNewsExpanded = () => {
    setIsNewsExpanded(!isNewsExpanded)
  }

  // 获取新闻正文的前3行
  const getFirstThreeLines = (content: string) => {
    const lines = content.split("\n").filter((line) => line.trim() !== "")
    return lines.slice(0, 3).join("\n")
  }

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keywordStyles }} />
      <div className="min-h-screen bg-white">
        {/* 固定顶部导航 */}
        <header className="fixed top-0 w-full bg-white border-b z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="mr-2 -ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">线索详情</h1>
          </div>
        </header>

        {/* 主体布局 */}
        <div className="pt-14">
          {/* 右侧主体内容区 */}
          <main className="max-w-4xl mx-auto px-6 py-4 space-y-6">
            {/* 新闻信息 */}
            <section id="news" className="border border-gray-200 rounded-lg p-4">
              <div className="bg-white">
                <div className="space-y-3">
                  {/* 新闻标题和商务抓手 */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {newsData.sourceUrl ? (
                          <a
                            href={newsData.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-900 hover:text-blue-600 hover:underline cursor-pointer transition-colors"
                          >
                            {newsData.title}
                          </a>
                        ) : (
                          newsData.title
                        )}
                      </h3>
                    </div>
                  </div>

                  {/* 新闻来源和发布时间 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <span>来源：</span>
                      <span className="font-medium">{newsData.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>发布时间：</span>
                      <span className="font-medium">{newsData.time}</span>
                    </div>
                  </div>

                  {/* 新闻正文 */}
                  <div className="prose prose-sm max-w-none">
                    {!isNewsExpanded ? (
                      // 收起状态：显示前3行，在...后面加展开按钮
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                        {getFirstThreeLines(newsData.fullContent)}
                        <span className="text-gray-400 mr-2">...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleNewsExpanded}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 inline-flex items-center"
                        >
                          <ChevronDown className="h-4 w-4 mr-1" />
                          展开
                        </Button>
                      </div>
                    ) : (
                      // 展开状态：显示完整内容，在最后加收起按钮
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                        {newsData.fullContent}
                        <div className="flex justify-end mt-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={toggleNewsExpanded}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            <ChevronUp className="h-4 w-4 mr-1" />
                            收起
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* 话术模块 */}
            <section id="scripts" className="border border-gray-200 rounded-lg p-4">
              <Tabs value={activeScriptTab} onValueChange={setActiveScriptTab}>
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="script1" className="text-4xl py-4">
                    推荐话术1
                  </TabsTrigger>
                  <TabsTrigger value="script2" className="text-4xl py-4">
                    推荐话术2
                  </TabsTrigger>
                </TabsList>
                {scripts.map((script) => (
                  <TabsContent key={script.id} value={script.id}>
                    <div className="bg-white mb-4">
                      <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line mb-3 text-black">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: highlightKeywords(script.content).replace(/\n/g, "<br/>"),
                          }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white text-gray-700 border-gray-300"
                          onClick={() => handleCopy(script.content, script.id)}
                        >
                          {copiedScript === script.id ? (
                            <>
                              <Check className="h-3 w-3 mr-1 text-green-600" />
                              <span className="text-green-600">已复制</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              复制
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </section>

            {/* 推荐材料下载 */}
            <section id="materials" className="border border-gray-200 rounded-lg p-4">
              <div className="bg-white">
                {/* 联系人信息卡片 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-base">
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-gray-600">推荐联系人：</span>
                        <span className="font-medium text-gray-900">{newsData.keyInfo.person}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">职位：</span>
                        <span className="font-medium text-gray-900">{newsData.keyInfo.position}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-gray-600">电话：</span>
                        <span className="font-medium text-gray-900">{newsData.keyInfo.phone}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">微信：</span>
                        <span className="font-medium text-gray-900">{newsData.keyInfo.wechat}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 需携带的材料标题 */}
                <div className="mb-4">
                  <span className="text-gray-600 text-base">需携带的材料：</span>
                </div>

                {/* 材料列表 */}
                <div className="space-y-3 mb-4">
                  {materials.map((material) => {
                    const state = reportStates[material.id] || "idle"
                    const progress = progresses[material.id] || 0

                    return (
                      <div
                        key={material.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-blue-600">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium text-base text-gray-900">{material.title}</div>
                            <div className="text-sm text-gray-500">
                              {material.type} • 预计{material.estimatedSize}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          {state === "generating" && (
                            <div className="flex flex-col items-center gap-1">
                              <CircularProgress progress={progress} size={32} />
                              <div className="text-xs text-gray-500 text-center">
                                <div>{getProgressText(progress)}</div>
                                <div>{getEstimatedTime(progress, material.estimatedTime)}</div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleCancelGenerate(material.id)}
                                className="text-xs text-gray-400 hover:text-gray-600"
                              >
                                取消
                              </Button>
                            </div>
                          )}

                          {state === "completed" && (
                            <div className="flex items-center gap-2 text-green-600">
                              <Check className="h-4 w-4" />
                              <span className="text-sm">已下载</span>
                            </div>
                          )}

                          {(state === "idle" || state === "failed") && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleGenerateAndDownload(material)}
                              className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              一键生成并下载
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 下载全部材料按钮 */}
                <Button
                  variant="outline"
                  className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={handleDownloadAll}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载全部材料
                </Button>
              </div>
            </section>
          </main>
        </div>

        {/* 文件命名弹窗 */}
        <Dialog open={isNamingDialogOpen} onOpenChange={setIsNamingDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>设置报告名称</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="filename">文件名称</Label>
                <Input
                  id="filename"
                  value={customFileName}
                  onChange={(e) => setCustomFileName(e.target.value)}
                  placeholder="请输入文件名称"
                  maxLength={50}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">报告将保存为PDF格式，最多50个字符</p>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsNamingDialogOpen(false)}>
                  取消
                </Button>
                <Button
                  onClick={handleConfirmGenerate}
                  disabled={!customFileName.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  开始生成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* 错误提示弹窗 */}
        <Dialog open={isErrorDialogOpen} onOpenChange={setIsErrorDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                生成失败
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-gray-700">{errorMessage}</p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsErrorDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleRetryGenerate} className="bg-blue-600 hover:bg-blue-700">
                  重新生成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  )
}
