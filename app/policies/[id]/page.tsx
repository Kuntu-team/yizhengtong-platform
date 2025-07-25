"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronDown,
  CheckCircle,
  Users,
  X,
  Copy,
} from "lucide-react";
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

function CustomStrong({
  children,
  ...props
}: {
  children?: React.ReactNode | React.ReactNode[];
}) {
  const text = Array.isArray(children) ? children[0] : children;
  if (typeof text === "string") {
    // 不去除《》
    const match = text.match(
      /^([，。！？,.!?、；:：“”‘’\(\)\[\]\{\}\s]*)(.*?)([，。！？,.!?、；:：“”‘’\(\)\[\]\{\}\s]*)$/
    );
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
  return (
    <span
      style={{ 
        color: "#000000",
        fontSize: '14px',
        lineHeight: '1.6'
      }}
      dangerouslySetInnerHTML={{
        __html: script.replace(
          /\*\*([^*]+)\*\*/g,
          '<strong style="color:#2966d2;font-weight:bold">$1</strong>'
        ),
      }}
    />
  );
}

// 政策解读渲染前处理，支持高亮和换行
function renderAnalysisWithHighlight(text: string) {
  if (!text) return [];
  // 先高亮成对的 **内容**
  const html = text.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong style="color:#2966d2;font-weight:bold">$1</strong>'
  );
  // 再按换行分割
  return html
    .split("\n")
    .map((line, idx) => (
      <span key={idx} dangerouslySetInnerHTML={{ __html: line }} />
    ));
}

// 新增流式 answer hook
function useStreamingAnswer({ id, query, type }: { id: string, query: string, type: string }) {
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 如果没有有效的ID，不发送请求
    if (!id || id === 'undefined' || id === 'null') {
      setAnswer("");
      setError(null);
      setLoading(false);
      return;
    }
    
    setAnswer("");
    setError(null);
    setLoading(true);
    let cancelled = false;
    async function fetchStream() {
      try {
        console.log('Making streaming request for:', { id, query, type });
        const res = await fetch(`/api/policies/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query,
            inputs: { policy_id: id, type },
            response_mode: "streaming",
            conversation_id: "",
            user: "wby",
            files: [],
          }),
        });
        
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${res.status}: ${res.statusText}`);
        }
        
        if (!res.body) throw new Error("No response body");
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        while (true) {
          const { done, value } = await reader.read();
          if (done || cancelled) break;
          buffer += decoder.decode(value, { stream: true });
          let lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.replace("data: ", "").trim();
              if (!data || data === "[DONE]") continue;
              try {
                const json = JSON.parse(data);
                if (json.answer) {
                  setAnswer(prev => prev + json.answer);
                }
              } catch (e) {
                // ignore
              }
            }
          }
        }
      } catch (err: any) {
        // console.log('Streaming request failed:', err);
        const errorMessage = err.message || "流式请求失败";
        setError(errorMessage);
        // 如果是配置错误，给出更友好的提示
        if (errorMessage.includes('DIFY token') || errorMessage.includes('403')) {
          setError("AI服务暂时不可用，请稍后再试");
        }
      } finally {
        setLoading(false);
      }
    }
    fetchStream();
    return () => { cancelled = true; };
  }, [id, query, type]);
  return { answer, loading, error };
}

