"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, User, FileText, Star, CheckCircle, X } from "lucide-react";
import axios from "axios";
import { getTimeAgo } from "@/lib/utils";

interface Notification {
  person_id: string;
  type: "leader_news";
  person_name: string;
  news_title: string;
  news_content: string;
  news_time: string;
  read: boolean;
  news_id: string;
  isFollowed: boolean;
}

// const mockNotifications: Notification[] = [
//   {
//     id: "notif1",
//     type: "leader_news",
//     title: "张三：九江将建5个数字产业园",
//     description:
//       "您关注的张三发改委主任发布了新动态：谈数字经济3年规划，投资500亿",
//     time: "2025-06-24 14:30",
//     timeAgo: "2小时前",
//     read: false,
//     leaderId: "1",
//     leaderName: "张三",
//     newsId: "1",
//   },
//   {
//     id: "notif2",
//     type: "new_policy",
//     title: "关于推进数字经济发展的指导意见",
//     description:
//       "国务院发布新政策，涉及数字经济发展指导意见，可能影响您的业务领域",
//     time: "2025-06-24 10:00",
//     timeAgo: "6小时前",
//     read: false,
//     policyId: "policy1",
//   },
//   {
//     id: "notif3",
//     type: "leader_news",
//     title: "李四：南昌港口物流园区规划",
//     description:
//       "您关注的李四财政局长发布了新动态：介绍新港区建设，预计投资200亿",
//     time: "2025-06-24 08:15",
//     timeAgo: "8小时前",
//     read: true,
//     leaderId: "2",
//     leaderName: "李四",
//     newsId: "2",
//   },
// ];

