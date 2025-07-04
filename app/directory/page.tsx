"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ChevronLeft, Star, User, Phone, Filter, X } from "lucide-react"
import { motion } from "framer-motion"

interface Person {
  id: string
  name: string
  position: string
  department: string
  region: string
  hometown: string
  age: number
  tenure: string
  focusAreas: string[]
  latestActivity?: string
  avatar?: string
  contact?: {
    phone?: string
    wechat?: string
  }
}

// 部门岗位联动数据
const departmentJobs: Record<string, string[]> = {
  全部部门: ["全部岗位"],
  发改委: ["全部岗位", "综合规划科科员", "产业发展处副主任", "投资科负责人"],
  水利局: ["全部岗位", "水资源管理科科员", "工程建设科主任", "防汛办工作人员"],
  环保局: ["全部岗位", "环境监测中心专员", "排污许可科科员", "固废管理处负责人"],
}

const mockPeople: Person[] = [
  {
    id: "1",
    name: "张三",
    position: "主任",
    department: "发改委",
    region: "jiujiang",
    hometown: "南昌市",
    age: 52,
    tenure: "3年",
    focusAreas: ["数字经济", "产业发展", "投资促进"],
    latestActivity: "主持召开数字经济发展座谈会",
    contact: {
      phone: "0792-8****888",
      wechat: "zhangsan_jj",
    },
  },
  {
    id: "2",
    name: "李四",
    position: "局长",
    department: "财政局",
    region: "nanchang",
    hometown: "九江市",
    age: 48,
    tenure: "2年",
    focusAreas: ["财政管理", "资金监管", "预算编制"],
    latestActivity: "审议2024年财政预算执行情况",
    contact: {
      phone: "0791-8****666",
      wechat: "lisi_nc",
    },
  },
  {
    id: "3",
    name: "王五",
    position: "市长",
    department: "市政府",
    region: "yichun",
    hometown: "宜春市",
    age: 55,
    tenure: "4年",
    focusAreas: ["城市发展", "民生保障", "招商引资"],
    latestActivity: "调研教育城项目建设进展",
    contact: {
      phone: "0795-3****999",
      wechat: "wangwu_yc",
    },
  },
  {
    id: "4",
    name: "赵六",
    position: "副市长",
    department: "市政府",
    region: "shangrao",
    hometown: "景德镇市",
    age: 46,
    tenure: "1年",
    focusAreas: ["城市建设", "基础设施", "市政工程"],
    latestActivity: "检查重点工程建设情况",
    contact: {
      phone: "0793-8****777",
      wechat: "zhaoliu_sr",
    },
  },
  {
    id: "5",
    name: "陈七",
    position: "局长",
    department: "住建局",
    region: "ganzhou",
    hometown: "赣州市",
    age: 50,
    tenure: "5年",
    focusAreas: ["房地产", "城市规划", "住房保障"],
    latestActivity: "部署保障性住房建设工作",
    contact: {
      phone: "0797-8****555",
      wechat: "chenqi_gz",
    },
  },
  {
    id: "6",
    name: "孙八",
    position: "局长",
    department: "交通局",
    region: "jiujiang",
    hometown: "抚州市",
    age: 49,
    tenure: "2年",
    focusAreas: ["交通建设", "物流发展", "港口管理"],
    latestActivity: "推进综合交通枢纽建设",
    contact: {
      phone: "0792-8****444",
      wechat: "sunba_fz",
    },
  },
]

