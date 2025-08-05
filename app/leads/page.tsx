"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Filter, ChevronDown, Loader2, X, ChevronLeft } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import axios from "axios";
import { getTimeAgo } from "@/lib/utils";
import { Suspense } from "react";
import { Pagination } from "antd";

// 检测设备类型的hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener("resize", checkIsMobile);

    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return isMobile;
};

interface LeadItem {
  created_time: string; // 创建时间，ISO 格式字符串
  data_status: string; // 数据状态，字符串表示
  news_city_cn: string; // 新闻所在城市中文名称
  news_city_code: string; // 新闻所在城市编码
  news_content: string; // 新闻内容
  news_district_cn: string; // 新闻所在区中文名称
  news_district_code: string; // 新闻所在区编码
  news_id: string; // 新闻唯一标识
  news_region_code: string; // 新闻所在地区编码
  news_province_cn: string; // 新闻所在省份中文名称
  news_province_code: string; // 新闻所在省份编码
  news_source: string; // 新闻来源
  news_time: string; // 新闻发布时间，ISO 格式字符串
  news_title: string; // 新闻标题
  news_url: string; // 新闻链接地址
  person_id: string; // 人物唯一标识
  person_name: string; // 人物姓名
  tags_name: string; // 标签名称，多个标签用逗号分隔
  updated_time: string; // 更新时间，ISO 格式字符串
}

interface Region {
  region_code: string;
  region_cn: string;
}

interface Person {
  person_id: string;
  person_name: string;
  position: string;
  region_cn: string;
  department: string;
}
export default function LeadsPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <MainContent />
    </Suspense>
  );
}

function MainContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useIsMobile();

  // 所有Hook顶层声明
  const [followedPersonIds, setFollowedPersonIds] = useState<string[]>([]);
  const [personIdParam, setPersonIdParam] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("internal");
  const [regions, setRegions] = useState<Region[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [ready, setReady] = useState(false);
  const [duringTenureData, setDuringTenureData] = useState<any[]>([]);
  const [outsideTermData, setOutsideTermData] = useState<any[]>([]);
  const [personFilteredData, setPersonFilteredData] = useState<any[]>([]);

  // PC端分页相关状态
  const [pcInternalPage, setPcInternalPage] = useState(1);
  const [pcExternalPage, setPcExternalPage] = useState(1);
  const [pcInternalTotal, setPcInternalTotal] = useState(0);
  const [pcExternalTotal, setPcExternalTotal] = useState(0);

  useEffect(() => {
    const followedPersonIdsParam = searchParams.get("followedPersonIds");

    setPersonIdParam(searchParams.get("person_id") || null);
    if (followedPersonIdsParam) {
      setFollowedPersonIds(JSON.parse(followedPersonIdsParam));
    } else {
      setFollowedPersonIds([]);
    }
    setReady(true);
  }, [searchParams]);

  const activeFilterCount = selectedRegions.length + selectedPeople.length;

  useEffect(() => {
    const saved = localStorage.getItem("salesLeadFilters");
    console.log(saved);

    if (saved) {
      try {
        const { regions, people } = JSON.parse(saved);
        setSelectedRegions(regions || []);
        setSelectedPeople(people || []);
      } catch (error) {
        // console.log("Failed to parse saved filters:", error)
      }
    }
    // fetchData();
    getSelectData();
  }, []);

  // 初始化完成后获取第一页数据
  useEffect(() => {
    if (ready && !internalLoading && !externalLoading) {
      console.log("Component ready, fetching initial data...");
      if (activeTab === "internal") {
        fetchPcInternalData(1);
      } else {
        fetchPcExternalData(1);
      }
    }
  }, [ready, activeTab]);

  const filteredData = useMemo(() => {
    // 根据当前 tab 选择数据源
    let data = [];
    if (activeTab === "internal") {
      data = duringTenureData;
    } else {
      data = outsideTermData;
    }
    return data;
  }, [
    selectedRegions,
    selectedPeople,
    duringTenureData,
    outsideTermData,
    personIdParam,
    followedPersonIds,
    activeTab,
  ]);
  // const fetchData = async (page: number = 1) => {
  //   try {
  //     const [response, response1] = await Promise.all([
  //       axios.get("/api/sales-lead"),
  //       axios.get("/api/term?page=1&pageSize=20"),
  //     ]);
  //     setDuringTenureData(response.data);
  //     setFilteredItems(response.data);
  //     setOutsideTermData(response1.data.data);
  //   } catch (error) {
  //     console.log("请求失败:", error);
  //   }
  // };
  // const [internalPage, setInternalPage] = useState(1);
  // const [externalPage, setExternalPage] = useState(1);
  // const [internalData, setInternalData] = useState<LeadItem[]>([]);
  // const [externalData, setExternalData] = useState<LeadItem[]>([]);
  const [internalHasMore, setInternalHasMore] = useState(true);
  const [externalHasMore, setExternalHasMore] = useState(true);
  const [internalLoading, setInternalLoading] = useState(false);
  const [externalLoading, setExternalLoading] = useState(false);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: any[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // PC端获取内部数据
  const fetchPcInternalData = async (page = 1) => {
    // 防止重复请求
    if (internalLoading) {
      console.log("Internal request already in progress, skipping...");
      return;
    }

    if (isMobile) {
      setInternalLoading(true);
    }
    try {
      // 构建筛选参数
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });
      const saved = localStorage.getItem("salesLeadFilters");
      console.log(saved);
      if (saved) {
        const { regions, people } = JSON.parse(saved);
        if (regions.length > 0) {
          params.append("regions", regions.join(","));
        }
        if (people.length > 0) {
          params.append("people", people.join(","));
        }
      }
      // 添加personIdParam和followedPersonIds筛选参数
      if (personIdParam) {
        params.append("person_id", personIdParam);
      } else if (followedPersonIds && followedPersonIds.length > 0) {
        params.append("person_ids", followedPersonIds.join(","));
      }
      const res = await axios.get(`/api/sales-lead?${params.toString()}`);
      const data = res.data.data || [];
      console.log(data);

      // 根据设备类型和页码处理数据
      if (isMobile) {
        // 手机端：第一页替换，后续页面追加
        if (page === 1) {
          setDuringTenureData(data);
        } else {
          setDuringTenureData((prev) => [...prev, ...data]);
        }
        setInternalHasMore(data.length === 10);
      } else {
        // PC端：总是替换数据（分页模式）
        setDuringTenureData(data);
      }

      setPcInternalTotal(res.data.total || 0);
    } catch (error) {
      console.log("Error fetching internal data:", error);
      // 请求失败时，重置hasMore状态，防止无限重试
      if (isMobile) {
        setInternalHasMore(false);
      }
    } finally {
      if (isMobile) {
        setInternalLoading(false);
      }
    }
  };

  // PC端获取外部数据
  const fetchPcExternalData = async (page = 1) => {
    // 防止重复请求
    if (externalLoading) {
      console.log("External request already in progress, skipping...");
      return;
    }

    if (isMobile) {
      setExternalLoading(true);
    }
    try {
      // 构建筛选参数
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "10",
      });

      const saved = localStorage.getItem("salesLeadFilters");
      console.log(saved);
      if (saved) {
        const { regions, people } = JSON.parse(saved);
        if (regions.length > 0) {
          params.append("regions", regions.join(","));
        }
        // if (people.length > 0) {
        //   params.append("people", people.join(","));
        // }
      }

      const res = await axios.get(`/api/term?${params.toString()}`);
      // const res = await axios.get(`/api/term?page=${page}&pageSize=10`);
      const data = res.data.data || [];
      console.log("External data received:", data.length, "items");

      // 根据设备类型和页码处理数据
      if (isMobile) {
        // 手机端：第一页替换，后续页面追加
        if (page === 1) {
          setOutsideTermData(data);
        } else {
          setOutsideTermData((prev) => [...prev, ...data]);
        }
        setExternalHasMore(data.length === 10);
      } else {
        // PC端：总是替换数据（分页模式）
        setOutsideTermData(data);
      }

      setPcExternalTotal(res.data.total || 0);
    } catch (error) {
      console.log("Error fetching external data:", error);
      // 请求失败时，重置hasMore状态，防止无限重试
      if (isMobile) {
        setExternalHasMore(false);
      }
    } finally {
      if (isMobile) {
        setExternalLoading(false);
      }
    }
  };

  // 检查是否到达底部
  const isNearBottom = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    return scrollTop + windowHeight >= documentHeight - 200; // 提前200px触发
  };

  useEffect(() => {
    console.log("Active Tab Changed:", activeTab);

    const handleScroll = debounce(() => {
      // 只在手机端启用滚动加载
      if (!isMobile) return;

      // 检查是否到达底部
      if (!isNearBottom()) return;

      if (activeTab === "internal" && internalHasMore && !internalLoading) {
        // 防止重复请求
        setPcInternalPage((prevPage) => {
          if (prevPage === pcInternalPage) {
            return prevPage + 1;
          }
          return prevPage;
        });
      }

      if (activeTab === "external" && externalHasMore && !externalLoading) {
        console.log("External Scroll Triggered", pcExternalPage);

        // 防止重复请求
        setPcExternalPage((prevPage) => {
          if (prevPage === pcExternalPage) {
            return prevPage + 1;
          }
          return prevPage;
        });
      }
    }, 200); // 200ms防抖

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    activeTab,
    internalHasMore,
    externalHasMore,
    internalLoading,
    externalLoading,
    isMobile,
    pcInternalPage,
    pcExternalPage,
  ]);

  useEffect(() => {
    // 防止在组件初始化时重复请求
    if (!ready) return;
    // 当页码变化时获取数据
    if (activeTab === "internal") {
      fetchPcInternalData(pcInternalPage);
    }
    if (activeTab === "external") {
      fetchPcExternalData(pcExternalPage);
    }
  }, [pcInternalPage, pcExternalPage, activeTab, ready]);

  // 筛选条件变化时重置分页并重新获取数据
  useEffect(() => {
    if (!ready) return;

    console.log("Filter conditions changed, resetting pagination...");

    if (activeTab === "internal") {
      setPcInternalPage(1);
      setDuringTenureData([]);
      setInternalHasMore(true);
      // 立即获取新数据
      setTimeout(() => fetchPcInternalData(1), 0);
    } else {
      setPcExternalPage(1);
      setOutsideTermData([]);
      setExternalHasMore(true);
      // 立即获取新数据
      setTimeout(() => fetchPcExternalData(1), 0);
    }
  }, [
    selectedRegions,
    selectedPeople,
    personIdParam,
    followedPersonIds,
    activeTab,
    ready,
  ]);
  const loading = activeTab === "internal" ? internalLoading : externalLoading;
  const hasMore = activeTab === "internal" ? internalHasMore : externalHasMore;
  const getSelectData = async () => {
    try {
      const response = await axios.get("api/sales-lead/region");
      console.log(response.data);
      if (response.data.region_info.length > 0) {
        setRegions(
          response.data.region_info.map((item: any) => ({
            region_code: item.region_code,
            region_cn: item.region_cn,
          }))
        );
        setPeople(
          response.data.person_info.map((item: any) => ({
            person_id: item.person_id,
            person_name: item.person_name,
            position: item.position,
            region_cn: item.region_cn,
            department: item.department,
          }))
        );
      }
      // setRegions(response.data.region_info);
    } catch (error) {
      console.log("请求失败:", error);
    }
  };

  const handleItemClick = (item: LeadItem) => {
    if (item.person_name) {
      router.push(`/leads/detail/${item.news_id}`);
    } else {
      router.push(`/leads/detail-external/${item.news_id}`);
    }
  };
  const clearFilters = () => {
    setSelectedRegions([]);
    setSelectedPeople([]);

    // 清除localStorage中的筛选条件
    localStorage.removeItem("salesLeadFilters");

    // 重置分页状态
    if (activeTab === "internal") {
      setPcInternalPage(1);
      setDuringTenureData([]);
      setInternalHasMore(true);
    } else {
      setPcExternalPage(1);
      setOutsideTermData([]);
      setExternalHasMore(true);
    }
  };
  const handleRegionChange = (regionId: string, checked: boolean) => {
    console.log("Region Change:", regionId, checked);
    console.log(selectedRegions);
    const saved = localStorage.getItem("salesLeadFilters");
    console.log(saved);

    if (saved) {
      const { regions, people } = JSON.parse(saved);
      let newRegions = [];
      if (checked) {
        newRegions = [...regions, regionId];
      } else {
        newRegions = regions.filter((r: string) => r !== regionId);
      }
      setSelectedRegions(newRegions);
      localStorage.setItem(
        "salesLeadFilters",
        JSON.stringify({
          regions: newRegions,
          people: people,
        })
      );
    } else {
      setSelectedRegions([regionId]);
      localStorage.setItem(
        "salesLeadFilters",
        JSON.stringify({
          regions: [regionId],
          people: [],
        })
      );
    }

    // 重置分页状态
    if (activeTab === "internal") {
      setPcInternalPage(1);
      setDuringTenureData([]);
    } else {
      setPcExternalPage(1);
      setOutsideTermData([]);
    }
  };

  const handlePersonChange = (personId: string) => {
    const newPeople = selectedPeople.includes(personId)
      ? selectedPeople.filter((p) => p !== personId)
      : [...selectedPeople, personId];

    setSelectedPeople(newPeople);

    // 保存到localStorage
    localStorage.setItem(
      "salesLeadFilters",
      JSON.stringify({
        regions: selectedRegions,
        people: newPeople,
      })
    );

    // 重置分页状态（只有任内数据支持按人物筛选）
    if (activeTab === "internal") {
      setPcInternalPage(1);
      setDuringTenureData([]);
    }
    // 任外数据不支持按人物筛选，所以不需要重置
  };

  // PC端分页处理函数
  const handlePcInternalPageChange = (page: number) => {
    setPcInternalPage(page);
  };

  const handlePcExternalPageChange = (page: number) => {
    setPcExternalPage(page);
  };

  if (!ready) {
    // SSR和客户端初次渲染时都渲染空内容，避免hydration mismatch
    return <div />;
  }
  return (
    <div className="min-h-screen bg-white">
      {/* Apple风格顶部导航 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 fixed top-0 w-full z-50"
      >
        <div className="h-16 px-6 flex items-center justify-between mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                router.back();
                localStorage.removeItem("salesLeadFilters");
              }}
              className="p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
            >
              <ChevronLeft className="h-5 w-5 text-slate-600" />
            </motion.button>
            <h1 className="text-xl font-light text-slate-800 tracking-wide">
              销售线索
            </h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilterOpen(!filterOpen)}
            className="relative rounded-lg p-3 text-slate-700 font-light hover:bg-white/30 transition-all duration-200"
          >
            <Filter className="h-4 w-4" />
            {activeFilterCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium"
              >
                {activeFilterCount}
              </motion.span>
            )}
          </motion.button>
        </div>
      </motion.header>

      {/* 主体内容区 */}
      <main className="pt-16">
        {/* 筛选面板 */}
        <AnimatePresence>
          {filterOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white border-b border-gray-200 overflow-hidden sticky top-16 z-50"
            >
              <div className="px-6 py-6 space-y-6 max-w-6xl mx-auto sm:mx-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 地区筛选 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-3 block tracking-wide">
                      地区
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border border-gray-200 font-light"
                        >
                          <span className="text-sm">
                            {selectedRegions.length > 0
                              ? `已选择 ${selectedRegions.length} 个地区`
                              : "选择地区"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-sm rounded-lg">
                        <Command>
                          <CommandInput
                            placeholder="搜索地区..."
                            className="border-0"
                          />
                          <CommandList>
                            <CommandEmpty>未找到相关地区</CommandEmpty>
                            <CommandGroup className="max-h-48 overflow-auto">
                              {regions.map((region) => (
                                <CommandItem
                                  key={region.region_code}
                                  onSelect={() =>
                                    handleRegionChange(
                                      region.region_code,
                                      !selectedRegions.includes(
                                        region.region_code
                                      )
                                    )
                                  }
                                  className="cursor-pointer hover:bg-white/20"
                                >
                                  <Checkbox
                                    checked={selectedRegions.includes(
                                      region.region_code
                                    )}
                                    className="mr-3"
                                  />
                                  <span className="font-light">
                                    {region.region_cn}
                                  </span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* 关键人物筛选 */}
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-3 block tracking-wide">
                      关键人物
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border border-gray-200 font-light"
                        >
                          <span className="text-sm">
                            {selectedPeople.length > 0
                              ? `已选择 ${selectedPeople.length} 人`
                              : "选择关键人物"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-sm rounded-lg">
                        <Command>
                          <CommandInput
                            placeholder="搜索人物..."
                            className="border-0"
                          />
                          <CommandList>
                            <CommandEmpty>未找到相关人物</CommandEmpty>
                            <CommandGroup className="max-h-48 overflow-auto">
                              {people.map((person) => (
                                <CommandItem
                                  key={person.person_id}
                                  onSelect={() =>
                                    handlePersonChange(person.person_id)
                                  }
                                  className="cursor-pointer hover:bg-white/20"
                                >
                                  <Checkbox
                                    checked={selectedPeople.includes(
                                      person.person_id
                                    )}
                                    className="mr-3"
                                  />
                                  <div className="flex-1">
                                    <span className="font-light">
                                      {person.person_name}
                                    </span>
                                    <span className="text-xs text-slate-500 ml-2 font-light">
                                      {person.region_cn +
                                        person.department +
                                        person.position}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/*    选择的筛选条件 */}
                {(selectedRegions.length > 0 || selectedPeople.length > 0) && (
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-3 block tracking-wide">
                      已选择的筛选条件
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedRegions.map((regionId) => {
                        const region = regions.find(
                          (r) => r.region_code === regionId
                        );
                        return (
                          <motion.div
                            key={regionId}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-slate-200 bg-white border border-gray-200 font-light"
                              onClick={() =>
                                handleRegionChange(regionId, false)
                              }
                            >
                              {region?.region_cn}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          </motion.div>
                        );
                      })}
                      {selectedPeople.map((personId) => {
                        const person = people.find(
                          (p) => p.person_id === personId
                        );
                        return (
                          <motion.div
                            key={personId}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                          >
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-slate-200 bg-white border border-gray-200 font-light"
                              onClick={() => handlePersonChange(personId)}
                            >
                              {person?.person_name}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 操作按钮 */}
                <div className="flex justify-between items-center pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    disabled={activeFilterCount === 0}
                    className="font-light hover:bg-white/20"
                  >
                    清除筛选
                  </Button>
                  <div className="text-sm text-slate-500 font-light">
                    共 {filteredData.length} 条线索
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签切换 */}
        <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
          <div className="px-6 mx-auto">
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="w-full h-12 rounded-none bg-transparent border-0 p-0">
                <TabsTrigger
                  value="internal"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
                >
                  任内
                </TabsTrigger>
                <TabsTrigger
                  value="external"
                  className="flex-1 data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:text-blue-600 data-[state=active]:font-semibold rounded-none h-full text-base font-medium text-slate-700"
                >
                  任外
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* 列表内容 */}
        <div className="px-6 mx-auto">
          {filteredData.length > 0 ? (
            <motion.div
              className="divide-y divide-white/20 mb-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredData.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg my-4 p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 leading-relaxed tracking-wide">
                        {item.person_name
                          ? item.person_name + "：" + item.news_title
                          : item.news_title}
                      </h3>
                    </div>
                    {/* <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{item.news_source}</span>
                        <span>•</span>
                        <span>{getTimeAgo(item.news_time)}</span>
                      </div>
                      <div className="text-base text-slate-600">
                        <span className="font-medium">商务抓手：</span>
                        <span className="text-blue-600 font-medium">
                          {item.tags_name ?? "暂无"}
                        </span>
                      </div>
                    </div> */}
                    <div className="flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap">
                      <div className="flex items-center gap-3 text-sm text-slate-500 w-full sm:w-auto sm:justify-end">
                        <span>{item.news_source ?? "暂无"}</span>
                        <span>•</span>
                        <span>{getTimeAgo(item.news_time)}</span>
                      </div>
                      {item.tags_name && (
                        <div className="flex items-center gap-2 w-full sm:w-1/2 sm:justify-end">
                          <span className="text-sm font-medium text-slate-700 whitespace-nowrap">
                            商务抓手：
                          </span>
                          <span className="text-base text-blue-600 font-medium">
                            {item.tags_name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16 bg-white border border-gray-200 shadow-sm rounded-lg mt-8"
            >
              <p className="text-slate-500 font-light text-lg">
                {activeFilterCount > 0
                  ? "没有符合筛选条件的线索"
                  : "暂无线索更新"}
              </p>
              {activeFilterCount > 0 && (
                <Button
                  variant="link"
                  onClick={clearFilters}
                  className="mt-4 font-light text-blue-600"
                >
                  清除筛选条件
                </Button>
              )}
            </motion.div>
          )}

          {/* PC端分页组件 */}
          {!isMobile && (
            <div className="flex justify-center my-8">
              <Pagination
                current={
                  activeTab === "internal" ? pcInternalPage : pcExternalPage
                }
                total={
                  activeTab === "internal" ? pcInternalTotal : pcExternalTotal
                }
                pageSize={10}
                onChange={
                  activeTab === "internal"
                    ? handlePcInternalPageChange
                    : handlePcExternalPageChange
                }
                showSizeChanger={false}
                showQuickJumper
                showTotal={(total, range) =>
                  `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
                }
                className="ant-pagination-custom"
              />
            </div>
          )}

          {/* 手机端滚动加载提示 */}
          {isMobile && loading && (
            <div className="text-center pb-6">加载中...</div>
          )}
          {isMobile && !hasMore && filteredData.length > 0 && (
            <div className="text-center pb-6 text-gray-400">没有更多了</div>
          )}
        </div>
      </main>
    </div>
  );
}
