"use client"

import { useState, useEffect } from "react"
import { AppLayout } from "@/components/app-layout"
import { Card, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Clock, User } from "lucide-react"

interface UserInfo {
  id: string
  name: string
  phone: string
  role: string
  employeeId: string
  team: string
  manager: string
  regions: string[]
  lastLoginTime: number
  lastLoginLocation: string
}

interface NewsItem {
  id: string
  title: string
  summary: string
  time: string
  timestamp: number
  leader: string
  region: string
  category: string
  isFollowed: boolean
}

const mockNewsData: NewsItem[] = [
  {
    id: "news-1",
    title: "张三主持召开数字经济发展座谈会",
    summary: "九江市发改委主任张三主持召开数字经济发展座谈会，讨论未来三年数字产业园建设规划",
    time: "3天前",
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    leader: "张三",
    region: "九江市",
    category: "数字经济",
    isFollowed: true,
  },
  {
    id: "news-2",
    title: "李四出席南昌港口物流园区奠基仪式",
    summary: "南昌市财政局局长李四出席港口物流园区奠基仪式，宣布200亿投资计划正式启动",
    time: "5天前",
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    leader: "李四",
    region: "南昌市",
    category: "基础设施",
    isFollowed: true,
  },
  {
    id: "news-3",
    title: "王五调研宜春教育城项目进展",
    summary: "宜春市市长王五实地调研教育城项目建设进展，强调要加快推进高校建设工作",
    time: "1周前",
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    leader: "王五",
    region: "宜春市",
    category: "教育投资",
    isFollowed: true,
  },
  {
    id: "news-4",
    title: "赵六参加城市建设规划会议",
    summary: "上饶市副市长赵六参加城市建设规划会议，部署下一阶段基础设施建设重点工作",
    time: "2周前",
    timestamp: Date.now() - 14 * 24 * 60 * 60 * 1000,
    leader: "赵六",
    region: "上饶市",
    category: "城市建设",
    isFollowed: true,
  },
]

export default function HomePage() {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [followedNews, setFollowedNews] = useState<NewsItem[]>([])

  // 获取用户数据和更新时间
  useEffect(() => {
    const userInfo = localStorage.getItem("userInfo")
    if (userInfo) {
      const userData = JSON.parse(userInfo)
      setUser(userData)
    } else {
      // 设置默认用户数据
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
      }
      setUser(defaultUser)
      localStorage.setItem("userInfo", JSON.stringify(defaultUser))
    }

    // 更新时间
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    // 初始化关注的新闻数据，按时间从远到近排序
    const sortedNews = mockNewsData.filter((news) => news.isFollowed).sort((a, b) => a.timestamp - b.timestamp)
    setFollowedNews(sortedNews)

    return () => clearInterval(timer)
  }, [])

  // 获取问候语
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "早上好"
    if (hour < 18) return "下午好"
    return "晚上好"
  }

  // 获取日期字符串
  const getDateString = () => {
    const weekdays = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    const year = currentTime.getFullYear()
    const month = currentTime.getMonth() + 1
    const date = currentTime.getDate()
    const weekday = weekdays[currentTime.getDay()]
    return `${year}年${month}月${date}日 ${weekday}`
  }

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
                      欢迎回来，曾春梅，你有<span className="text-5xl font-medium text-red-500">8</span>条新的任内动态
                    </h1>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.6 }}
                  >
                    <p className="text-base font-light text-gray-600 tracking-wide">{getDateString()}</p>
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 关注领导的新闻动态 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="mt-8"
          >
            <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
              <CardContent className="px-6 py-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-medium text-gray-900 tracking-wide">关注领导动态</h2>
                  <Badge variant="outline" className="text-xs font-light">
                    {followedNews.length} 条更新
                  </Badge>
                </div>

                <div className="space-y-4">
                  {followedNews.map((news, index) => (
                    <motion.div
                      key={news.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
                      className="border-l-2 border-blue-100 pl-4 py-3 hover:border-blue-300 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 text-sm mb-1 tracking-wide">{news.title}</h3>
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
                              <span className="font-light">{news.time}</span>
                            </div>
                            <Badge variant="secondary" className="text-xs font-light bg-gray-100">
                              {news.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {followedNews.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500 font-light">暂无关注的领导动态</p>
                  </div>
                )}
                 </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  )
}
