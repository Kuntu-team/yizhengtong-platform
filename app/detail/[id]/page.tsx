"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChevronLeft,
  Copy,
  Check,
  Download,
  FileText,
  ImageIcon,
  BarChart3,
  Eye,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import MaterialPreview from "@/components/material-preview";

interface DetailPageProps {
  params: {
    id: string;
  };
}

// 模拟新闻全文数据
const mockNewsData = {
  "1": {
    title: "张三：九江将建5个数字产业园",
    description: "发改委主任谈数字经济3年规划，投资500亿",
    time: "2小时前",
    source: "九江日报",
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
    },
    area: "九江市",
    reportTypes: ["工程可研报告", "社会稳定风险评估", "水土保持报告"],
  },
  "2": {
    title: "李四：南昌港口物流园区规划",
    description: "财政局长介绍新港区建设，预计投资200亿",
    time: "4小时前",
    source: "南昌晚报",
    fullContent: `南昌市财政局长李四今日宣布...`,
    keyInfo: {
      person: "李四",
      position: "南昌市财政局长",
    },
    area: "南昌市",
    reportTypes: ["环境影响评估", "投资分析报告"],
  },
};

const generateMaterials = (area: string, reportType: string) => {
  const baseMaterials = [
    {
      id: `base-mat-1-${area}-${reportType}`,
      name: `${area} ${reportType} 可研报告`,
      type: "PDF",
      size: "12.5MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# ${area} ${reportType} 可行性研究报告

## 项目概述
本报告为关于${area} ${reportType} 的可行性研究报告。

## 核心内容
包括项目背景、建设内容、投资估算、效益分析和风险分析等。`,
    },
    {
      id: `base-mat-2-${area}-${reportType}`,
      name: `${area} 相关政策汇编`,
      type: "PDF",
      size: "9.1MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# ${area} 相关政策汇编

## 政策要点
包括财税支持、土地政策和人才政策等。`,
    },
  ];

  // 根据报告类型添加特定材料
  if (reportType === "工程可研报告") {
    baseMaterials.push({
      id: `specific-mat-1-${area}-${reportType}`,
      name: `${area} 工程设计图`,
      type: "CAD",
      size: "25.8MB",
      icon: <ImageIcon className="h-4 w-4" />,
      url: "#",
      previewType: "images",
      previewContent: [
        {
          name: "设计图1",
          url: "/placeholder.svg?height=400&width=600&text=工程设计图1",
          description: "详细设计图",
        },
      ],
    });
  } else if (reportType === "社会稳定风险评估") {
    baseMaterials.push({
      id: `specific-mat-2-${area}-${reportType}`,
      name: `${area} 风险评估报告`,
      type: "PDF",
      size: "7.3MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# ${area} 社会稳定风险评估报告

## 评估结果
本报告为关于${area} 社会稳定风险的评估报告。`,
    });
  } else if (reportType === "水土保持报告") {
    baseMaterials.push({
      id: `specific-mat-3-${area}-${reportType}`,
      name: `${area} 水土保持方案`,
      type: "PDF",
      size: "10.2MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# ${area} 水土保持方案

## 方案内容
本报告为关于${area} 水土保持的方案。`,
    });
  } else if (reportType === "环境影响评估") {
    baseMaterials.push({
      id: `specific-mat-4-${area}-${reportType}`,
      name: `${area} 环境影响报告`,
      type: "PDF",
      size: "11.9MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# ${area} 环境影响报告

## 评估结果
本报告为关于${area} 环境影响的评估报告。`,
    });
  } else if (reportType === "投资分析报告") {
    baseMaterials.push({
      id: `specific-mat-5-${area}-${reportType}`,
      name: `${area} 投资收益分析`,
      type: "XLSX",
      size: "3.5MB",
      icon: <BarChart3 className="h-4 w-4" />,
      url: "#",
      previewType: "chart",
      previewContent: {
        title: "投资收益分析",
        data: [
          { year: "2024", investment: 150, revenue: 40, profit: -110 },
          { year: "2025", investment: 100, revenue: 120, profit: 20 },
          { year: "2026", investment: 50, revenue: 200, profit: 150 },
          { year: "2027", investment: 0, revenue: 300, profit: 300 },
        ],
        summary: {
          totalInvestment: "300亿元",
          breakEvenYear: "2025年",
          roi: "18.5%",
          paybackPeriod: "3.8年",
        },
      },
    });
  }

  return baseMaterials;
};

export default function DetailPage({ params }: DetailPageProps) {
  const router = useRouter();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState<any>(null);
  const [isContentExpanded, setIsContentExpanded] = useState(true);
  const [generatedMaterials, setGeneratedMaterials] = useState<any[]>([]);

  // 获取新闻数据
  const newsData = mockNewsData[params.id as keyof typeof mockNewsData] || {
    title: "新闻标题",
    description: "新闻简介",
    time: "时间",
    source: "新闻来源",
    fullContent: "新闻全文内容...",
    keyInfo: {
      person: "联系人",
      position: "职位",
    },
  };

  const scripts = [
    {
      id: "script1",
      title: "推荐话术1：同级对比",
      icon: "💬",
      content: `张主任您好，我了解到您���在推进数字产业园项目，这个500亿的投资规模在全省都是领先的。

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
  ];

  // 模拟材料数据
  const materials = [
    {
      id: "mat1",
      name: "数字产业园项目可研报告",
      type: "PDF",
      size: "15.2MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# 九江市数字产业园项目可行性研究报告

## 项目概述
九江市数字产业园项目是九江市"十四五"规划的重点工程，总投资规模达 500 亿元，分三期实施。

## 项目背景
随着数字经济的快速发展，九江市迫切需要建设专业化的数字产业园区，以承接长三角地区的产业转移，打造长江中游地区重要的数字经济高地。

## 建设内容
### 第一期（2024-2025 年）
- 九江经开区数字产业园：占地 1000 亩
- 濂溪区智慧制造园：占地 800 亩

### 第二期（2025-2026 年）
- 共青城数字文创园：占地 600 亩
- 德安县数字农业园：占地 500 亩

### 第三期（2026-2027 年）
- 九江港数字物流园：占地 400 亩

## 投资估算
- 总投资：500 亿元
- 政府投资：200 亿元
- 社会投资：300 亿元

## 效益分析
预计到 2027 年，项目将实现：
- 年产值突破 1000 亿元
- 吸纳就业人口 10 万人
- 培育上市企业 10 家以上

## 风险分析
主要风险包括政策风险、市场风险、技术风险等，需要制定相应的风险防控措施。`,
    },
    {
      id: "mat2",
      name: "九江市数字经济政策汇编",
      type: "PDF",
      size: "8.7MB",
      icon: <FileText className="h-4 w-4" />,
      url: "#",
      previewType: "pdf",
      previewContent: `# 九江市数字经济政策汇编

## 财税支持政策
### 1. 税收优惠
- 入驻企业享受"三免三减半"税收优惠
- 高新技术企业减按 15% 税率征收企业所得税
- 研发费用加计扣除比例提高至 200%

### 2. 财政补贴
- 设立 10 亿元数字经济发展专项资金
- 对重点项目给予最高 1000 万元补贴
- 支持企业技术改造和设备更新

## 土地政策
### 1. 用地保障
- 工业用地按最低标准收取
- 研发用地可租可售
- 优先保障重点项目用地需求

### 2. 容积率政策
- 数字经济项目容积率可适当提高
- 支持建设多层厂房和研发楼宇

## 人才政策
### 1. 人才引进
- 设立 10 亿元人才发展基金
- 提供住房、子女教育等配套服务
- 高层次人才可享受最高 100 万元安家费

### 2. 人才培养
- 支持校企合作培养数字经济人才
- 设立数字经济人才培训基地
- 每年培养数字经济人才 1 万人以上`,
    },
    {
      id: "mat3",
      name: "项目效果图及规划图",
      type: "ZIP",
      size: "45.3MB",
      icon: <ImageIcon className="h-4 w-4" />,
      url: "#",
      previewType: "images",
      previewContent: [
        {
          name: "园区总体规划图",
          url: "/placeholder.svg?height=400&width=600&text=园区总体规划图",
          description:
            "九江数字产业园总体规划布局图，展示五个园区的空间分布和功能定位",
        },
        {
          name: "核心区效果图",
          url: "/placeholder.svg?height=400&width=600&text=核心区效果图",
          description:
            "数字产业园核心区建筑效果图，包括研发中心、孵化器等主要建筑",
        },
        {
          name: "智慧制造园效果图",
          url: "/placeholder.svg?height=400&width=600&text=智慧制造园效果图",
          description: "智慧制造园区效果图，展示现代化的生产车间和办公环境",
        },
        {
          name: "交通规划图",
          url: "/placeholder.svg?height=400&width=600&text=交通规划图",
          description: "园区交通规划图，包括道路网络、公共交通和停车设施规划",
        },
      ],
    },
    {
      id: "mat4",
      name: "投资收益分析报告",
      type: "XLSX",
      size: "2.1MB",
      icon: <BarChart3 className="h-4 w-4" />,
      url: "#",
      previewType: "chart",
      previewContent: {
        title: "投资收益分析",
        data: [
          { year: "2024", investment: 200, revenue: 50, profit: -150 },
          { year: "2025", investment: 200, revenue: 180, profit: -20 },
          { year: "2026", investment: 100, revenue: 350, profit: 250 },
          { year: "2027", investment: 0, revenue: 500, profit: 500 },
          { year: "2028", investment: 0, revenue: 650, profit: 650 },
        ],
        summary: {
          totalInvestment: "500亿元",
          breakEvenYear: "2026年",
          roi: "15.2%",
          paybackPeriod: "4.2年",
        },
      },
    },
  ];

  // 复制推荐话术
  const handleCopy = async (text: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptId);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) {
      console.log("复制失败:", err);
    }
  };

  const handleDownload = (material: (typeof materials)[0]) => {
    console.log("下载材料:", material.name);
    const link = document.createElement("a");
    link.href = material.url;
    link.download = material.name;
    link.click();
  };

  const handlePreview = (material: (typeof materials)[0]) => {
    setPreviewContent(material);
    setPreviewOpen(true);
  };

  const closePreview = () => {
    setPreviewOpen(false);
    setPreviewContent(null);
  };

  const toggleContentExpanded = () => {
    setIsContentExpanded(!isContentExpanded);
  };

  const handleGenerateReport = (area: string, reportType: string) => {
    const newMaterials = generateMaterials(area, reportType);
    setGeneratedMaterials(newMaterials);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 固定顶部导航 - 与主页header完全一致的对齐 */}
      <header className="fixed top-0 w-full bg-white border-b z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-2 -ml-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">线索详情</h1>
        </div>
      </header>

      {/* 主体内容区 - 与header完全对齐 */}
      <main className="pt-14">
        <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
          {/* 新闻信息 */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">📰</span>
                <span>新闻信息</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                {/* 新闻标题 */}
                <div>
                  <h3 className="font-medium text-gray-900 text-lg mb-2">
                    {newsData.title}
                  </h3>
                </div>

                {/* 新闻来源和发布时间 */}
                <div className="flex items-center gap-4 text-sm text-gray-500 pb-4 border-b">
                  <div className="flex items-center gap-1">
                    <span>来源：</span>
                    <span className="font-medium">{newsData.source}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>发布时间：</span>
                    <span className="font-medium">{newsData.time}</span>
                  </div>
                </div>

                {/* 新闻正文 - 添加展开/收起功能 */}
                <div className="prose prose-sm max-w-none">
                  <div
                    className={`text-sm leading-relaxed whitespace-pre-line text-gray-700 transition-all duration-300 ${
                      isContentExpanded
                        ? ""
                        : "max-h-32 overflow-hidden relative"
                    }`}
                  >
                    {newsData.fullContent}
                    {/* 收起状态下的渐变遮罩 */}
                    {!isContentExpanded && (
                      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
                    )}
                  </div>

                  {/* 展开/收起按钮 */}
                  <div className="flex justify-center mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleContentExpanded}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      {isContentExpanded ? (
                        <>
                          <ChevronUp className="h-4 w-4 mr-1" />
                          收起
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4 mr-1" />
                          展开
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 联系人信息 - 独立框框 */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">👤</span>
                <span>推荐联系人</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">联系人：</span>
                  <span className="font-medium">{newsData.keyInfo.person}</span>
                </div>
                <div>
                  <span className="text-gray-500">职位：</span>
                  <span className="font-medium">
                    {newsData.keyInfo.position}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 推荐话术模块 */}
          {scripts.map((script) => (
            <Card key={script.id} className="border-gray-200">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">{script.icon}</span>
                  <span>{script.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line">
                  {script.content}
                </div>
              </CardContent>
              <CardFooter className="pt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto bg-white text-gray-700 border-gray-300"
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
              </CardFooter>
            </Card>
          ))}

          {/* 携带材料下载 */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">📎</span>
                <span>携带材料</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                {materials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">{material.icon}</div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {material.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {material.type} • {material.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(material)}
                        className="bg-white text-gray-700 border-gray-300"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        预览
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(material)}
                        className="bg-white text-gray-700 border-gray-300"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                ))}
                {generatedMaterials.map((material) => (
                  <div
                    key={material.id}
                    className="flex items-center justify-between p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-blue-600">{material.icon}</div>
                      <div>
                        <div className="font-medium text-sm text-gray-900">
                          {material.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {material.type} • {material.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(material)}
                        className="bg-white text-gray-700 border-gray-300"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        预览
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload(material)}
                        className="bg-white text-gray-700 border-gray-300"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        下载
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button
                variant="outline"
                className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                onClick={() => {
                  materials.forEach((material) => handleDownload(material));
                }}
              >
                <Download className="h-4 w-4 mr-2" />
                下载全部材料
              </Button>
            </CardFooter>
          </Card>

          {/* 智能报告生成模块 */}
          <Card className="border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <span className="text-lg">🤖</span>
                <span>智能报告生成</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  基于此线索信息，智能生成专业报告文档
                </p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      选择地区
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      defaultValue={newsData.area}
                      disabled
                    >
                      <option value={newsData.area}>{newsData.area}</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      报告类型
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        handleGenerateReport(newsData.area, e.target.value);
                      }}
                    >
                      <option value="">请选择报告类型</option>
                      {newsData.reportTypes?.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">
                    报告将包含以下内容：
                  </h4>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• 项目概述与背景分析</li>
                    <li>• 政策依据与合规性分析</li>
                    <li>• 投资估算与效益分析</li>
                    <li>• 风险评估与应对措施</li>
                    <li>• 实施方案与时间安排</li>
                  </ul>
                </div>
              </div>
            </CardContent>
            <CardFooter className="pt-3">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  // 这里可以添加报告生成逻辑
                  console.log("开始生成报告...");
                }}
              >
                <FileText className="h-4 w-4 mr-2" />
                生成专业报告
                <span className="text-sm ml-2 opacity-80">预计需要2-3分钟</span>
              </Button>
            </CardFooter>
          </Card>

          {/* 预览弹窗 */}
          <MaterialPreview
            open={previewOpen}
            onClose={closePreview}
            material={previewContent}
          />
        </div>
      </main>
    </div>
  );
}
