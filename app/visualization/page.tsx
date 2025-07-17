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
import QRCode from 'qrcode';
import { useSearchParams } from "next/navigation"
import { Suspense } from "react";

interface ProjectData {
  region: string
  projectCount: number
  fundingScale: number
  rank: number
  isUserRegion?: boolean
  score?: number // 新增：用于智能排序的得分
}

interface InsightData {
  icon: React.ReactNode
  text: string
  type: "rank" | "comparison" | "scale"
}

// 省市区数据结构调整
interface Region {
  region_code: string;
  region_name: string;
  region_level: string;
  parent_code: string | null;
  parent_cn?: string;
  cities?: Region[];
  counties?: Region[];
}

export const dynamic = "force-dynamic";

export default function VisualizationPage() {
  return (
    <Suspense fallback={<div>加载中...</div>}>
      <MainContent />
    </Suspense>
  );
}

function MainContent() {
  const router = useRouter()
  const searchParams = useSearchParams();
  const isFromWxShare = searchParams?.get('from') === 'wxshare';
  const [selectedProvince, setSelectedProvince] = useState<Region | null>(null)
  const [selectedCity, setSelectedCity] = useState<Region | null>(null)
  const [selectedCounty, setSelectedCounty] = useState<Region | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("1year")
  const [isLoading, setIsLoading] = useState(false)
  const [chartData, setChartData] = useState<ProjectData[]>([])
  const [insights, setInsights] = useState<InsightData[]>([])
  const [hasGenerated, setHasGenerated] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [regions, setRegions] = useState<Region[]>([]);
  // 在 VisualizationPage 组件内添加二维码弹窗状态
  const [showQR, setShowQR] = useState(false);
  const [qrUrl, setQrUrl] = useState<string | null>(null);
  // 页面渲染时 showDataLabels=false，下载时临时切换为true
  const [showDataLabels, setShowDataLabels] = useState(false);

  // 只在客户端生成二维码图片
  useEffect(() => {
    if (showQR && typeof window !== 'undefined') {
      let url = window.location.origin + window.location.pathname;
      if (window.location.search) {
        const params = new URLSearchParams(window.location.search);
        params.set('from', 'wxshare');
        url += '?' + params.toString();
      } else {
        url += '?from=wxshare';
      }
      QRCode.toDataURL(url).then(setQrUrl);
    }
  }, [showQR]);

  useEffect(() => {
    async function fetchRegions() {
      const res = await fetch('/api/region-info');
      const { data } = await res.json();
      // 适配后端数据为 Region 结构
      const regions: Region[] = [];
      if (Array.isArray(data)) {
        data.forEach((item: any) => {
          // 省份
          if (item.province_code && !regions.some(r => r.region_code === item.province_code)) {
            regions.push({
              region_code: item.province_code,
              region_name: item.province_cn,
              region_level: '1',
              parent_code: null,
            });
          }
          // 城市
          if (item.city_code && !regions.some(r => r.region_code === item.city_code)) {
            regions.push({
              region_code: item.city_code,
              region_name: item.city_cn,
              region_level: '2',
              parent_code: item.province_code,
            });
          }
          // 区县
          if (item.district_code && !regions.some(r => r.region_code === item.district_code)) {
            regions.push({
              region_code: item.district_code,
              region_name: item.district_cn,
              region_level: '3',
              parent_code: item.city_code,
            });
          }
        });
      }
      setRegions(regions);
    }
    fetchRegions();
  }, []);

  // 省份列表（region_level === '1'）
  const provinceList = regions.filter(r => r.region_level === '1');
  // 城市列表（region_level === '2'，parent_code === 选中省份的 region_code）
  const cityList = selectedProvince ? regions.filter(r => r.region_level === '2' && r.parent_code === selectedProvince.region_code) : [];
  // 区县列表（region_level === '3'，parent_code === 选中城市的 region_code）
  const countyList = selectedCity ? regions.filter(r => r.region_level === '3' && r.parent_code === selectedCity.region_code) : [];

  // 直辖市 code 列表
  const DIRECT_MUNICIPALITY_CODES = ['110000', '120000', '310000', '500000'];

  const timeRanges = [
    { value: "1year", label: "近1年" },
    { value: "3years", label: "近3年" },
    { value: "5years", label: "近5年" },
  ]

  // 智能选择对比区县，兼容直辖市和普通省份
  // 已废弃，无需保留

  // 真实数据获取和适配，兼容 region_special_bond_stats 字段
  const fetchRealData = async (
    selectedCounty: Region,
    selectedCity: Region,
    selectedProvince: Region,
    timeRange: string
  ): Promise<ProjectData[]> => {
    // 1. 获取同市所有区县的 region_code
    const allSameCityCounties = regions.filter(r => 
      r.region_level === '3' && 
      r.parent_code === selectedCity.region_code
    );
    
    const allRegionCodes = allSameCityCounties.map(county => county.region_code);

    // timeRange -> year_dim
    let year_dim = '1'
    if (timeRange === '3years') year_dim = '3'
    if (timeRange === '5years') year_dim = '5'

    // 2. 并发请求同市所有区县数据
    const results = await Promise.all(
      allRegionCodes.map(async (region_code) => {
        if (!region_code) return null;
        const res = await fetch(`/api/visualization?region_code=${region_code}&year_dim=${year_dim}`)
        const { data } = await res.json()
        return data && data[0] ? { ...data[0], isUserRegion: region_code === selectedCounty.region_code } : null
      })
    )
    
    // 3 适配 ProjectData 结构
    let allData: ProjectData[] = results.filter(Boolean).map((item: any) => ({
      region: item.region_name,
      projectCount: Number(item.project_amount),
      fundingScale: Number(item.issued_amount),
      rank: 1,
      isUserRegion: item.isUserRegion,
    }))

    //4. 控制台打印：显示同市所有区县数据（按项目数量从高到低排序）
    const sortedAllData = [...allData].sort((a, b) => b.projectCount - a.projectCount);
    console.log(`=== ${selectedCity.region_name} 所有区县数据（按项目数量排序）===`);
    console.log(`统计周期: ${timeRange === "1year" ? "近1年" : timeRange === "3years" ? "近3年" : "近5年"}`);
    console.table(sortedAllData.map((item, index) => ({
      排名: index + 1,
      区县: item.region,
      项目数量: item.projectCount + '个',
      发行规模: item.fundingScale + '亿元',
      是否选中: item.isUserRegion ? '✅' : '❌'
    })));
    console.log(`总计区县数量: ${allData.length}个`);
    console.log('=====================================');

    // 4. 只展示项目数量或发行规模比当前区县高的区县（不包含等于），加上自己，最多6个，按项目数量从高到低排序
    const sorted = [...allData].sort((a, b) => b.projectCount - a.projectCount);
    const topFive = sorted.slice(0, 5);
    const userRegion = allData.find(d => d.isUserRegion);
    if (userRegion) {
      let result = topFive;
      const inTopFive = topFive.some(d => d.region === userRegion.region);
      if (!inTopFive) {
        result = [...topFive, userRegion];
      }
      // 只保留项目数量或发行规模比当前区县高的区县（不包含等于），加上自己
      const filtered = result.filter(item =>
        item.region === userRegion.region ||
        item.projectCount > userRegion.projectCount ||
        item.fundingScale > userRegion.fundingScale
      );
      // 去重并排序，最多6个
      const uniqueResult = Array.from(new Map(filtered.map(item => [item.region, item])).values());
      uniqueResult.sort((a, b) => b.projectCount - a.projectCount);
      uniqueResult.forEach((item, idx) => (item.rank = idx + 1));
      return uniqueResult.slice(0, 6);
    }
    // 如果没有找到用户区县，按项目数量排序
    allData.sort((a, b) => b.projectCount - a.projectCount)
    allData.forEach((item, idx) => (item.rank = idx + 1))
    return allData
  }

  // 生成洞察数据逻辑不变
  const generateInsights = (data: ProjectData[], selectedRegion: string): InsightData[] => {
    // 1. 按项目数量降序排序，找到自己真实排名
    const sorted = [...data].sort((a, b) => b.projectCount - a.projectCount);
    const userRegion = data.find(d => d.isUserRegion);
    if (!userRegion) return [];
    const userRank = sorted.findIndex(d => d.region === userRegion.region) + 1;
    const topRegion = sorted[0];

    const insights: InsightData[] = [];
    insights.push({
      icon: <Crown className="h-5 w-5" />, text: `${selectedRegion}在对比中排名第${userRank}位`, type: "rank",
    });

    if (userRank > 1) {
      const gap = topRegion.projectCount - userRegion.projectCount;
      insights.push({
        icon: <TrendingUp className="h-5 w-5" />, text: `项目数量落后${topRegion.region} ${gap}个项目`, type: "comparison",
      });
    } else {
      insights.push({
        icon: <TrendingUp className="h-5 w-5" />, text: `项目数量领先，表现优异`, type: "comparison",
      });
    }

    const scaleRatio = topRegion.fundingScale > 0
      ? Math.round((userRegion.fundingScale / topRegion.fundingScale) * 100)
      : 0;
    insights.push({
      icon: <DollarSign className="h-5 w-5" />, text: `发行规模达到领先地区的${scaleRatio}%`, type: "scale",
    });

    return insights;
  }

  // 使用Canvas和Chart.js实现的柱状图组件
  const CanvasBarChart = ({ data, isFullscreen = false, showDataLabels = false }: { data: ProjectData[]; isFullscreen?: boolean; showDataLabels?: boolean }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const chartRef = useRef<any>(null);

    useEffect(() => {
      if (!canvasRef.current || !data || data.length === 0) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // 彻底销毁旧实例
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }

      let destroyed = false;

      Promise.all([
        import("chart.js/auto"),
        import("chartjs-plugin-datalabels") as any
      ])
        .then(([Chart, ChartDataLabels]) => {
          if (destroyed) return;
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
              layout: {
                padding: {
                  bottom: 48,
                },
              },
              interaction: {
                mode: "index",
                intersect: false,
              },
              plugins: {
                legend: {
                  display: true,
                  position: "top",
                  labels: {
                    font: {
                      size: isMobile ? 10 : (isFullscreen ? 28 : 20),
                      weight: 'bold',
                    },
                    color: '#222',
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.dataset.label || "";
                      const value = context.parsed.y;
                      const unit = label.includes("项目") ? "个" : "亿元";
                      return `${label}: ${value}${unit}`;
                    },
                  },
                },
                datalabels: {
                  display: showDataLabels,
                  clamp: true,
                  anchor: 'end',
                  align: 'start',
                  font: (ctx: any) => ({
                    weight: 'bold',
                    size: isMobile ? 12 : (ctx.chart.options.scales?.x?.title?.font?.size || 20),
                  }),
                  color: '#fff', // 数据标签白色
                  formatter: (value: any, ctx: any) => ctx.dataset.label === '项目数量(个)' ? `${value}个` : `${value}亿元`,
                },
              },
              scales: {
                x: {
                  display: true,
                  title: {
                    display: true,
                    text: "区县",
                    font: {
                      size: isMobile ? 10 : (isFullscreen ? 28 : 20),
                      weight: 'bold',
                    },
                    color: '#222',
                  },
                  ticks: {
                    color: "#222",
                    font: {
                      size: isMobile ? 10 : 24,
                      weight: "bold",
                    },
                    maxRotation: isMobile ? 0 : 45,
                    minRotation: isMobile ? 0 : 45,
                    autoSkip: isMobile ? true : false,
                  },
                },
                y: {
                  type: "linear",
                  display: true,
                  position: "left",
                  title: {
                    display: true,
                    text: "项目数量(个)",
                    font: {
                      size: isMobile ? 10 : (isFullscreen ? 28 : 20),
                      weight: 'bold',
                    },
                    color: '#222',
                  },
                  ticks: {
                    color: "#222",
                    font: {
                      size: isMobile ? 10 : 24,
                      weight: 'bold',
                    },
                  },
                },
                y1: {
                  type: "linear",
                  display: true,
                  position: "right",
                  title: {
                    display: true,
                    text: "发行规模(亿元)",
                    font: {
                      size: isMobile ? 10 : (isFullscreen ? 28 : 20),
                      weight: 'bold',
                    },
                    color: '#222',
                  },
                  ticks: {
                    color: "#222",
                    font: {
                      size: isMobile ? 10 : 24,
                      weight: 'bold',
                    },
                  },
                  grid: {
                    drawOnChartArea: false,
                  },
                },
              },
            },
            plugins: [(ChartDataLabels as any).default],
          });
          chartRef.current = chartInstance;
        })
        .catch((error) => {
          console.error("Failed to load Chart.js or plugin:", error);
        });

      return () => {
        destroyed = true;
        if (chartRef.current) {
          chartRef.current.destroy();
          chartRef.current = null;
        }
      };
    }, [data, isFullscreen, showDataLabels]);

    // 在CanvasBarChart组件内，判断是否为移动端
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 600;

    return (
      <div className={`${isFullscreen ? "h-[80vh]" : isMobile ? "h-60" : "h-[500px]"} w-full`}>
        <canvas ref={canvasRef} />
      </div>
    );
  };

  // 省份变化时重置市和县，直辖市自动选中唯一城市
  const handleProvinceChange = (provinceCode: string) => {
    const province = provinceList.find((p) => p.region_code === provinceCode) || null;
    setSelectedProvince(province);
    if (province && DIRECT_MUNICIPALITY_CODES.includes(province.region_code)) {
      // 直辖市自动选中“城市”节点（其实就是省本身）
      const city = {
        region_code: province.region_code,
        region_name: province.region_name,
        region_level: '2',
        parent_code: province.region_code,
      };
      setSelectedCity(city);
    } else {
      setSelectedCity(null);
    }
    setSelectedCounty(null);
    setHasGenerated(false);
  };

  // 城市变化时重置县
  const handleCityChange = (cityCode: string) => {
    const city = cityList.find((c) => c.region_code === cityCode) || null;
    setSelectedCity(city);
    setSelectedCounty(null);
    setHasGenerated(false);
  };

  // 区县变化
  const handleCountyChange = (countyCode: string) => {
    const county = countyList.find((c) => c.region_code === countyCode) || null;
    setSelectedCounty(county);
    setHasGenerated(false);
  };

  // 生成图表按钮逻辑
  const generateChart = async () => {
    if (!selectedProvince || !selectedCity || !selectedCounty) return
    setIsLoading(true)
    try {
      const data = await fetchRealData(selectedCounty, selectedCity, selectedProvince, selectedTimeRange)
      setChartData(data)
      setInsights(generateInsights(data, selectedCounty.region_name))
      setHasGenerated(true)
      setTimeout(() => { setIsFullscreen(true) }, 500)
    } catch (error) {
      console.error("生成图表时出错:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 移除自动调用 generateChart 的 useEffect，防止死循环
  // useEffect(() => {
  //   if (hasGenerated && selectedProvince && selectedCity && selectedCounty) {
  //     generateChart()
  //   }
  // }, [selectedTimeRange])

  const getTimeRangeLabel = () => {
    const range = timeRanges.find((t) => t.value === selectedTimeRange)
    return range?.label || "近1年"
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  const canGenerate = selectedProvince && selectedCity && selectedCounty

  // 城市下拉框是否禁用（直辖市时禁用）
  const isCityDisabled = !selectedProvince || (selectedProvince && DIRECT_MUNICIPALITY_CODES.includes(selectedProvince.region_code));

  // VisualizationPage 组件内，添加下载函数：
  const handleDownloadChart = () => {
    setShowDataLabels(true);
    setTimeout(() => {
      const canvas = document.querySelector('canvas');
      if (!canvas) return;
      // 提高分辨率：临时放大canvas再导出
      const scale = 3;
      const width = canvas.width;
      const height = canvas.height;
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width * scale;
      tempCanvas.height = height * scale;
      const ctx = tempCanvas.getContext('2d');
      if (ctx) {
        ctx.scale(scale, scale);
        ctx.drawImage(canvas, 0, 0);
        const url = tempCanvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'chart.png';
        link.click();
      }
      setShowDataLabels(false);
    }, 300); // 等待300ms确保图表刷新
  };

  // 分享按钮绑定事件
  const handleShare = () => setShowQR(true);
  const handleCloseQR = () => setShowQR(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航 */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isFromWxShare && (
              <Button variant="ghost" size="sm" onClick={() => router.push("/")} className="-ml-2">
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-3">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">竞态看板</h1>
            </div>
          </div>
        </div>
      </header>

      {/* 主体内容 */}
      <main className="w-full px-2 sm:max-w-7xl sm:mx-auto sm:px-6 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* 左侧筛选面板 */}
          <div className="w-full sm:lg:col-span-1 mb-4 sm:mb-0">
            <div className="bg-white rounded-xl shadow-lg w-full p-2 sm:p-6 sticky top-4">
              <div className="mb-6">
                <div className="text-base sm:text-lg font-bold flex items-center gap-2 text-gray-900">
                  <Target className="h-5 w-5 text-blue-600" />
                  多区县项目情况对比图
                </div>
              </div>
              <div className="space-y-6">
                {/* 选择省份 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">选择省份</label>
                  <Select value={selectedProvince?.region_code || ""} onValueChange={handleProvinceChange}>
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder="请选择省份" />
                    </SelectTrigger>
                    <SelectContent>
                      {provinceList.map((province) => (
                        <SelectItem key={province.region_code} value={province.region_code}>
                          {province.region_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 选择城市 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">选择城市</label>
                  <Select
                    value={selectedCity?.region_code || (selectedProvince && DIRECT_MUNICIPALITY_CODES.includes(selectedProvince.region_code) ? selectedProvince.region_code : "")}
                    onValueChange={handleCityChange}
                    disabled={isCityDisabled}
                  >
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder={selectedProvince ? "请选择城市" : "请先选择省份"} />
                    </SelectTrigger>
                    <SelectContent>
                      {isCityDisabled && selectedProvince && DIRECT_MUNICIPALITY_CODES.includes(selectedProvince.region_code) ? (
                        <SelectItem key={selectedProvince.region_code} value={selectedProvince.region_code}>
                          {selectedProvince.region_name}
                        </SelectItem>
                      ) : (
                        cityList.map((city) => (
                          <SelectItem key={city.region_code} value={city.region_code}>
                            {city.region_name}
                          </SelectItem>
                        ))
                      )}
                    </SelectContent>
                  </Select>
                </div>

                {/* 选择区县 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">选择区县</label>
                  <Select
                    value={selectedCounty?.region_code || ""}
                    onValueChange={handleCountyChange}
                    disabled={!selectedCity}
                  >
                    <SelectTrigger className="h-11 border-gray-300">
                      <SelectValue placeholder={selectedCity ? "请选择区县" : "请先选择城市"} />
                    </SelectTrigger>
                    <SelectContent>
                      {countyList.map((county) => (
                        <SelectItem key={county.region_code} value={county.region_code}>
                          {county.region_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[10px] sm:text-xs text-gray-500 mt-2">系统将自动选择5个相关区县进行对比</p>
                </div>

                {/* 选择时间范围 */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-3">时间范围</label>
                  <div className="space-y-2">
                    {timeRanges.map((range) => (
                      <Button
                        key={range.value}
                        variant={selectedTimeRange === range.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTimeRange(range.value)}
                        className={`w-full justify-start text-xs sm:text-sm${selectedTimeRange !== range.value ? ' border-gray-300' : ''}`}
                      >
                        {range.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={generateChart}
                  disabled={!canGenerate || isLoading}
                  className="w-full h-12 text-sm sm:text-base rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold shadow"
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
              </div>
            </div>
          </div>

          {/* 右侧图表区域 */}
          <div className="w-full sm:lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg h-full w-full p-2 sm:p-8">
                {!hasGenerated && !isLoading && (
                  <div className="text-center py-10 sm:py-20">
                    <BarChart3 className="h-16 w-16 text-blue-200 mx-auto mb-6" />
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">开始您的数据分析</h3>
                    <p className="text-xs sm:text-base text-gray-500 mb-6">选择省份、城市、区县和时间范围，生成智能对比分析图表</p>
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
                  <div className="space-y-4 sm:space-y-8">
                    {/* 图表标题和操作按钮 */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-gray-900 break-all whitespace-normal text-left w-full leading-snug">
                          {selectedCounty?.region_name}竞态看板
                        </h3>
                        <p className="text-xs sm:text-base text-gray-500 mt-1 break-all whitespace-normal text-left w-full leading-snug">
                          统计周期：{getTimeRangeLabel()} | 智能匹配5个对比区县
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={toggleFullscreen} className="rounded-md border-gray-300">
                          <Maximize2 className="h-4 w-4 mr-2" />
                          查看详情
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleShare} className="rounded-md border-gray-300">
                          <Share2 className="h-4 w-4 mr-2" />
                          分享
                        </Button>
                        <Button variant="outline" size="sm" onClick={handleDownloadChart} className="rounded-md border-gray-300">
                          <Download className="h-4 w-4 mr-2" />
                          下载
                        </Button>
                      </div>
                    </div>

                    {/* 图表 */}
                    <div className="bg-white rounded-xl border p-2 sm:p-6 shadow w-full">
                      <CanvasBarChart data={chartData} showDataLabels={showDataLabels} />
                    </div>

                    {/* 关键洞察 */}
                    <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-6">关键洞察</h4>
                    <div className="flex flex-col items-center sm:grid sm:grid-cols-3 gap-4 sm:gap-6 w-full">
                      {insights.map((insight, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center justify-center gap-2 bg-blue-50 rounded-2xl shadow-md p-6 min-w-[220px] max-w-[340px] w-full sm:w-full text-center h-28 mx-auto"
                        >
                          <div className="text-blue-600 text-2xl flex-shrink-0 flex items-center justify-center mb-1">{insight.icon}</div>
                          <div className="font-semibold text-xs sm:text-base text-gray-900 break-words text-center w-full">
                            {insight.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      </main>

      {/* 全屏图表对话框 */}
      <Dialog open={isFullscreen} onOpenChange={setIsFullscreen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] p-6" hideCloseButton>
          <DialogHeader>
            <DialogTitle className="text-base sm:text-xl">
              {selectedCounty?.region_name}项目对比分析 - {getTimeRangeLabel()}
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-base text-black">详细的区县项目数量和发行规模对比分析图表</DialogDescription>
          </DialogHeader>
          {/* 右上角绝对定位的退出全屏按钮 */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="border-gray-300 absolute right-2 top-2 sm:right-4 sm:top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground px-2 py-1 sm:px-4 sm:py-2 text-xs sm:text-base"
          >
            <Minimize2 className="h-3 w-3 mr-1 sm:h-4 sm:w-4 sm:mr-2" />
            <span className="hidden sm:inline">退出全屏</span>
            <span className="inline sm:hidden">退出</span>
          </Button>
          <div className="mt-4">
            <CanvasBarChart data={chartData} isFullscreen={true} showDataLabels={showDataLabels} />
          </div>
        </DialogContent>
      </Dialog>

      {/* 微信二维码弹窗 */}
      {showQR && typeof window !== 'undefined' && (
        <div style={{
          position: 'fixed', left: 0, top: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
        }}>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8, textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}>微信扫码分享当前页面</div>
            {qrUrl && <img src={qrUrl} alt="二维码" style={{ width: 200, height: 200 }} />}
            <div>
              <Button onClick={handleCloseQR} style={{ marginTop: 16 }}>关闭</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