// 新增 typewriter 打字机动画 hook
function useTypewriterEffect(fullText: string, speed = 20) {
  const [displayed, setDisplayed] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevFullTextRef = useRef("");

  useEffect(() => {
    // 只有 fullText 变短（如切换 policy）时才重置
    if (fullText.length < prevFullTextRef.current.length) {
      setDisplayed("");
    }
    prevFullTextRef.current = fullText;
  }, [fullText]);

  useEffect(() => {
    if (!fullText) {
      setDisplayed("");
      return;
    }
    // 只补充新内容，不重头打字
    if (displayed.length < fullText.length) {
      if (timerRef.current) clearInterval(timerRef.current);
      let i = displayed.length;
      timerRef.current = setInterval(() => {
        setDisplayed(prev => {
          const next = fullText.slice(0, i + 1);
          i++;
          if (i >= fullText.length && timerRef.current) clearInterval(timerRef.current);
          return next;
        });
      }, speed);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line
  }, [fullText, speed]);
  return displayed;
}

// 工具函数：提取 <body> 标签内容，并去除不需要的部分
function extractBody(html: string) {
  const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  let body = match ? match[1] : html;

  // 0. 去除所有<link ...>标签（如iframe.css等外部样式表）
  body = body.replace(/<link[^>]*>/gi, '');
  // 1. 去除所有包含“扫一扫”或“分享”字样的段落或区块
  body = body.replace(/<[^>]*>[^<]*(扫一扫|分享)[^<]*<\/[^>]*>/gi, '');
  body = body.replace(/(扫一扫|分享)[^<\n\r]*/gi, '');
  // 2. 去除头部“首页 > 信息公开...”等导航和发布时间等（图三部分）
  body = body.replace(/<div[^>]*class=["']crumb-box["'][^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div[^>]*class=["']info["'][^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<p[^>]*class=["']xxgk-infos["'][^>]*>[\s\S]*?<\/p>/gi, '');
  body = body.replace(/发布时间：[^<]+<br\s*\/?>/gi, '');
  body = body.replace(/<span[^>]*>\s*分享至：?[\s\S]*?<\/span>/gi, '');

  // 3. 去除红框中的LOGO区块和大标题
  body = body.replace(/<div[^>]*class=["']main-logo["'][^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div[^>]*class=["']xxgk-title["'][^>]*>[\s\S]*?<\/div>/gi, '');
  body = body.replace(/<div[^>]*class=["']top-info["'][^>]*>[\s\S]*?<\/div>/gi, '');
  // 通用匹配各地政府大标题
  body = body.replace(/<h[1-3][^>]*>[\s\S]*?(?:[省市区县].*?人民政府)[\s\S]*?<\/h[1-3]>/gi, '');
  // 通用匹配各地政府办公室印发说明
  body = body.replace(/<p[^>]*>[\s\S]*?人民政府办公室关于印发[\s\S]*?<\/p>/gi, '');
  body = body.replace(/<div[^>]*>\s*<\/div>/gi, '');
  body = body.replace(/<p[^>]*>\s*<\/p>/gi, '');

  // 4. 去除所有图片
  body = body.replace(/<img[^>]*>/gi, '');

  // 5. 去除多余空行和空白块
  // 递归去除仅包含 &nbsp;、空格、<br>、换行的 <p>、<div>、<span>
  let prevBody;
  do {
    prevBody = body;
    body = body.replace(/<(p|div|span)[^>]*>(\s|&nbsp;|<br\s*\/?>|\r|\n)*<\/(p|div|span)>/gi, '');
  } while (body !== prevBody);
  // 合并多个 <br>、空白、换行为一个 <br>
  body = body.replace(/((<br\s*\/?>|\s|&nbsp;|\r|\n){2,})/gi, '<br />');
  // 去除所有孤立的 <br> 或空白块（行首行尾）
  body = body.replace(/^(<br\s*\/?>|\s|&nbsp;)+/gi, '');
  body = body.replace(/(<br\s*\/?>|\s|&nbsp;)+$/gi, '');
  // 去除首尾空白
  body = body.trim();

  return body;
}

// 处理表格样式，确保内容不溢出
function processTableStyles(html: string) {
  return html
    .replace(/<table/g, '<table style="width: 100%; border-collapse: collapse; table-layout: fixed; font-size: 11px; overflow-x: auto; line-height: 1.2;"')
    .replace(/<td/g, '<td style="border: 1px solid #ddd; padding: 8px 4px; word-wrap: break-word; word-break: break-all; vertical-align: middle !important; text-align: center; overflow: hidden; text-overflow: ellipsis; white-space: normal; max-width: 0; display: table-cell; line-height: 1.2;"')
    .replace(/<th/g, '<th style="border: 1px solid #ddd; padding: 8px 4px; word-wrap: break-word; word-break: break-all; vertical-align: middle !important; text-align: center; background-color: #f5f5f5; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: normal; max-width: 0; display: table-cell; line-height: 1.2;"');
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
  const [contentNeedsExpand, setContentNeedsExpand] = useState(false);
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

  const [showTitleModal, setShowTitleModal] = useState(false); // 新增标题弹窗状态

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

  // 恢复 policy 基本信息的 GET 请求
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
            status: "completed",
            keyPoints: [],
            projects: [],
            fullContent: item.body_content || "-",
          });
        }
      });
  }, [id]);

  // 检测内容是否需要展开收起功能
  useEffect(() => {
    if (policy?.fullContent) {
      const contentElement = document.querySelector('.policy-html-content');
      if (contentElement) {
        const scrollHeight = contentElement.scrollHeight;
        const clientHeight = contentElement.clientHeight;
        setContentNeedsExpand(scrollHeight > 300);
      }
    }
  }, [policy?.fullContent, expanded.content]);

  // 推荐话术流式
  const { answer: script1, loading: script1Loading, error: script1Error } = useStreamingAnswer({ 
    id: policy?.id || '', 
    query: "生成推荐话术1", 
    type: "2" 
  });
  // 政策解读流式
  const { answer: analysisAnswer, loading: analysisLoading, error: analysisError } = useStreamingAnswer({ 
    id: policy?.id || '', 
    query: "生成政策解读", 
    type: "1" 
  });

  // 推荐话术和政策解读 typewriter 动画变量
  const typewriterScript1 = useTypewriterEffect(script1, 20);
  const typewriterAnalysis = useTypewriterEffect(analysisAnswer, 20);

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
      setShareText("朋友圈文案生成中...");
      fetch("https://dify.ktt.team/v1/chat-messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer app-sx9Om1926GQsuACSpKc22Alj",
        },
        body: JSON.stringify({
          inputs: { policy_id: policy.id, type: "3" },
          query: "生成朋友圈文案",
          response_mode: "blocking",
          conversation_id: "",
          user: "wby",
          files: [],
        }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.answer) {
            // 去除 <key_points> 和 </key_points> 标签，并去除首尾空行
            let clean = data.answer
              .replace(/<key_points>/g, "")
              .replace(/<\/key_points>/g, "");
            clean = clean.replace(/^[\s\n]+|[\s\n]+$/g, "");
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
        .replace(/\*\*(.*?)\*\*/g, "$1") // 粗体
        .replace(/\*(.*?)\*/g, "$1") // 斜体
        .replace(/`([^`]+)`/g, "$1") // 行内代码
        .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // 链接
        .replace(/^#+\s?(.*)/gm, "$1") // 标题
        .replace(/\!\[(.*?)\]\((.*?)\)/g, "") // 图片
        .replace(/<[^>]+>/g, "") // HTML标签
        .replace(/\r?\n/g, "\n") // 保留换行
        .replace(/^[\s\t]+|[\s\t]+$/gm, ""); // 行首尾空格
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
      console.log("复制失败:", err);
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
      console.log("❌ 分享失败:", error);

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
  const isFromWxShare = searchParams?.get("from") === "wxshare";

  if (!policy) {
    return <div className="text-center py-16">加载中...</div>;
  }

  return (
    <div className="bg-white">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4 w-full">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.back()}
              className="-ml-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h1
              className="flex-1 min-w-0 font-light text-slate-800 text-sm sm:text-base md:text-lg whitespace-nowrap overflow-hidden text-ellipsis cursor-pointer"
              style={{ fontSize: "clamp(11px, 4vw, 16px)" }}
              onClick={() => setShowTitleModal(true)}
              title={policy.title}
            >
              {policy.title}
            </h1>
          </div>
        </div>
      </header>

      {/* 标题完整内容弹窗 */}
      {showTitleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-base font-semibold">完整标题</span>
              <button onClick={() => setShowTitleModal(false)} className="p-1 rounded hover:bg-gray-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="text-gray-900 text-sm break-words" style={{ wordBreak: 'break-all' }}>{policy.title}</div>
          </div>
        </div>
      )}

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
      <main className="max-w-7xl mx-auto px-2 sm:px-6 pt-4 sm:pt-6 min-h-screen bg-white">
        {/* 政策内容和解读模块 */}
        <section id="policy-content" className="bg-white rounded-lg p-4 mb-4 border border-gray-200">
          <Tabs defaultValue="content" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="content">政策内容</TabsTrigger>
              <TabsTrigger value="analysis">政策解读</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="mt-4">
              {/* 发布机构和时间信息 */}
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-3 border-b">
                <span className="max-w-[55%] whitespace-nowrap overflow-hidden text-ellipsis block">
                  发布机构：
                  {(() => {
                    const source = policy.source;
                    const displaySource = !source || source === '-' || source === '未知' || source.trim() === '' ? '政策原文' : source;
                    return policy.sourceUrl ? (
                      <a
                        href={policy.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                      >
                        {displaySource}
                      </a>
                    ) : (
                      displaySource
                    );
                  })()}
                </span>
                <span className="max-w-[45%] whitespace-nowrap overflow-hidden text-ellipsis block text-right">发布时间：{formatDate(policy.publishDate)}</span>
              </div>

              {/* 政策内容 - 仅渲染 <body> 内内容，并加样式限制 */}
              <div className="relative">
                <div
                  className="policy-html-content"
                  style={{
                    maxWidth: '100%',
                    overflowX: 'auto',
                    background: '#fff',
                    padding: '12px 16px',
                    borderRadius: 8,
                    wordBreak: 'break-word',
                    maxHeight: expanded.content ? 'none' : '300px',
                    overflow: expanded.content ? 'auto' : 'hidden',
                    transition: 'max-height 0.3s ease-in-out',
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#000000',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: processTableStyles(extractBody(policy.fullContent || '')),
                  }}
                />
                {!expanded.content && contentNeedsExpand && (
                  <div 
                    className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent pointer-events-none"
                    style={{ 
                      bottom: '0px',
                      left: '16px',
                      right: '16px',
                      borderRadius: '0 0 8px 8px'
                    }}
                  />
                )}
              </div>

              {contentNeedsExpand && (
                <div className="flex justify-end mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log('展开/收起按钮被点击，当前状态:', expanded.content);
                      setExpanded({ ...expanded, content: !expanded.content });
                    }}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {expanded.content ? '收起' : '展开全文'}
                    <ChevronDown
                      className={`ml-1 h-3 w-3 transition-transform ${
                        expanded.content ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </div>
              )}
            </TabsContent>

            <TabsContent value="analysis" className="mt-4">
              <div className="space-y-3">
                {analysisError ? (
                  <div className="text-center py-8">
                    <div className="text-gray-500 text-sm mb-2">AI服务暂时不可用</div>
                    <div className="text-gray-400 text-xs">政策解读功能需要AI服务支持，请稍后再试</div>
                  </div>
                ) : !typewriterAnalysis ? (
                  <div className="text-gray-500 text-sm">政策解读生成中...</div>
                ) : (
                  <div className="prose prose-sm max-w-none" style={{ color: '#222' }}>
                    {renderAnalysisWithHighlight(typewriterAnalysis).map((el, idx) => <React.Fragment key={idx}>{el}<br/></React.Fragment>)}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </section>

        {/* 推荐话术模块 */}
        {policy?.id && (
          <section
            id="matching-projects"
            className="bg-white rounded-lg p-4 mb-4 border border-gray-200"
          >
            {script1Error ? (
              <div className="text-center py-8">
                <div className="text-gray-500 text-sm mb-2">AI服务暂时不可用</div>
                <div className="text-gray-400 text-xs">推荐话术功能需要AI服务支持，请稍后再试</div>
              </div>
            ) : !typewriterScript1 ? (
              <div className="text-gray-400 text-center py-8 text-lg">
                推荐话术生成中...
              </div>
            ) : (
              <div className="w-full">
                {/* 标题栏样式调整，去除 max-w-md，左右撑满 */}
                <div className="w-full bg-[#eaf2fb] rounded-lg p-3 border border-[#c2dbf7] mb-4">
                  <h3 className="text-base font-semibold text-[#2966d2] text-center">推荐话术</h3>
                </div>
                {/* 内容区 */}
                <div 
                  className="bg-white rounded-lg p-3 border border-gray-200"
                  style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: '#000000'
                  }}
                >
                  <div className="w-full">
                    {renderScriptWithCustomHighlight(typewriterScript1)}
                  </div>
                  <div className="flex justify-end mt-3 w-full">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyScript(typewriterScript1, 'script1')}
                      className="rounded-lg border border-gray-200 bg-white text-gray-800 flex items-center gap-1 px-4 py-2 transition hover:bg-[#e8f0fe] hover:text-[#2966d2] focus:outline-none focus:ring-2 focus:ring-[#2966d2]"
                      style={{ boxShadow: "none" }}
                    >
                      {copiedScript === 'script1' ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1 text-green-600" />
                          <span className="text-green-600">已复制</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-4 w-4 mr-1 transition-colors group-hover:text-[#2966d2]" />
                          <span className="transition-colors group-hover:text-[#2966d2]">
                            复制
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                  {copiedScript === 'script1' && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xs text-green-600 mt-2 text-center"
                    >
                      已复制到剪贴板
                    </motion.p>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
