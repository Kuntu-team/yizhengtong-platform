"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Bell, User, FileText, Star, CheckCircle, X } from "lucide-react"

interface Notification {
  id: string
  type: "leader_news" | "new_policy"
  title: string
  description: string
  time: string
  timeAgo: string
  read: boolean
  leaderId?: string
  leaderName?: string
  policyId?: string
  newsId?: string
}

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "leader_news",
    title: "张三：九江将建5个数字产业园",
    description: "您关注的张三发改委主任发布了新动态：谈数字经济3年规划，投资500亿",
    time: "2025-06-24 14:30",
    timeAgo: "2小时前",
    read: false,
    leaderId: "1",
    leaderName: "张三",
    newsId: "1",
  },
  {
    id: "notif2",
    type: "new_policy",
    title: "关于推进数字经济发展的指导意见",
    description: "国务院发布新政策，涉及数字经济发展指导意见，可能影响您的业务领域",
    time: "2025-06-24 10:00",
    timeAgo: "6小时前",
    read: false,
    policyId: "policy1",
  },
  {
    id: "notif3",
    type: "leader_news",
    title: "李四：南昌港口物流园区规划",
    description: "您关注的李四财政局长发布了新动态：介绍新港区建设，预计投资200亿",
    time: "2025-06-24 08:15",
    timeAgo: "8小时前",
    read: true,
    leaderId: "2",
    leaderName: "李四",
    newsId: "2",
  },
]

export function NotificationDropdown() {
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "leader") return notification.type === "leader_news"
    if (activeTab === "policy") return notification.type === "new_policy"
    if (activeTab === "unread") return !notification.read
    return true
  })

  const handleToggle = () => {
    setIsOpen(!isOpen)
  }

  const handleClose = () => {
    setIsOpen(false)
  }

  const handleNotificationClick = (notification: Notification) => {
    setIsOpen(false)
    if (notification.type === "leader_news" && notification.newsId) {
      router.push(`/leads/detail/${notification.newsId}`)
    } else if (notification.type === "new_policy" && notification.policyId) {
      router.push(`/policies/${notification.policyId}`)
    }
  }

  const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
  }

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={handleToggle}
        className="relative p-3 rounded-full hover:bg-gray-100 transition-all duration-300"
        aria-label="通知"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* 弹窗内容 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />

          {/* 弹窗 */}
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 shadow-2xl rounded-xl z-50">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-800">通知</h3>
                {unreadCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button onClick={handleMarkAllAsRead} className="text-xs px-2 py-1 hover:bg-gray-100 rounded">
                    全部已读
                  </button>
                )}
                <button onClick={handleClose} className="p-1 hover:bg-gray-100 rounded">
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 标签切换 */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex space-x-1">
                {[
                  { key: "all", label: "全部" },
                  { key: "unread", label: `未读${unreadCount > 0 ? ` (${unreadCount})` : ""}` },
                  { key: "leader", label: "关注" },
                  { key: "policy", label: "政策" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      activeTab === tab.key
                        ? "bg-blue-100 text-blue-600 font-semibold"
                        : "text-slate-700 hover:bg-gray-100"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 通知列表 */}
            <div className="max-h-96 overflow-y-auto">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.slice(0, 8).map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50/50 transition-colors ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          notification.type === "leader_news"
                            ? "bg-blue-100 text-blue-600"
                            : "bg-green-100 text-green-600"
                        }`}
                      >
                        {notification.type === "leader_news" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )}
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4
                            className={`text-sm font-medium text-gray-900 line-clamp-1 ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                            <span className="text-xs text-gray-500 whitespace-nowrap">{notification.timeAgo}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                          {notification.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                notification.type === "leader_news"
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {notification.type === "leader_news" ? "关注动态" : "新政策"}
                            </span>
                            {notification.leaderName && (
                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span>{notification.leaderName}</span>
                              </div>
                            )}
                          </div>
                          {notification.read && <CheckCircle className="h-3 w-3 text-green-500" />}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 px-4">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500 mb-1">
                    {activeTab === "unread"
                      ? "暂无未读通知"
                      : activeTab === "leader"
                        ? "暂无关注动态"
                        : activeTab === "policy"
                          ? "暂无新政策通知"
                          : "暂无通知"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {activeTab === "leader"
                      ? "关注感兴趣的领导获取最新动态"
                      : activeTab === "policy"
                        ? "设置关注领域接收政策更新"
                        : "有新动态时我们会及时通知您"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
