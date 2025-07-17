"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronDown, CheckCircle, Users, X, Copy } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import React, { ReactNode } from "react";

import QRCode from "qrcode";


interface Project {
  id: string;
  name: string;
  suitable: string;
  requirements: string;
  script: string;
}

interface PolicyDetail {
  id: string;
  title: string;
  source: string;
  sourceUrl?: string; // 添加这行
  publishDate: string;
  status: "pending" | "completed";
  keyPoints: string[];
  projects: Project[];
  fullContent: string;
}

function CustomStrong({ children, ...props }: { children?: React.ReactNode | React.ReactNode[] }) {
  const text = Array.isArray(children) ? children[0] : children;
  if (typeof text === "string") {
    // 不去除《》
    const match = text.match(/^([，。！？,.!?、；:：“”‘’\(\)\[\]\{\}\s]*)(.*?)([，。！？,.!?、；:：“”‘’\(\)\[\]\{\}\s]*)$/);
    if (match) {
      const [, leading, core, trailing] = match;
      return (
        <>
          {leading}
          <strong style={{ color: "#2966d2", fontWeight: "bold" }} {...props}>
            {core}
          </strong>
          {trailing}
        </>
      );
    }
  }
  return (
    <strong style={{ color: "#2966d2", fontWeight: "bold" }} {...props}>
      {children}
    </strong>
  );
}

// 推荐话术渲染前处理，只高亮成对的 **内容**
function renderScriptWithCustomHighlight(script: string) {
  if (!script) return null;
  // 只替换成对的 **内容**，不处理嵌套和不成对
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: script.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2966d2;font-weight:bold">$1</strong>')
      }}
    />
  );
}

// 政策解读渲染前处理，支持高亮和换行
function renderAnalysisWithHighlight(text: string) {
  if (!text) return [];
  // 先高亮成对的 **内容**
  const html = text.replace(/\*\*([^*]+)\*\*/g, '<strong style="color:#2966d2;font-weight:bold">$1</strong>');
  // 再按换行分割
  return html.split('\n').map((line, idx) => (
    <span key={idx} dangerouslySetInnerHTML={{ __html: line }} />
  ));
}

