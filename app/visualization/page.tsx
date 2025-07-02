"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import {
  ChevronLeft,
  Download,
  Share2,
  Crown,
  TrendingUp,
  Target,
  DollarSign,
  Maximize2,
  Minimize2,
  BarChart3,
} from "lucide-react"

interface ProjectData {
  region: string
  projectCount: number
  fundingScale: number
  rank: number
  isUserRegion?: boolean
}

interface InsightData {
  icon: React.ReactNode
  text: string
  type: "rank" | "comparison" | "scale"
}

interface Province {
  code: string
  name: string
  cities: City[]
}

interface City {
  code: string
  name: string
  counties: County[]
}

interface County {
  code: string
  name: string
}

// 三级行政区划数据
const administrativeData: Province[] = [
  {
    code: "330000",
    name: "浙江省",
    cities: [
      {
        code: "330100",
        name: "杭州市",
        counties: [
          { code: "330102", name: "上城区" },
          { code: "330105", name: "拱墅区" },
          { code: "330106", name: "西湖区" },
          { code: "330108", name: "滨江区" },
          { code: "330109", name: "萧山区" },
          { code: "330110", name: "余杭区" },
          { code: "330111", name: "富阳区" },
          { code: "330112", name: "临安区" },
          { code: "330113", name: "临平区" },
          { code: "330114", name: "钱塘区" },
          { code: "330122", name: "桐庐县" },
          { code: "330127", name: "淳安县" },
          { code: "330182", name: "建德市" },
        ],
      },
      {
        code: "330200",
        name: "宁波市",
        counties: [
          { code: "330203", name: "海曙区" },
          { code: "330205", name: "江北区" },
          { code: "330206", name: "北仑区" },
          { code: "330211", name: "镇海区" },
          { code: "330212", name: "鄞州区" },
          { code: "330213", name: "奉化区" },
          { code: "330225", name: "象山县" },
          { code: "330226", name: "宁海县" },
          { code: "330281", name: "余姚市" },
          { code: "330282", name: "慈溪市" },
        ],
      },
      {
        code: "330300",
        name: "温州市",
        counties: [
          { code: "330302", name: "鹿城区" },
          { code: "330303", name: "龙湾区" },
          { code: "330304", name: "瓯海区" },
          { code: "330305", name: "洞头区" },
          { code: "330324", name: "永嘉县" },
          { code: "330326", name: "平阳县" },
          { code: "330327", name: "苍南县" },
          { code: "330328", name: "文成县" },
          { code: "330329", name: "泰顺县" },
          { code: "330381", name: "瑞安市" },
          { code: "330382", name: "乐清市" },
          { code: "330383", name: "龙港市" },
        ],
      },
    ],
  },
  {
    code: "320000",
    name: "江苏省",
    cities: [
      {
        code: "320100",
        name: "南京市",
        counties: [
          { code: "320102", name: "玄武区" },
          { code: "320104", name: "秦淮区" },
          { code: "320105", name: "建邺区" },
          { code: "320106", name: "鼓楼区" },
          { code: "320111", name: "浦口区" },
          { code: "320113", name: "栖霞区" },
          { code: "320114", name: "雨花台区" },
          { code: "320115", name: "江宁区" },
          { code: "320116", name: "六合区" },
          { code: "320117", name: "溧水区" },
          { code: "320118", name: "高淳区" },
        ],
      },
      {
        code: "320200",
        name: "无锡市",
        counties: [
          { code: "320205", name: "锡山区" },
          { code: "320206", name: "惠山区" },
          { code: "320211", name: "滨湖区" },
          { code: "320213", name: "梁溪区" },
          { code: "320214", name: "新吴区" },
          { code: "320281", name: "江阴市" },
          { code: "320282", name: "宜兴市" },
        ],
      },
      {
        code: "320300",
        name: "徐州市",
        counties: [
          { code: "320302", name: "鼓楼区" },
          { code: "320303", name: "云龙区" },
          { code: "320305", name: "贾汪区" },
          { code: "320311", name: "泉山区" },
          { code: "320312", name: "铜山区" },
          { code: "320321", name: "丰县" },
          { code: "320322", name: "沛县" },
          { code: "320324", name: "睢宁县" },
          { code: "320381", name: "新沂市" },
          { code: "320382", name: "邳州市" },
        ],
      },
    ],
  },
  {
    code: "440000",
    name: "广东省",
    cities: [
      {
        code: "440100",
        name: "广州市",
        counties: [
          { code: "440103", name: "荔湾区" },
          { code: "440104", name: "越秀区" },
          { code: "440105", name: "海珠区" },
          { code: "440106", name: "天河区" },
          { code: "440111", name: "白云区" },
          { code: "440112", name: "黄埔区" },
          { code: "440113", name: "番禺区" },
          { code: "440114", name: "花都区" },
          { code: "440115", name: "南沙区" },
          { code: "440117", name: "从化区" },
          { code: "440118", name: "增城区" },
        ],
      },
      {
        code: "440300",
        name: "深圳市",
        counties: [
          { code: "440303", name: "罗湖区" },
          { code: "440304", name: "福田区" },
          { code: "440305", name: "南山区" },
          { code: "440306", name: "宝安区" },
          { code: "440307", name: "龙岗区" },
          { code: "440308", name: "盐田区" },
          { code: "440309", name: "龙华区" },
          { code: "440310", name: "坪山区" },
          { code: "440311", name: "光明区" },
          { code: "440312", name: "大鹏新区" },
        ],
      },
    ],
  },
]

