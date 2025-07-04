"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
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
  age: number | null
  tenure: string
  focusAreas: string[]
  latestActivity?: string
  avatar?: string
  office_phone?: string
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
        {person.avatar ? (
          <img 
            src={person.avatar} 
            alt={person.name}
            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/placeholder-user.jpg';
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
            {/* <span className="text-xs text-slate-400">·</span> */}
            <span className="text-xs text-gray-700">{person.hometown}</span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-gray-600">{person.age !== null ? `${person.age}岁` : '未知'}</span>
          </div>

          {/* 第三行：电话和微信 */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Phone className="h-3 w-3 text-slate-400 flex-shrink-0" />
              <span className="text-xs text-gray-900 font-medium">{person.office_phone || '暂无办公电话'}</span>
            </div>
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
  const [people, setPeople] = useState<Person[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterOpen, setFilterOpen] = useState(false)
  const [hoveredDepartment, setHoveredDepartment] = useState<string | null>(null)

  // 检查是否有筛选条件
  const hasFilter = selectedDepartment !== "全部部门" || selectedPosition !== "全部岗位"

  // 根据部门选择更新岗位选项
  const availablePositions = departmentJobs[selectedDepartment] || ["全部岗位"]

  // 获取人物数据
  useEffect(() => {
    let isMounted = true // 防止组件卸载后设置状态

    async function fetchPeople() {
      try {
        const response = await fetch('/api/key-persons')
        if (!response.ok) throw new Error('Failed to fetch data')
        const data = await response.json()
        if (isMounted) {
          const transformed = data.map((p: any) => ({
            ...p,
            age: calculateAge(p.birth_date),
            hometown: p.hometown || '',
            tenure: p.tenure || '',
            focusAreas: p.focusAreas || [],
            latestActivity: p.latestActivity || '',
            contact: {
              phone: p.phone || '',
              wechat: p.wechat || ''
            }
          }))
          setPeople(transformed)
        }
      } catch (error) {
        if (isMounted) {
          toast({
            title: "加载失败",
            description: "无法获取人物数据",
            variant: "destructive"
          })
          console.error(error)
        }
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    fetchPeople()

    return () => {
      isMounted = false
    }
  }, [toast])

  // 点击外部关闭筛选
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

  // 过滤人物列表
  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      // 首先按tab筛选
      if (activeTab === "followed" && !followedPeople.includes(person.id)) {
        return false
      }

      const matchesDepartment = selectedDepartment === "全部部门" || person.department === selectedDepartment
      const matchesPosition = selectedPosition === "全部岗位" || person.position === selectedPosition
      return matchesDepartment && matchesPosition
    })
  }, [people, selectedDepartment, selectedPosition, activeTab, followedPeople])

  // 切换关注状态
  const handleToggleFollow = useCallback((personId: string) => {
    setFollowedPeople(prev => {
      if (prev.includes(personId)) {
        toast({
          title: "取消关注",
          description: "已取消关注",
        })
        return prev.filter((id) => id !== personId)
      } else {
        if (prev.length >= 10) {
          toast({
            title: "关注失败",
            description: "最多关注10位关键人物",
            variant: "destructive",
          })
          return prev
        }
        toast({
          title: "关注成功",
          description: "将在销售线索中显示其动态",
        })
        return [...prev, personId]
      }
    })
  }, [toast])

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
                  全部人物 ({people.length})
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
        {isLoading ? (
          <div className="text-center py-12">加载中...</div>
        ) : (
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
        )}
      </main>
    </div>
  )
}

// 优化后的年龄计算函数
function calculateAge(birthDateString: string | undefined): number | null {
  if (!birthDateString) return null;

  // 全角字符转半角字符
  const toHalfWidth = (str: string) => 
    str.replace(/[！-～]/g, c => String.fromCharCode(c.charCodeAt(0) - 0xFEE0))
       .replace(/　/g, ' ');

  // 中文月份转数字
  const chineseMonths: Record<string, string> = {
    '一月': '1月', '二月': '2月', '三月': '3月', '四月': '4月', 
    '五月': '5月', '六月': '6月', '七月': '7月', '八月': '8月', 
    '九月': '9月', '十月': '10月', '十一月': '11月', '十二月': '12月'
  };

  // 统一转换所有数字为半角并处理中文月份
  let normalizedDateString = toHalfWidth(birthDateString.trim());
  for (const [cnMonth, numMonth] of Object.entries(chineseMonths)) {
    normalizedDateString = normalizedDateString.replace(new RegExp(cnMonth, 'g'), numMonth);
  }

  // 尝试解析各种日期格式
  let birthDate: Date | null = null;
  
  // 1. 尝试中文日期格式 (YYYY年MM月DD日 或 YYYY年MM月)
  const chineseDateMatch = normalizedDateString.match(/(\d{4})\s*年\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?/);
  if (chineseDateMatch) {
    const year = parseInt(chineseDateMatch[1], 10);
    const month = parseInt(chineseDateMatch[2], 10) - 1; // 月份从0开始
    const day = chineseDateMatch[3] ? parseInt(chineseDateMatch[3], 10) : 1;
    birthDate = new Date(year, month, day);
  }
  
  // 2. 尝试ISO格式 (YYYY-MM-DD)
  if (!birthDate || isNaN(birthDate.getTime())) {
    const isoMatch = normalizedDateString.match(/(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
    if (isoMatch) {
      const year = parseInt(isoMatch[1], 10);
      const month = parseInt(isoMatch[2], 10) - 1;
      const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
      birthDate = new Date(year, month, day);
    }
  }
  
  // 3. 尝试斜杠分隔格式 (YYYY/MM/DD 或 MM/DD/YYYY)
  if (!birthDate || isNaN(birthDate.getTime())) {
    const slashMatch = normalizedDateString.match(/(\d{1,4})\/(\d{1,2})(?:\/(\d{1,2}))?/);
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
    const dotMatch = normalizedDateString.match(/(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?/);
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

  // 计算年龄 [1,2,3](@ref)
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // 考虑月份和日期因素 [4,5](@ref)
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : null;
}