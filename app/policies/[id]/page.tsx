"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronDown, CheckCircle, Users, X } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface PolicyDetailProps {
  params: {
    id: string
  }
}

interface Project {
  id: string
  name: string
  suitable: string
  requirements: string
  script: string
}

interface PolicyDetail {
  id: string
  title: string
  source: string
  sourceUrl?: string // 添加这行
  publishDate: string
  status: "pending" | "completed"
  keyPoints: string[]
  projects: Project[]
  fullContent: string
}

// 模拟政策详情数据
const mockPolicyDetails: Record<string, PolicyDetail> = {
  policy1: {
    id: "policy1",
    title: "关于推进数字经济发展的指导意见",
    source: "国务院",
    sourceUrl: "https://www.gov.cn/zhengce/2024-06/20/content_6951234.html", // 添加这行
    publishDate: "2025-06-20",
    status: "completed",
    keyPoints: [
      "到2025年，数字经济核心产业增加值占GDP比重达到10%",
      "加快5G网络、数据中心、工业互联网等新型基础设施建设",
      "推动制造业、服务业、农业等产业数字化转型",
      "培育壮大人工智能、大数据、区块链等新兴数字产业",
      "完善数字经济治理体系，营造良好发展环境",
    ],
    projects: [
      {
        id: "proj1",
        name: "数字产业园区建设项目",
        suitable: "地级市以上",
        requirements: "具备产业基础和区位优势",
        script:
          "张主任您好，国务院刚发布的数字经济指导意见提到，到2025年数字经济核心产业增加值要占GDP的10%。九江作为长江经济带重要节点城市，在数字产业园建设方面有着得天独厚的优势。我们公司在全国已经成功运营了15个数字产业园项目，累计引进企业超过500家，总投资额达到300亿元。这次政策明确支持算力基础设施建设和5G网络部署，正好符合贵地区十四五规划中提出的数字经济发展目标。我们可以协助制定详细的申报方案，争取到2-5亿元的专项资金支持，同时提供从规划设计、招商引资到项目落地的全流程服务。园区建成后预计可引进100家以上数字经济企业，创造就业岗位5000个，年产值突破50亿元。",
      },
      {
        id: "proj2",
        name: "5G+工业互联网示范项目",
        suitable: "制造业企业",
        requirements: "有数字化转型需求",
        script:
          "李总您好，新发布的数字经济政策明确支持5G+工业互联网建设，这对制造业企业来说是千载难逢的机遇。贵公司作为本地制造业的龙头企业，年产值达到20亿元，正好符合政策扶持的重点对象。我们在5G+工业互联网领域有着丰富的实施经验，已经为全国200多家制造企业提供了数字化转型服务，平均帮助企业降低生产成本15%，提高生产效率25%。这次政策特别提到要推进制造业数字化转型，支持智能制造工程建设，最高可获得1000万元的项目补贴。我们可以帮助贵公司快速获得政策认定，享受三免三减半的税收优惠政策。从智能设备采购、系统集成到人员培训，我们都能提供一站式的专业服务，确保项目在6个月内完成部署并投入使用。",
      },
      {
        id: "proj3",
        name: "数字乡村建设试点",
        suitable: "县级政府",
        requirements: "农业产业基础较好",
        script:
          "王县长您好，数字经济政策特别强调要促进农业数字化转型，这为县域经济发展带来了新的增长点。贵县拥有50万亩优质农田和完善的农业产业链，非常适合申报数字乡村建设试点项目。我们已经在全国成功打造了30个数字乡村示范点，帮助农民增收30%以上，农产品品质提升显著。这次政策明确支持智慧农业发展，推进农业生产经营数字化改造，试点县可获得5000万元的专项建设资金。我们可以协助贵县制定完整的申报方案，从智慧农业平台搭建、农产品溯源体系建设到电商销售渠道打通，提供全链条的技术支持。项目建成后，预计可带动全县农业产值增长40%，打造区域农业品牌，实现农业现代化跨越式发展，成为全省数字乡村建设的标杆。",
      },
    ],
    fullContent: `为深入贯彻党中央、国务院关于发展数字经济的重大决策部署，加快数字经济发展，推进数字产业化和产业数字化，推动数字经济和实体经济深度融合，打造具有国际竞争力的数字产业集群，现提出如下意见。

一、总体要求

（一）指导思想。以习近平新时代中国特色社会主义思想为指导，全面贯彻党的二十大精神，完整、准确、全面贯彻新发展理念，加快构建新发展格局，着力推动高质量发展，统筹发展和安全，充分发挥数据要素作用，以数字技术与实体经济深度融合为主线，加强数字基础设施建设，完善数字经济治理体系，协同推进数字产业化和产业数字化，赋能传统产业转型升级，培育新业态新模式，不断做强做优做大我国数字经济。

（二）基本原则
——坚持创新驱动。把创新作为引领数字经济发展的第一动力，加强关键核心技术攻关，加快新技术产业化步伐，激发各类主体创新活力，构建技术先进、生态完善的数字经济体系。

——坚持应用牵引。以应用为导向，推动数字技术和实体经济深度融合，在融合中实现技术快速迭代和产业快速成长，形成以应用促发展的良好局面。

——坚持数据赋能。充分发挥数据要素作用，强化高质量数据要素供给，加快数据要素市场化配置改革，创新数据要素开发利用机制，让数据要素价值充分释放。

——坚持公平竞争。健全完善数字经济治理体系，强化反垄断和防止资本无序扩张，营造公平竞争的市场环境，充分激发市场主体活力。

——坚持系统推进。加强前瞻性思考、全局性谋划、战略性布局、整体性推进，统筹国内国际两个大局，协同推进数字产业化和产业数字化，实现发展质量、结构、规模、速度、效益、安全相统一。

——坚持开放合作。统筹发展和安全，坚持对外开放基本国策，加强数字经济领域国际合作，积极参与数字经济国际规则制定，共享数字经济发展成果。

二、主要目标

到2025年，数字经济迈向全面扩展期，数字经济核心产业增加值占GDP比重达到10%，数字化创新引领发展能力大幅提升，智能化水平明显增强，数字技术与实体经济融合取得显著成效，数字经济治理体系更加完善，我国数字经济竞争力和影响力稳步提升。

到2035年，数字经济迈向繁荣成熟期，力争形成统一公平、竞争有序、成熟完备的数字经济现代市场体系，数字经济发展水平位居世界前列。

三、重点任务

（一）加强数字基础设施建设
1. 加快信息网络基础设施建设。系统优化算力基础设施布局，促进东西部算力高效互补和协同联动，推动算力、算法、数据、应用资源集约化和服务化创新。加快5G网络规模化部署，推广升级千兆光纤网络。前瞻布局 6G 网络技术储备。

2. 推进云网协同和算网融合发展。加快构建算力、算法、数据、应用资源协同的全国一体化大数据中心体系。在京津冀、长三角、粤港澳大湾区、成渝地区双城经济圈、贵州、内蒙古、甘肃、宁夏等地布局全国一体化算力网络国家枢纽节点。

（二）推动数字产业化
1. 增强关键技术创新能力。瞄准传感器、量子信息、网络通信、集成电路、关键软件、大数据、人工智能、区块链、新材料等战略性前瞻性领域，发挥我国社会主义制度优势、新型举国体制优势、超大规模市场优势，提高数字技术基础研发能力。

2. 加快推动数字产业化。做强做优数字经济核心产业，培育壮大人工智能、大数据、区块链、云计算、网络安全等新兴数字产业，提升通信设备、核心电子元器件、关键软件等产业水平。

（三）加快产业数字化转型
1. 推进制造业数字化转型。深入实施智能制造工程，大力推进产业数字化转型，全面深化重点产业数字化转型，加快推动研发设计、生产制造、经营管理、市场服务等全流程数字化转型。

2. 加快服务业数字化发展。推动生活性服务业向高品质和多样化升级，加快发展智慧物流、智慧旅游、智慧广电、智慧养老、智慧家政等新业态，推进服务业标准化、品牌化。

3. 促进农业数字化转型。加快发展智慧农业，推进农业生产经营和管理服务数字化改造，强化农业农村大数据应用，推动新一代信息技术与农业生产深度融合。`,
  },
  policy3: {
    id: "policy3",
    title: "绿色低碳发展实施方案",
    source: "生态环境部",
    sourceUrl: "https://www.mee.gov.cn/xxgk2018/xxgk/xxgk01/202406/t20240618_1234567.html", // 添加这行
    publishDate: "2025-06-18",
    status: "completed",
    keyPoints: [
      "2030年前实现碳达峰，2060年前实现碳中和",
      "大力发展可再生能源，提高非化石能源消费比重",
      "推进重点行业和领域绿色化改造",
      "完善绿色金融体系，支持绿色低碳项目",
      "加强碳排放监测和管理",
    ],
    projects: [
      {
        id: "proj4",
        name: "清洁能源产业园",
        suitable: "地级市",
        requirements: "风光资源丰富",
        script:
          "根据最新发布的绿色低碳发展方案，碳达峰碳中和已成为国家重大战略，清洁能源产业迎来了前所未有的发展机遇。我们注意到贵地区年均风速达到6.5米/秒，年日照时数超过2200小时，在清洁能源开发方面具有得天独厚的资源禀赋。建议抓住这个政策窗口期，规划建设1000MW的风光互补清洁能源产业园。我们公司在清洁能源领域深耕15年，已投资建设清洁能源项目总装机容量超过5000MW，累计投资额达到400亿元。这次政策明确���持可再生能源规模化发展，产业园项目可申请绿色发展基金50亿元支持，同时享受15年的税收优惠政策。项目建成后年发电量可达25亿度，年产值超过15亿元，可为当地创造2000个就业岗位，实现绿色发展与经济增长的双赢。",
      },
      {
        id: "proj5",
        name: "碳中和示范区建设",
        suitable: "开发区",
        requirements: "产业基础良好",
        script:
          "新发布的碳中和政策为示范区建设提供了绝佳的发展机遇，这是开发区转型升级的关键节点。贵开发区现有企业200多家，年工业总产值达到300亿元，产业基础扎实，正好符合碳中和示范区的申报条件。我们在全国已经成功打造了8个碳中和示范区，帮助园区企业平均减少碳排放40%，同时实现经济效益提升20%。这次政策明确支持示范区建设，最高可获得10亿元的专项资金支持，还可享受绿色金融优惠政策。我们可以协助制定完整的碳中和实施方案，包括能源结构优化、产业绿色改造、碳排放监测体系建设等。通过建设分布式光伏、储能系统和智慧能源管理平台，预计可帮助示范区实现碳排放减少60%，成为全国碳中和示范区的标杆项目，为区域绿色发展树立典型。",
      },
    ],
    fullContent: `为深入贯彻习近平生态文明思想，全面贯彻党的二十大精神，落实碳达峰碳中和重大战略决策，推动绿色低碳发展，现制定本实施方案。

一、总体要求

（一）指导思想
以习近平新时代中国特色社会主义思想为指导，深入贯彻习近平生态文明思想，完整、准确、全面贯彻新发展理念，加快构建新发展格局，坚持系统观念，处理好发展和减排、整体和局部、短期和中长期的关系，统筹稳增长和调结构，把碳达峰碳中和纳入经济社会发展全局，以经济社会发展全面绿色转型为引领，以能源绿色低碳发展为关键，加快形成节约资源和保护环境的产业结构、生产方式、生活方式、空间格局，坚定不移走生态优先、绿色低碳的高质量发展道路。

（二）工作原则
——统筹谋划、系统推进。全国统筹、节约优先、双轮驱动、内外畅通、防范风险的总方针，加强顶层设计，各地区各行业统筹推进，避免"一刀切"简单化。

——重点突破、全面转型。抓住资源配置、科技创新、政策工具等关键环节，推动重点领域、重点行业、重点区域率先达峰，带动经济社会发展全面绿色转型。

——创新驱动、科技支撑。把科技创新作为实现碳达峰碳中和的关键支撑，加强绿色低碳技术创新和推广应用，加快构建绿色低碳技术创新体系。

——政府引导、市场主导。更好发挥政府作用，构建有利于绿色低碳发展的政策体系。充分发挥市场机制作用，形成有效激励约束机制。

——积极稳妥、安全降碳。立足国情，坚持先立后破，稳妥有序、循序渐进推进碳达峰行动，确保安全降碳，在降碳的同时确保能源安全、产业链供应链安全、粮食安全和群众正常生活。

二、主要目标

"十四五"期间，产业结构和能源结构调整优化取得明显进展，重点行业能源利用效率大幅提升，煤炭消费增长得到严格控制，新型电力系统加快构建，绿色低碳技术研发和推广应用取得新进展，绿色生产生活方式得到普遍推行，有利于绿色低碳发展的政策体系进一步完善。到2025年，非化石能源消费比重达到 20% 左右，单位国内生产总值能源消耗比 2020 年下降 13.5%，单位国内生产总值二氧化碳排放比 2020 年下降 18%，为实现碳达峰奠定坚实基础。

"十五五"期间，产业结构调整取得重大进展，清洁低碳安全高效的能源体系初步建立，重点领域低碳发展模式基本形成，重点耗能行业能源利用效率达到国际先进水平，非化石能源消费比重进一步提高，煤炭消费逐步减少，绿色低碳技术取得关键突破，绿色生活方式成为公众自觉选择，绿色低碳循环发展政策体系基本健全。到2030年，非化石能源消费比重达到 25% 左右，单位国内生产总值二氧化碳排放比 2005 年下降 65% 以上，顺利实现 2030 年前碳达峰目标。

三、重点任务

（一）推进经济社会发展全面绿色转型
1. 强化绿色发展规划引领。将碳达峰碳中和目标要求全面融入经济社会发展中长期规划，强化各级各类规划间衔接协调。加强各类空间管控边界协调，严格落实生态保护红线、环境质量底线、资源利用上线硬约束。

2. 优化绿色低碳发展区域布局。持续优化重大基础设施、重大生产力和公共资源布局，构建有利于碳达峰碳中和的国土空间开发保护格局。

（二）深度调整产业结构
1. 推动产业结构优化升级。大力发展战略性新兴产业，加快推动互联网、大数据、人工智能、第五代移动通信（5G）等新兴技术与绿色低碳产业深度融合。

2. 坚决遏制高耗能高排放低水平项目盲目发展。新建、扩建钢铁、水泥、平板玻璃、电解铝等高耗能高排放项目严格落实产能等量或减量置换，出台煤电、石化、煤化工等产能控制政策。

（三）加快构建清洁低碳安全高效能源体系
1. 大力发展新能源。全面推进风电、太阳能发电大规模开发和高质量发展，坚持集中式与分布式并举，加快建设风电和光伏发电基地。

2. 因地制宜开发水电。积极安全有序发展核电。因地制宜发展生物质发电、生物质能清洁供暖和生物天然气。

3. 合理调控化石能源。加强煤炭清洁高效利用，合理控制煤炭消费增长，抓好煤炭清洁高效利用，推进存量煤电机组节能升级和灵活性改造。`,
  },
}

