"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Save, User, MapPin } from "lucide-react"
import { motion } from "framer-motion"

// 省份和城市数据
const PROVINCES_CITIES = {
  上海市: ["黄浦区", "徐汇区", "长宁区", "静安区", "普陀区", "虹口区", "杨浦区", "浦东新区"],
  江苏省: [
    "南京市",
    "苏州市",
    "无锡市",
    "常州市",
    "镇江市",
    "南通市",
    "泰州市",
    "扬州市",
    "盐城市",
    "连云港市",
    "徐州市",
    "宿迁市",
    "淮安市",
  ],
  浙江省: [
    "杭州市",
    "宁波市",
    "温州市",
    "嘉兴市",
    "湖州市",
    "绍兴市",
    "金华市",
    "衢州市",
    "舟山市",
    "台州市",
    "丽水市",
  ],
  安徽省: [
    "合肥市",
    "芜湖市",
    "蚌埠市",
    "淮南市",
    "马鞍山市",
    "淮北市",
    "铜陵市",
    "安庆市",
    "黄山市",
    "滁州市",
    "阜阳市",
    "宿州市",
    "六安市",
    "亳州市",
    "池州市",
    "宣城市",
  ],
  北京市: [
    "东城区",
    "西城区",
    "朝阳区",
    "丰台区",
    "石景山区",
    "海淀区",
    "门头沟区",
    "房山区",
    "通州区",
    "顺义区",
    "昌平区",
    "大兴区",
    "怀柔区",
    "平谷区",
    "密云区",
    "延庆区",
  ],
  天津市: [
    "和平区",
    "河东区",
    "河西区",
    "南开区",
    "河北区",
    "红桥区",
    "东丽区",
    "西青区",
    "津南区",
    "北辰区",
    "武清区",
    "宝坻区",
    "滨海新区",
  ],
  河北省: [
    "石家庄市",
    "唐山市",
    "秦皇岛市",
    "邯郸市",
    "邢台市",
    "保定市",
    "张家口市",
    "承德市",
    "沧州市",
    "廊坊市",
    "衡水市",
  ],
  广东省: [
    "广州市",
    "深圳市",
    "珠海市",
    "汕头市",
    "佛山市",
    "韶关市",
    "湛江市",
    "肇庆市",
    "江门市",
    "茂名市",
    "惠州市",
    "梅州市",
    "汕尾市",
    "河源市",
    "阳江市",
    "清远市",
    "东莞市",
    "中山市",
    "潮州市",
    "揭阳市",
    "云浮市",
  ],
  广西壮族自治区: [
    "南宁市",
    "柳州市",
    "桂林市",
    "梧州市",
    "北海市",
    "防城港市",
    "钦州市",
    "贵港市",
    "玉林市",
    "百色市",
    "贺州市",
    "河池市",
    "来宾市",
    "崇左市",
  ],
  海南省: ["海口市", "三亚市", "三沙市", "儋州市"],
}

// 职位列表
const POSITIONS = ["商务经理", "商务专员", "商务助理", "区域总监"]

// 模拟数据
const mockTeamMembers = [
  {
    id: "1",
    name: "张商务",
    phone: "13800138001",
    position: "商务经理",
    regions: [
      { province: "上海市", cities: ["黄浦区", "徐汇区"] },
      { province: "江苏省", cities: ["南京市", "苏州市"] },
    ],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    name: "李专员",
    phone: "13800138002",
    position: "商务专员",
    regions: [{ province: "广东省", cities: ["广州市", "深圳市"] }],
    createdAt: "2024-01-16",
    updatedAt: "2024-01-16",
  },
]

interface RegionData {
  province: string
  cities: string[]
}

interface FormData {
  name: string
  phone: string
  position: string
  regions: RegionData[]
}

