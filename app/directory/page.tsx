"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ChevronLeft, Star, User, Phone, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import Cookies from "js-cookie";

interface Person {
  id: string;
  name: string;
  position: string;
  department: string;
  region: string;
  hometown: string;
  age: number | null;
  tenure: string;
  focusAreas: string[];
  latestActivity?: string;
  avatar?: string;
  office_phone?: string;
  contact?: {
    phone?: string;
    wechat?: string;
  };
}

// 计算年龄的辅助函数
function calculateAge(birthDateString: string | undefined): number | null {
  if (!birthDateString) return null;

  // 全角字符转半角字符
  const toHalfWidth = (str: string) =>
    str
      .replace(/[！-～]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0xfee0))
      .replace(/　/g, " ");

  // 中文月份转数字
  const chineseMonths: Record<string, string> = {
    一月: "1月",
    二月: "2月",
    三月: "3月",
    四月: "4月",
    五月: "5月",
    六月: "6月",
    七月: "7月",
    八月: "8月",
    九月: "9月",
    十月: "10月",
    十一月: "11月",
    十二月: "12月",
  };

  // 统一转换所有数字为半角并处理中文月份
  let normalizedDateString = toHalfWidth(birthDateString.trim());
  for (const [cnMonth, numMonth] of Object.entries(chineseMonths)) {
    normalizedDateString = normalizedDateString.replace(
      new RegExp(cnMonth, "g"),
      numMonth
    );
  }

  // 尝试解析各种日期格式
  let birthDate: Date | null = null;

  // 1. 尝试中文日期格式 (YYYY年MM月DD日 或 YYYY年MM月)
  const chineseDateMatch = normalizedDateString.match(
    /(\d{4})\s*年\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?/
  );
  if (chineseDateMatch) {
    const year = parseInt(chineseDateMatch[1], 10);
    const month = parseInt(chineseDateMatch[2], 10) - 1; // 月份从0开始
    const day = chineseDateMatch[3] ? parseInt(chineseDateMatch[3], 10) : 1;
    birthDate = new Date(year, month, day);
  }

  // 2. 尝试ISO格式 (YYYY-MM-DD)
  if (!birthDate || isNaN(birthDate.getTime())) {
    const isoMatch = normalizedDateString.match(
      /(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/
    );
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
      birthDate = new Date(year, month, day);
    }
  }

  // 3. 尝试斜杠分隔格式 (YYYY/MM/DD 或 MM/DD/YYYY)
  if (!birthDate || isNaN(birthDate.getTime())) {
    const slashMatch = normalizedDateString.match(
      /(\d{1,4})\/(\d{1,2})(?:\/(\d{1,2}))?/
    );
    if (slashMatch) {
      let year, month, day;
      const part1 = parseInt(slashMatch[1], 10);
      const part2 = parseInt(slashMatch[2], 10);
      const part3 = slashMatch[3] ? parseInt(slashMatch[3], 10) : 1;

      // 判断是 YYYY/MM/DD 还是 MM/DD/YYYY
      if (part1 > 1900) {
        // YYYY/MM/DD 格式
        year = part1;
        month = part2 - 1;
        day = part3;
      } else {
        // MM/DD/YYYY 格式
        year = part3;
        month = part1 - 1;
        day = part2;

        // 如果月份无效，尝试交换月和日
        if (month < 0 || month > 11) {
          month = day - 1;
          day = part1;
        }
      }
      birthDate = new Date(year, month, day);
    }
  }

  // 4. 尝试点分隔格式 (YYYY.MM.DD)
  if (!birthDate || isNaN(birthDate.getTime())) {
    const dotMatch = normalizedDateString.match(
      /(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?/
    );
    if (dotMatch) {
      const year = parseInt(dotMatch[1], 10);
      const month = parseInt(dotMatch[2], 10) - 1;
      const day = dotMatch[3] ? parseInt(dotMatch[3], 10) : 1;
      birthDate = new Date(year, month, day);
    }
  }

  // 5. 最后尝试标准日期解析
  if (!birthDate || isNaN(birthDate.getTime())) {
    birthDate = new Date(normalizedDateString);
  }

  // 如果仍然无效，返回null
  if (!birthDate || isNaN(birthDate.getTime())) {
    return null;
  }

  // 计算年龄
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  // 考虑月份和日期因素
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age >= 0 ? age : null;
}

