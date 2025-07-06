"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import {
  ChevronLeft,
  Star,
  User,
  Calendar,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Copy,
  Check,
  FileText,
  Lightbulb,
  Target,
} from "lucide-react"
import { motion } from "framer-motion"
import { useParams } from 'next/navigation';

interface PersonDetailProps {
  params: {
    id: string
  }
}

interface PersonDetail {
  id: string
  name: string
  currentPosition: {
    department: string
    title: string
    startDate: string
  }
  hometown: string
  age: number
  region: string
  person_photo_url?: string
  focusAreas: string[]
  workHistory: Array<string | {
    period: string
    organization: string
    position: string
  }>
  education: Array<{
    school: string
    degree: string
    major: string
    period: string
  }>
  achievements: string[]
  recentActivities: Array<{
    id: string
    title: string
    description: string
    date: string
    timeAgo: string
    type: "internal" | "external"
    source: string
  }>
  contact?: {
    phone?: string
    wechat?: string
  }
}

// 模拟详细人物数据
const mockPersonDetails: Record<string, PersonDetail> = {
  "1": {
    id: "1",
    name: "张三",
    currentPosition: {
      department: "九江市发改委",
      title: "主任",
      startDate: "2022-03",
    },
    hometown: "南昌市",
    age: 52,
    region: "jiujiang",
    focusAreas: ["数字经济", "产业发展", "投资促进", "区域协调"],
    workHistory: [
      {
        period: "2022.03-至今",
        organization: "九江市发改委",
        position: "主任",
      },
      {
        period: "2019.06-2022.03",
        organization: "九江市发改委",
        position: "副主任",
      },
      {
        period: "2016.09-2019.06",
        organization: "九江市经信委",
        position: "副主任",
      },
      {
        period: "2013.12-2016.09",
        organization: "九江市招商局",
        position: "副局长",
      },
      {
        period: "2010.03-2013.12",
        organization: "九江经开区管委会",
        position: "副主任",
      },
    ],
    education: [
      {
        school: "南昌大学",
        degree: "硕士",
        major: "经济学",
        period: "1992-1995",
      },
      {
        school: "江西财经大学",
        degree: "学士",
        major: "国际贸易",
        period: "1988-1992",
      },
    ],
    achievements: [
      "主导九江市数字经济三年行动计划制定",
      "成功引进华为、腾讯等头部企业落户九江",
      "推动九江港数字化转型，提升物流效率30%",
      "获得江西省优秀公务员称号",
      "主持完成多项重大产业项目可研报告",
    ],
    recentActivities: [
      {
        id: "1",
        title: "张三：九江将建5个数字产业园",
        description: "发改委主任谈数字经济3年规划，投资500亿",
        date: "2025-06-22",
        timeAgo: "2小时前",
        type: "internal",
        source: "九江日报",
      },
      {
        id: "4",
        title: "张三：九江发改委主任 → 省发改委副主任",
        description: "主导过多个重大项目，熟悉投融资政策",
        date: "2025-06-20",
        timeAgo: "昨天",
        type: "external",
        source: "江西日报",
      },
      {
        id: "news_3",
        title: "张三出席长江中游城市群发展论坛",
        description: "发表主旨演讲，阐述九江在区域发展中的重要作用",
        date: "2025-06-18",
        timeAgo: "6天前",
        type: "internal",
        source: "九江日报",
      },
    ],
    contact: {
      phone: "0792-8****888",
      wechat: "zs_jiujiang",
    },
  },
}