export default function EditMemberPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    position: "",
    regions: [],
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const params = useParams()
  const { toast } = useToast()

  // 加载成员数据
  useEffect(() => {
    const loadMember = async () => {
      try {
        // 模拟API调用
        await new Promise((resolve) => setTimeout(resolve, 500))

        const member = mockTeamMembers.find((m) => m.id === params.id)
        if (member) {
          setFormData({
            name: member.name,
            phone: member.phone,
            position: member.position,
            regions: member.regions,
          })
        } else {
          toast({
            description: "成员不存在",
            variant: "destructive",
          })
          router.back()
        }
      } catch (error) {
        toast({
          description: "加载失败，请重试",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadMember()
  }, [params.id, router, toast])

  // 表单验证
  const validateForm = () => {
    const newErrors: Partial<FormData> = {}

    if (!formData.name.trim()) {
      newErrors.name = "请输入姓名"
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "请输入手机号"
    } else if (!/^1[3-9]\d{9}$/.test(formData.phone)) {
      newErrors.phone = "请输入正确的手机号格式"
    }

    if (!formData.position) {
      newErrors.position = "请选择职位"
    }

    if (formData.regions.length === 0) {
      newErrors.regions = []
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // 添加省份
  const addProvince = () => {
    setFormData((prev) => ({
      ...prev,
      regions: [...prev.regions, { province: "", cities: [] }],
    }))
  }

  // 删除省份
  const removeProvince = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.filter((_, i) => i !== index),
    }))
  }

  // 更新省份
  const updateProvince = (index: number, province: string) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.map((region, i) => (i === index ? { province, cities: [] } : region)),
    }))
  }

  // 处理城市选择
  const handleCityChange = (regionIndex: number, city: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      regions: prev.regions.map((region, i) =>
        i === regionIndex
          ? {
              ...region,
              cities: checked ? [...region.cities, city] : region.cities.filter((c) => c !== city),
            }
          : region,
      ),
    }))
  }

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        description: "成员信息更新成功",
      })

      router.back()
    } catch (error) {
      toast({
        description: "更新失败，请重试",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    )
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
            <h1 className="text-lg font-semibold text-gray-900">编辑成员</h1>
          </div>

          <Button size="sm" onClick={handleSubmit} disabled={isSubmitting}>
            <Save className="w-4 h-4 mr-1" />
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 基本信息 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="w-4 h-4" />
                  基本信息
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* 姓名 */}
                <div>
                  <Label htmlFor="name">姓名 *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                      if (errors.name) {
                        setErrors((prev) => ({ ...prev, name: undefined }))
                      }
                    }}
                    placeholder="请输入姓名"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* 手机号 */}
                <div>
                  <Label htmlFor="phone">手机号 *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData((prev) => ({ ...prev, phone: e.target.value }))
                      if (errors.phone) {
                        setErrors((prev) => ({ ...prev, phone: undefined }))
                      }
                    }}
                    placeholder="请输入手机号"
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                {/* 职位 */}
                <div>
                  <Label>职位 *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, position: value }))
                      if (errors.position) {
                        setErrors((prev) => ({ ...prev, position: undefined }))
                      }
                    }}
                  >
                    <SelectTrigger className={errors.position ? "border-red-500" : ""}>
                      <SelectValue placeholder="请选择职位" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((position) => (
                        <SelectItem key={position} value={position}>
                          {position}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && <p className="text-xs text-red-500 mt-1">{errors.position}</p>}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 负责区域 */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    负责区域
                  </CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addProvince}>
                    添加省份
                  </Button>
                </div>
                <p className="text-sm text-gray-500">选择该成员负责的省份和城市</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {formData.regions.map((region, regionIndex) => (
                    <div key={regionIndex} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <Label className="text-sm font-medium">省份 {regionIndex + 1}</Label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeProvince(regionIndex)}
                          className="text-red-500 hover:text-red-700"
                        >
                          删除
                        </Button>
                      </div>

                      {/* 省份选择 */}
                      <div className="mb-4">
                        <Select value={region.province} onValueChange={(value) => updateProvince(regionIndex, value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="请选择省份" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(PROVINCES_CITIES).map((province) => (
                              <SelectItem key={province} value={province}>
                                {province}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* 城市选择 */}
                      {region.province && (
                        <div>
                          <Label className="text-sm font-medium mb-2 block">选择城市</Label>
                          <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                            {PROVINCES_CITIES[region.province as keyof typeof PROVINCES_CITIES]?.map((city) => (
                              <div key={city} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`${regionIndex}-${city}`}
                                  checked={region.cities.includes(city)}
                                  onCheckedChange={(checked) => handleCityChange(regionIndex, city, checked as boolean)}
                                />
                                <Label htmlFor={`${regionIndex}-${city}`} className="text-sm cursor-pointer">
                                  {city}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {formData.regions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p>暂无负责区域，点击"添加省份"开始设置</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* 底部按钮 */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" className="flex-1" onClick={() => router.back()}>
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : "保存"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