const timeRanges = [
  { value: "1year", label: "近1年" },
  { value: "3years", label: "近3年" },
  { value: "5years", label: "近5年" },
]

// 模拟后台智能选择对比区县的逻辑
const getComparisonRegions = (selectedCounty: County, selectedCity: City, selectedProvince: Province): string[] => {
  // 优先选择同城区县
  const sameCityCounties = selectedCity.counties
    .filter((county) => county.code !== selectedCounty.code)
    .map((county) => county.name)
    .slice(0, 3)

  // 如果同城区县不足，选择同省其他城市的主要区县
  const otherCityCounties = selectedProvince.cities
    .filter((city) => city.code !== selectedCity.code)
    .flatMap((city) => city.counties.slice(0, 2))
    .map((county) => county.name)
    .slice(0, 5 - sameCityCounties.length)

  return [...sameCityCounties, ...otherCityCounties].slice(0, 5)
}

// 模拟数据生成函数
const generateMockData = (
  selectedCounty: County,
  selectedCity: City,
  selectedProvince: Province,
  timeRange: string,
): ProjectData[] => {
  const comparisonRegions = getComparisonRegions(selectedCounty, selectedCity, selectedProvince)
  const allRegions = [selectedCounty.name, ...comparisonRegions]

  // 基础数据（根据区县级别调整规模）
  const baseProjectCount = Math.floor(Math.random() * 20) + 10 // 10-30个项目
  const baseFundingScale = Math.floor(Math.random() * 50) + 20 // 20-70亿元

  const multiplier = timeRange === "1year" ? 1 : timeRange === "3years" ? 2.5 : 4.2

  const data = allRegions.map((region, index) => {
    const isUserRegion = index === 0
    const variance = 0.7 + Math.random() * 0.6 // 0.7-1.3的变化范围

    const projectCount = Math.round(baseProjectCount * multiplier * variance)
    const fundingScale = Math.round(baseFundingScale * multiplier * variance)

    return {
      region,
      projectCount,
      fundingScale,
      rank: 1,
      isUserRegion,
    }
  })

  // 按项目数量排序并更新排名
  data.sort((a, b) => b.projectCount - a.projectCount)
  data.forEach((item, index) => {
    item.rank = index + 1
  })

  return data
}

// 生成洞察数据
const generateInsights = (data: ProjectData[], selectedRegion: string): InsightData[] => {
  const userRegion = data.find((d) => d.isUserRegion)
  if (!userRegion) return []

  const topRegion = data[0]
  const insights: InsightData[] = []

  // 排名洞察
  insights.push({
    icon: <Crown className="h-5 w-5" />,
    text: `${selectedRegion}在对比中排名第${userRegion.rank}位`,
    type: "rank",
  })

  // 对比洞察
  if (userRegion.rank > 1) {
    const gap = topRegion.projectCount - userRegion.projectCount
    insights.push({
      icon: <TrendingUp className="h-5 w-5" />,
      text: `项目数量落后${topRegion.region} ${gap}个项目`,
      type: "comparison",
    })
  } else {
    insights.push({
      icon: <TrendingUp className="h-5 w-5" />,
      text: `项目数量领先，表现优异`,
      type: "comparison",
    })
  }

  // 规模洞察
  const scaleRatio = Math.round((userRegion.fundingScale / topRegion.fundingScale) * 100)
  insights.push({
    icon: <DollarSign className="h-5 w-5" />,
    text: `发行规模达到领先地区的${scaleRatio}%`,
    type: "scale",
  })

  return insights
}

