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
import axios from "axios";
import { getTimeAgo } from "@/lib/utils";
import { marked } from "marked";
import ReactMarkdown from "react-markdown";
import { message } from "antd";

interface DetailPageProps {
  params: {
    id: string;
  };
}

// 在组件开始处添加样式
const keywordStyles = `
  .highlight-keyword {
    color: #2563eb;
    font-weight: 600;
    font-size: 1.2em;
  }
`;
export default function DetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [copiedScript, setCopiedScript] = useState<string | null>(null);
  const [isNewsExpanded, setIsNewsExpanded] = useState(true);
  const [newsData, setNewsData] = useState({
    news_title: "新闻标题",
    news_time: "时间",
    news_source: "新闻来源",
    news_url: "",
    news_content: "新闻内容生成中...",
    person_name: "联系人",
    position: "职位",
    person_private: {
      phone_number: "联系人电话",
      wechat_number: "联系人微信",
    },
    news_region_cn: "",
  });

  // 获取新闻数据
  const { id } = React.use(params);
  console.log("Received news_id:", id);
  const fetchDetail = async () => {
    const res = await axios.get("/api/term/all");
    console.log(res.data);
    const privateData = res.data.find(
      (item: any) => String(item.news_id) === String(id)
    );
    console.log("Private data for news_id:", privateData);

    setNewsData(privateData);
  };

  useEffect(() => {
    fetchDetail();
    // const randomString = generateRandomString(15);
    // console.log(randomString);
  }, []);

  const handleCopy = async (text: string, scriptId: string) => {
    console.log("text：", text, "scriptId：", scriptId);
    try {
      await navigator.clipboard.writeText(text);
      setCopiedScript(scriptId);
      setTimeout(() => setCopiedScript(null), 2000);
    } catch (err) {
      try {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
        setCopiedScript(scriptId);
        setTimeout(() => setCopiedScript(null), 2000);
      } catch (err2) {
        message.error("复制失败,请手动复制");
        console.log("复制失败:", err, err2);
      }
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
          <div className="mx-auto px-4 h-14 flex items-center">
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
          <main className="sm:mx-7 px-6 py-4 space-y-6">
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
                        {newsData?.news_title}
                      </h3>
                    </div>
                  </div>

                  {/* 新闻来源和发布时间 */}
                  <div className="flex items-center gap-4 text-sm text-gray-500 pb-3 border-b border-gray-100">
                    <div className="flex items-center gap-1">
                      <span>来源：</span>
                      <span className="font-medium max-w-[120px] truncate md:max-w-none">
                        <a
                          href={newsData?.news_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer transition-colors"
                        >
                          {newsData?.news_source ?? "未知来源"}
                        </a>
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span>发布时间：</span>
                      <span className="font-medium">
                        {getTimeAgo(newsData?.news_time)}
                      </span>
                    </div>
                  </div>

                  {/* 新闻正文 */}
                  <div className="prose prose-sm max-w-none">
                    {!isNewsExpanded ? (
                      // 收起状态：显示前3行，在...后面加展开按钮
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                        {/* <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(
                              getFirstThreeLines(newsData?.news_content)
                            ),
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
                          {getFirstThreeLines(newsData?.news_content)}
                        </ReactMarkdown>
                        <div className="flex justify-end mt-2">
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
                      </div>
                    ) : (
                      // 展开状态：显示完整内容，在最后加收起按钮
                      <div className="text-sm leading-relaxed whitespace-pre-line text-gray-700">
                        {/* <div
                          dangerouslySetInnerHTML={{
                            __html: marked.parse(newsData?.news_content),
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
                          {newsData?.news_content}
                        </ReactMarkdown>
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
          </main>
        </div>
      </div>
    </>
  );
}