// 紧凑的人物卡片组件
function CompactPersonCard({
  person,
  isFollowed,
  onToggleFollow,
}: {
  person: Person;
  isFollowed: boolean;
  onToggleFollow: (personId: string) => void;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg p-2 sm:p-3 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-50"
      onClick={(e) => {
        const target = e.target as HTMLElement;
        if (!target.closest("button")) {
          router.push(`/directory/${person.id}`);
        }
      }}
    >
      <div className="flex items-center gap-2 sm:gap-3">
        {/* 头像 */}
        {person.avatar ? (
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder-user.jpg";
            }}
          />
        ) : (
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <User className="h-6 w-6 text-white" />
          </div>
        )}

        {/* 主要信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            {/* 第一行：姓名 */}
            <h3
              className="font-bold text-gray-900 text-base truncate max-w-[80px] sm:max-w-[120px]"
              title={person.name}
            >
              {person.name}
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFollow(person.id);
              }}
            >
              <Star
                className={`h-4 w-4 ${
                  isFollowed
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-slate-400"
                }`}
              />
            </motion.button>
          </div>

          {/* 第二行：部门、职位、地区、年龄 */}
          <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2 flex-wrap">
            <span
              className="text-sm font-medium text-gray-800 truncate max-w-[60px]"
              title={person.department}
            >
              {person.department}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span
              className="text-sm font-medium text-gray-800 truncate max-w-[60px]"
              title={person.position}
            >
              {person.position}
            </span>
            {/* <span className="text-xs text-slate-400">·</span> */}
            <span
              className="text-xs text-gray-700 truncate max-w-[60px]"
              title={person.hometown}
            >
              {person.hometown}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-gray-600">
              {person.age !== null ? `${person.age}岁` : "未知"}
            </span>
          </div>

          {/* 第三行：电话和微信 */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span
                className="text-xs text-gray-900 font-medium truncate max-w-[80px]"
                title={person.office_phone}
              >
                {person.office_phone || "暂无办公电话"}
              </span>
            </div>
            {/* 隐藏微信号显示 */}
            {/* <div className="flex items-center gap-1">
              <svg
                className="h-3 w-3 text-green-600 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              </svg>
              <span
                className="text-xs text-gray-900 font-medium truncate max-w-[80px]"
                title={person.contact?.wechat}
              >
                {person.contact?.wechat || "未提供"}
              </span>
            </div> */}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function DirectoryPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [selectedDepartment, setSelectedDepartment] =
    useState<string>("全部部门");
  const [selectedPosition, setSelectedPosition] = useState<string>("全部岗位");
  // 部门岗位联动数据 - 从API获取
  const [departmentPositions, setDepartmentPositions] = useState<
    Record<string, string[]>
  >({
    全部部门: ["全部岗位"],
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [followedPeople, setFollowedPeople] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("followed");
  const [people, setPeople] = useState<Person[]>([]);
  // Removed duplicate isLoading state declaration
  const [filterOpen, setFilterOpen] = useState(false);
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(
    null
  );
  const [regionOptions, setRegionOptions] = useState<{ code: string; name: string }[]>([]);
  const [selectedRegion, setSelectedRegion] = useState<string>("全部地区");
  const [regionDict, setRegionDict] = useState<any[]>([]);
  const businessPersonId = Cookies.get("business_person_id");
  console.log("business_person_id", businessPersonId);

  // 获取部门岗位数据
  useEffect(() => {
    async function fetchDepartmentPositions() {
      try {
        const response = await fetch("/api/departments/positions");
        if (!response.ok)
          throw new Error("Failed to fetch department positions");
        const data = await response.json();
        console.log("Fetched department positions from API:", data);
        setDepartmentPositions(data);
      } catch (error) {
        console.log("Error fetching department positions:", error);
        toast({
          title: "数据加载失败",
          description: "无法获取部门岗位数据",
          variant: "destructive",
        });
      }
    }

    fetchDepartmentPositions();
  }, [toast]);

  // 获取地区字典表
  useEffect(() => {
    fetch('/api/region-info').then(res => res.json()).then(data => setRegionDict(data.data || []));
  }, []);

  // 检查是否有筛选条件
  const hasFilter =
    selectedDepartment !== "全部部门" || selectedPosition !== "全部岗位";

  function getAllRegionNames(selectedRegion: string) {
    if (selectedRegion === '全部地区') return [];
    // 找到所有属于该省/市/区的区县名
    const lowerNames = regionDict
      .filter(d =>
        d.province_cn === selectedRegion ||
        d.city_cn === selectedRegion ||
        d.district_cn === selectedRegion
      )
      .map(d => d.district_cn || d.city_cn || d.province_cn);
    // 还要加上本身
    return [selectedRegion, ...lowerNames];
  }

  // 当前筛选下所有人（不管是否关注）——已做地区映射
  const filteredAllPeople = useMemo(() => {
    return people.filter(person => {
      let matchesRegion = true;
      if (selectedRegion !== '全部地区') {
        const regionNames = getAllRegionNames(selectedRegion);
        matchesRegion = regionNames.includes(person.region);
      }
      const matchesDepartment =
        selectedDepartment === "全部部门" ||
        person.department === selectedDepartment;
      const matchesPosition =
        selectedPosition === "全部岗位" || person.position === selectedPosition;
      return matchesRegion && matchesDepartment && matchesPosition;
    });
  }, [people, selectedRegion, selectedDepartment, selectedPosition, regionDict]);

  // 当前筛选下被关注的人
  const filteredFollowedPeople = useMemo(() => {
    return filteredAllPeople.filter((person) =>
      followedPeople.includes(person.id)
    );
  }, [filteredAllPeople, followedPeople]);

  // 页面实际渲染用的列表
  const filteredPeople = useMemo(() => {
    if (activeTab === "followed") {
      return filteredFollowedPeople;
    }
    // "all" 时已关注的优先
    return [
      ...filteredAllPeople.filter((p) => followedPeople.includes(p.id)),
      ...filteredAllPeople.filter((p) => !followedPeople.includes(p.id)),
    ];
  }, [activeTab, filteredAllPeople, filteredFollowedPeople, followedPeople]);

  // 获取人物数据
  useEffect(() => {
    let isMounted = true; // 防止组件卸载后设置状态

    async function fetchPeople() {
      try {
        // 从URL参数获取businessPersonId
        // const searchParams = new URLSearchParams(window.location.search);
        // const businessPersonId =
        //   searchParams.get("businessPersonId") ||
        //   "e7558fb6-234c-475d-82b9-79db46840389";
        const response = await fetch(
          `/api/key-persons?businessPersonId=${businessPersonId}`
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const data = await response.json();
        console.log(
          businessPersonId,
          "------",
          "Fetched key persons data:",
          data
        );
        // 获取关注表数据
        const followResponse = await fetch("/api/business-person/follow");
        if (!followResponse.ok) throw new Error("Failed to fetch follow data");
        const followData = await followResponse.json();
        console.log("查询wby_business_person_follow表全部的数据:", followData);
        // 提取关注的人员ID列表
        // 正确提取API响应中的关注人员ID数组
        const followedPersonIds = Array.isArray(followData?.followedPersonIds)
          ? followData.followedPersonIds
          : [];
        setFollowedPeople(followedPersonIds);

        // 筛选出已关注的人员数据
        const followedPersons = data.filter((item: any) =>
          followedPersonIds.includes(item.id)
        );
        console.log("已关注的人员数据:", followedPersons);

        if (isMounted) {
          const transformed = data.map((p: any) => ({
            ...p,
            age: calculateAge(p.birth_date),
            hometown: p.hometown || "",
            tenure: p.tenure || "",
            focusAreas: p.focusAreas || [],
            latestActivity: p.latestActivity || "",
            contact: {
              phone: p.phone || "",
              wechat: p.wechat || "",
            },
          }));
          setPeople(transformed);
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "加载失败",
            description: "无法获取人物数据",
            variant: "destructive",
          });
          console.log(error);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchPeople();

    return () => {
      isMounted = false;
    };
  }, [toast]);

  // 获取地区选项
  useEffect(() => {
    async function fetchRegions() {
      // 只用 /api/sales-lead/region 返回的 region_cn 字段
      const res = await fetch("/api/sales-lead/region");
      const data = await res.json();
      const options = (data.region_info || []).map((r: any) => ({
        code: r.region_code,
        name: r.region_cn
      }));
      setRegionOptions([{ code: "", name: "全部地区" }, ...options]);
    }
    fetchRegions();
  }, []);

  // 点击外部关闭筛选
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (filterOpen && !target.closest(".relative")) {
        setFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [filterOpen]);

  // 过滤人物列表
  const handleToggleFollow = useCallback(
    async (personId: string) => {
      try {
        const isFollowing = followedPeople.includes(personId);
        // 获取当前用户ID和部门代码（实际项目中需要替换为真实获取方式）
        // const businessPersonId = 'current_business_person_id'; // 应从用户认证信息中获取
        // const searchParams = new URLSearchParams(window.location.search);
        // const businessPersonId =
        //   searchParams.get("businessPersonId") ||
        //   "e7558fb6-234c-475d-82b9-79db46840389";
        const departmentCode = selectedDepartment; // 或从用户信息中获取

        if (isFollowing) {
          // 取消关注 - 调用DELETE API
          const response = await fetch("/api/business-person/follow", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              business_person_id: businessPersonId,
              followed_person_id: personId,
            }),
          });

          if (!response.ok) throw new Error("取消关注失败");

          toast({
            title: "取消关注",
            description: "已取消关注",
          });
          setFollowedPeople((prev) => prev.filter((id) => id !== personId));
        } else {
          // 关注 - 调用POST API
          if (followedPeople.length >= 10) {
            toast({
              title: "关注失败",
              description: "最多关注10位关键人物",
              variant: "destructive",
            });
            return;
          }

          const response = await fetch("/api/business-person/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              business_person_id: businessPersonId,
              followed_person_id: personId,
              department_code: departmentCode,
              follow_time: new Date().toISOString(),
            }),
          });

          if (!response.ok) throw new Error("关注失败");

          toast({
            title: "关注成功",
            description: "将在销售线索中显示其动态",
          });
          setFollowedPeople((prev) => [...prev, personId]);
        }
      } catch (error) {
        console.log("关注操作失败:", error);
        toast({
          title: "操作失败",
          description:
            error instanceof Error ? error.message : "关注/取消关注请求失败",
          variant: "destructive",
        });
      }
    },
    [toast, followedPeople, selectedDepartment]
  );

  // 选中部门时，自动高亮“全部岗位”
  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department);
    setSelectedPosition("全部岗位");
    setHoveredDepartment(null);
    setFilterOpen(false);
  };

  // 选中地区时，自动高亮“全部部门/全部岗位”
  const handleRegionSelect = (regionName: string) => {
    setSelectedRegion(regionName);
    setSelectedDepartment("全部部门");
    setSelectedPosition("全部岗位");
    setHoveredDepartment(null);
    setFilterOpen(false);
  };

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position);
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setSelectedDepartment("全部部门");
    setSelectedPosition("全部岗位");
    setSelectedRegion("全部地区");
    setFilterOpen(false);
    toast({
      title: "筛选已清除",
      description: "已重置所有筛选条件",
    });
  };

  useEffect(() => {
    async function fetchFollowedPeople() {
      // const searchParams = new URLSearchParams(window.location.search);
      // const businessPersonId =
      //   searchParams.get("businessPersonId") ||
      //   "e7558fb6-234c-475d-82b9-79db46840389";
      try {
        const res = await fetch(
          `/api/business-person/follow?businessPersonId=${businessPersonId}`
        );
        if (res.ok) {
          const data = await res.json();
          setFollowedPeople(
            Array.isArray(data.followedPersonIds) ? data.followedPersonIds : []
          );
        } else {
          setFollowedPeople([]);
        }
      } catch {
        setFollowedPeople([]);
      }
    }
    fetchFollowedPeople();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
              className="p-2 rounded-xl hover:bg-gray-100 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </motion.button>
            <h1 className="text-xl font-medium text-gray-900">人物花名册</h1>
          </div>
        </div>
      </motion.header>

      {/* Tab切换 */}
      <div className="bg-white border-b border-gray-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-200">
                <TabsTrigger
                  value="followed"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent"
                >
                  我关注的 ({filteredFollowedPeople.length})
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent"
                >
                  全部人物 ({filteredAllPeople.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 筛选按钮组 */}
            <div className="flex items-center gap-2 ml-2 sm:ml-0">
              {/* 筛选按钮 */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 border border-gray-200 bg-white hover:bg-gray-50"
                  onClick={() => setFilterOpen(!filterOpen)}
                >
                  <Filter className="h-4 w-4" />
                </Button>

                {filterOpen && (
                  <div className="absolute top-full right-0 mt-1 w-96 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                    <div className="flex">
                      {/* 地区筛选 */}
                      <div className="w-40 border-r border-gray-200">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">地区</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {regionOptions.map((region) => (
                            <div
                              key={region.code}
                              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                selectedRegion === region.name
                                  ? "bg-blue-50 text-blue-700"
                                  : "text-gray-700 hover:bg-gray-50"
                              }`}
                              onClick={() => handleRegionSelect(region.name)}
                            >
                              {region.name}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* 部门筛选 */}
                      <div className="w-40 border-r border-gray-200">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">部门</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {/* 全部部门选项 */}
                          <div
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              selectedDepartment === "全部部门"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => handleDepartmentSelect("全部部门")}
                          >
                            全部部门
                          </div>
                          {Object.keys(departmentPositions)
                            .filter((dept) => dept !== "全部部门")
                            .map((department) => (
                              <div
                                key={department}
                                className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                  hoveredDepartment === department
                                    ? "bg-blue-50 text-blue-700"
                                    : "text-gray-700 hover:bg-gray-50"
                                }`}
                                onMouseEnter={() => setHoveredDepartment(department)}
                                onClick={() => handleDepartmentSelect(department)}
                              >
                                {department}
                              </div>
                            ))}
                        </div>
                      </div>
                      {/* 职位筛选 */}
                      <div className="w-40">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">
                            {hoveredDepartment || "职位"}
                          </span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {/* 全部岗位选项 */}
                          <div
                            className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                              selectedPosition === "全部岗位"
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50"
                            }`}
                            onClick={() => handlePositionSelect("全部岗位")}
                          >
                            全部岗位
                          </div>
                          {hoveredDepartment &&
                            departmentPositions[
                              hoveredDepartment as keyof typeof departmentPositions
                            ]
                              ?.filter((pos: any) => pos !== "全部岗位")
                              .map((position: any) => (
                                <div
                                  key={position}
                                  className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                    selectedPosition === position
                                      ? "bg-blue-50 text-blue-700"
                                      : "text-gray-700 hover:bg-gray-50"
                                  }`}
                                  onClick={() => handlePositionSelect(position)}
                                >
                                  {position}
                                </div>
                              ))}
                          {!hoveredDepartment && (
                            <div className="px-3 py-2 text-sm text-gray-400">
                              请先选择部门
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 清除筛选按钮 - 只在有筛选条件时显示 */}
              {hasFilter && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 w-9 p-0 border border-gray-200 bg-white hover:bg-gray-50"
                  onClick={handleClearFilter}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 主体内容 */}
      <main className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-4">
        {isLoading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="all" className="mt-0">
              {filteredPeople.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {filteredPeople.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <CompactPersonCard
                        person={person}
                        isFollowed={followedPeople.includes(person.id)}
                        onToggleFollow={handleToggleFollow}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white border border-gray-200 shadow-sm rounded-lg"
                >
                  <User className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 mb-1 font-light">
                    没有找到符合条件的人物
                  </p>
                  <p className="text-sm text-slate-400 font-light">
                    尝试调整筛选条件
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border border-gray-200 hover:bg-gray-100 font-light"
                    onClick={handleClearFilter}
                  >
                    清除筛选
                  </Button>
                </motion.div>
              )}
            </TabsContent>

            <TabsContent value="followed" className="mt-0">
              {filteredPeople.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {filteredPeople.map((person, index) => (
                    <motion.div
                      key={person.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                    >
                      <CompactPersonCard
                        person={person}
                        isFollowed={followedPeople.includes(person.id)}
                        onToggleFollow={handleToggleFollow}
                      />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 bg-white border border-gray-200 shadow-sm rounded-lg"
                >
                  <Star className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                  <p className="text-slate-500 mb-1 font-light">
                    还没有关注任何人物
                  </p>
                  <p className="text-sm text-slate-400 font-light">
                    点击星标关注感兴趣的关键人物
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 border border-gray-200 hover:bg-gray-100 font-light"
                    onClick={() => setActiveTab("all")}
                  >
                    浏览全部人物
                  </Button>
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
