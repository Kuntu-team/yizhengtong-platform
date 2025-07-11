"use client";

import { useState, useEffect } from "react";
import { AppLayout } from "@/components/app-layout";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Clock, User } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  phone: string;
  role: string;
  employeeId: string;
  team: string;
  manager: string;
  regions: string[];
  lastLoginTime: number;
  lastLoginLocation: string;
}

interface NewsItem {
  id: string
  title: string
  summary: string
  time: string
  leader: string
  tags: string
  source: string
  region: string
  category: string
}

export default function HomePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [newsData, setNewsData] = useState<NewsItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const pageSize = 10

  useEffect(() => {
    const userInfo = typeof window !== 'undefined' ? localStorage.getItem("userInfo") : null
    if (userInfo) {
      const userData = JSON.parse(userInfo);
      setUser(userData);
    } else {
      const defaultUser = {
        id: "default",
        name: "王商务",
        phone: "13800138000",
        role: "商务经理",
        employeeId: "EMP001",
        team: "华东销售团队",
        manager: "李总监",
        regions: ["上海市", "江苏省", "浙江省"],
        lastLoginTime: Date.now(),
        lastLoginLocation: "上海市",
      };
      setUser(defaultUser);
      localStorage.setItem("userInfo", JSON.stringify(defaultUser));
    }
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    fetch(`/api/business-person-news?page=${page}&pageSize=${pageSize}`)
      .then(res => res.json())
      .then(res => {
        setNewsData(res.data || [])
        setTotal(res.total || 0)
      })
  }, [page])

  // 获取问候语
  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return "早上好";
    if (hour < 18) return "下午好";
    return "晚上好";
  };

  // 获取日期字符串
  const getDateString = () => {
    const weekdays = [
      "星期日",
      "星期一",
      "星期二",
      "星期三",
      "星期四",
      "星期五",
      "星期六",
    ];
    const year = currentTime.getFullYear();
    const month = currentTime.getMonth() + 1;
    const date = currentTime.getDate();
    const weekday = weekdays[currentTime.getDay()];
    return `${year}年${month}月${date}日 ${weekday}`;
  };
  return (
    <AppLayout>
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-6 py-8">
          {/* 简化的问候语区域 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="px-6 py-6">
                <div className="text-center space-y-2">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    <h1 className="text-2xl font-light text-gray-900 tracking-tight">
                      欢迎回来，曾春梅，你有
                      <span className="text-5xl font-medium text-red-500">
                        8
                      </span>
                      条新的任内动态
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <p className="text-base font-light text-gray-600 tracking-wide">
                      {getDateString()}
                    </p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 关注领导的新闻动态 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className="mt-8"
          >
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="px-6 py-6">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 tracking-wide">关注领导动态</h2>
                    <p className="text-xs text-gray-500 mb-1">当前仅展示近一个月内的关注领导动态</p>
                  </div>
                  <Badge variant="outline" className="text-xs font-light">
                    {total} 条更新
                  </Badge>
                </div>

                <div className="space-y-4">
                  {newsData.map((news, index) => (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className="border-l-2 border-blue-100 pl-4 py-3 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 tracking-wide">
                            {news.title}
                          </h3>
                          <p className="text-gray-600 text-xs mb-2 line-clamp-2 font-light leading-relaxed">
                            {news.summary}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span className="font-light">{news.leader}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span className="font-light">{news.time ? new Date(news.time).toLocaleDateString() : ''}</span>
                            </div>
                            {news.tags && (
                              <Badge variant="secondary" className="text-xs font-light bg-blue-100 text-blue-600 hover:text-black transition-colors duration-200">
                                {news.tags}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {newsData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-light">
                      暂无关注的领导动态
                    </p>
                  </div>
                )}
                {/* 分页控件 */}
                {total > pageSize && (
                  <div className="flex justify-center mt-6">
                    <button
                      className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                      onClick={() => setPage(page - 1)}
                      disabled={page === 1}
                    >
                      上一页
                    </button>
                    <span className="px-2 text-sm">{page} / {Math.ceil(total / pageSize)}</span>
                    <button
                      className="px-3 py-1 mx-1 border rounded disabled:opacity-50"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= Math.ceil(total / pageSize)}
                    >
                      下一页
                    </button>
                  </div>
                )}
                 </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
}