export default function PolicyDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const [policy, setPolicy] = useState<PolicyDetail | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    projects: true,
    content: false, // 政策内容默认收起
  });
  const [copiedScript, setCopiedScript] = useState<string | null>(null);

  const [activeSection, setActiveSection] = useState("policy-content");

  // 使用简单的状态管理替代Dialog
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareText, setShareText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // 添加结果弹窗状态
  const [resultModalOpen, setResultModalOpen] = useState(false);
  const [shareResult, setShareResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const [policyAnalysis, setPolicyAnalysis] = useState<string>("");
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // 滚动到指定模块
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 56; // 顶部导航栏高度
      const elementPosition = element.offsetTop - headerHeight - 20;
      window.scrollTo({
        top: elementPosition,
        behavior: "smooth",
      });
      setActiveSection(sectionId);
    }
  };

  // 监听滚动事件，更新激活状态
  useEffect(() => {
    const handleScroll = () => {
      const sections = ["policy-content", "matching-projects"];
      const headerHeight = 56;

      for (let i = sections.length - 1; i >= 0; i--) {
        const element = document.getElementById(sections[i]);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= headerHeight + 100) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch(`/api/policies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const item = data.data;
          setPolicy({
            id: item.policy_id,
            title: item.policy_title || "-",
            source: item.issued_authority || "-",
            sourceUrl: item.policy_url || undefined,
            publishDate: item.released_date || "-",
            status: "completed", // 可根据需要调整
            keyPoints: [], // 可根据需要解析
            projects: [], // 可根据需要解析
            fullContent: item.policy_content || "-",
          });
        }
      });
  }, [id]);

  // 推荐话术生成
  useEffect(() => {
    if (!policy?.id) return;
    setPolicyAnalysis("");
    setAnalysisError(null);
    setAnalysisLoading(true);
    setProjectsLoading(true);

    const generateScripts = async () => {
      try {
        // 推荐话术1
        const response1 = await fetch("https://dify.ktt.team/v1/chat-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer app-sx9Om1926GQsuACSpKc22Alj",
          },
          body: JSON.stringify({
            inputs: {
              policy_id: policy.id,
              type: "2"
            },
            query: "生成推荐话术1",
            response_mode: "blocking",
            conversation_id: "",
            user: "wby",
            files: [],
          }),
        });
        // 推荐话术2
        const response2 = await fetch("https://dify.ktt.team/v1/chat-messages", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer app-sx9Om1926GQsuACSpKc22Alj",
          },
          body: JSON.stringify({
            inputs: {
              policy_id: policy.id,
              type: "2"
            },
            query: "生成推荐话术2",
            response_mode: "blocking",
            conversation_id: "",
            user: "wby",
            files: [],
          }),
        });
        const data1 = await response1.json();
        const data2 = await response2.json();
        
        // 打印返回数据到控制台
        console.log("推荐话术1返回数据:", data1);
        console.log("推荐话术2返回数据:", data2);
        console.log("推荐话术1 answer字段:", data1?.answer);
        console.log("推荐话术2 answer字段:", data2?.answer);
        
        let projects = [];
        // 处理推荐话术1
        if (data1 && data1.answer) {
          projects.push({
            id: "styleA",
            name: "推荐话术1",
            suitable: "",
            requirements: "",
            script: data1.answer, // 不做任何处理，直接展示原始 answer
          });
        }
        // 处理推荐话术2
        if (data2 && data2.answer) {
          projects.push({
            id: "styleB",
            name: "推荐话术2",
            suitable: "",
            requirements: "",
            script: data2.answer, // 不做任何处理，直接展示原始 answer
          });
        }
        setPolicy((prev) => (prev ? { ...prev, projects } : prev));
        // setPolicyAnalysis("政策解读内容已生成，请查看推荐话术。"); // 不再覆盖政策解读内容
        
        // 添加调试日志
        console.log("处理后的 projects 数组:", projects);
        console.log("projects 数组长度:", projects.length);
      } catch (err) {
        console.error("生成推荐话术失败:", err);
        setAnalysisError("推荐话术生成失败，请稍后重试。");
        setPolicy((prev) => (prev ? { ...prev, projects: [] } : prev));
      } finally {
        setAnalysisLoading(false);
        setProjectsLoading(false);
      }
    };
    generateScripts();
  }, [policy?.id]);

  // 政策解读内容生成
  useEffect(() => {
    if (!policy?.id) return;
    setAnalysisLoading(true);
    setAnalysisError(null);

    fetch("https://dify.ktt.team/v1/chat-messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer app-sx9Om1926GQsuACSpKc22Alj",
      },
      body: JSON.stringify({
        inputs: {
          policy_id: policy.id,
          type: "1"
        },
        query: "生成政策解读",
        response_mode: "blocking",
        conversation_id: "",
        user: "wby",
        files: [],
      }),
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.answer) {
          // 去除所有 <xxx> 标签
          let analysis = data.answer.replace(/<[^>]+>/g, '').trim();
          setPolicyAnalysis(analysis);
        } else {
          setPolicyAnalysis("未获取到政策解读内容。");
        }
      })
      .catch(() => setAnalysisError("政策解读获取失败，请稍后重试。"))
      .finally(() => setAnalysisLoading(false));
  }, [policy?.id]);

  // 只在弹窗未打开时，policy变化才设置默认朋友圈文案，避免覆盖接口返回内容
  useEffect(() => {
    if (!shareModalOpen) {
      const defaultShareText = `【${policy?.title}】\n#政策解读 #${policy?.source}`;
      setShareText(defaultShareText);
    }
  }, [policy, shareModalOpen]);

  // 分享弹窗打开时自动请求朋友圈文案
  useEffect(() => {
    if (shareModalOpen && policy?.id) {
      setShareText('朋友圈文案生成中...');
      fetch('https://dify.ktt.team/v1/chat-messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer app-sx9Om1926GQsuACSpKc22Alj',
        },
        body: JSON.stringify({
          inputs: { policy_id: policy.id, type: '3' },
          query: '生成朋友圈文案',
          response_mode: 'blocking',
          conversation_id: '',
          user: 'wby',
          files: [],
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.answer) {
            // 去除 <key_points> 和 </key_points> 标签，并去除首尾空行
            let clean = data.answer.replace(/<key_points>/g, '').replace(/<\/key_points>/g, '');
            clean = clean.replace(/^[\s\n]+|[\s\n]+$/g, '');
            setShareText(clean);
          }
        });
    }
  }, [shareModalOpen, policy?.id]);

  // 复制话术
  const handleCopyScript = async (script: string, projectId: string) => {
    try {
      // 去除 markdown 语法，仅保留纯文本
      let plainText = script
        .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
        .replace(/\*(.*?)\*/g, '$1') // 斜体
        .replace(/`([^`]+)`/g, '$1') // 行内代码
        .replace(/\[(.*?)\]\((.*?)\)/g, '$1') // 链接
        .replace(/^#+\s?(.*)/gm, '$1') // 标题
        .replace(/\!\[(.*?)\]\((.*?)\)/g, '') // 图片
        .replace(/<[^>]+>/g, '') // HTML标签
        .replace(/\r?\n/g, '\n') // 保留换行
        .replace(/^[\s\t]+|[\s\t]+$/gm, '') // 行首尾空格
        ;
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainText);
        setCopiedScript(projectId);
        setTimeout(() => setCopiedScript(null), 2000);
      } else {
        // 兼容旧浏览器
        const textarea = document.createElement("textarea");
        textarea.value = plainText;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedScript(projectId);
        setTimeout(() => setCopiedScript(null), 2000);
      }
    } catch (err) {
      console.error("复制失败:", err);
    }
  };

  // 删除高亮关键词相关的函数和keywords数组

  const handleShare = async () => {
    console.log("🎉 分享按钮被点击了！");
    setIsGenerating(true);
    try {
      console.log("⏳ 开始生成分享内容...");
      // 模拟生成图片的过程
      await new Promise((resolve) => setTimeout(resolve, 2000));
      console.log("📝 分享内容:", shareText);
      console.log("✅ 分享完成，准备关闭弹窗");

      // 设置成功结果并显示结果弹窗
      setShareResult({
        success: true,
        message: "", // 删除原来的消息文本
      });
      setShareModalOpen(false);
      setResultModalOpen(true);
    } catch (error) {
      console.error("❌ 分享失败:", error);

      // 设置失败结果并显示结果弹窗
      setShareResult({
        success: false,
        message: "分享生成失败，请稍后重试。",
      });
      setShareModalOpen(false);
      setResultModalOpen(true);
    } finally {
      console.log("🔄 重置生成状态");
      setIsGenerating(false);
    }
  };

  function formatDate(dateStr: string) {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    // 输出 YYYY-MM-DD HH:mm
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  // 分享二维码弹窗逻辑
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  useEffect(() => {
    if (showQR && typeof window !== "undefined") {
      const url = window.location.href;
      QRCode.toDataURL(url).then(setQrUrl);
    }
  }, [showQR]);

  const searchParams = useSearchParams();
  const isFromWxShare = searchParams?.get('from') === 'wxshare';

  if (!policy) {
    return <div className="text-center py-16">加载中...</div>;
  }

  return (
    <div>
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h1 className="ml-4 text-base font-medium truncate flex-1">
            {policy.title}
          </h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("👆 Users按钮被点击");
              setShareModalOpen(true);
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
                  console.log("🔙 返回按钮被点击");
                  setShareModalOpen(false);
                }}
                className="p-0 h-auto text-blue-600 hover:text-blue-700"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                返回
              </Button>
              <h2 className="text-base font-medium">分享预览</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareModalOpen(false)}
                className="p-0 h-auto"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 弹窗内容 */}
            <div className="p-4 space-y-6">
              {/* 文案编辑区域 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-700">
                    朋友圈文案
                  </label>
                  <span className="text-xs text-gray-500">
                    {shareText.length}/200
                  </span>
                </div>
                <Textarea
                  value={shareText}
                  onChange={(e) => setShareText(e.target.value)}
                  placeholder="编辑分享文案..."
                  className="min-h-[120px] resize-none text-sm border border-gray-300 focus:border-gray-400 focus:ring-0 whitespace-pre-line"
                  maxLength={200}
                />
              </div>

              {/* 原新闻链接 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  原文链接
                </label>
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

              {/* 二维码分享区域，仅PC端显示 */}
              <Button
                onClick={() => setShowQR(true)}
                className="w-full h-10 bg-[#07C160] hover:bg-[#06AD56] text-white font-bold mt-2"
              >
                生成微信分享二维码
              </Button>
              {showQR && typeof window !== "undefined" && (
                <div
                  style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    zIndex: 9999,
                  }}
                >
                  <div
                    style={{
                      background: "#fff",
                      padding: 24,
                      borderRadius: 8,
                      textAlign: "center",
                    }}
                  >
                    <div style={{ marginBottom: 12 }}>微信扫码分享当前页面</div>
                    {qrUrl && (
                      <img
                        src={qrUrl}
                        alt="二维码"
                        style={{ width: 200, height: 200 }}
                      />
                    )}
                    <div>
                      <Button
                        onClick={() => setShowQR(false)}
                        style={{ marginTop: 16 }}
                      >
                        关闭
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* 分享按钮 */}
              {/* <Button
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
              </Button> */}
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
              <p className="text-sm text-gray-600 mb-6 leading-relaxed">
                {shareResult.message}
              </p>

              {/* 按钮 */}
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                    setResultModalOpen(false);
                    setShareResult(null);
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
      <main className="max-w-4xl mx-auto px-4 py-4 min-h-screen bg-gray-50">
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
                <span>发布时间：{formatDate(policy.publishDate)}</span>
              </div>

              {/* 政策内容 */}
              <div className="text-sm leading-relaxed text-gray-700">
                {policy.fullContent.split("\n").slice(0, 5).join("\n")}
                {policy.fullContent.split("\n").length > 5 && "..."}
              </div>

              <AnimatePresence>
                {expanded.content && policy.fullContent.split("\n").length > 5 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm max-w-none">
                        <div className="text-sm leading-relaxed text-gray-700 whitespace-pre-line">
                          {policy.fullContent.split("\n").slice(5).join("\n")}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-end mt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    setExpanded({ ...expanded, content: !expanded.content })
                  }
                  className="text-blue-600 hover:text-blue-700"
                >
                  {expanded.content ? "收起" : "展开全文"}
                  <ChevronDown
                    className={`ml-1 h-3 w-3 transition-transform ${
                      expanded.content ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <div className="space-y-3">
                {analysisLoading && (
                  <div className="text-gray-500 text-sm">政策解读生成中...</div>
                )}
                {analysisError && (
                  <div className="text-red-500 text-sm">{analysisError}</div>
                )}
                {!analysisLoading && !analysisError && policyAnalysis && (
                  <div className="prose prose-sm max-w-none">
                    {renderAnalysisWithHighlight(policyAnalysis).map((el, idx) => <React.Fragment key={idx}>{el}<br/></React.Fragment>)}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* 推荐项目及话术模块 */}
        <section
          id="matching-projects"
          className="bg-white rounded-lg p-4 mb-4"
        >
          {projectsLoading ? (
            <div className="text-gray-400 text-center py-8 text-lg">
              推荐话术生成中...
            </div>
          ) : policy.projects.length > 0 ? (
            <Tabs defaultValue={policy.projects[0].id} className="w-full">
              <TabsList className="w-full flex flex-row gap-4 bg-transparent p-2 mb-6">
                {policy.projects.map((project, index) => (
                  <TabsTrigger
                    key={project.id}
                    value={project.id}
                    className="flex-1 text-2xl md:text-4xl font-bold py-4 rounded-xl bg-white shadow-sm transition min-w-0 data-[state=active]:bg-[#e8f0fe] data-[state=active]:text-[#2966d2] data-[state=active]:shadow-none"
                  >
                    推荐话术{index + 1}
                  </TabsTrigger>
                ))}
              </TabsList>

              {policy.projects.map((project, index) => (
                <TabsContent
                  key={project.id}
                  value={project.id}
                  className="mt-0"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-xl p-6 min-h-[80px] flex flex-col items-center shadow"
                  >
                    {/* 推荐话术 */}
                    <div className="w-full">
                      {renderScriptWithCustomHighlight(project.script)}
                    </div>
                    {/* 复制按钮移到框外 */}
                    <div className="flex justify-end mt-3 w-full">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleCopyScript(project.script, project.id)
                        }
                        className="rounded-lg border border-gray-200 bg-white text-gray-800 flex items-center gap-1 px-4 py-2 transition hover:bg-[#e8f0fe] hover:text-[#2966d2] focus:outline-none focus:ring-2 focus:ring-[#2966d2]"
                        style={{ boxShadow: 'none' }}
                      >
                        {copiedScript === project.id ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                            <span className="text-green-600">已复制</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-1 transition-colors group-hover:text-[#2966d2]" />
                            <span className="transition-colors group-hover:text-[#2966d2]">复制</span>
                          </>
                        )}
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
          ) : (
            <div className="text-gray-400 text-center py-8 text-lg">
              暂无推荐话术
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