// 使用Canvas和Chart.js实现的柱状图组件
const CanvasBarChart = ({ data, isFullscreen = false }: { data: ProjectData[]; isFullscreen?: boolean }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const chartRef = useRef<any>(null)

  useEffect(() => {
    if (!canvasRef.current || !data || data.length === 0) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // 销毁之前的图表
    if (chartRef.current) {
      chartRef.current.destroy()
    }

    // 动态导入Chart.js
    import("chart.js/auto")
      .then((Chart) => {
        const chartInstance = new Chart.default(ctx, {
          type: "bar",
          data: {
            labels: data.map((item) => item.region),
            datasets: [
              {
                label: "项目数量(个)",
                data: data.map((item) => item.projectCount),
                backgroundColor: "#4A90E2",
                borderColor: "#4A90E2",
                borderWidth: 1,
                yAxisID: "y",
              },
              {
                label: "发行规模(亿元)",
                data: data.map((item) => item.fundingScale),
                backgroundColor: "#52C41A",
                borderColor: "#52C41A",
                borderWidth: 1,
                yAxisID: "y1",
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
              mode: "index",
              intersect: false,
            },
            scales: {
              x: {
                display: true,
                title: {
                  display: true,
                  text: "区县",
                },
              },
              y: {
                type: "linear",
                display: true,
                position: "left",
                title: {
                  display: true,
                  text: "项目数量(个)",
                },
                ticks: {
                  color: "#4A90E2",
                },
              },
              y1: {
                type: "linear",
                display: true,
                position: "right",
                title: {
                  display: true,
                  text: "发行规模(亿元)",
                },
                ticks: {
                  color: "#52C41A",
                },
                grid: {
                  drawOnChartArea: false,
                },
              },
            },
            plugins: {
              legend: {
                display: true,
                position: "top",
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const label = context.dataset.label || ""
                    const value = context.parsed.y
                    const unit = label.includes("项目") ? "个" : "亿元"
                    return `${label}: ${value}${unit}`
                  },
                },
              },
            },
          },
        })

        chartRef.current = chartInstance
      })
      .catch((error) => {
        console.error("Failed to load Chart.js:", error)
      })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
      }
    }
  }, [data])

  return (
    <div className={`${isFullscreen ? "h-[80vh]" : "h-96"} w-full`}>
      <canvas ref={canvasRef} />
    </div>
  )
}