// 话术生成弹窗组件
function ScriptGenerationModal({
  open,
  onClose,
  person,
}: {
  open: boolean
  onClose: () => void
  person: PersonDetail | null
}) {
  const [copied, setCopied] = useState(false)

  const scriptContent = `
【开场白】
张主任您好，我是亿科咨询的小王。听说您是南昌人，我也是江西老乡，上大学时经常去八一广场。很荣幸能有机会向您请教。

【话题切入】
看到您最近在数字经济论坛上的讲话，特别是关于产业数字化转型的观点很有启发。九江在长江经济带的区位优势确实得天独厚，您提出的"数字+港口+制造"的   展思路很有前瞻性。

【项目建议】
基于九江的产业基础和您主导的三年行动计划，我们在数字工厂改造方面有成熟方案。比如我们帮助某地级市完成了200亿数字产业园的融资方案，现在园区入驻率已达85%，年产值突破300亿。

【具体合作】
我们可以为九江提供：
1. 数字经济产业规划咨询
2. 重点项目可研报告编制
3. 招商引资专业服务
4. 政策资金申报指导

 希望能有机会详细汇报我们的方案，为九江的数字经济发展贡献一份力量。
`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent.trim())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("复制失败:", err)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>拜访话术建议 - {person?.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* 开场白 */}
          <div>
            <h3 className="flex items-center gap-2 font-medium mb-2">
              <FileText className="h-4 w-4 text-blue-600" />
              开场白
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                "张主任您好，我是亿科咨询的小王。听说您是{person?.hometown}
                人，我也是江西老乡，上大学时经常去八一广场。很荣幸能有机会向您请教。"
              </p>
            </div>
          </div>

          {/* 话题切入 */}
          <div>
            <h3 className="flex items-center gap-2 font-medium mb-2">
              <Lightbulb className="h-4 w-4 text-yellow-600" />
              话题切入
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                "看到您最近在数字经济论坛上的讲话，特别是关于{person?.focusAreas?.[0]}
                的观点很有启发。九江在长江经济带的区位优势确实得天独厚..."
              </p>
            </div>
          </div>

          {/* 项目建议 */}
          <div>
            <h3 className="flex items-center gap-2 font-medium mb-2">
              <Target className="h-4 w-4 text-green-600" />
              项目建议
            </h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">
                "基于九江的产业基础和您主导的三年行动计划，我们在{person?.focusAreas?.[0]}
                方面有成熟方案。比如我们帮助某地级市完成了200亿数字产业园的融资方案..."
              </p>
            </div>
          </div>

          {/* 准备材料 */}
          <div>
            <h3 className="flex items-center gap-2 font-medium mb-2">
              <FileText className="h-4 w-4 text-purple-600" />
              准备材料
            </h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                
                <span>{person?.focusAreas?.[0]}相关成功案例</span>
              </li>
              <li className="flex items-start gap-2">
                
                <span>投资收益数据分析</span>
              </li>
              <li className="flex items-start gap-2">
                
                <span>技术方案简要说明</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-0.5">•</span>
                <span>政策资金申报指导材料</span>
              </li>
            </ul>
          </div>

          {/* 完整话术 */}
          <div>
            <h3 className="flex items-center gap-2 font-medium mb-2">
              <MessageSquare className="h-4 w-4 text-indigo-600" />
              完整话术
            </h3>
            <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{scriptContent.trim()}</pre>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose}>
            关闭
          </Button>
          <Button onClick={handleCopy}>
            {copied ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                已复制
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 mr-2" />
                复制全部
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PersonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter()
  const { toast } = useToast()
  const [person, setPerson] = useState<PersonDetail | null>(null)
  const [isFollowed, setIsFollowed] = useState(false)
  const [expandedSections, setExpandedSections] = useState({
    achievements: false,
    activities: false,
  })
  const [showScriptModal, setShowScriptModal] = useState(false)

  useEffect(() => {


    
    // 从API获取数据
    const fetchPersonData = async () => {
      try {
        const response = await fetch(`/api/key-persons/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch person data');
        }
        const apiData = await response.json();
        console.log(apiData,'______________')
        // 映射API数据到PersonDetail结构
        const mappedData = {
          id: apiData.person_id,
          name: apiData.person_name,
          currentPosition: {
            department: apiData.department,
            title: apiData.position,
            startDate: apiData.start_date
          },
          hometown: apiData.ancestral_home,
          age: calculateAge(apiData.birth_date),
          region: apiData.region,
          person_photo_url: apiData.person_photo_url,
          focusAreas: JSON.parse(apiData.focus_areas || '[]'),
          workHistory: (() => { try { const parsed = JSON.parse(apiData.work_experience || '""'); if (Array.isArray(parsed)) { return parsed.flatMap(item => typeof item === 'string' ? parseWorkExperience(item) : item); } else if (typeof parsed === 'string') { return parseWorkExperience(parsed); } else { console.warn('Unexpected work experience format:', parsed); return []; } } catch (e) { console.error('JSON parse failed for work experience:', e, 'Raw data:', apiData.work_experience); const cleanedData = apiData.work_experience?.replace(/[\u0000-\u001F\u007F]/g, '') || ''; return parseWorkExperience(cleanedData); } })(),
          education: JSON.parse(apiData.education || '[]'),
          achievements: JSON.parse(apiData.achievements || '[]'),
          recentActivities: JSON.parse(apiData.recent_activities || '[]'),
          contact: (apiData.wechat_number || apiData.phone_number) ? { 
            wechat: apiData.wechat_number, 
            phone: apiData.phone_number 
          } : undefined
          // contact: (apiData.wechat_number || apiData.phone_number) ? { wechat_number: apiData.wechat_number, phone_number: apiData.phone_number } : undefined
        };
        if (mappedData.age !== null) {
          setPerson(mappedData as PersonDetail);
        } else {
          // 如果年龄为 null，则将 age 设置为默认值 0
          setPerson({ ...mappedData, age: 0 } as PersonDetail);
        }
        console.log('映射后的数据:', mappedData);
        setIsFollowed(Math.random() > 0.5);
      } catch (error) {
        console.error('Error fetching person data:', error);
        setPerson(null);
      }
    };

    fetchPersonData();
        // 模拟获取人物详情
    // const personData = mockPersonDetails[id]
    // if (personData) {
    //   setPerson(personData)
    //   // 模拟检查是否已关注
    //   setIsFollowed(Math.random() > 0.5)
    // }
    // console.log('查询到的数据-----',personData)
  }, [id])
// 计算年龄的辅助函数
const parseWorkExperience = (experienceStr: string): Array<{ period: string; organization: string; position: string; startYear: number; endYear: number }> => {
  const getYearFromPeriod = (period: string): number => {
    const yearMatch = period.match(/(\d{4})/);
    return yearMatch ? parseInt(yearMatch[1]) : 0;
  };

  if (!experienceStr) return [];
  // 分割主要条目（过滤空字符串）
  const mainEntries = experienceStr.split(/；+/).map(entry => entry.trim()).filter(entry => entry);
  const parsedItems = mainEntries.map(entry => {
    // 提取时间段 (匹配年份格式)
    const periodMatch = entry.match(/\d{4}年\d{1,2}月(?:--(?:\d{4}年\d{1,2}月|至今))?/);
    const period = periodMatch?.[0] || '';
  const startYear = getYearFromPeriod(period);
  const endYear = period.includes('至今') ? new Date().getFullYear() : getYearFromPeriod(period.split('--')[1] || '');
  // 提取剩余部分并清理
  const remaining = period ? entry.replace(period, '').trim().replace(/^，+/, '').replace(/^任/, '') : entry.trim().replace(/^，+/, '').replace(/^任/, '');
    // 分割组织和职位 (简单处理，实际可能需要更复杂逻辑)
    const parts = remaining.split('，');
    const organization = parts[0]?.trim() || '';
    const position = parts.slice(1).join('，').trim() || '';
    return {
    period,
    organization: organization.trim(),
    position: position.trim(),
    startYear,
    endYear
  };
  });
return parsedItems
  .filter(item => item.organization.trim() || item.position.trim() || item.period.trim())
  .sort((a, b) => b.endYear - a.endYear || b.startYear - a.startYear);
}

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

  // 计算年龄
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // 考虑月份和日期因素
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age >= 0 ? age : null;
}
  const handleToggleFollow = () => {
    setIsFollowed(!isFollowed)
    toast({
      title: isFollowed ? "已取消关注" : "关注成功",
      description: isFollowed ? "已取消关注该人物" : "已添加到关注列表",
    })
  }

  // 处理动态点击，跳转到对应的新闻详情页
  const handleActivityClick = (activity: PersonDetail["recentActivities"][0]) => {
    // 如果是线索追踪中存在的新闻，跳转到详情页
    if (activity.id === "1" || activity.id === "4") {
      router.push(`/leads/detail/${activity.id}`)
    } else {
      // 对于其他动态，可以显示提示或跳转到通用详情页
      toast({
        title: "查看详细内容",
        description: "正在跳转到详情页面",
      })
    }
  }

  if (!person) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">人物信息未找到</p>
          <Button onClick={() => router.back()} className="mt-4">
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-full mx-auto px-3 h-12 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回
          </Button>

          <Button variant="ghost" size="sm" onClick={handleToggleFollow}>
            <Star className={`h-4 w-4 mr-1 ${isFollowed ? "fill-yellow-400 text-yellow-400" : ""}`} />
            {isFollowed ? "已关注" : "关注"}
          </Button>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="px-3 py-4 w-full">
        {/* 近期动态 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Calendar className="h-4 w-4" />
              近期动态
            </h2>
            <Button variant="link" size="sm" className="text-blue-600 text-xs" onClick={() => router.push("/leads")}>
              查看全部 <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {(person.recentActivities || []).slice(0, expandedSections.activities ? undefined : 3).map((activity, index) => (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleActivityClick(activity)}
              >
                <span className={`mt-0.5 ${activity.type === "internal" ? "text-red-500" : "text-blue-500"}`}>
                  {activity.type === "internal" ? "●" : "🔄"}
                </span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1 text-sm">{activity.title}</h4>
                  <p className="text-xs text-gray-600 mb-1">{activity.description.replace(/,/g, '')}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{activity.timeAgo}</span>
                    
                    <span>{activity.source}</span>
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      {activity.type === "internal" ? "任内" : "任外"}
                    </Badge>
                  </div>
                </div>
                <ChevronRight className="h-3 w-3 text-gray-400 mt-1" />
              </motion.div>
            ))}
          </div>

          {((person.recentActivities || []).length > 3) && (
            <Button
              variant="link"
              size="sm"
              className="mt-3 p-0 text-xs"
              onClick={() => setExpandedSections({ ...expandedSections, activities: !expandedSections.activities })}
            >
              {expandedSections.activities ? "收起" : "展开更多"}
              <ChevronDown
                className={`h-3 w-3 ml-1 transition-transform ${expandedSections.activities ? "rotate-180" : ""}`}
              />
            </Button>
          )}
        </section>

        {/* 基本信息 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-lg p-4 mb-2">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900 mb-4">
            <User className="h-4 w-4" />
            基本信息
          </h2>

          <div className="space-y-3">
            {/* 头像和姓名 */}
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={person.person_photo_url || '/placeholder-user.jpg'}
                  alt={person.name || '用户头像'}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex gap-2">
                  <h1 className="text-md font-bold text-gray-900">{person.name || '未知姓名'}</h1>
                  <p className="text-md font-bold text-gray-700">{person.currentPosition?.department}</p>
                  <p className="text-md font-bold text-gray-700">· {person.currentPosition?.title}</p>
                </div>
                <div className="flex gap-2">
                  <p className="text-sm font-bold text-gray-700">{person.hometown}</p>
                  <p className="text-sm font-bold text-gray-700">· {person.age>0 ? `${person.age}岁` : '年龄未知'}</p>
                  <p className="text-sm font-bold text-gray-700">
                    · {new Date().getFullYear() - Number.parseInt(person.currentPosition?.startDate?.split("-")[0] || new Date().getFullYear().toString())}
                    年任职
                  </p>
                  
                  {person.contact && (
                    <>
                      {person.contact?.phone && (
                        <p className="text-sm font-bold text-gray-700">· 电话: {person.contact?.phone}</p>
                      )}
                      {person.contact?.wechat && (
                        <p className="text-sm font-bold text-gray-700">· 微信: {person.contact?.wechat}</p>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tab切换区域 */}
            <Tabs defaultValue="work" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="work">工作履历</TabsTrigger>
                <TabsTrigger value="achievements">主要成就</TabsTrigger>
                <TabsTrigger value="education">教育经历</TabsTrigger>
              </TabsList>

              {/* 工作履历 */}
              <TabsContent value="work" className="mt-4">
                <div className="space-y-2">
                  {(person.workHistory || [])
                    .filter(work => typeof work !== 'string' && (work.organization || work.position || work.period))
                    .map((work, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-900 text-sm">{typeof work === 'string' ? work : work.position}</span>
                        <span className="text-gray-600 text-sm">·</span>
                        <span className="text-gray-600 text-sm">{typeof work === 'string' ? work : work.organization}</span>
                        <span className="text-gray-600 text-sm">·</span>
                        <Badge variant={index === 0 ? "default" : "secondary"} className="text-xs">
                          {typeof work === 'string' ? work : work.period}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="outline" className="text-xs text-blue-600">
                            当前
                          </Badge>
                        )}
                      </motion.div>
                    ))
                  }
                </div>
              </TabsContent>

              {/* 主要成就 */}
              <TabsContent value="achievements" className="mt-4">
                <div className="space-y-2">
                  {(person.achievements || []).map((achievement, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2"
                    >
                      
                      <span className="text-sm text-gray-700">{achievement.replace(/,/g, '')}</span>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>

              {/* 教育经历 */}
              <TabsContent value="education" className="mt-4">
                <div className="space-y-2">
                  {(person.education || []).map((edu, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-semibold text-gray-900 text-sm">{edu.school.replace(/,/g, '')}</span>
                      <span className="text-gray-600 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{edu.degree.replace(/,/g, '')}</span>
                      <span className="text-gray-600 text-sm">·</span>
                      <span className="text-gray-600 text-sm">{edu.major.replace(/,/g, '')}</span>
                      <span className="text-gray-600 text-sm">·</span>
                      <Badge variant="outline" className="text-xs">
                        {edu.period}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      {/* 话术生成弹窗 */}
      <ScriptGenerationModal open={showScriptModal} onClose={() => setShowScriptModal(false)} person={person || {}} />
    </div>
  )
}
