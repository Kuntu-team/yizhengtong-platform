"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  Copy,
  Check,
  Download,
  FileText,
  ChevronUp,
  ChevronDown,
  AlertCircle,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import axios from "axios";
import { getTimeAgo } from "@/lib/utils";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";

interface DetailPageProps {
  params: {
    id: string;
  };
}
function generateRandomString(length: number): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+{}[]<>?~";
  let result = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  return result;
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
  ];

  let highlightedText = text;

  patterns.forEach((pattern) => {
    highlightedText = highlightedText.replace(pattern, (match) => {
      return `<span class="highlight-keyword">${match}</span>`;
    });
  });

  return highlightedText;
};

// 报告状态类型
type ReportState = "idle" | "naming" | "generating" | "completed" | "failed";

// 在组件开始处添加样式
const keywordStyles = `
  .highlight-keyword {
    color: #2563eb;
    font-weight: 600;
    font-size: 1.2em;
  }
`;

// 进度条组件
const CircularProgress = ({
  progress,
  size = 40,
}: {
  progress: number;
  size?: number;
}) => {
  const radius = (size - 4) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth="3"
          fill="none"
        />
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
  );
};
const extractSections = (text: string) => {
  const newsRegex =
    /###\s*新闻解读\s*([\s\S]*?)(?=###\s*话术生成|###\s*风格A|$)/;
  const styleARegex = /###\s*风格A[\s\S]*?\n([\s\S]*?)(?=###\s*风格B|$)/;
  const styleBRegex = /###\s*风格B[\s\S]*?\n([\s\S]*)/;

  const newsMatch = text.match(newsRegex);
  const styleAMatch = text.match(styleARegex);
  const styleBMatch = text.match(styleBRegex);

  return {
    newsSection: newsMatch ? newsMatch[1] : "",
    styleASection: styleAMatch ? styleAMatch[1] : "",
    styleBSection: styleBMatch ? styleBMatch[1] : "",
  };
};