export default function PolicyDetailPage({ params }: PolicyDetailProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    projects: true,
    content: false, // 政策内容默认收起
  })
  const [copiedScript, setCopiedScript] = useState<string | null>(null)

  const [activeSection, setActiveSection] = useState("policy-content")

  // 使用简单的状态管理替代Dialog
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [shareText, setShareText] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // 添加结果弹窗状态
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [shareResult, setShareResult] = useState<{
    success: boolean
    message: string
  } | null>(null)

  // 滚动到指定模块
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const headerHeight = 56 // 顶部导航栏高度
      const elementPosition = element.offsetTop - headerHeight - 20
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      })
      setActiveSection(sectionId)
    }
  }

  // 监听滚动事件，更新激活状态
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["policy-content", "matching-projects"]
      const headerHeight = 56

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i])
        if (element) {
          const rect = element.getBoundingClientRect()
          if (rect.top <= headerHeight + 100) {
            setActiveSection(sections[i])
            break
          }
        }
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const policy = mockPolicyDetails[params.id] || {
    id: params.id,
    title: "政策标题",
    source: "发布机构",
    publishDate: "2025-06-20",
    status: "completed" as const,
    keyPoints: ["政策要点1", "政策要点2"],
    projects: [],
    fullContent: "政策全文内容",
  }

  // 初始化分享文案
  useEffect(() => {
    const defaultShareText = `【${policy.title}】

${policy.keyPoints
  .slice(0, 3)
  .map((point) => `• ${point}`)
  .join("\n")}

#政策解读 #${policy.source}`
    setShareText(defaultShareText)
  }, [policy])

  // 复制话术
  const handleCopyScript = async (script: string, projectId: string) => {
    try {
      await navigator.clipboard.writeText(script)
      setCopiedScript(projectId)
      setTimeout(() => setCopiedScript(null), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  // 在组件内添加高亮关键字的函数
  const highlightKeywords = (text: string) => {
    const keywords = [
      "数字经济",
      "政策",
      "资金",
      "项目",
      "支持",
      "建设",
      "发展",
      "申报",
      "补贴",
      "优惠",
      "示范",
      "试点",
      "转型",
      "升级",
    ]
    let highlightedText = text

    keywords.forEach((keyword) => {
      const regex = new RegExp(`(${keyword})`, "gi")
      highlightedText = highlightedText.replace(regex, `<span class="text-blue-600 font-semibold text-base">$1</span>`)
    })

    return highlightedText
  }

  const handleShare = async () => {
    console.log("🎉 分享按钮被点击了！")
    setIsGenerating(true)
    try {
      console.log("⏳ 开始生成分享内容...")
      // 模拟生成图片的过程
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log("📝 分享内容:", shareText)
      console.log("✅ 分享完成，准备关闭弹窗")

      // 设置成功结果并显示结果弹窗
      setShareResult({
        success: true,
        message: "", // 删除原来的消息文本
      })
      setShareModalOpen(false)
      setResultModalOpen(true)
    } catch (error) {
      console.error("❌ 分享失败:", error)

      // 设置失败结果并显示结果弹窗
      setShareResult({
        success: false,
        message: "分享生成失败，请稍后重试。",
      })
      setShareModalOpen(false)
      setResultModalOpen(true)
    } finally {
      console.log("🔄 重置生成状态")
      setIsGenerating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="ml-4 text-base font-medium truncate flex-1">{policy.title}</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("👆 Users按钮被点击")
              setShareModalOpen(true)
            }}
          >
            <Users className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* 简单的模态框 */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* 弹窗头部 */}
            <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log("🔙 返回按钮被点击")
                  setShareModalOpen(false)
                }}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                返回
              </Button>
              <h2 className="text-base font-medium">分享预览</h2>
              <Button variant="ghost" size="sm" onClick={() => setShareModalOpen(false)} className="p-0 h-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 space-y-6">
              {/* 文案编辑区域 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">朋友圈文案</label>
                  <span className="text-xs text-gray-500">{shareText.length}/200</span>
                </div>
                <Textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  placeholder="编辑分享文案..."
                  className="min-h-[120px] resize-none text-sm"
                  maxLength={200}
                />
              </div>

              {/* 原新闻链接 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">原文链接</label>
                <div className="bg-gray-50 rounded-lg p-3 border">
                  {policy.sourceUrl ? (
                    <a
                      href={policy.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm break-all hover:underline"
                    >
                      {policy.sourceUrl}
                    </a>
                  ) : (
                    <span className="text-gray-500 text-sm">暂无原文链接</span>
                  )}
                </div>
              </div>

              {/* 分享按钮 */}
              <Button
                onClick={(e) => {
                  console.log("🖱️ 分享按钮点击事件", e.type)
                  handleShare()
                }}
                disabled={isGenerating}
                className="w-full h-12 bg-[#07C160] hover:bg-[#06AD56] text-white font-medium"
              >
                {isGenerating ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    生成中...
                  </div>
                ) : (
                  "一键分享到朋友圈"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 结果反馈弹窗 */}
      {resultModalOpen && shareResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full">
            {/* 弹窗内容 */}
            <div className="p-6 text-center">
              {/* 图标 */}
              <div className="mb-4">
                {shareResult.success ? (
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                ) : (
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-red-600" />
                  </div>
                )}
              </div>

              {/* 标题 */}
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {shareResult.success ? "分享成功" : "分享失败"}
              </h3>

              {/* 消息 */}
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">{shareResult.message}</p>

              {/* 按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setResultModalOpen(false)
                    setShareResult(null)
                  }}
                  className="px-8"
                >
                  关闭
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 主体内容 */}
      <main className="max-w-4xl mx-auto px-4 py-4">
        {/* 政策内容和解读模块 */}
        <section id="policy-content" className="bg-white rounded-lg p-4 mb-4">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">政策内容</TabsTrigger>
              <TabsTrigger value="analysis">政策解读</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              {/* 发布机构和时间信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-3 border-b">
                <span>
                  发布机构：
                  {policy.sourceUrl ? (
                    <a
                      href={policy.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                    >
                      {policy.source}
                    </a>
                  ) : (
                    policy.source
                  )}
                </span>
                <span>发布时间：{policy.publishDate}</span>
              </div>

              {/* 政策内容 */}
              <div className="text-sm leading-relaxed text-gray-700">
                {policy.fullContent.split("\n").slice(0, 5).join("\n")}
                {policy.fullContent.split("\n").length > 5 && "..."}
              </div>

              <AnimatePresence>
                {expanded.content && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                          {policy.fullContent}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded({ ...expanded, content: !expanded.content })}
                className="mt-3 text-blue-600 hover:text-blue-700"
              >
                {expanded.content ? "收起" : "展开全文"}
                <ChevronDown className={`ml-1 h-3 w-3 transition-transform ${expanded.content ? "rotate-180" : ""}`} />
              </Button>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <div className="space-y-3">
                {policy.keyPoints.map((point, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2"
                  >
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span className="text-sm text-gray-700">{point}</span>
                  </motion.div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* 推荐项目及话术模块 */}
        <section id="matching-projects" className="bg-white rounded-lg p-4 mb-4">
          {policy.projects.length > 0 && (
            <Tabs defaultValue={policy.projects[0].id} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                {policy.projects.map((project, index) => (
                  <TabsTrigger key={project.id} value={project.id} className="text-4xl font-medium">
                    推荐话术{index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {policy.projects.map((project, index) => (
                <TabsContent key={project.id} value={project.id} className="mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="border rounded-lg p-4"
                  >
                    {/* 推荐话术 */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p
                        className="text-sm text-gray-700 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: `"${highlightKeywords(project.script)}"` }}
                      />
                    </div>
                    {/* 复制按钮移到框外 */}
                    <div className="flex justify-end mt-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyScript(project.script, project.id)}
                        className="px-4 py-2"
                      >
                        {copiedScript === project.id ? "已复制" : "复制"}
                      </Button>
                    </div>
                    {copiedScript === project.id && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-green-600 mt-2"
                      >
                        已复制到剪贴板
                      </motion.p>
                    )}
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </section>
      </main>
    </div>
  )
}
