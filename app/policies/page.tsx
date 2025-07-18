"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { AppLayout } from "@/components/app-layout"
import { FileText, Settings, ChevronLeft } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

interface Policy {
  id: string
  title: string
  source: string
  publishDate: Date
  timeAgo: string
  status: "pending" | "completed"
  progress?: number
  estimatedDate?: string
  matchedProjects?: number
  unread?: boolean
  category: string
  salesPitch: string // 添加话术字段
}

const mockPolicies: Policy[] = [
  {
    id: "policy3",
    title: "绿色低碳发展实施方案",
    source: "生态环境部",
    publishDate: new Date("2025-06-22"),
    timeAgo: "2天前",
    status: "completed",
    matchedProjects: 8,
    unread: false,
    category: "environment",
    salesPitch:
      "这项政策为环保设备制造商带来巨大商机。建议重点关注碳监测设备、节能改造方案和绿色认证服务。预计市场规模将达到千亿级别，现在正是布局的最佳时机。我们的环保解决方案完全符合政策导向。",
  },
  {
    id: "policy4",
    title: "乡村振兴战略实施规划",
    source: "农业农村部",
    publishDate: new Date("2025-06-21"),
    timeAgo: "3天前",
    status: "completed",
    matchedProjects: 12,
    unread: false,
    category: "rural",
    salesPitch:
      "乡村振兴政策释放万亿级投资机会，重点关注智慧农业、农村电商平台和基础设施建设。我们的数字化农业解决方案可以帮助农村实现产业升级，建议立即对接相关部门，抢占先机。",
  },
  {
    id: "policy5",
    title: "制造业数字化转型行动方案",
    source: "工信部",
    publishDate: new Date("2025-06-20"),
    timeAgo: "4天前",
    status: "completed",
    matchedProjects: 6,
    unread: false,
    category: "digital",
    salesPitch:
      "制造业数字化转型迎来政策红利期，工业互联网、智能制造设备需求激增。我们的工业4.0解决方案正好契合政策要求，建议主动联系制造业企业，提供数字化改造服务，市场前景广阔。",
  },
  {
    id: "policy6",
    title: "金融支持实体经济发展意见",
    source: "央行",
    publishDate: new Date("2025-06-18"),
    timeAgo: "6天前",
    status: "completed",
    matchedProjects: 4,
    unread: false,
    category: "finance",
    salesPitch:
      "央行新政策为金融科技公司创造重大机遇，重点支持小微企业融资和供应链金融。我们的金融科技产品可以帮助银行提升服务效率，降低风险成本，建议尽快与金融机构建立合作关系。",
  },
  {
    id: "policy7",
    title: "教育数字化转型实施方案",
    source: "教育部",
    publishDate: new Date("2025-06-15"),
    timeAgo: "1周前",
    status: "completed",
    matchedProjects: 3,
    unread: false,
    category: "education",
    salesPitch:
      "教育数字化政策推动在线教育和智慧校园建设，预计带动千亿级市场需求。我们的教育科技解决方案包含AI教学、虚拟实验室等前沿技术，正是学校急需的产品，建议加快市场推广步伐。",
  },
  {
    id: "policy1",
    title: "关于推进数字经济发展的指导意见",
    source: "国务院",
    publishDate: new Date("2025-06-24"),
    timeAgo: "2小时前",
    status: "pending",
    progress: 75,
    estimatedDate: "今日18:00",
    unread: true,
    category: "digital",
    salesPitch:
      "国务院数字经济新政即将出台，预计将释放万亿级市场机会。重点关注5G应用、人工智能、大数据等领域的投资机会。我们的数字化解决方案完全符合政策导向，建议提前准备商务方案，抢占市场先机。",
  },
  {
    id: "policy2",
    title: "新型基础设施建设三年行动计划",
    source: "发改委",
    publishDate: new Date("2025-06-23"),
    timeAgo: "1天前",
    status: "pending",
    progress: 45,
    estimatedDate: "明日12:00",
    unread: true,
    category: "infrastructure",
    salesPitch:
      "新基建三年计划即将发布，涉及5G网络、数据中心、充电桩等多个领域，总投资规模预计超过10万亿。我们的基础设施解决方案正好对应政策重点，建议立即联系相关部门，争取项目合作机会。",
  },
]

