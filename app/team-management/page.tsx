"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Plus, Search, Edit, Trash2, User, Phone, CheckSquare, Square, Eye, EyeOff } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

// 数据结构定义
interface TeamMember {
  id: string
  name: string
  phone: string
  position: string
  regions: { province: string; cities: string[] }[]
  createdAt: string
  updatedAt: string
}

// 职位列表
const POSITIONS = ["商务经理", "商务专员", "商务助理", "区域总监"]

// 模拟数据
const mockTeamMembers: TeamMember[] = [
  {
    id: "1",
    name: "张商务",
    phone: "13800138001",
    position: "商务经理",
    regions: [
      { province: "江西省", cities: ["南昌市", "九江市"] },
      { province: "浙江省", cities: ["杭州市", "宁波市", "温州市"] },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "李专员",
    phone: "13800138002",
    position: "商务专员",
    regions: [
      { province: "江西省", cities: ["上饶市", "赣州市"] },
      { province: "福建省", cities: ["福州市", "厦门市"] },
    ],
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
  {
    id: "3",
    name: "王助理",
    phone: "13800138003",
    position: "商务助理",
    regions: [{ province: "江西省", cities: ["景德镇市", "萍乡市", "新余市"] }],
    createdAt: "2024-01-17",
    updatedAt: "2024-01-17",
  },
  {
    id: "4",
    name: "赵总监",
    phone: "13800138004",
    position: "区域总监",
    regions: [
      { province: "江西省", cities: ["宜春市", "抚州市", "吉安市"] },
      { province: "湖南省", cities: ["长沙市", "株洲市"] },
    ],
    createdAt: "2024-01-18",
    updatedAt: "2024-01-18",
  },
  {
    id: "5",
    name: "陈经理",
    phone: "13800138005",
    position: "商务经理",
    regions: [
      { province: "江西省", cities: ["鹰潭市"] },
      { province: "安徽省", cities: ["合肥市", "芜湖市", "蚌埠市"] },
    ],
    createdAt: "2024-01-19",
    updatedAt: "2024-01-19",
  },
  {
    id: "6",
    name: "刘专员",
    phone: "13800138006",
    position: "商务专员",
    regions: [{ province: "江西省", cities: ["赣州市", "吉安市"] }],
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
]

// 模拟管理员密码
const ADMIN_PASSWORD = "admin123"

export default function TeamManagementPage() {
  const [members, setMembers] = useState<TeamMember[]>(mockTeamMembers)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPosition, setSelectedPosition] = useState("全部职位")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null)
  const [batchMode, setBatchMode] = useState(false)
  const [adminPassword, setAdminPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  // 筛选后的成员列表
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.phone.includes(searchTerm) ||
        member.regions.some((region) =>
          region.cities.some((city) => city.toLowerCase().includes(searchTerm.toLowerCase())),
        )
      const matchesPosition = selectedPosition === "全部职位" || member.position === selectedPosition

      return matchesSearch && matchesPosition
    })
  }, [members, searchTerm, selectedPosition])

  // 获取城市列表
  const getCityList = (regions: { province: string; cities: string[] }[]) => {
    const allCities = regions.flatMap((region) => region.cities)
    return allCities.join("、")
  }

  // 验证管理员密码
  const validateAdminPassword = () => {
    if (adminPassword !== ADMIN_PASSWORD) {
      setPasswordError("管理员密码错误，请重新输入")
      return false
    }
    setPasswordError("")
    return true
  }

  // 删除成员
  const handleDeleteMember = (id: string) => {
    if (!validateAdminPassword()) {
      return
    }

    setMembers((prev) => prev.filter((member) => member.id !== id))
    setSelectedMembers((prev) => prev.filter((memberId) => memberId !== id))

    const memberName = members.find((m) => m.id === id)?.name
    toast({
      description: `已将 ${memberName} 从系统中移除`,
    })

    // 重置状态
    setShowDeleteDialog(false)
    setMemberToDelete(null)
    setAdminPassword("")
    setPasswordError("")
  }

  // 批量删除
  const handleBatchDelete = () => {
    if (!validateAdminPassword()) {
      return
    }

    setMembers((prev) => prev.filter((member) => !selectedMembers.includes(member.id)))
    const deletedCount = selectedMembers.length
    setSelectedMembers([])
    setBatchMode(false)

    toast({
      description: `已将 ${deletedCount} 个成员从系统中移除`,
    })

    // 重置状态
    setShowDeleteDialog(false)
    setAdminPassword("")
    setPasswordError("")
  }

  // 全选/取消全选
  const handleSelectAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([])
    } else {
      setSelectedMembers(filteredMembers.map((member) => member.id))
    }
  }

  // 单个选择
  const handleSelectMember = (id: string) => {
    setSelectedMembers((prev) => (prev.includes(id) ? prev.filter((memberId) => memberId !== id) : [...prev, id]))
  }

  // 打开删除弹窗
  const openDeleteDialog = (memberId?: string) => {
    setMemberToDelete(memberId || null)
    setShowDeleteDialog(true)
    setAdminPassword("")
    setPasswordError("")
  }

  // 关闭删除弹窗
  const closeDeleteDialog = () => {
    setShowDeleteDialog(false)
    setMemberToDelete(null)
    setAdminPassword("")
    setPasswordError("")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="p-2" onClick={() => router.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-gray-900">团队人员管理</h1>
          </div>

          <div className="flex items-center gap-2">
            {batchMode && (
              <Button
                variant="destructive"
                size="sm"
                onClick={() => openDeleteDialog()}
                disabled={selectedMembers.length === 0}
              >
                移除({selectedMembers.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setBatchMode(!batchMode)
                setSelectedMembers([])
              }}
            >
              {batchMode ? "取消" : "批量"}
            </Button>
            <Button size="sm" onClick={() => router.push("/team-management/add")}>
              <Plus className="w-4 h-4 mr-1" />
              添加
            </Button>
          </div>
        </div>
      </div>

      {/* 搜索和筛选栏 - 合并到一行 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex gap-2 mb-3">
          {/* 搜索框 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索姓名/手机/城市"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-9"
            />
          </div>

          {/* 职位筛选 */}
          <Select value={selectedPosition} onValueChange={setSelectedPosition}>
            <SelectTrigger className="w-28 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="全部职位">全部职位</SelectItem>
              {POSITIONS.map((position) => (
                <SelectItem key={position} value={position}>
                  {position}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* 批量操作栏 */}
        {batchMode && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={handleSelectAll} className="p-1">
                {selectedMembers.length === filteredMembers.length ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <Square className="w-4 h-4" />
                )}
              </Button>
              <span className="text-sm text-gray-600">
                已选择 {selectedMembers.length} / {filteredMembers.length}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 成员列表 - 高密度优化 */}
      <div className="p-3">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <User className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无团队成员</h3>
            <p className="text-sm text-gray-500 mb-4">
              {searchTerm || selectedPosition !== "全部职位" ? "没有符合筛选条件的成员" : "开始添加第一个团队成员吧"}
            </p>
            {!searchTerm && selectedPosition === "全部职位" && (
              <Button onClick={() => router.push("/team-management/add")}>
                <Plus className="w-4 h-4 mr-1" />
                添加成员
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {filteredMembers.map((member) => (
                <motion.div
                  key={member.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-sm border border-gray-100"
                >
                  <div className="p-3">
                    <div className="flex items-start gap-3">
                      {/* 批量选择复选框 */}
                      {batchMode && (
                        <Checkbox
                          checked={selectedMembers.includes(member.id)}
                          onCheckedChange={() => handleSelectMember(member.id)}
                          className="mt-1"
                        />
                      )}

                      {/* 头像 */}
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>

                      {/* 主要信息 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            {/* 第一行：姓名和职位 */}
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900">{member.name}</h3>
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {member.position}
                              </span>
                            </div>

                            {/* 第二行：手机号和负责地区 */}
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-700">
                                <Phone className="inline w-3.5 h-3.5 mr-1 text-gray-400" />
                                {member.phone}
                              </span>
                              <span className="text-sm text-gray-700 line-clamp-1">
                                负责地区：{getCityList(member.regions)}
                              </span>
                            </div>
                          </div>

                          {/* 操作按钮 */}
                          {!batchMode && (
                            <div className="flex items-center gap-1 ml-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push(`/team-management/edit/${member.id}`)}
                                className="p-1.5 h-auto"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openDeleteDialog(member.id)}
                                className="p-1.5 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* 删除确认弹窗 */}
      <Dialog open={showDeleteDialog} onOpenChange={closeDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>确认移除成员</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm text-gray-600 mb-2">
                {memberToDelete
                  ? `确定要把"${members.find((m) => m.id === memberToDelete)?.name}"从系统里移除吗？`
                  : `确定要把选中的 ${selectedMembers.length} 个成员从系统里移除吗？`}
              </p>
              <p className="text-xs text-red-500">移除后该账号将无法登录系统</p>
            </div>

            {/* 管理员密码验证 */}
            <div className="space-y-2">
              <Label htmlFor="admin-password" className="text-sm font-medium">
                请输入管理员密码
              </Label>
              <div className="relative">
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  value={adminPassword}
                  onChange={(e) => {
                    setAdminPassword(e.target.value)
                    setPasswordError("")
                  }}
                  placeholder="请输入管理员密码"
                  className={passwordError ? "border-red-500" : ""}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>
              {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDeleteDialog}>
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (memberToDelete) {
                  handleDeleteMember(memberToDelete)
                } else {
                  handleBatchDelete()
                }
              }}
              disabled={!adminPassword.trim()}
            >
              确认移除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
