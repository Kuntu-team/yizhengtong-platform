"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
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
} from "lucide-react";
import { motion } from "framer-motion";
import { useParams } from "next/navigation";
import Cookies from "js-cookie";

interface PersonDetailProps {
  params: {
    id: string;
  };
}

interface PersonDetail {
  id: string;
  name: string;
  currentPosition: {
    department: string;
    title: string;
    startDate: string;
  };
  hometown: string;
  age: number;
  region: string;
  person_photo_url?: string;
  focusAreas: string[];
  workHistory: Array<
    | string
    | {
        period: string;
        organization: string;
        position: string;
      }
  >;
  education: Array<{
    school: string;
    degree: string;
    major: string;
    period: string;
  }>;
  achievements: string[];
  recentActivities: Array<{
    id: string;
    title: string;
    description: string;
    date: string;
    timeAgo: string;
    type: "internal" | "external";
    source: string;
  }>;
  contact?: {
    phone?: string;
    wechat?: string;
  };
  person_desc?: string;
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
    person_desc:
      "张三同志是一位经验丰富的经济管理专家，长期从事经济管理和政策研究工作。他在数字经济、产业发展、投资促进等方面有深入的研究和实践经验。",
  },
};

// 话术生成弹窗组件
function ScriptGenerationModal({
  open,
  onClose,
  person,
}: {
  open: boolean;
  onClose: () => void;
  person: PersonDetail | null;
}) {
  const [copied, setCopied] = useState(false);

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
`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.log("复制失败:", err);
    }
  };

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
                "看到您最近在数字经济论坛上的讲话，特别是关于
                {person?.focusAreas?.[0]}
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
                "基于九江的产业基础和您主导的三年行动计划，我们在
                {person?.focusAreas?.[0]}
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
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                {scriptContent.trim()}
              </pre>
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
  );
}

// 清理函数，去除[]、多余逗号、空字符串、引号和首尾空格，并避免连续两个点
function cleanText(str: string) {
  return str
    .replace(/\[\d+(?:-\d+)?\]/g, "") // 去除[5-6]、[11]等
    .replace(/["'""']/g, "") // 去除各种引号
    .replace(/,+/g, ",") // 连续逗号合并为一个
    .replace(/^,+|,+$/g, "") // 去除首尾逗号
    .replace(/\s+/g, " ") // 多空格合一
    .replace(/\.{2,}/g, "·") // 连续点替换为一个·
    .replace(/^·+|·+$/g, "") // 去除首尾·
    .trim();
}

// 计算最近一份工作任职年数
function getCurrentTenure(workHistory: any[]): number | null {
  if (!workHistory || workHistory.length === 0) return null;
  const first = workHistory[0];
  let period = "";
  if (typeof first === "object" && first !== null && first.period) {
    period = first.period;
  } else if (typeof first === "string") {
    period = first;
  }
  // 匹配起始年份
  const match = period.match(/(\d{4})[.年-](\d{1,2})?/);
  if (match) {
    const startYear = parseInt(match[1], 10);
    const now = new Date();
    let years = now.getFullYear() - startYear;
    // 如果有月份，且当前月份小于起始月份，则减一年
    if (match[2]) {
      const startMonth = parseInt(match[2], 10);
      if (now.getMonth() + 1 < startMonth) years--;
    }
    return years >= 0 ? years : null;
  }
  return null;
}

// 获取履历时间区间
function getPeriod(work: any): string {
  if (typeof work === "object" && work !== null && work.period)
    return cleanText(work.period);
  if (typeof work === "string") {
    // 修正正则字符类顺序
    const match = work.match(
      /(\d{4}[.\-年]\d{1,2}(?:[.\-月]\d{1,2})?(?:[—~至-][\d.年月今至]*)?)/
    );
    return match ? match[0] : "";
  }
  return "";
}

function daysAgo(dateString: string): string {
  if (!dateString) return "";
  // 只取日期部分，兼容 ISO 字符串
  const dateOnly = dateString
    .split("T")[0]
    .replace(/-/g, "/")
    .replace(/\./g, "/");
  const date = new Date(dateOnly);
  if (isNaN(date.getTime())) return dateString;
  const now = new Date();
  // 只保留年月日
  const nowYMD = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dateYMD = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffTime = nowYMD.getTime() - dateYMD.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "今天";
  if (diffDays > 0) return `${diffDays}天前`;
  if (diffDays === -1) return "明天";
  return `未来${-diffDays}天`;
}

// 展示所有履历，按enddate和startdate倒序排列，enddate为'至今'的排最前
function parseDate(str: string) {
  if (!str) return 0;
  if (str === "至今") return 99999999;
  // 兼容'2018年09月'等格式
  const match = str.match(/(\d{4})年(\d{1,2})月/);
  if (match) return parseInt(match[1]) * 100 + parseInt(match[2]);
  return 0;
}

// 计算当前任职年数（基于workExperiences）
function getCurrentTenureFromWorkExperiences(
  workExperiences: Array<{ startdate: string; enddate: string }>
): number | null {
  if (!workExperiences || workExperiences.length === 0) return null;

  console.log("计算任职年限，workExperiences:", workExperiences);

  // 首先尝试找到enddate为"至今"的那条
  let current = workExperiences.find((exp) => exp.enddate === "至今");

  // 如果没找到至今的记录，取第一条记录（假设按时间倒序排列）
  if (!current && workExperiences.length > 0) {
    current = workExperiences[0];
    console.log("未找到'至今'记录，使用第一条记录:", current);
  }

  if (!current || !current.startdate) {
    console.log("未找到有效的当前职位记录");
    return null;
  }

  console.log("当前职位记录:", current);

  // 支持多种日期格式："2251月、201809、2180920251今"
  let startDateStr = current.startdate;

  // 如果startdate包含时间段（如"2025年01月-至今"），提取开始日期
  if (
    startDateStr.includes("-") ||
    startDateStr.includes("—") ||
    startDateStr.includes("至")
  ) {
    const parts = startDateStr.split(/[-—至]/);
    if (parts.length > 0) {
      startDateStr = parts[0].trim();
    }
  }

  console.log("提取的开始日期:", startDateStr);

  // 匹配年份和月份 - 支持"225月"格式
  const match = startDateStr.match(/(\d{4})年(\d{1,2})月/);
  if (match) {
    const startYear = parseInt(match[1], 10);
    const startMonth = parseInt(match[2], 10);
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() 返回0
    let years = currentYear - startYear;

    // 考虑月份因素
    if (currentMonth < startMonth) {
      years--;
    }

    console.log(
      `计算任职年限: ${startYear}年${startMonth}月 到 ${currentYear}年${currentMonth}月 = ${years}年`
    );

    return years >= 0 ? years : 0; // 如果计算结果为负数，返回0
  }

  console.log("无法解析开始日期格式:", startDateStr);
  return null;
}

export default function PersonDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();
  const [person, setPerson] = useState<PersonDetail | null>(null);
  const [followedPeople, setFollowedPeople] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    achievements: false,
    activities: false,
  });
  const [showScriptModal, setShowScriptModal] = useState(false);
  const businessPersonId = Cookies.get("business_person_id");
  console.log("business_person_id", businessPersonId);
  // const searchParams =
  //   typeof window !== "undefined"
  //     ? new URLSearchParams(window.location.search)
  //     : null;
  // const businessPersonId =
  //   searchParams?.get("businessPersonId") ||
  //   "e7558fb6-234c-475d-82b9-79db46840389";
  const [graduateSchool, setGraduateSchool] = useState<string>("");
  const [personDesc, setPersonDesc] = useState<string>("");
  const [newsList, setNewsList] = useState<any[]>([]);
  const [districtCn, setDistrictCn] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [workExperiences, setWorkExperiences] = useState<
    Array<{ position_info: string; startdate: string; enddate: string }>
  >([]);

  // 获取已关注ID
  useEffect(() => {
    async function fetchFollowed() {
      try {
        const res = await fetch(
          `/api/business-person/follow?businessPersonId=${businessPersonId}`
        );
        if (!res.ok) throw new Error("获取关注列表失败");
        const data = await res.json();
        setFollowedPeople(
          Array.isArray(data.followedPersonIds) ? data.followedPersonIds : []
        );
      } catch (e) {
        setFollowedPeople([]);
      }
    }
    fetchFollowed();
  }, [businessPersonId]);

  useEffect(() => {
    // 从API获取数据
    const fetchPersonData = async () => {
      try {
        const response = await fetch(`/api/key-persons/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch person data");
        }
        const apiData = await response.json();
        console.log(apiData, "______________");
        // 映射API数据到PersonDetail结构
        const mappedData = {
          id: apiData.person_id,
          name: apiData.person_name,
          currentPosition: {
            department: apiData.department,
            title: apiData.position,
            startDate: apiData.start_date,
          },
          hometown: apiData.ancestral_home,
          age: calculateAge(apiData.birth_date),
          region: apiData.region,
          person_photo_url: apiData.person_photo_url,
          focusAreas: JSON.parse(apiData.focus_areas || "[]"),
          workHistory: (() => {
            const raw = apiData.work_experience || "";
            try {
              const parsed = JSON.parse(raw);
              if (Array.isArray(parsed)) {
                return parsed.flatMap((item) =>
                  typeof item === "string" ? parseWorkExperience(item) : item
                );
              } else if (typeof parsed === "string") {
                return parseWorkExperience(parsed);
              } else {
                return [];
              }
            } catch {
              // 如果不是 JSON，尝试用 parseWorkExperience 解析
              if (typeof raw === "string" && raw.trim()) {
                return parseWorkExperience(raw);
              }
              return [];
            }
          })(),
          education: JSON.parse(apiData.education || "[]"),
          achievements: JSON.parse(apiData.achievements || "[]"),
          recentActivities: JSON.parse(apiData.recent_activities || "[]"),
          contact:
            apiData.wechat_number || apiData.phone_number
              ? {
                  wechat: apiData.wechat_number,
                  phone: apiData.phone_number,
                }
              : undefined,
          person_desc: apiData.person_desc || "",
        };
        if (mappedData.age !== null) {
          setPerson(mappedData as PersonDetail);
        } else {
          // 如果年龄为 null，则将 age 设置为默认值 0
          setPerson({ ...mappedData, age: 0 } as PersonDetail);
        }
        console.log("映射后的数据:", mappedData);
        setGraduateSchool(apiData.graduate_school || "");
        setPersonDesc(apiData.person_desc || "");
        setDistrictCn(apiData.district_cn || "");
        setLoading(false);
      } catch (error) {
        console.log("Error fetching person data:", error);
        setPerson(null);
        setGraduateSchool("");
        setLoading(false);
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
  }, [id]);

  // 拉取新闻动态
  useEffect(() => {
    async function fetchNews() {
      try {
        const res = await fetch(`/api/key-persons/${id}/news`);
        if (res.ok) {
          const data = await res.json();
          setNewsList(Array.isArray(data) ? data : []);
        } else {
          setNewsList([]);
        }
      } catch {
        setNewsList([]);
      }
    }
    fetchNews();
  }, [id]);

  useEffect(() => {
    if (!id || !person?.name) return;
    const cacheKey = `work-experience-${id}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setWorkExperiences(JSON.parse(cached));
    } else {
      fetch(
        `/api/persons/${id}/work-experience?name=${encodeURIComponent(
          person.name
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          // 字段兜底，防止后端字段变动
          const safeData = Array.isArray(data)
            ? data.map((item) => ({
                position_info: item.position_info || "",
                startdate: item.startdate || "",
                enddate: item.enddate || "",
              }))
            : [];
          setWorkExperiences(safeData);
          sessionStorage.setItem(cacheKey, JSON.stringify(safeData));
        });
    }
  }, [id, person?.name]);

  // 计算年龄的辅助函数
  const parseWorkExperience = (
    experienceStr: string
  ): Array<{
    period: string;
    organization: string;
    position: string;
    startYear: number;
    endYear: number;
  }> => {
    const getYearFromPeriod = (period: string): number => {
      const yearMatch = period.match(/(\d{4})/);
      return yearMatch ? parseInt(yearMatch[1]) : 0;
    };

    if (!experienceStr) return [];
    // 分割主要条目（过滤空字符串）
    const mainEntries = experienceStr
      .split(/；+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry);
    const parsedItems = mainEntries.map((entry) => {
      // 提取时间段 (匹配年份格式)
      const periodMatch = entry.match(
        /\d{4}年\d{1,2}月(?:--(?:\d{4}年\d{1,2}月|至今))?/
      );
      const period = periodMatch?.[0] || "";
      const startYear = getYearFromPeriod(period);
      const endYear = period.includes("至今")
        ? new Date().getFullYear()
        : getYearFromPeriod(period.split("--")[1] || "");
      // 提取剩余部分并清理
      const remaining = period
        ? entry
            .replace(period, "")
            .trim()
            .replace(/^，+/, "")
            .replace(/^任/, "")
        : entry.trim().replace(/^，+/, "").replace(/^任/, "");
      // 分割组织和职位 (简单处理，实际可能需要更复杂逻辑)
      const parts = remaining.split("，");
      const organization = parts[0]?.trim() || "";
      const position = parts.slice(1).join("，").trim() || "";
      return {
        period,
        organization: organization.trim(),
        position: position.trim(),
        startYear,
        endYear,
      };
    });
    return parsedItems
      .filter(
        (item) =>
          item.organization.trim() || item.position.trim() || item.period.trim()
      )
      .sort((a, b) => b.endYear - a.endYear || b.startYear - a.startYear);
  };

  function calculateAge(birthDateString: string | undefined): number | null {
    if (!birthDateString) return null;

    // 全角字符转半角字符
    const toHalfWidth = (str: string) =>
      str
        .replace(/[！-～]/g, (c) =>
          String.fromCharCode(c.charCodeAt(0) - 0xfee0)
        )
        .replace(/　/g, " ");

    // 中文月份转数字
    const chineseMonths: Record<string, string> = {
      一月: "1月",
      二月: "2月",
      三月: "3月",
      四月: "4月",
      五月: "5月",
      六月: "6月",
      七月: "7月",
      八月: "8月",
      九月: "9月",
      十月: "10月",
      十一月: "11月",
      十二月: "12月",
    };

    // 统一转换所有数字为半角并处理中文月份
    let normalizedDateString = toHalfWidth(birthDateString.trim());
    for (const [cnMonth, numMonth] of Object.entries(chineseMonths)) {
      normalizedDateString = normalizedDateString.replace(
        new RegExp(cnMonth, "g"),
        numMonth
      );
    }

    // 尝试解析各种日期格式
    let birthDate: Date | null = null;

    // 1. 尝试中文日期格式 (YYYY年MM月DD日 或 YYYY年MM月)
    const chineseDateMatch = normalizedDateString.match(
      /(\d{4})\s*年\s*(\d{1,2})\s*月(?:\s*(\d{1,2})\s*日)?/
    );
    if (chineseDateMatch) {
      const year = parseInt(chineseDateMatch[1], 10);
      const month = parseInt(chineseDateMatch[2], 10) - 1; // 月份从0开始
      const day = chineseDateMatch[3] ? parseInt(chineseDateMatch[3], 10) : 1;
      birthDate = new Date(year, month, day);
    }

    // 2. 尝试ISO格式 (YYYY-MM-DD)
    if (!birthDate || isNaN(birthDate.getTime())) {
      const isoMatch = normalizedDateString.match(
        /(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/
      );
      if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1;
        const day = isoMatch[3] ? parseInt(isoMatch[3], 10) : 1;
        birthDate = new Date(year, month, day);
      }
    }

    // 3. 尝试斜杠分隔格式 (YYYY/MM/DD 或 MM/DD/YYYY)
    if (!birthDate || isNaN(birthDate.getTime())) {
      const slashMatch = normalizedDateString.match(
        /(\d{1,4})\/(\d{1,2})(?:\/(\d{1,2}))?/
      );
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
      const dotMatch = normalizedDateString.match(
        /(\d{4})\.(\d{1,2})(?:\.(\d{1,2}))?/
      );
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
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : null;
  }
  const handleToggleFollow = async () => {
    if (!person) return;
    const isFollowing = followedPeople.includes(person.id);
    const departmentCode = person.currentPosition?.department || "";
    try {
      if (isFollowing) {
        // 取消关注
        const res = await fetch("/api/business-person/follow", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_person_id: businessPersonId,
            followed_person_id: person.id,
          }),
        });
        if (!res.ok) throw new Error("取消关注失败");
        toast({ title: "已取消关注", description: "已取消关注该人物" });
        setFollowedPeople((prev) => prev.filter((pid) => pid !== person.id));
      } else {
        // 关注
        if (followedPeople.length >= 10) {
          toast({
            title: "关注失败",
            description: "最多关注10位关键人物",
            variant: "destructive",
          });
          return;
        }
        const res = await fetch("/api/business-person/follow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            business_person_id: businessPersonId,
            followed_person_id: person.id,
            department_code: departmentCode,
            follow_time: new Date().toISOString(),
          }),
        });
        if (!res.ok) throw new Error("关注失败");
        toast({ title: "关注成功", description: "已添加到关注列表" });
        setFollowedPeople((prev) => [...prev, person.id]);
      }
    } catch (e) {
      toast({
        title: "操作失败",
        description: e instanceof Error ? e.message : "关注/取消关注请求失败",
        variant: "destructive",
      });
    }
  };

  const isFollowed = person ? followedPeople.includes(person.id) : false;

  // 处理动态点击，跳转到对应的新闻详情页
  const handleActivityClick = (
    activity: PersonDetail["recentActivities"][0]
  ) => {
    // 如果是线索追踪中存在的新闻，跳转到详情页
    if (activity.id === "1" || activity.id === "4") {
      router.push(`/leads/detail/${activity.id}`);
    } else {
      // 对于其他动态，可以显示提示或跳转到通用详情页
      toast({
        title: "查看详细内容",
        description: "正在跳转到详情页面",
      });
    }
  };

  useEffect(() => {
    console.log("workExperiences", workExperiences);
  }, [workExperiences]);

  // 只展示enddate为'至今'的履历
  const filteredWorkExperiences = workExperiences.filter(
    (exp) => exp.enddate === "至今"
  );

  // 展示所有履历，按enddate和startdate倒序排列，enddate为'至今'的排最前
  const sortedWorkExperiences = [...workExperiences].sort((a, b) => {
    const endA = parseDate(a.enddate);
    const endB = parseDate(b.enddate);
    if (endA !== endB) return endB - endA;
    const startA = parseDate(a.startdate);
    const startB = parseDate(b.startdate);
    return endB !== endA ? endB - endA : startB - startA;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">加载中...</p>
        </div>
      </div>
    );
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
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* 顶部导航 */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-full mx-auto px-2 sm:px-3 h-12 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-xs sm:text-sm px-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleFollow}
            className="text-xs sm:text-sm px-2"
          >
            <Star
              className={`h-4 w-4 mr-1 ${
                isFollowed ? "fill-yellow-400 text-yellow-400" : ""
              }`}
            />
            {isFollowed ? "已关注" : "关注"}
          </Button>
        </div>
      </header>

      {/* 主体内容区 */}
      <main className="px-1 sm:px-3 py-2 sm:py-4 w-full">
        {/* 近期动态 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-lg p-2 sm:p-4 mb-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 sm:mb-4 gap-2 sm:gap-0">
            <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900">
              <Calendar className="h-4 w-4" />
              近期动态
            </h2>
            <Button
              variant="link"
              size="sm"
              className="text-blue-600 text-xs px-1 self-end"
              onClick={() => router.push(`/leads?person_id=${id}`)}
            >
              查看全部 <ChevronRight className="h-3 w-3 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {newsList.length > 0 ? (
              newsList
                .slice(0, expandedSections.activities ? undefined : 3)
                .map((news, index) => (
                  <motion.div
                    key={news.id || index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    // 可根据需要添加 onClick 跳转
                    onClick={() => {
                      console.log(news, "news");

                      router.push(`/leads/detail/${news.news_id}`);
                    }}
                  >
                    <span className={`mt-0.5 text-red-500`}>●</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 mb-1 text-sm">
                        {news.title || news.news_title || "无标题"}
                      </h4>
                      <p className="text-xs text-gray-600 mb-1 line-clamp-2 sm:line-clamp-none">
                        {news.content || news.news_content || ""}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>
                          {news.news_time ? daysAgo(news.news_time) : ""}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-yellow-100 text-yellow-700 text-xs font-semibold">
                          任内
                        </span>
                        {news.source && <span>{news.source}</span>}
                      </div>
                    </div>
                    <ChevronRight className="h-3 w-3 text-gray-400 mt-1" />
                  </motion.div>
                ))
            ) : (
              <div className="text-gray-400 text-sm text-center py-6">
                暂无动态
              </div>
            )}
          </div>
          {newsList.length > 3 && (
            <Button
              variant="link"
              size="sm"
              className="mt-3 p-0 text-xs"
              onClick={() =>
                setExpandedSections({
                  ...expandedSections,
                  activities: !expandedSections.activities,
                })
              }
            >
              {expandedSections.activities ? "收起" : "展开更多"}
              <ChevronDown
                className={`h-3 w-3 ml-1 transition-transform ${
                  expandedSections.activities ? "rotate-180" : ""
                }`}
              />
            </Button>
          )}
        </section>

        {/* 基本信息 */}
        <section className="bg-white border border-gray-200 shadow-sm rounded-lg p-2 sm:p-4 mb-2">
          <h2 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-4">
            <User className="h-4 w-4" />
            基本信息
          </h2>

          <div className="space-y-3">
            {/* 头像和基本信息 */}
            <div className="flex items-start gap-3 sm:flex-row sm:items-start sm:text-left flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                <img
                  src={person.person_photo_url || "/placeholder-user.jpg"}
                  alt={person.name || "用户头像"}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                {/* 姓名和职位信息 */}
                <div className="flex flex-wrap items-center gap-1 mb-1">
                  <h1
                    className="text-base font-bold text-gray-900"
                    title={person.name}
                  >
                    {person.name || "未知姓名"}
                  </h1>
                  <span className="text-sm font-medium text-gray-700">·</span>
                  <span
                    className="text-sm font-medium text-gray-700"
                    title={person.currentPosition?.department}
                  >
                    {person.currentPosition?.department || "未知部门"}
                  </span>
                  <span className="text-sm font-medium text-gray-700">·</span>
                  <span
                    className="text-sm font-medium text-gray-700"
                    title={person.currentPosition?.title}
                  >
                    {person.currentPosition?.title || "未知职位"}
                  </span>
                </div>

                {/* 详细信息 */}
                <div className="flex flex-wrap items-center gap-1 text-sm text-gray-700">
                  <span title={person.hometown}>
                    {person.hometown || "未知地区"}
                  </span>
                  <span>·</span>
                  {districtCn && (
                    <>
                      <span title={districtCn}>{districtCn}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{person.age > 0 ? `${person.age}岁` : "年龄未知"}</span>
                  <span>·</span>
                  <span>
                    {(() => {
                      const tenure =
                        getCurrentTenureFromWorkExperiences(workExperiences);
                      if (tenure === null) return "任职年限未知";
                      if (tenure === 0) return "任职不满一年";
                      return `${tenure}年任职`;
                    })()}
                  </span>

                  {/* 联系方式 */}
                  {person.contact && (
                    <>
                      {person.contact?.phone && (
                        <>
                          <span>·</span>
                          <span>电话: {person.contact.phone}</span>
                        </>
                      )}
                      {person.contact?.wechat && (
                        <>
                          <span>·</span>
                          <span>微信: {person.contact.wechat}</span>
                        </>
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
                  {sortedWorkExperiences.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-6">
                      暂无工作履历
                    </div>
                  ) : (
                    sortedWorkExperiences.map((exp, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 p-2 bg-gray-50 rounded-lg overflow-x-auto whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent text-center sm:text-left"
                      >
                        <span className="font-semibold text-gray-900 text-xs sm:text-sm w-full sm:w-auto sm:text-left">
                          {exp.position_info}
                        </span>
                        <div className="flex items-center gap-1 justify-center sm:justify-start">
                          <span
                            className="text-xs sm:text-sm font-semibold"
                            style={{
                              background: "#E6F0FF",
                              color: "#1677FF",
                              borderRadius: 4,
                              padding: "2px 8px",
                              fontWeight: 600,
                              display: "inline-block",
                            }}
                          >
                            {exp.startdate} - {exp.enddate}
                          </span>
                          {exp.enddate === "至今" && (
                            <span
                              className="text-xs sm:text-sm font-semibold"
                              style={{
                                background: "#1677FF",
                                color: "#fff",
                                borderRadius: 4,
                                padding: "2px 8px",
                                fontWeight: 600,
                                display: "inline-block",
                              }}
                            >
                              当前
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </TabsContent>

              {/* 主要成就 */}
              <TabsContent value="achievements" className="mt-4">
                <div className="space-y-2">
                  {person.achievements && person.achievements.length > 0 ? (
                    person.achievements.map((achievement, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2"
                      >
                        <span className="text-green-500 mt-1">●</span>
                        <span className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-none">
                          {achievement.replace(/,/g, "")}
                        </span>
                      </motion.div>
                    ))
                  ) : personDesc ? (
                    personDesc
                      .split(/[。\n]/)
                      .map((desc) =>
                        desc
                          .replace(/\[\d+(?:-\d+)?\]/g, "")
                          .replace(/^[,，\s"'""'']+/, "")
                          .replace(/[,，\s"'""'']+$/, "")
                          .trim()
                      )
                      .filter((desc) => desc && /[\u4e00-\u9fa5\w]/.test(desc))
                      .map((desc, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center gap-2"
                        >
                          <span className="text-green-500 mt-1">●</span>
                          <span className="text-sm text-gray-700 line-clamp-2 sm:line-clamp-none">
                            {desc}
                          </span>
                        </motion.div>
                      ))
                  ) : (
                    <span className="text-gray-400 text-sm">暂无主要成就</span>
                  )}
                </div>
              </TabsContent>

              {/* 教育经历 */}
              <TabsContent value="education" className="mt-4">
                <div className="space-y-2">
                  {person.education && person.education.length > 0 ? (
                    person.education.map((edu, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                      >
                        <span className="font-semibold text-gray-900 text-sm">
                          {cleanText(edu.school)}
                        </span>
                        <span className="text-gray-600 text-sm">·</span>
                        <span className="text-gray-600 text-sm">
                          {cleanText(edu.degree)}
                        </span>
                        <span className="text-gray-600 text-sm">·</span>
                        <span className="text-gray-600 text-sm">
                          {cleanText(edu.major)}
                        </span>
                        <span className="text-gray-600 text-sm">·</span>
                        <Badge variant="outline" className="text-xs">
                          {cleanText(edu.period)}
                        </Badge>
                      </motion.div>
                    ))
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0 }}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-semibold text-gray-900 text-sm">
                        {graduateSchool ? cleanText(graduateSchool) : "未知"}
                      </span>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>
      </main>

      {/* 话术生成弹窗 */}
      <ScriptGenerationModal
        open={showScriptModal}
        onClose={() => setShowScriptModal(false)}
        person={person || {}}
      />
    </div>
  );
}