export function NotificationDropdown() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>();
  const [activeTab, setActiveTab] = useState("all");
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    fetchData();
  }, []);
  const fetchData = async () => {
    try {
      const response = await axios.get("/api/sales-lead/all");
      const fifteenDaysAgo = new Date();
      fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);

      const filtered = response.data.filter((item: any) => {
        const newsTime = new Date(item.news_time);
        return newsTime >= fifteenDaysAgo;
      });
      // setNotifications(filtered);
      console.log("最近15天的数据：", filtered);
      // 获取关注表数据
      const followResponse = await fetch("/api/business-person/follow");
      if (!followResponse.ok) throw new Error("Failed to fetch follow data");
      const followData = await followResponse.json();
      // console.log(
      //   "查询wby_business_person_follow表全部的数据:",
      //   followData.followedPersonIds
      // );
      const readResponse = await axios.get("/api/notification");
      console.log(
        "查询user_notification_read表全部的数据:",
        readResponse.data.data
      );
      const readNewsIds = new Set(
        readResponse.data.data.map((item: any) => item.news_id)
      );
      // 合并关注字段
      const filteredWithFollow = filtered.map((item: any) => ({
        ...item,
        isFollowed: followData.followedPersonIds.includes(item.person_id),
        read: readNewsIds.has(item.news_id),
      }));
      console.log("带关注字段的数据：", filteredWithFollow);
      setNotifications(filteredWithFollow);
    } catch (error) {
      console.log("请求失败:", error);
    }
  };

  const unreadCount = notifications?.filter((n) => !n.read).length;

  const filteredNotifications = notifications?.filter((notification) => {
    if (activeTab === "all") return true;
    if (activeTab === "leader") return notification.isFollowed === true;
    // if (activeTab === "policy") return notification.type === "new_policy";
    if (activeTab === "unread") return !notification.read;
    return true;
  });

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleNotificationClick = async (notification: Notification) => {
    setIsOpen(false);
    setNotifications((prev) =>
      prev?.map((n) =>
        n.news_id === notification.news_id ? { ...n, read: true } : n
      )
    );
    try {
      await axios.post("/api/notification", {
        news_id: notification.news_id,
      });
    } catch (e) {
      // 可选：失败时提示
      console.log("标记已读失败", e);
    }
    router.push(`/leads/detail/${notification.news_id}`);
  };

  // const handleMarkAsRead = (notificationId: string, e: React.MouseEvent) => {
  //   e.stopPropagation();
  //   setNotifications((prev) =>
  //     prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
  //   );
  // };

  const handleMarkAllAsRead = async () => {
    // 1. 本地全部已读
    setNotifications((prev) => prev?.map((n) => ({ ...n, read: true })));

    // 2. 找出所有未读的 news_id
    const unreadIds = notifications
      ?.filter((n) => !n.read)
      .map((n) => n.news_id);

    if (unreadIds?.length === 0) return;

    // 3. 调用后端批量标记已读接口
    try {
      await axios.post("/api/notification/batch-read", {
        news_ids: unreadIds,
      });
    } catch (e) {
      console.log("批量标记已读失败", e);
    }
  };

  return (
    <div className="relative">
      {/* 触发按钮 */}
      <button
        onClick={handleToggle}
        className="relative p-3 rounded-full hover:bg-gray-100 transition-all duration-300"
        aria-label="通知"
      >
        <Bell className="h-5 w-5 text-slate-600" />
        {unreadCount && unreadCount > 0 ? (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        ) : null}
      </button>

      {/* 弹窗内容 */}
      {isOpen && (
        <>
          {/* 遮罩层 */}
          <div className="fixed inset-0 z-40" onClick={handleClose} />
          {/* 弹窗 */}
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 shadow-2xl rounded-xl z-50  md:w-96">
            {/* 头部 */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-slate-600" />
                <h3 className="font-semibold text-slate-800">通知</h3>
                {unreadCount && unreadCount > 0 ? (
                  <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {unreadCount}
                  </span>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                {unreadCount && unreadCount > 0 ? (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="text-xs px-2 py-1 hover:bg-gray-100 rounded"
                  >
                    全部已读
                  </button>
                ) : null}
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* 标签切换 */}
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="flex space-x-1">
                {[
                  { key: "all", label: "全部" },
                  {
                    key: "unread",
                    label: `未读${
                      unreadCount && unreadCount > 0 ? ` (${unreadCount})` : ""
                    }`,
                  },
                  { key: "leader", label: "关注" },
                  // { key: "policy", label: "政策" },
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
              {filteredNotifications && filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.news_id}
                    className={`p-3 cursor-pointer border-b border-gray-100 last:border-b-0 hover:bg-blue-50/50 transition-colors ${
                      !notification.read ? "bg-blue-50/50" : ""
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-blue-100 text-blue-600`}
                      >
                        {/* {notification.type === "leader_news" ? (
                          <User className="h-4 w-4" />
                        ) : (
                          <FileText className="h-4 w-4" />
                        )} */}
                        <User className="h-4 w-4" />
                      </div>

                      {/* 内容 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-1">
                          <h4
                            className={`text-sm font-medium text-gray-900 line-clamp-1 ${
                              !notification.read ? "font-semibold" : ""
                            }`}
                          >
                            {notification.person_name +
                              "：" +
                              notification.news_title}
                          </h4>
                          <div className="flex items-center gap-1 ml-2">
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                            )}
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {getTimeAgo(notification.news_time)}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-600 line-clamp-2 mb-2 leading-relaxed">
                          {notification.news_content
                            ? notification.news_content.slice(0, 30) +
                              (notification.news_content.length > 30
                                ? "..."
                                : "")
                            : ""}
                        </p>

                        <div className="flex items-center justify-between">
                          {notification.isFollowed ? (
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-600`}
                              >
                                {/* {notification.type === "leader_news"
                                ? "关注动态"
                                : "新政策"} */}
                                关注动态
                              </span>

                              <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                                <span>{notification.person_name}</span>
                              </div>
                            </div>
                          ) : (
                            <div></div>
                          )}
                          {notification.read && (
                            <CheckCircle className="h-3 w-3 text-green-500" />
                          )}
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
  );
}