export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [isNewsExpanded, setIsNewsExpanded] = useState(false);
  const [activeSection, setActiveSection] = useState("scripts");
  const [activeScriptTab, setActiveScriptTab] = useState("script1");

  // 报告生成相关状态
  const [reportStates, setReportStates] = useState<Record<string, ReportState>>(
    {}
  );
  const [progresses, setProgresses] = useState<Record<string, number>>({});
  const [activeReport, setActiveReport] = useState<any>(null);
  const [isNamingDialogOpen, setIsNamingDialogOpen] = useState(false);
  const [customFileName, setCustomFileName] = useState("");
  const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [newsData, setNewsData] = useState({
    news_title: "新闻标题",
    news_time: "时间",
    news_source: "新闻来源",
    news_url: "",
    news_content: "新闻全文内容...",
    person_name: "联系人",
    position: "职位",
    person_private: {
      phone_number: "联系人电话",
      wechat_number: "联系人微信",
    },
    news_region_cn: "",
  });
  const [aiContent, setAiContent] = useState({
    news: "新闻内容生成中...",
    styleA: "推荐话术生成中...",
    styleB: "推荐话术生成中...",
  });

  // 获取新闻数据
  const { id } = React.use(params);
  console.log("Received news_id:", id);
  const fetchDetail = async () => {
    const res = await axios.get("/api/sales-lead");
    console.log(res.data);
    const privateData = res.data.find((item: any) => item.news_id === id);
    console.log("Private data for news_id:", privateData);

    setNewsData(privateData);

    const token = "app-M2jwPu1Lkq5F4dpd49SWUoWu";
    const params = {
      inputs: {
        news_id: id,
      },
      query: "start",
      response_mode: "blocking",
      conversation_id: "",
      user: "abc-123",
      files: [],
    };

    try {
      const res2 = await axios.post(
        "https://dify.ktt.team/v1/chat-messages",
        params,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );
      console.log(res2.data.answer);

      const { newsSection, styleASection, styleBSection } = extractSections(
        res2.data.answer
      );
      setAiContent({
        news: newsSection,
        styleA: styleASection,
        styleB: styleBSection,
      });
    } catch (error) {
      // console.error("请求失败:", error);
    }
  };

  useEffect(() => {
    fetchDetail();
    // const randomString = generateRandomString(15);
    // console.log(randomString);
  }, []);

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
  ];

  // 根据领导岗位和新闻内容智能生成携带材料
  const generateMaterials = (newsData: any) => {
    const { position, department, region, title } = newsData;
    const materials = [];

    // 第一份材料：项目分析（必有）
    let projectAnalysisTitle = "";
    let estimatedSize = "10-15MB";
    let estimatedTime = "2-3分钟";

    if (department?.includes("发改")) {
      projectAnalysisTitle = `${region}数字经济市场分析报告`;
      estimatedSize = "12-18MB";
      estimatedTime = "3-4分钟";
    } else if (position?.includes("市长") || position?.includes("副市长")) {
      const projectType = title.includes("教育")
        ? "教育城"
        : title.includes("物流")
        ? "物流园区"
        : "产业园";
      projectAnalysisTitle = `${region}${projectType}项目实施方案`;
      estimatedSize = "15-20MB";
      estimatedTime = "3-5分钟";
    } else if (department?.includes("财政")) {
      projectAnalysisTitle = `${region}财政投资项目分析报告`;
      estimatedSize = "8-12MB";
      estimatedTime = "2-3分钟";
    } else {
      projectAnalysisTitle = `${region}重点项目投资分析`;
      estimatedSize = "10-15MB";
      estimatedTime = "2-3分钟";
    }

    materials.push({
      id: "mat1",
      title: projectAnalysisTitle,
      type: "PDF",
      estimatedSize,
      estimatedTime,
      category: "market_analysis",
    });

    // 第二份材料：根据具体情况生成
    if (department?.includes("发改")) {
      materials.push({
        id: "mat2",
        title: `${region}数字经济政策汇编`,
        type: "PDF",
        estimatedSize: "8-12MB",
        estimatedTime: "1-2分钟",
        category: "policy_collection",
      });
    } else if (position?.includes("市长") || position?.includes("副市长")) {
      const materialType = title.includes("教育")
        ? "教育产业"
        : title.includes("物流")
        ? "物流产业"
        : "重点产业";
      materials.push({
        id: "mat2",
        title: `${region}${materialType}发展规划`,
        type: "PDF",
        estimatedSize: "15-20MB",
        estimatedTime: "3-4分钟",
        category: "development_plan",
      });
    } else if (department?.includes("财政")) {
      materials.push({
        id: "mat2",
        title: `${region}PPP项目投资指南`,
        type: "PDF",
        estimatedSize: "9-15MB",
        estimatedTime: "2-3分钟",
        category: "investment_guide",
      });
    }

    return materials;
  };

  // 使用新的材料生成函数
  const materials = generateMaterials(newsData);

  // 模拟生成进度
  const simulateProgress = (reportId: string, onComplete: () => void) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setProgresses((prev) => ({ ...prev, [reportId]: 100 }));
        setTimeout(() => {
          onComplete();
        }, 500);
      } else {
        setProgresses((prev) => ({
          ...prev,
          [reportId]: Math.floor(progress),
        }));
      }
    }, 500);

    return () => clearInterval(interval);
  };

  // 获取进度状态文字
  const getProgressText = (progress: number) => {
    if (progress < 30) return "正在收集数据...";
    if (progress < 60) return "正在分析处理...";
    if (progress < 90) return "正在生成报告...";
    return "正在准备下载...";
  };

  // 计算剩余时间
  const getEstimatedTime = (progress: number, totalTime: string) => {
    const totalMinutes = Number.parseInt(totalTime.split("-")[1]) || 3;
    const remainingMinutes = Math.ceil(((100 - progress) / 100) * totalMinutes);
    return remainingMinutes > 0
      ? `预计还需 ${remainingMinutes} 分钟`
      : "即将完成";
  };

  // 模拟文件下载
  const downloadFile = (filename: string) => {
    const content = `这是${filename}的内容`;
    const blob = new Blob([content], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = filename + ".pdf";
    link.click();

    URL.revokeObjectURL(url);
  };

  // 处理一键生成并下载
  const handleGenerateAndDownload = (material: any) => {
    setActiveReport(material);
    setCustomFileName(material.title);
    setIsNamingDialogOpen(true);
  };

  // 确认文件名并开始生成
  const handleConfirmGenerate = () => {
    if (!activeReport || !customFileName.trim()) return;

    setIsNamingDialogOpen(false);
    setReportStates((prev) => ({ ...prev, [activeReport.id]: "generating" }));
    setProgresses((prev) => ({ ...prev, [activeReport.id]: 0 }));

    // 模拟生成过程
    const cleanup = simulateProgress(activeReport.id, () => {
      // 生成完成，自动下载
      try {
        downloadFile(customFileName);
        setReportStates((prev) => ({
          ...prev,
          [activeReport.id]: "completed",
        }));
        toast.success(`${customFileName}.pdf 下载成功！`);

        // 3秒后恢复初始状态
        setTimeout(() => {
          setReportStates((prev) => ({ ...prev, [activeReport.id]: "idle" }));
          setProgresses((prev) => ({ ...prev, [activeReport.id]: 0 }));
        }, 3000);
      } catch (error) {
        setReportStates((prev) => ({ ...prev, [activeReport.id]: "failed" }));
        setErrorMessage("报告生成失败，请重试");
        setIsErrorDialogOpen(true);
      }
    });
  };

  // 取消生成
  const handleCancelGenerate = (reportId: string) => {
    setReportStates((prev) => ({ ...prev, [reportId]: "idle" }));
    setProgresses((prev) => ({ ...prev, [reportId]: 0 }));
  };

  // 处理生成失败后的重试
  const handleRetryGenerate = () => {
    setIsErrorDialogOpen(false);
    if (activeReport) {
      handleGenerateAndDownload(activeReport);
    }
  };

  // 下载全部材料
  const handleDownloadAll = () => {
    materials.forEach((material, index) => {
      setTimeout(() => {
        setReportStates((prev) => ({ ...prev, [material.id]: "generating" }));
        setProgresses((prev) => ({ ...prev, [material.id]: 0 }));

        const cleanup = simulateProgress(material.id, () => {
          downloadFile(material.title);
          setReportStates((prev) => ({ ...prev, [material.id]: "completed" }));

          setTimeout(() => {
            setReportStates((prev) => ({ ...prev, [material.id]: "idle" }));
            setProgresses((prev) => ({ ...prev, [material.id]: 0 }));
          }, 3000);
        });
      }, index * 1000); // 错开1秒开始
    });

    toast.success("开始批量生成下载，请稍候...");
  };

  const handleCopy = async (text: string, scriptId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptId);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) {
      // console.error("复制失败:", err)
    }
  };

  const toggleNewsExpanded = () => {
    setIsNewsExpanded(!isNewsExpanded);
  };

  // 获取新闻正文的前3行
  const getFirstThreeLines = (content: string) => {
    if (!content) return "";
    // const lines = content.split("\n").filter((line) => line.trim() !== "");
    // return lines.slice(0, 3).join("\n");
    return content.length > 100
      ? content.slice(0, 100) + "..."
      : content.slice(0, 100);
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keywordStyles }} />
      <div className="min-h-screen bg-white">
        {/* 固定顶部导航 */}
        <header className="fixed top-0 w-full bg-white border-b z-50">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center">
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

        {/* 主体布局 */}
        <div className="pt-14">
          {/* 右侧主体内容区 */}
          <main className="max-w-4xl mx-auto px-6 py-4 space-y-6">
            {/* 新闻信息 */}
            <section
              id="news"
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="bg-white">
                <div className="space-y-3">
                  {/* 新闻标题和商务抓手 */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 text-lg">
                        {newsData.person_name + "：" + newsData.news_title}
                      </h3>
                    </div>
                  </div>

                  {/* 新闻来源和发布时间 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <span>来源：</span>
                      <span className="font-medium">
                        {/* {newsData.news_source} */}
                        <a
                          href={newsData.news_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                        >
                          {newsData.news_source}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>发布时间：</span>
                      <span className="font-medium">
                        {getTimeAgo(newsData.news_time)}
                      </span>
                    </div>
                  </div>

                  {/* 新闻正文 */}
                  <div className="prose prose-sm max-w-none">
                    {!isNewsExpanded ? (
                      // 收起状态：显示前3行，在...后面加展开按钮
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700 flex justify-between">
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(
                              getFirstThreeLines(aiContent.news)
                            ),
                          }}
                        />
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
                        <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(aiContent.news),
                          }}
                        />
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
            <section
              id="scripts"
              className="border border-gray-200 rounded-lg p-4"
            >
              <Tabs value={activeScriptTab} onValueChange={setActiveScriptTab}>
                <TabsList className="grid w-full grid-cols-2 mb-3">
                  <TabsTrigger value="script1" className="text-4xl py-4">
                    推荐话术1
                  </TabsTrigger>
                  <TabsTrigger value="script2" className="text-4xl py-4">
                    推荐话术2
                  </TabsTrigger>
                </TabsList>
                <TabsContent key={1} value={"script1"}>
                  <div className="bg-white mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line mb-3 text-black mt-11">
                      {/* <div
                        dangerouslySetInnerHTML={{
                          __html: marked.parse(aiContent.styleA),
                        }}
                      /> */}
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                            <strong
                              style={{
                                color: "#2563eb",
                                fontWeight: "bold",
                                fontSize: "1.125rem",
                              }}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {aiContent.styleA}
                      </ReactMarkdown>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300"
                        onClick={() => handleCopy(aiContent.styleA, "script1")}
                      >
                        {copiedScript === "script1" ? (
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
                <TabsContent key={2} value={"script2"}>
                  <div className="bg-white mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-sm leading-relaxed whitespace-pre-line mb-3 text-black mt-11">
                      <ReactMarkdown
                        components={{
                          strong: ({ node, ...props }) => (
                            <strong
                              style={{
                                color: "#2563eb",
                                fontWeight: "bold",
                                fontSize: "1.125rem",
                              }}
                              {...props}
                            />
                          ),
                        }}
                      >
                        {aiContent.styleB}
                      </ReactMarkdown>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-white text-gray-700 border-gray-300"
                        onClick={() => handleCopy(aiContent.styleB, "script2")}
                      >
                        {copiedScript === "script2" ? (
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
              </Tabs>
            </section>

            {/* 推荐材料下载 */}
            <section
              id="materials"
              className="border border-gray-200 rounded-lg p-4"
            >
              <div className="bg-white">
                {/* 联系人信息卡片 */}
                <div className="bg-blue-50 rounded-lg p-4 mb-4">
                  <div className="space-y-2 text-base">
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-gray-600">推荐联系人：</span>
                        <span className="font-medium text-gray-900">
                          {newsData.person_name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">职位：</span>
                        <span className="font-medium text-gray-900">
                          {newsData.position}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-8">
                      <div>
                        <span className="text-gray-600">电话：</span>
                        <span className="font-medium text-gray-900">
                          {newsData.person_private.phone_number}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">微信：</span>
                        <span className="font-medium text-gray-900">
                          {newsData.person_private.wechat_number}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 需携带的材料标题 */}
                <div className="mb-4">
                  <span className="text-gray-600 text-base">
                    需携带的材料：
                  </span>
                </div>

                {/* 材料列表 */}
                <div className="space-y-3 mb-4">
                  {materials.map((material) => {
                    const state = reportStates[material.id] || "idle";
                    const progress = progresses[material.id] || 0;

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
                            <div className="font-medium text-base text-gray-900">
                              {/* {material.title} */}
                              {newsData.news_region_cn}项目清单
                            </div>
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
                                <div>
                                  {getEstimatedTime(
                                    progress,
                                    material.estimatedTime
                                  )}
                                </div>
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleCancelGenerate(material.id)
                                }
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
                              onClick={() =>
                                handleGenerateAndDownload(material)
                              }
                              className="bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:border-blue-700"
                              disabled
                            >
                              <Download className="h-3 w-3 mr-1" />
                              一键生成并下载
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* 下载全部材料按钮 */}
                <Button
                  variant="outline"
                  className="w-full bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                  onClick={handleDownloadAll}
                  disabled
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
                <p className="text-xs text-gray-500 mt-1">
                  报告将保存为PDF格式，最多50个字符
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsNamingDialogOpen(false)}
                >
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
                <Button
                  variant="outline"
                  onClick={() => setIsErrorDialogOpen(false)}
                >
                  取消
                </Button>
                <Button
                  onClick={handleRetryGenerate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  重新生成
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