// 紧凑的人物卡片组件
function CompactPersonCard({
  person,
  isFollowed,
  onToggleFollow,
}: {
  person: Person
  isFollowed: boolean
  onToggleFollow: (personId: string) => void
}) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-all duration-300 cursor-pointer hover:bg-gray-50"
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (!target.closest("button")) {
          router.push(`/directory/${person.id}`)
        }
      }}
    >
      <div className="flex items-center gap-3">
        {/* 头像 */}
        <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <User className="h-6 w-6 text-white" />
        </div>

        {/* 主要信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            {/* 第一行：姓名 */}
            <h3 className="font-bold text-gray-900 text-base truncate">{person.name}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-1 rounded-lg hover:bg-gray-100 transition-all duration-200 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                onToggleFollow(person.id)
              }}
            >
              <Star className={`h-4 w-4 ${isFollowed ? "fill-yellow-400 text-yellow-400" : "text-slate-400"}`} />
            </motion.button>
          </div>

          {/* 第二行：部门、职位、地区、年龄 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-gray-800">{person.department}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-sm font-medium text-gray-800">{person.position}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-gray-700">{person.hometown}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-gray-600">{person.age}岁</span>
          </div>

          {/* 第三行：电话和微信 */}
          <div className="flex items-center gap-4">
            {person.contact?.phone && (
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
                <span className="text-xs text-gray-900 font-medium">{person.contact.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <svg className="h-3 w-3 text-green-600 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 4.882-1.900 7.6.5.5-3.187-2.75-6.874-8.372-6.874zm-3.375 5.25a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5zm6.75 0a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5z" />
                <path d="M15.312 9.531c-4.157 0-7.5 2.69-7.5 6.094 0 1.875.937 3.563 2.438 4.688-.188.75-.375 1.313-.375 1.313s1.313-.375 2.063-.75c.375.094.75.188 1.125.188 4.156 0 7.5-2.69 7.5-6.094s-3.344-6.094-7.5-6.094zm-2.25 3.75a.563.563 0 1 1 0-1.125.563.563 0 0 1 0 1.125zm4.5 0a.563.563 0 1 1 0-1.125.563.563 0 0 1 0 1.125z" />
              </svg>
              <span className="text-xs text-gray-900 font-medium">{person.contact?.wechat || "未提供"}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function DirectoryPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedDepartment, setSelectedDepartment] = useState("全部部门")
  const [selectedPosition, setSelectedPosition] = useState("全部岗位")
  const [followedPeople, setFollowedPeople] = useState<string[]>(["1", "3"])
  const [activeTab, setActiveTab] = useState("followed")

  const [filterOpen, setFilterOpen] = useState(false)
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null)

  // 检查是否有筛选条件
  const hasFilter = selectedDepartment !== "全部部门" || selectedPosition !== "全部岗位"

  // 根据部门选择更新岗位选项
  const availablePositions = departmentJobs[selectedDepartment] || ["全部岗位"]

  const filteredPeople = useMemo(() => {
    return mockPeople.filter((person) => {
      // 首先按tab筛选
      if (activeTab === "followed" && !followedPeople.includes(person.id)) {
        return false
      }

      const matchesDepartment = selectedDepartment === "全部部门" || person.department === selectedDepartment
      const matchesPosition = selectedPosition === "全部岗位" || person.position === selectedPosition
      return matchesDepartment && matchesPosition
    })
  }, [selectedDepartment, selectedPosition, activeTab, followedPeople])

  const handleToggleFollow = (personId: string) => {
    if (followedPeople.includes(personId)) {
      setFollowedPeople(followedPeople.filter((id) => id !== personId))
      toast({
        title: "取消关注",
        description: "已取消关注",
      })
    } else {
      if (followedPeople.length >= 10) {
        toast({
          title: "关注失败",
          description: "最多关注10位关键人物",
          variant: "destructive",
        })
        return
      }
      setFollowedPeople([...followedPeople, personId])
      toast({
        title: "关注成功",
        description: "将在销售线索中显示其动态",
      })
    }
  }

  const handleDepartmentSelect = (department: string) => {
    setSelectedDepartment(department)
    setSelectedPosition("全部岗位")
    setHoveredDepartment(null)
    setFilterOpen(false)
  }

  const handlePositionSelect = (position: string) => {
    setSelectedPosition(position)
    setFilterOpen(false)
  }

  const handleClearFilter = () => {
    setSelectedDepartment("全部部门")
    setSelectedPosition("全部岗位")
    setFilterOpen(false)
    toast({
      title: "筛选已清除",
      description: "已重置所有筛选条件",
    })
  }

  // 在组件顶部添加
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (filterOpen && !target.closest(".relative")) {
        setFilterOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [filterOpen])

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
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-gray-200">
                <TabsTrigger
                  value="followed"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent"
                >
                  我关注的 ({followedPeople.length})
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-600 data-[state=inactive]:bg-transparent"
                >
                  全部人物 ({mockPeople.length})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* 筛选按钮组 */}
            <div className="flex items-center gap-2">
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
                  <div className="absolute top-full right-0 mt-1 w-80 bg-white border border-gray-200 shadow-lg rounded-lg z-50">
                    <div className="flex">
                      {/* 第一级菜单 - 部门 */}
                      <div className="w-40 border-r border-gray-200">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">部门</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {Object.keys(departmentJobs)
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

                      {/* 第二级菜单 - 职位 */}
                      <div className="w-40">
                        <div className="p-2 border-b border-gray-100 bg-gray-50">
                          <span className="text-xs font-medium text-gray-600">{hoveredDepartment || "职位"}</span>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {hoveredDepartment &&
                            departmentJobs[hoveredDepartment]
                              ?.filter((pos) => pos !== "全部岗位")
                              .map((position) => (
                                <div
                                  key={position}
                                  className="px-3 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-50 transition-colors"
                                  onClick={() => handlePositionSelect(position)}
                                >
                                  {position}
                                </div>
                              ))}
                          {!hoveredDepartment && <div className="px-3 py-2 text-sm text-gray-400">请先选择部门</div>}
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
      <main className="max-w-7xl mx-auto px-6 py-4">
        <Tabs value={activeTab} className="w-full">
          <TabsContent value="all" className="mt-0">
            {filteredPeople.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
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
                <p className="text-slate-500 mb-1 font-light">没有找到符合条件的人物</p>
                <p className="text-sm text-slate-400 font-light">尝试调整筛选条件</p>
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
              <div className="grid grid-cols-2 gap-3">
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
                <p className="text-slate-500 mb-1 font-light">还没有关注任何人物</p>
                <p className="text-sm text-slate-400 font-light">点击星标关注感兴趣的关键人物</p>
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
      </main>
    </div>
  )
}