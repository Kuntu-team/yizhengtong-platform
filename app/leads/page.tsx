"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Filter, ChevronDown, Loader2, X, ChevronLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"

interface LeadItem {
  id: string
  title: string
  description: string
  salesPitch: string // 添加这个字段
  time: string
  type: "internal" | "external"
  person: string
  personId: number
  region: string
  regionId: string
  businessHandle: string
  source: string
}

interface Region {
  id: string
  name: string
}

interface Person {
  id: number
  name: string
  position: string
}

const regions: Region[] = [
  { id: "jiujiang", name: "九江市" },
  { id: "nanchang", name: "南昌市" },
  { id: "yichun", name: "宜春市" },
  { id: "shangrao", name: "上饶市" },
  { id: "ganzhou", name: "赣州市" },
]

const people: Person[] = [
  { id: 1, name: "张三", position: "发改委主任" },
  { id: 2, name: "李四", position: "财政局局长" },
  { id: 3, name: "王五", position: "市长" },
  { id: 4, name: "赵六", position: "副市长" },
  { id: 5, name: "陈七", position: "住建局局长" },
  { id: 6, name: "孙八", position: "交通局局长" },
  { id: 7, name: "周九", position: "教育局局长" },
]

const mockLeadsData: LeadItem[] = [
  {
    id: "1",
    title: "张三：九江将建5个数字产业园",
    description: "发改委主任谈数字经济3年规划，投资500亿",
    salesPitch:
      "张主任，您好！看到九江市数字产业园的规划，这是个千载难逢的机会。我们公司在数字基础设施建设方面有丰富经验，特别是在园区智能化管理系统和5G网络部署方面。考虑到500亿的投资规模，我们可以为您提供一站式的数字化解决方案，帮助九江打造华中地区领先的数字经济高地。",
    time: "2小时前",
    type: "internal",
    person: "张三",
    personId: 1,
    region: "九江市",
    regionId: "jiujiang",
    businessHandle: "数字经济、产业园建设、政府投资、专项债券",
    source: "九江日报",
  },
  {
    id: "2",
    title: "李四：南昌港口物流园区规划",
    description: "财政局长介绍新港区建设，预计投资200亿",
    salesPitch:
      "李局长，南昌港口物流园区的建设对江西经济发展意义重大。我们在港口智能化管理、物流信息系统集成方面有成熟的解决方案。特别是我们的智慧港口管理平台，已在多个大型港口成功应用，可以显著提升货物吞吐效率。针对200亿的投资计划，我们愿意深度参与，为南昌打造中部地区重要的物���枢纽贡献力量。",
    time: "4小时前",
    type: "internal",
    person: "李四",
    personId: 2,
    region: "南昌市",
    regionId: "nanchang",
    businessHandle: "港口物流、基础设施建设、财政投资、物流园区",
    source: "南昌晚报",
  },
  {
    id: "3",
    title: "王五：宜春教育城项目启动",
    description: "市长宣布新建3所高校，总投资150亿",
    salesPitch:
      "王市长，宜春教育城项目体现了您对教育事业的远见卓识。我们专注于智慧校园建设，在高校信息化、数字化教学环境打造方面有丰富经验。3所高校的建设是个系统工程，我们可以提供从校园网络基础设施到智能教学系统的全套解决方案，确保宜春教育城成为江西乃至全国的教育标杆。",
    time: "6小时前",
    type: "internal",
    person: "王五",
    personId: 3,
    region: "宜春市",
    regionId: "yichun",
    businessHandle: "教育投资、高校建设、城市发展、教育产业",
    source: "宜春日报",
  },
  {
    id: "4",
    title: "张三：九江发改委主任 → 省发改委副主任",
    description: "主导过多个重大项目，熟悉投融资政策",
    salesPitch:
      "张主任，恭喜您履新省发改委副主任！您在九江期间主导的数字产业园等项目成果显著，现在到了省里，必将推动更多重大项目落地。我们一直关注您的工作动向，希望能在您负责的新项目中发挥作用。我们在政府投融资、PPP项目运作方面有丰富经验，愿意为江西省的发展贡献专业力量。",
    time: "昨天",
    type: "external",
    person: "张三",
    personId: 1,
    region: "九江市",
    regionId: "jiujiang",
    businessHandle: "投融资政策、重大项目、发改系统、政策解读",
    source: "江西日报",
  },
  {
    id: "5",
    title: "赵六：上饶副市长 → 九江市委副书记",
    description: "城建领域专家，主导过多个大型基建项目",
    salesPitch:
      "赵书记，您从上饶到九江，带来了丰富的城建经验，这对九江的发展是重大利好。我们了解到您在上饶期间主导的几个基建项目都很成功，我们公司在城市基础设施建设、智慧城市解决方案方面实力雄厚。希望能有机会向您汇报我们的城建理念和技术方案，为九江的城市建设添砖加瓦。",
    time: "2天前",
    type: "external",
    person: "赵六",
    personId: 4,
    region: "上饶市",
    regionId: "shangrao",
    businessHandle: "城市建设、基础设施、市政工程、城市规划",
    source: "上饶日报",
  },
  {
    id: "6",
    title: "陈七：赣州住建局长 → 南昌副市长",
    description: "房地产和城市规划专家，推动多项城建改革",
    salesPitch:
      "陈市长，您从赣州住建局长到南昌副市长，这个跨越体现了组织对您专业能力的认可。您在赣州推动的住房保障和城建改革都很有创新性，现在到了南昌这个更大的平台，必将有更大作为。我们在城市规划信息化、住房管理系统方面有成熟产品，希望能为南昌的城市建设和住房保障工作提供技术支撑。",
    time: "3天前",
    type: "external",
    person: "陈七",
    personId: 5,
    region: "赣州市",
    regionId: "ganzhou",
    businessHandle: "房地产开发、城市规划、住房保障、城建改革",
    source: "赣州晚报",
  },
]

