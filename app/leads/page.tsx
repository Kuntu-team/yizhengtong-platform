"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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

interface LeadItem {
  created_time: string; // 创建时间，ISO 格式字符串
  data_status: string; // 数据状态，字符串表示
  news_city_cn: string; // 新闻所在城市中文名称
  news_city_code: string; // 新闻所在城市编码
  news_content: string; // 新闻内容
  news_district_cn: string; // 新闻所在区中文名称
  news_district_code: string; // 新闻所在区编码
  news_id: string; // 新闻唯一标识
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

// const regions: Region[] = [
//   { id: "jiujiang", name: "九江市" },
//   { id: "nanchang", name: "南昌市" },
//   { id: "yichun", name: "宜春市" },
//   { id: "shangrao", name: "上饶市" },
//   { id: "ganzhou", name: "赣州市" },
// ];

// const people: Person[] = [
//   { id: 1, name: "张三", position: "发改委主任" },
//   { id: 2, name: "李四", position: "财政局局长" },
//   { id: 3, name: "王五", position: "市长" },
//   { id: 4, name: "赵六", position: "副市长" },
//   { id: 5, name: "陈七", position: "住建局局长" },
//   { id: 6, name: "孙八", position: "交通局局长" },
//   { id: 7, name: "周九", position: "教育局局长" },
// ];

export default function LeadsPage() {
  const router = useRouter();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedPeople, setSelectedPeople] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("internal");
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [filteredItems, setFilteredItems] = useState<LeadItem[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [people, setPeople] = useState<Person[]>([]);

  const activeFilterCount = selectedRegions.length + selectedPeople.length;

  useEffect(() => {
    const saved = localStorage.getItem("salesLeadFilters");
    if (saved) {
      try {
        const { regions, people } = JSON.parse(saved);
        setSelectedRegions(regions || []);
        setSelectedPeople(people || []);
      } catch (error) {
        // console.error("Failed to parse saved filters:", error)
      }
    }

    fetchData();
    getSelectData();
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "salesLeadFilters",
      JSON.stringify({
        regions: selectedRegions,
        people: selectedPeople,
      })
    );
    console.log(selectedRegions);
  }, [selectedRegions, selectedPeople]);
  useEffect(() => {
    console.log("Active Tab Changed:", activeTab);
    if (activeTab != "internal") {
      setFilteredItems([]);
    } else {
      fetchData();
    }
  }, [activeTab]);

  const filteredData = useMemo(() => {
    if (selectedRegions.length === 0 && selectedPeople.length === 0) {
      return filteredItems;
    }
    return filteredItems.filter((item) => {
      const matchesRegion =
        selectedRegions.length === 0 ||
        selectedRegions.includes(item.news_province_code);
      const matchesPerson =
        selectedPeople.length === 0 || selectedPeople.includes(item.person_id);

      return matchesRegion && matchesPerson;
    });
  }, [selectedRegions, selectedPeople, filteredItems]);
  const fetchData = async () => {
    try {
      const response = await axios.get("api/sales-lead");
      console.log(response.data);
      setFilteredItems(response.data);
    } catch (error) {
      console.log("请求失败:", error);
    }
  };
  const getSelectData = async () => {
    try {
      const response = await axios.get("api/sales-lead/region");
      console.log(response.data);
      // setFilteredItems(response.data);
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
  // const filteredItems = useMemo(() => {
  //   let items = mockLeadsData.filter((item) => item.type === activeTab);

  //   if (selectedRegions.length > 0) {
  //     items = items.filter((item) => selectedRegions.includes(item.regionId));
  //   }

  //   if (selectedPeople.length > 0) {
  //     items = items.filter((item) => selectedPeople.includes(item.personId));
  //   }

  //   return items;
  // }, [activeTab, selectedRegions, selectedPeople]);

  const handleItemClick = (item: LeadItem) => {
    router.push(`/leads/detail/${item.news_id}`);
  };

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setHasMore(false);
    }, 1000);
  };

  const clearFilters = () => {
    setSelectedRegions([]);
    setSelectedPeople([]);
  };

  const handleRegionChange = (regionId: string, checked: boolean) => {
    console.log("Region Change:", regionId, checked);

    if (checked) {
      setSelectedRegions([...selectedRegions, regionId]);
    } else {
      setSelectedRegions(selectedRegions.filter((r) => r !== regionId));
    }
  };

  const handlePersonChange = (personId: string) => {
    setSelectedPeople(
      selectedPeople.includes(personId)
        ? selectedPeople.filter((p) => p !== personId)
        : [...selectedPeople, personId]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Apple风格顶部导航 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 fixed top-0 w-full z-50"
      >
        <div className="h-16 px-6 flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/")}
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
              className="bg-white border-b border-gray-200 overflow-hidden"
            >
              <div className="px-6 py-6 space-y-6 max-w-6xl mx-auto">
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

                {/* ���选择的筛选条件 */}
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
          <div className="px-6 max-w-6xl mx-auto">
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
        <div className="px-6 max-w-6xl mx-auto">
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
                        {item.person_name + "：" + item.news_title}
                      </h3>
                    </div>
                    <div className="flex items-center justify-between">
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

          {/* {hasMore && filteredData.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center my-8"
            >
              <Button
                variant="ghost"
                className="bg-white border border-gray-200 shadow-sm rounded-lg font-light"
                onClick={loadMore}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    加载中...
                  </>
                ) : (
                  "加载更多"
                )}
              </Button>
            </motion.div>
          )} */}
        </div>
      </main>
    </div>
  );
}