export default function VisualizationPage() {
  const router = useRouter()
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null)
  const [selectedCity, setSelectedCity] = useState<City | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<County | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("1year")
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<ProjectData[]>([])
  const [insights, setInsights] = useState<InsightData[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  // 省份变化时重置市和县
  const handleProvinceChange = (provinceCode: string) => {
    const province = administrativeData.find((p) => p.code === provinceCode)
    setSelectedProvince(province || null)
    setSelectedCity(null)
    setSelectedCounty(null)
    setHasGenerated(false)
  }

  // 城市变化时重置县
  const handleCityChange = (cityCode: string) => {
    if (!selectedProvince) return
    const city = selectedProvince.cities.find((c) => c.code === cityCode)
    setSelectedCity(city || null)
    setSelectedCounty(null)
    setHasGenerated(false)
  }

  // 县区变化
  const handleCountyChange = (countyCode: string) => {
    if (!selectedCity) return
    const county = selectedCity.counties.find((c) => c.code === countyCode)
    setSelectedCounty(county || null)
    setHasGenerated(false)
  }

  const generateChart = async () => {
    if (!selectedProvince || !selectedCity || !selectedCounty) return

    setIsLoading(true)

    try {
      // 模拟加载时间
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const data = generateMockData(selectedCounty, selectedCity, selectedProvince, selectedTimeRange)
      const insightData = generateInsights(data, selectedCounty.name)

      setChartData(data)
      setInsights(insightData)
      setHasGenerated(true)

      // 生成完成后自动全屏显示
      setTimeout(() => {
        setIsFullscreen(true)
      }, 500)
    } catch (error) {
      console.error("生成图表时出错:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 时间范围变化时自动重新生成
  useEffect(() => {
    if (hasGenerated && selectedProvince && selectedCity && selectedCounty) {
      generateChart()
    }
  }, [selectedTimeRange])

  const getTimeRangeLabel = () => {
    const range = timeRanges.find((t) => t.value === selectedTimeRange)
    return range?.label || "近1年"
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const canGenerate = selectedProvince && selectedCity && selectedCounty

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl font-semibold text-gray-900">竞态看板</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧筛选面板 */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-600" />
                  多区县项目情况对比图
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* 选择省份 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择省份</label>
                  <Select value={selectedProvince?.code || ""} onValueChange={handleProvinceChange}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="请选择省份" />
                    </SelectTrigger>
                    <SelectContent>
                      {administrativeData.map((province) => (
                        <SelectItem key={province.code} value={province.code}>
                          {province.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 选择城市 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择城市</label>
                  <Select
                    value={selectedCity?.code || ""}
                    onValueChange={handleCityChange}
                    disabled={!selectedProvince}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={selectedProvince ? "请选择城市" : "请先选择省份"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedProvince?.cities.map((city) => (
                        <SelectItem key={city.code} value={city.code}>
                          {city.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 选择区县 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">选择区县</label>
                  <Select
                    value={selectedCounty?.code || ""}
                    onValueChange={handleCountyChange}
                    disabled={!selectedCity}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder={selectedCity ? "请选择区县" : "请先选择城市"} />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedCity?.counties.map((county) => (
                        <SelectItem key={county.code} value={county.code}>
                          {county.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-2">系统将自动选择5个相关区县进行对比</p>
                </div>

                {/* 选择时间范围 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">时间范围</label>
                  <div className="space-y-2">
                    {timeRanges.map((range) => (
                      <Button
                        key={range.value}
                        variant={selectedTimeRange === range.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTimeRange(range.value)}
                        className="w-full justify-start"
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 生成按钮 */}
                <Button
                  onClick={generateChart}
                  disabled={!canGenerate || isLoading}
                  className="w-full h-12 text-base"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      智能分析中...
                    </>
                  ) : (
                    "生成对比分析"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 右侧图表区域 */}
          <div className="lg:col-span-3">
            <Card className="h-full">
              <CardContent className="p-6">
                {!hasGenerated && !isLoading && (
                  <div className="text-center py-20">
                    <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-6" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">开始您的数据分析</h3>
                    <p className="text-gray-500 mb-6">选择省份、城市、区县和时间范围，生成智能对比分析图表</p>
                  </div>
                )}

                {isLoading && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <Skeleton className="h-8 w-64" />
                      <Skeleton className="h-6 w-32" />
                    </div>
                    <Skeleton className="h-96 w-full" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                      <Skeleton className="h-20 w-full" />
                    </div>
                  </div>
                )}

                {hasGenerated && !isLoading && (
                  <div className="space-y-6">
                    {/* 图表标题和操作按钮 */}
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{selectedCounty?.name}竞态看板</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          统计周期：{getTimeRangeLabel()} | 智能匹配5个对比区县
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                          <Maximize2 className="h-4 w-4 mr-2" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          分享
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </Button>
                      </div>
                    </div>

                    {/* 图表 */}
                    <div className="bg-white rounded-lg border p-4">
                      <CanvasBarChart data={chartData} />
                    </div>

                    {/* 关键洞察 */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">关键洞察</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {insights.map((insight, index) => (
                          <div
                            key={index}
                            className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100"
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-blue-600 mt-1">{insight.icon}</div>
                              <p className="text-sm text-gray-700 leading-relaxed">{insight.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* 全屏图表对话框 */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-6">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {selectedCounty?.name}项目对比分析 - {getTimeRangeLabel()}
            </DialogTitle>
            <DialogDescription>详细的区县项目数量和发行规模对比分析图表</DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            <div className="flex justify-end mb-4">
              <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                <Minimize2 className="h-4 w-4 mr-2" />
                退出全屏
              </Button>
            </div>
            <CanvasBarChart data={chartData} isFullscreen={true} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
