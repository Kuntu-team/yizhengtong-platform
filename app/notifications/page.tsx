"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppLayout } from "@/components/app-layout";
import {
  Bell,
  User,
  FileText,
  ChevronLeft,
  Star,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Notification {
  id: string;
  type: "leader_news" | "new_policy";
  title: string;
  description: string;
  time: string;
  timeAgo: string;
  read: boolean;
  leaderId?: string;
  leaderName?: string;
  policyId?: string;
  newsId?: string;
  avatar?: string;
}

const mockNotifications: Notification[] = [
  {
    id: "notif1",
    type: "leader_news",
    title: "张三：九江将建5个数字产业园",
    description:
      "您关注的张三发改委主任发布了新动态：谈数字经济3年规划，投资500亿",
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
    description:
      "国务院发布新政策，涉及数字经济发展指导意见，可能影响您的业务领域",
    time: "2025-06-24 10:00",
    timeAgo: "6小时前",
    read: false,
    policyId: "policy1",
  },
  {
    id: "notif3",
    type: "leader_news",
    title: "李四：南昌港口物流园区规划",
    description:
      "您关注的李四财政局长发布了新动态：介绍新港区建设，预计投资200亿",
    time: "2025-06-24 08:15",
    timeAgo: "8小时前",
    read: true,
    leaderId: "2",
    leaderName: "李四",
    newsId: "2",
  },
  {
    id: "notif4",
    type: "new_policy",
    title: "绿色低碳发展实施方案",
    description: "生态环境部发布绿色低碳发展实施方案，关注环保和碳中和相关政策",
    time: "2025-06-23 16:20",
    timeAgo: "昨天",
    read: true,
    policyId: "policy3",
  },
  {
    id: "notif5",
    type: "leader_news",
    title: "王五：宜春教育城项目启动",
    description: "您关注的王五市长发布了新动态：宣布新建3所高校，总投资150亿",
    time: "2025-06-23 14:45",
    timeAgo: "昨天",
    read: true,
    leaderId: "3",
    leaderName: "王五",
    newsId: "3",
  },
  {
    id: "notif6",
    type: "leader_news",
    title: "张三：九江发改委主任 → 省发改委副主任",
    description: "您关注的张三有人事变动：主导过多个重大项目，熟悉投融资政策",
    time: "2025-06-22 09:30",
    timeAgo: "2天前",
    read: true,
    leaderId: "1",
    leaderName: "张三",
    newsId: "4",
  },
  // 添加更多通知以展示完整列表
  {
    id: "notif7",
    type: "new_policy",
    title: "制造业数字化转型行动方案",
    description:
      "工信部发布制造业���字化转型行动方案，推动传统制造业向智能制造转型",
    time: "2025-06-21 15:20",
    timeAgo: "3天前",
    read: true,
    policyId: "policy4",
  },
  {
    id: "notif8",
    type: "leader_news",
    title: "赵六：上饶副市长调任九江市委副书记",
    description: "您关注的赵六有人事变动：城建领域专家，主导过多个大型基建项目",
    time: "2025-06-20 11:45",
    timeAgo: "4天前",
    read: true,
    leaderId: "4",
    leaderName: "赵六",
    newsId: "5",
  },
];

function NotificationCard({
  notification,
  onRead,
  onClick,
}: {
  notification: Notification;
  onRead: (id: string) => void;
  onClick: (notification: Notification) => void;
}) {
  const handleClick = () => {
    if (!notification.read) {
      onRead(notification.id);
    }
    onClick(notification);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      transition={{ duration: 0.2 }}
      className={`bg-white border border-gray-200 shadow-sm rounded-lg p-4 cursor-pointer hover:shadow-apple-lg transition-all duration-300 ${
        !notification.read ? "border-blue-200/50 bg-blue-50/30" : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        {/* 图标 */}
        <div
          className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            notification.type === "leader_news"
              ? "bg-gradient-to-br from-blue-400 to-blue-600"
              : "bg-gradient-to-br from-green-400 to-green-600"
          }`}
        >
          {notification.type === "leader_news" ? (
            <User className="h-5 w-5 text-white" />
          ) : (
            <FileText className="h-5 w-5 text-white" />
          )}
        </div>

        {/* 内容 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <h3
              className={`font-medium text-slate-800 line-clamp-1 ${
                !notification.read ? "font-semibold" : ""
              }`}
            >
              {notification.title}
            </h3>
            <div className="flex items-center gap-2 ml-2">
              {!notification.read && (
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              )}
              <span className="text-xs text-slate-500 whitespace-nowrap">
                {notification.timeAgo}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 line-clamp-2 mb-3 font-light leading-relaxed">
            {notification.description}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge
                variant={
                  notification.type === "leader_news" ? "default" : "secondary"
                }
                className="text-xs font-light"
              >
                {notification.type === "leader_news" ? "关注动态" : "新政策"}
              </Badge>
              {notification.leaderName && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <span>{notification.leaderName}</span>
                </div>
              )}
            </div>
            {notification.read && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] =
    useState<Notification[]>(mockNotifications);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "leader") return notification.type === "leader_news";
    if (activeTab === "policy") return notification.type === "new_policy";
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  const handleNotificationClick = (notification: Notification) => {
    if (notification.type === "leader_news" && notification.newsId) {
      // 跳转到对应的新闻详情页
      router.push(`/leads/detail/${notification.newsId}`);
    } else if (notification.type === "new_policy" && notification.policyId) {
      // 跳转到对应的政策详情页
      router.push(`/policies/${notification.policyId}`);
    }
  };

  const handleMarkAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <AppLayout hideNavigation={true}>
      {/* Apple风格页面头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="p-2 glass rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </motion.button>
            <div className="flex items-center gap-3">
              <Bell className="h-5 w-5 text-slate-600" />
              <h1 className="text-xl font-light text-slate-800 tracking-wide">
                通知中心
              </h1>
              {unreadCount > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium"
                >
                  {unreadCount}
                </motion.span>
              )}
            </div>
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="font-light hover:bg-white/20"
            >
              全部已读
            </Button>
          )}
        </div>
      </motion.header>

      {/* 标签切换 */}
      <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
        <div className="px-6 max-w-6xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full h-12 rounded-none bg-transparent border-0 p-0">
              <TabsTrigger
                value="all"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                全部 ({notifications.length})
              </TabsTrigger>
              <TabsTrigger
                value="unread"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                未读 ({unreadCount})
              </TabsTrigger>
              <TabsTrigger
                value="leader"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                关注动态 (
                {notifications.filter((n) => n.type === "leader_news").length})
              </TabsTrigger>
              <TabsTrigger
                value="policy"
                className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
              >
                新政策 (
                {notifications.filter((n) => n.type === "new_policy").length})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* 通知列表 */}
      <main className="max-w-6xl mx-auto px-6 py-8 bg-white">
        {filteredNotifications.length > 0 ? (
          <div className="space-y-4">
            <AnimatePresence>
              {filteredNotifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NotificationCard
                    notification={notification}
                    onRead={handleMarkAsRead}
                    onClick={handleNotificationClick}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-white border border-gray-200 shadow-sm rounded-lg"
          >
            <Bell className="h-16 w-16 text-slate-400 mx-auto mb-6" />
            <p className="text-slate-500 mb-2 font-light text-lg">
              {activeTab === "unread"
                ? "暂无未读通知"
                : activeTab === "leader"
                ? "暂无关注动态"
                : activeTab === "policy"
                ? "暂无新政策通知"
                : "暂无通知"}
            </p>
            <p className="text-sm text-slate-400 font-light">
              {activeTab === "leader"
                ? "关注感兴趣的领导，第一时间获取他们的最新动态"
                : activeTab === "policy"
                ? "设置关注领域，及时接收相关政策更新"
                : "当有新的动态或政策时，我们会及时通知您"}
            </p>
            {activeTab === "leader" && (
              <Button
                variant="outline"
                className="mt-6 glass border-white/20 hover:bg-white/30 font-light"
                onClick={() => router.push("/directory")}
              >
                去关注领导
              </Button>
            )}
            {activeTab === "policy" && (
              <Button
                variant="outline"
                className="mt-6 glass border-white/20 hover:bg-white/30 font-light"
                onClick={() => router.push("/policies")}
              >
                设置关注领域
              </Button>
            )}
          </motion.div>
        )}
      </main>
    </AppLayout>
  );
}
