"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppLayout } from "@/components/app-layout";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, User, Lock, MessageCircle, QrCode } from "lucide-react";
import { motion } from "framer-motion";
import axios from "axios";

interface UserType {
  business_person_id: string;
  business_person_name: string;
  phone_number: string;
  position: string;
  staff_id: string;
  department: string;
  manager_name: string;
  wechatId?: string;
}

const formatPhone = (phone: string) => {
  if (!phone) return "";
  const cleaned = phone.replace(/\D/g, "");
  return `${cleaned.slice(0, 3)}****${cleaned.slice(7)}`;
};

const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "刚刚";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;

  return date.toLocaleDateString("zh-CN");
};

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [isWechatDialogOpen, setIsWechatDialogOpen] = useState(false);
  const [wechatId, setWechatId] = useState("");
  const [isBindingWechat, setIsBindingWechat] = useState(false);
  const [showQrCode, setShowQrCode] = useState(false);
  const [regions, setRegions] = useState("");
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    getRegionData();
    const userInfo = localStorage.getItem("user_yk");
    if (userInfo) {
      try {
        const userData = JSON.parse(userInfo);
        console.log("User data from localStorage:", userData);
        setUser(userData);
        setWechatId(userData.wechatId || "");
      } catch (error) {
        console.log("Error parsing user data:", error);
        setDefaultUser();
      }
    } else {
      console.log("No user data found, setting default");
      setDefaultUser();
    }
  }, []);
  const getRegionData = async () => {
    try {
      const response = await axios.get("api/sales-lead/region");
      if (response.data.region_info.length > 0) {
        const regionStr = response.data.region_info
          .map((info: any) => info.region_cn)
          .join("、");
        setRegions(regionStr);
      }
    } catch (error) {
      console.log("请求失败:", error);
    }
  };
  const setDefaultUser = () => {
    const defaultUser = {
      business_person_id: "default",
      business_person_name: "默认王商务",
      phone_number: "默认13800138000",
      position: "默认商务经理",
      staff_id: "默认EMP001",
      department: "默认华东销售团队",
      manager_name: "默认李总监",
    };
    setUser(defaultUser);
    localStorage.setItem("userInfo", JSON.stringify(defaultUser));
    console.log("Default user set:", defaultUser);
  };

  const handleBack = () => {
    router.back();
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  };

  const handleWechatBind = async () => {
    if (!wechatId.trim()) {
      toast({
        title: "请输入微信号",
        description: "微信号不能为空",
        variant: "destructive",
      });
      return;
    }

    setIsBindingWechat(true);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const updatedUser = { ...user!, wechatId: wechatId.trim() };
    setUser(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    toast({
      title: "微信绑定成功",
      description: `已成功绑定微信号：${wechatId.trim()}`,
    });

    setIsBindingWechat(false);
    setIsWechatDialogOpen(false);
  };

  const handleWechatUnbind = async () => {
    setIsBindingWechat(true);

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const updatedUser = { ...user!, wechatId: "" };
    setUser(updatedUser);
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));

    toast({
      title: "微信解绑成功",
      description: "已成功解绑微信号",
    });

    setIsBindingWechat(false);
    setWechatId("");
  };

  const generateQrCode = () => {
    setShowQrCode(true);
    // 模拟二维码生成延迟
    setTimeout(() => {
      setShowQrCode(false);
      toast({
        title: "扫码绑定",
        description: "请使用微信扫描二维码完成绑定",
      });
    }, 3000);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 mb-8"
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </motion.button>
          <h1 className="text-2xl font-light text-slate-800 tracking-wide">
            个人中心
          </h1>
        </motion.div>

        {/* 基本信息和工作信息合并 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardContent className="p-6">
              <div className="space-y-8">
                {/* 基本信息部分 */}
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <div>
                    <p className="text-xl font-light text-slate-800 mb-1 tracking-wide">
                      {user?.business_person_name || "加载中..."}
                    </p>
                    <p className="text-base text-slate-500 font-light">
                      {user?.phone_number
                        ? formatPhone(user.phone_number)
                        : "加载中..."}
                    </p>
                  </div>
                </div>

                {/* 工作信息部分 */}
                <div className="space-y-4 text-base">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <span className="text-slate-500 font-light">工号：</span>
                      <span className="ml-2 font-medium text-slate-800">
                        {user?.staff_id || "加载中..."}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light">角色：</span>
                      <span className="ml-2 font-medium text-slate-800">
                        {user?.position || "加载中..."}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light">
                        上级主管：
                      </span>
                      <span className="ml-2 font-medium text-slate-800">
                        {user?.manager_name || "加载中..."}
                      </span>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <span className="text-slate-500 font-light">
                        所属团队：
                      </span>
                      <span className="ml-2 font-medium text-slate-800">
                        {user?.department || "加载中..."}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 font-light">
                        负责区域：
                      </span>
                      <span className="ml-2 font-medium text-slate-800">
                        {regions || "加载中..."}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 账号安全 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <Card className="bg-white border border-gray-200 shadow-sm rounded-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-light text-slate-800 tracking-wide">
                账号安全
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-800">登录密码</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleChangePassword}
                    disabled
                  >
                    修改密码
                  </Button>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-slate-500" />
                    <div>
                      <p className="font-medium text-slate-800">微信绑定</p>
                      <p className="text-sm text-slate-500">
                        {user?.wechatId
                          ? `已绑定：${user.wechatId}`
                          : "绑定微信号可以接收重要通知"}
                      </p>
                    </div>
                  </div>
                  <Dialog
                    open={isWechatDialogOpen}
                    onOpenChange={setIsWechatDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" disabled>
                        {user?.wechatId ? "管理绑定" : "绑定微信"}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>
                          {user?.wechatId ? "管理微信绑定" : "绑定微信号"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        {user?.wechatId ? (
                          <div className="space-y-4">
                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm text-green-800">
                                当前已绑定微信号：
                                <span className="font-medium">
                                  {user.wechatId}
                                </span>
                              </p>
                            </div>
                            <div className="space-y-3">
                              <div>
                                <Label htmlFor="newWechatId">更换微信号</Label>
                                <Input
                                  id="newWechatId"
                                  value={wechatId}
                                  onChange={(e) => setWechatId(e.target.value)}
                                  placeholder="请输入新的微信号"
                                />
                              </div>
                              <div className="flex gap-3">
                                <Button
                                  variant="outline"
                                  onClick={handleWechatUnbind}
                                  disabled={isBindingWechat}
                                  className="flex-1 bg-transparent"
                                >
                                  {isBindingWechat ? "处理中..." : "解绑微信"}
                                </Button>
                                <Button
                                  onClick={handleWechatBind}
                                  disabled={isBindingWechat || !wechatId.trim()}
                                  className="flex-1"
                                >
                                  {isBindingWechat ? "绑定中..." : "更换绑定"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="wechatId">微信号</Label>
                              <Input
                                id="wechatId"
                                value={wechatId}
                                onChange={(e) => setWechatId(e.target.value)}
                                placeholder="请输入您的微信号"
                              />
                            </div>
                            <div className="flex gap-3">
                              <Button
                                variant="outline"
                                onClick={generateQrCode}
                                disabled={showQrCode}
                                className="flex-1 bg-transparent"
                              >
                                <QrCode className="h-4 w-4 mr-2" />
                                {showQrCode ? "生成中..." : "扫码绑定"}
                              </Button>
                              <Button
                                onClick={handleWechatBind}
                                disabled={isBindingWechat || !wechatId.trim()}
                                className="flex-1"
                              >
                                {isBindingWechat ? "绑定中..." : "确认绑定"}
                              </Button>
                            </div>
                            <p className="text-xs text-slate-500 text-center">
                              绑定后可以接收系统通知和重要消息提醒
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AppLayout>
  );
}