function formatDate(date: string | Date) {
  if (!date) return "-";
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return String(date);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

function PolicyCard({ policy }: { policy: Policy }) {
  const router = useRouter()

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -2 }}
      transition={{ duration: 0.3 }}
      className="card-mobile p-3 sm:p-4 cursor-pointer hover:shadow-lg transition-all duration-300 relative"
      onClick={() => router.push(`/policies/${policy.id}`)}
    >
      {policy.unread && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 w-2 h-2 sm:w-3 sm:h-3 bg-red-400 rounded-full"
        />
      )}

      <div className="space-y-2 sm:space-y-3">
        {/* 标题 */}
        <div className="flex items-start justify-between gap-2 sm:gap-4">
          <h3 className="text-base sm:text-xl font-bold text-slate-800 leading-tight tracking-wide flex-1 line-clamp-2 sm:line-clamp-none">
            {policy.title}
          </h3>
        </div>

        {/* 来源和时间信息 */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="truncate max-w-24 sm:max-w-none">{policy.source}</span>
            <span>•</span>
            <span>{formatDate(policy.publishDate)}</span>
          </div>
          <span className="text-xs">{policy.timeAgo}</span>
        </div>

        {/* 话术预览 */}
        <p className="text-sm sm:text-base text-slate-700 leading-relaxed break-words">
          {policy.salesPitch}
        </p>

        {/* 状态指示器 */}
        {policy.status === "pending" && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 sm:p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
              <span className="text-xs sm:text-sm font-medium text-amber-800">
                解读进行中 - 预计{policy.estimatedDate}完成
              </span>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
}

function FilterSheet({
  open,
  onClose,
  onOpenInterestsManagement,
  filters,
  onFiltersChange,
}: {
  open: boolean
  onClose: () => void
  onOpenInterestsManagement: () => void
  filters: {
    timeRange: string
    statusFilter: string[]
    interests: string[]
  }
  onFiltersChange: (filters: any) => void
}) {
  const [localFilters, setLocalFilters] = useState(filters)

  const handleReset = () => {
    const resetFilters = {
      timeRange: "all",
      statusFilter: ["pending", "completed"],
      interests: [],
    }
    setLocalFilters(resetFilters)
  }

  const handleConfirm = () => {
    onFiltersChange(localFilters)
    onClose()
  }

  const handleStatusChange = (status: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      statusFilter: checked ? [...prev.statusFilter, status] : prev.statusFilter.filter((s) => s !== status),
    }))
  }

  const handleInterestChange = (interest: string, checked: boolean) => {
    setLocalFilters((prev) => ({
      ...prev,
      interests: checked ? [...prev.interests, interest] : prev.interests.filter((i) => i !== interest),
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-80 glass-card border-white/20">
        <SheetHeader>
          <SheetTitle className="text-slate-800 font-light text-xl tracking-wide">筛选政策</SheetTitle>
        </SheetHeader>

        <div className="mt-8 space-y-8">
          {/* 发布时间 */}
          <div>
            <label className="text-sm font-medium mb-4 block text-slate-700 tracking-wide">发布时间</label>
            <RadioGroup
              value={localFilters.timeRange}
              onValueChange={(value) => setLocalFilters((prev) => ({ ...prev, timeRange: value }))}
            >
              <div className="space-y-3">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="today" />
                  <span className="text-sm font-light">今天</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="week" />
                  <span className="text-sm font-light">本周</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="month" />
                  <span className="text-sm font-light">本月</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <RadioGroupItem value="all" />
                  <span className="text-sm font-light">全部</span>
                </label>
              </div>
            </RadioGroup>
          </div>

          {/* 我的关注 */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-medium text-slate-700 tracking-wide">关注领域</label>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs font-light hover:bg-white/20"
                onClick={() => {
                  onClose()
                  onOpenInterestsManagement()
                }}
              >
                <Settings className="h-3 w-3 mr-1" />
                管理
              </Button>
            </div>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("digital")}
                  onCheckedChange={(checked) => handleInterestChange("digital", !!checked)}
                />
                <span className="text-sm font-light">数字经济</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("infrastructure")}
                  onCheckedChange={(checked) => handleInterestChange("infrastructure", !!checked)}
                />
                <span className="text-sm font-light">新基建</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("rural")}
                  onCheckedChange={(checked) => handleInterestChange("rural", !!checked)}
                />
                <span className="text-sm font-light">乡村振兴</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("environment")}
                  onCheckedChange={(checked) => handleInterestChange("environment", !!checked)}
                />
                <span className="text-sm font-light">绿色发展</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("finance")}
                  onCheckedChange={(checked) => handleInterestChange("finance", !!checked)}
                />
                <span className="text-sm font-light">金融政策</span>
              </label>
              <label className="flex items-center space-x-3">
                <Checkbox
                  checked={localFilters.interests.includes("education")}
                  onCheckedChange={(checked) => handleInterestChange("education", !!checked)}
                />
                <span className="text-sm font-light">教育科技</span>
              </label>
            </div>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 glass border-white/20 font-light hover:bg-white/20"
            onClick={handleReset}
          >
            重置
          </Button>
          <Button className="flex-1 bg-blue-500/80 hover:bg-blue-600/80 font-light" onClick={handleConfirm}>
            确定
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function InterestsManagementSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [selectedInterests, setSelectedInterests] = useState(["digital", "infrastructure"])

  const allInterests = [
    { id: "digital", name: "数字经济", description: "人工智能、大数据、5G等数字技术相关政策" },
    { id: "infrastructure", name: "新基建", description: "新型基础设施建设相关政策" },
    { id: "rural", name: "乡村振兴", description: "农业农村发展相关政策" },
    { id: "environment", name: "绿色发展", description: "环保、碳中和相关政策" },
    { id: "finance", name: "金融政策", description: "财政、税收、金融相关政策" },
    { id: "education", name: "教育科技", description: "教育、科技创新相关政策" },
    { id: "healthcare", name: "医疗健康", description: "医疗卫生、健康产业相关政策" },
    { id: "manufacturing", name: "制造业", description: "制造业转型升级相关政策" },
  ]

  const handleToggleInterest = (interestId: string) => {
    setSelectedInterests((prev) =>
      prev.includes(interestId) ? prev.filter((id) => id !== interestId) : [...prev, interestId],
    )
  }

  const handleSave = () => {
    console.log("保存关注领域:", selectedInterests)
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-96 glass-card border-white/20">
        <SheetHeader>
          <SheetTitle className="text-slate-800 font-light text-xl tracking-wide">管理关注领域</SheetTitle>
        </SheetHeader>

        <div className="mt-8">
          <p className="text-sm text-slate-600 mb-6 font-light leading-relaxed">
            选择您感兴趣的政策领域，我们会优先推送相关内容
          </p>

          <div className="space-y-4">
            {allInterests.map((interest) => (
              <motion.div
                key={interest.id}
                whileHover={{ scale: 1.02 }}
                className="glass border-white/20 rounded-2xl p-4"
              >
                <label className="flex items-start space-x-4 cursor-pointer">
                  <Checkbox
                    checked={selectedInterests.includes(interest.id)}
                    onCheckedChange={() => handleToggleInterest(interest.id)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm text-slate-800 tracking-wide">{interest.name}</div>
                    <div className="text-xs text-slate-500 mt-1 font-light leading-relaxed">{interest.description}</div>
                  </div>
                </label>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6 flex gap-3">
          <Button
            variant="outline"
            className="flex-1 glass border-white/20 font-light hover:bg-white/20"
            onClick={onClose}
          >
            取消
          </Button>
          <Button className="flex-1 bg-blue-500/80 hover:bg-blue-600/80 font-light" onClick={handleSave}>
            保存设置
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default function PoliciesPage() {
  const router = useRouter()
  const [policies, setPolicies] = useState<Policy[]>([])
  const [showFilter, setShowFilter] = useState(false)
  const [showInterestsManagement, setShowInterestsManagement] = useState(false)
  const [loading, setLoading] = useState(true)

  const [filters, setFilters] = useState({
    timeRange: "all",
    statusFilter: ["pending", "completed"],
    interests: [],
  })

  useEffect(() => {
    setLoading(true)
    // 获取 businessPersonId
    let businessPersonId = ''
    if (typeof window !== 'undefined') {
      const userYk = localStorage.getItem('user_yk')
      if (userYk) {
        try {
          const user = JSON.parse(userYk)
          businessPersonId = user.business_person_id
        } catch {}
      }
      if (!businessPersonId) {
        const userInfo = localStorage.getItem('userInfo')
        if (userInfo) {
          try {
            const user = JSON.parse(userInfo)
            businessPersonId = user.business_person_id || user.id
          } catch {}
        }
      }
    }
    if (!businessPersonId) {
      setPolicies([])
      setLoading(false)
      return
    }
    // 先获取 policy_id 列表
    fetch(`/api/policies?businessPersonId=${businessPersonId}`)
      .then((res) => res.json())
      .then(async (data) => {
        if (data.success && Array.isArray(data.data)) {
          // data.data 是 policy_id 数组
          // 需要批量获取政策详情
          if (data.data.length === 0) {
            setPolicies([])
            return
          }
          // 并发获取详情
          const policyIds: string[] = Array.isArray(data.data) ? data.data : [];
          const detailResults = await Promise.all(
            policyIds.map((policyId) =>
              fetch(`/api/policies/${policyId}`).then((res) => res.json())
            )
          )
          const mapped = detailResults
            .filter((d) => d.success && d.data)
            .map((d) => {
              const item = d.data
              // 兼容 Policy 类型
              let status: 'pending' | 'completed' = 'completed';
              if (item.status === 'pending' || item.status === 'completed') {
                status = item.status;
              }
              return {
                id: item.policy_id,
                title: item.policy_title || "-",
                source: item.issued_authority || "-",
                publishDate: item.released_date ? new Date(item.released_date) : new Date(),
                timeAgo: "", // 可根据需要计算
                status,
                matchedProjects: 0, // 可根据需要调整
                unread: false, // 可根据需要调整
                category: item.category_name || "other",
                salesPitch: item.policy_content ? item.policy_content.slice(0, 60) + "..." : "-",
              } as Policy
            })
          // 按发布时间倒序排序
          mapped.sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
          setPolicies(mapped as Policy[])
        } else {
          setPolicies([])
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filteredPolicies = useMemo(() => {
    let filtered = [...policies]

    if (filters.timeRange !== "all") {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

      filtered = filtered.filter((policy) => {
        switch (filters.timeRange) {
          case "today":
            return policy.publishDate >= today
          case "week":
            return policy.publishDate >= weekAgo
          case "month":
            return policy.publishDate >= monthAgo
          default:
            return true
        }
      })
    }

    if (filters.interests.length > 0) {
      filtered = filtered.filter((policy) => filters.interests.includes(policy.category))
    }

    return filtered
  }, [policies, filters])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.timeRange !== "all") count++
    if (filters.interests.length > 0) count++
    return count
  }, [filters])

  return (
    <AppLayout hideNavigation={true}>
      {/* Apple风格页面头部 */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-50"
      >
        <div className="h-16 px-6 flex items-center max-w-6xl mx-auto">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/")}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-white/30 transition-all duration-200"
          >
            <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
          </motion.button>
          <h1 className="ml-4 text-lg sm:text-xl font-light text-slate-800 tracking-wide">新政新知</h1>
        </div>
      </motion.header>

      <div className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto px-6">
        {/* 筛选结果提示 */}
        {activeFilterCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 sm:mb-6 p-3 sm:p-4 glass-card border-blue-200/50"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0">
              <span className="text-xs sm:text-sm text-blue-700 font-light">
                已应用 {activeFilterCount} 个筛选条件，共找到 {filteredPolicies.length} 条政策
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({ timeRange: "all", statusFilter: ["pending", "completed"], interests: [] })}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50/50 font-light text-xs sm:text-sm"
              >
                清除筛选
              </Button>
            </div>
          </motion.div>
        )}

        {/* 政策Feed流列表 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="space-y-2 sm:space-y-3">
            <AnimatePresence>
              {loading
                ? Array.from({ length: 5 }, (_, idx) => idx).map((idx) => (
                    <div key={idx} className="bg-white border border-gray-200 shadow-sm rounded-lg p-3 sm:p-4">
                      <Skeleton className="h-5 sm:h-6 w-2/3 mb-3 sm:mb-4" />
                      <Skeleton className="h-3 sm:h-4 w-1/3 mb-2" />
                      <Skeleton className="h-3 sm:h-4 w-1/4 mb-2" />
                      <Skeleton className="h-3 sm:h-4 w-full mb-2" />
                      <Skeleton className="h-3 sm:h-4 w-5/6" />
                    </div>
                  ))
                : filteredPolicies.map((policy, index) => (
                    <motion.div
                      key={policy.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PolicyCard policy={policy} />
                    </motion.div>
                  ))}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* 空状态 */}
        {!loading && filteredPolicies.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 sm:py-16 glass-card">
            <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-slate-400 mx-auto mb-4 sm:mb-6" />
            <p className="text-slate-500 mb-2 font-light text-base sm:text-lg">
              {activeFilterCount > 0 ? "没有符合筛选条件的政策" : "暂无政策更新"}
            </p>
            <p className="text-xs sm:text-sm text-slate-400 font-light">
              {activeFilterCount > 0 ? "尝试调整筛选条件" : "请稍后再试"}
            </p>
            {activeFilterCount > 0 && (
              <Button
                variant="outline"
                className="mt-4 sm:mt-6 glass border-white/20 hover:bg-white/30 font-light text-sm"
                onClick={() => setFilters({ timeRange: "all", statusFilter: ["pending", "completed"], interests: [] })}
              >
                清除筛选条件
              </Button>
            )}
          </motion.div>
        )}
        </div>
      </div>

      {/* 筛选弹窗 */}
      <FilterSheet
        open={showFilter}
        onClose={() => setShowFilter(false)}
        onOpenInterestsManagement={() => setShowInterestsManagement(true)}
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* 关注领域管理弹窗 */}
      <InterestsManagementSheet open={showInterestsManagement} onClose={() => setShowInterestsManagement(false)} />
    </AppLayout>
  )
}