export default function LeadsPage() {
  const router = useRouter()
  const [filterOpen, setFilterOpen] = useState(false)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])
  const [selectedPeople, setSelectedPeople] = useState<number[]>([])
  const [activeTab, setActiveTab] = useState("internal")
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const activeFilterCount = selectedRegions.length + selectedPeople.length

  useEffect(() => {
    const saved = localStorage.getItem("salesLeadFilters")
    if (saved) {
      try {
        const { regions, people } = JSON.parse(saved)
        setSelectedRegions(regions || [])
        setSelectedPeople(people || [])
      } catch (error) {
        console.error("Failed to parse saved filters:", error)
      }
    }
      
  }, [])

  useEffect(() => {
    localStorage.setItem(
      "salesLeadFilters",
      JSON.stringify({
        regions: selectedRegions,
        people: selectedPeople,
      }),
    )
  }, [selectedRegions, selectedPeople])

  const filteredItems = useMemo(() => {
    let items = mockLeadsData.filter((item) => item.type === activeTab)

    if (selectedRegions.length > 0) {
      items = items.filter((item) => selectedRegions.includes(item.regionId))
    }

    if (selectedPeople.length > 0) {
      items = items.filter((item) => selectedPeople.includes(item.personId))
    }

    return items
  }, [activeTab, selectedRegions, selectedPeople])

  const handleItemClick = (item: LeadItem) => {
    router.push(`/leads/detail/${item.id}`)
  }

  const loadMore = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setHasMore(false)
    }, 1000)
  }

  const clearFilters = () => {
    setSelectedRegions([])
    setSelectedPeople([])
  }

  const handleRegionChange = (regionId: string, checked: boolean) => {
    if (checked) {
      setSelectedRegions([...selectedRegions, regionId])
      
    } else {
      setSelectedRegions(selectedRegions.filter((r) => r !== regionId))
    }
  }

  const handlePersonChange = (personId: number) => {
    setSelectedPeople(
      selectedPeople.includes(personId) ? selectedPeople.filter((p) => p !== personId) : [...selectedPeople, personId],
    )
  }

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
            <h1 className="text-xl font-light text-slate-800 tracking-wide">销售线索</h1>
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
                    <label className="text-sm font-medium text-slate-700 mb-3 block tracking-wide">地区</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border border-gray-200 font-light"
                        >
                          <span className="text-sm">
                            {selectedRegions.length > 0 ? `已选择 ${selectedRegions.length} 个地区` : "选择地区"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-sm rounded-lg">
                        <Command>
                          <CommandInput placeholder="搜索地区..." className="border-0" />
                          <CommandList>
                            <CommandEmpty>未找到相关地区</CommandEmpty>
                            <CommandGroup className="max-h-48 overflow-auto">
                              {regions.map((region) => (
                                <CommandItem
                                  key={region.id}
                                  onSelect={() => handleRegionChange(region.id, !selectedRegions.includes(region.id))}
                                  className="cursor-pointer hover:bg-white/20"
                                >
                                  <Checkbox checked={selectedRegions.includes(region.id)} className="mr-3" />
                                  <span className="font-light">{region.name}</span>
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
                    <label className="text-sm font-medium text-slate-700 mb-3 block tracking-wide">关键人物</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-between bg-white border border-gray-200 font-light"
                        >
                          <span className="text-sm">
                            {selectedPeople.length > 0 ? `已选择 ${selectedPeople.length} 人` : "选择关键人物"}
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0 bg-white border border-gray-200 shadow-sm rounded-lg">
                        <Command>
                          <CommandInput placeholder="搜索人物..." className="border-0" />
                          <CommandList>
                            <CommandEmpty>未找到相关人物</CommandEmpty>
                            <CommandGroup className="max-h-48 overflow-auto">
                              {people.map((person) => (
                                <CommandItem
                                  key={person.id}
                                  onSelect={() => handlePersonChange(person.id)}
                                  className="cursor-pointer hover:bg-white/20"
                                >
                                  <Checkbox checked={selectedPeople.includes(person.id)} className="mr-3" />
                                  <div className="flex-1">
                                    <span className="font-light">{person.name}</span>
                                    <span className="text-xs text-slate-500 ml-2 font-light">{person.position}</span>
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
                        const region = regions.find((r) => r.id === regionId)
                        return (
                          <motion.div key={regionId} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-slate-200 bg-white border border-gray-200 font-light"
                              onClick={() => handleRegionChange(regionId, false)}
                            >
                              {region?.name}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          </motion.div>
                        )
                      })}
                      {selectedPeople.map((personId) => {
                        const person = people.find((p) => p.id === personId)
                        return (
                          <motion.div key={personId} initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                            <Badge
                              variant="secondary"
                              className="cursor-pointer hover:bg-slate-200 bg-white border border-gray-200 font-light"
                              onClick={() => handlePersonChange(personId)}
                            >
                              {person?.name}
                              <X className="h-3 w-3 ml-1" />
                            </Badge>
                          </motion.div>
                        )
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
                  <div className="text-sm text-slate-500 font-light">共 {filteredItems.length} 条线索</div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 标签切换 */}
        <div className="sticky top-16 bg-white border-b border-gray-200 z-40">
          <div className="px-6 max-w-6xl mx-auto">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
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
          {filteredItems.length > 0 ? (
            <motion.div
              className="divide-y divide-white/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4 }}
            >
              {filteredItems.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleItemClick(item)}
                  className="bg-white border border-gray-200 shadow-sm rounded-lg my-4 p-4 cursor-pointer hover:shadow-lg transition-all duration-300"
                >
                  <div className="space-y-2">
                    <div>
                      <h3 className="text-lg font-medium text-slate-800 leading-relaxed tracking-wide">{item.title}</h3>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-sm text-slate-500">
                        <span>{item.source}</span>
                        <span>•</span>
                        <span>{item.time}</span>
                      </div>
                      <div className="text-base text-slate-600">
                        <span className="font-medium">商务抓手：</span>
                        <span className="text-blue-600 font-medium">{item.businessHandle}</span>
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
                {activeFilterCount > 0 ? "没有符合筛选条件的线索" : "暂无线索更新"}
              </p>
              {activeFilterCount > 0 && (
                <Button variant="link" onClick={clearFilters} className="mt-4 font-light text-blue-600">
                  清除筛选条件
                </Button>
              )}
            </motion.div>
          )}

          {hasMore && filteredItems.length > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center my-8">
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
          )}
        </div>
      </main>
    </div>
  )
}
