"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, User, MapPin, Loader2, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

// 省份城市数据
const PROVINCES_CITIES = {
  上海市: [
    "黄浦区",
    "徐汇区",
    "长宁区",
    "静安区",
    "普陀区",
    "虹口区",
    "杨浦区",
    "浦东新区",
  ],
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
  四川省: [
    "成都市",
    "自贡市",
    "攀枝花市",
    "泸州市",
    "德阳市",
    "绵阳市",
    "广元市",
    "遂宁市",
    "内江市",
    "乐山市",
    "南充市",
    "眉山市",
    "宜宾市",
    "广安市",
    "达州市",
    "雅安市",
    "巴中市",
    "资阳市",
  ],
  山东省: [
    "济南市",
    "青岛市",
    "淄博市",
    "枣庄市",
    "东营市",
    "烟台市",
    "潍坊市",
    "济宁市",
    "泰安市",
    "威海市",
    "日照市",
    "滨州市",
    "德州市",
    "聊城市",
    "临沂市",
    "菏泽市",
  ],
  河南省: [
    "郑州市",
    "开封市",
    "洛阳市",
    "平顶山市",
    "安阳市",
    "鹤壁市",
    "新乡市",
    "焦作市",
    "濮阳市",
    "许昌市",
    "漯河市",
    "三门峡市",
    "南阳市",
    "商丘市",
    "信阳市",
    "周口市",
    "驻马店市",
  ],
  湖北省: [
    "武汉市",
    "黄石市",
    "十堰市",
    "宜昌市",
    "襄阳市",
    "鄂州市",
    "荆门市",
    "孝感市",
    "荆州市",
    "黄冈市",
    "咸宁市",
    "随州市",
  ],
  湖南省: [
    "长沙市",
    "株洲市",
    "湘潭市",
    "衡阳市",
    "邵阳市",
    "岳阳市",
    "常德市",
    "张家界市",
    "益阳市",
    "郴州市",
    "永州市",
    "怀化市",
    "娄底市",
  ],
  陕西省: [
    "西安市",
    "铜川市",
    "宝鸡市",
    "咸阳市",
    "渭南市",
    "延安市",
    "汉中市",
    "榆林市",
    "安康市",
    "商洛市",
  ],
  重庆市: [
    "万州区",
    "涪陵区",
    "渝中区",
    "大渡口区",
    "江北区",
    "沙坪坝区",
    "九龙坡区",
    "南岸区",
    "北碚区",
    "渝北区",
    "巴南区",
    "黔江区",
    "长寿区",
    "江津区",
    "合川区",
    "永川区",
    "南川区",
  ],
};

// 职位列表
const POSITIONS = ["商务经理", "商务专员", "商务助理", "区域总监"];

interface RegionData {
  province: string;
  cities: string[];
}

interface FormData {
  name: string;
  phone: string;
  username: string;
  password: string;
  position: string;
  regions: RegionData[];
}

interface FormErrors {
  name?: string;
  phone?: string;
  username?: string;
  password?: string;
  position?: string;
  regions?: string;
}

export default function AddMemberPage() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    phone: "",
    username: "",
    password: "",
    position: "",
    regions: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // 实时验证函数
  const validateField = (field: keyof FormData, value: any) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "请输入姓名";
        } else if (value.trim().length < 2 || value.trim().length > 10) {
          newErrors.name = "姓名长度应为2-10个字符";
        } else {
          delete newErrors.name;
        }
        break;

      case "phone":
        if (!value.trim()) {
          newErrors.phone = "请输入手机号";
        } else if (!/^1[3-9]\d{9}$/.test(value)) {
          newErrors.phone = "请输入正确的11位手机号";
        } else {
          delete newErrors.phone;
        }
        break;

      case "username":
        if (!value.trim()) {
          newErrors.username = "请输入用户名";
        } else if (value.trim().length < 3 || value.trim().length > 20) {
          newErrors.username = "用户名长度应为3-20个字符";
        } else {
          delete newErrors.username;
        }
        break;

      case "password":
        if (!value.trim()) {
          newErrors.password = "请输入密码";
        } else if (value.trim().length < 6) {
          newErrors.password = "密码长度不能少于6位";
        } else {
          delete newErrors.password;
        }
        break;

      case "position":
        if (!value) {
          newErrors.position = "请选择职位";
        } else {
          delete newErrors.position;
        }
        break;

      case "regions":
        if (value.length === 0) {
          newErrors.regions = "请至少选择一个负责区域";
        } else {
          const hasEmptyRegion = value.some(
            (region: RegionData) =>
              !region.province || region.cities.length === 0
          );
          if (hasEmptyRegion) {
            newErrors.regions = "请完善所有区域的省份和城市选择";
          } else {
            delete newErrors.regions;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 表单验证
  const validateForm = () => {
    const isNameValid = validateField("name", formData.name);
    const isPhoneValid = validateField("phone", formData.phone);
    const isUsernameValid = validateField("username", formData.username);
    const isPasswordValid = validateField("password", formData.password);
    const isPositionValid = validateField("position", formData.position);
    const isRegionsValid = validateField("regions", formData.regions);

    return (
      isNameValid &&
      isPhoneValid &&
      isUsernameValid &&
      isPasswordValid &&
      isPositionValid &&
      isRegionsValid
    );
  };

  // 处理输入变化
  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // 自动填充用户名和密码
      if (field === "phone" && value.length === 11) {
        if (!newData.username) {
          newData.username = value;
        }
        if (!newData.password && newData.name) {
          const firstLetter = newData.name.charAt(0);
          newData.password = firstLetter + value;
        }
      }

      if (field === "name" && value && newData.phone.length === 11) {
        if (!newData.password) {
          const firstLetter = value.charAt(0);
          newData.password = firstLetter + newData.phone;
        }
      }

      return newData;
    });

    // 实时验证
    setTimeout(() => validateField(field, value), 100);
  };

  // 添加省份
  const addProvince = () => {
    const newRegions = [...formData.regions, { province: "", cities: [] }];
    setFormData((prev) => ({ ...prev, regions: newRegions }));
  };

  // 删除省份
  const removeProvince = (index: number) => {
    const newRegions = formData.regions.filter((_, i) => i !== index);
    setFormData((prev) => ({ ...prev, regions: newRegions }));
    validateField("regions", newRegions);
  };

  // 更新省份
  const updateProvince = (index: number, province: string) => {
    const newRegions = [...formData.regions];
    newRegions[index] = { province, cities: [] };
    setFormData((prev) => ({ ...prev, regions: newRegions }));
    validateField("regions", newRegions);
  };

  // 处理城市选择
  const handleCityChange = (index: number, city: string, checked: boolean) => {
    const newRegions = [...formData.regions];
    if (checked) {
      newRegions[index].cities = [...newRegions[index].cities, city];
    } else {
      newRegions[index].cities = newRegions[index].cities.filter(
        (c) => c !== city
      );
    }
    setFormData((prev) => ({ ...prev, regions: newRegions }));
    validateField("regions", newRegions);
  };

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) {
      toast({
        title: "表单验证失败",
        description: "请检查表单信息",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast({
        title: "添加成功",
        description: "成员添加成功",
        variant: "default",
      });

      router.push("/team-management");
    } catch (error) {
      toast({
        title: "添加失败",
        description: "添加失败，请重试",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算总选择数量
  const getTotalSelectedCount = () => {
    return formData.regions.reduce(
      (total, region) => total + region.cities.length,
      0
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 页面头部 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-lg font-semibold text-gray-900">添加人员</h1>
        </div>
      </div>

      {/* 表单内容 */}
      <div className="p-4 space-y-4">
        {/* 基本信息 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="w-4 h-4" />
                基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {/* 姓名 */}
              <div>
                <Label htmlFor="name" className="text-sm font-medium">
                  姓名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="请输入姓名（2-10个字符）"
                  className={`mt-1 ${
                    errors.name ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  maxLength={10}
                />
                {errors.name && (
                  <p className="text-xs text-red-500 mt-1">{errors.name}</p>
                )}
              </div>

              {/* 手机号 */}
              <div>
                <Label htmlFor="phone" className="text-sm font-medium">
                  手机号 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => {
                    // 只允许输入数字
                    const value = e.target.value.replace(/\D/g, "");
                    if (value.length <= 11) {
                      handleInputChange("phone", value);
                    }
                  }}
                  placeholder="请输入11位手机号"
                  className={`mt-1 ${
                    errors.phone ? "border-red-500 focus:border-red-500" : ""
                  }`}
                  maxLength={11}
                />
                {errors.phone && (
                  <p className="text-xs text-red-500 mt-1">{errors.phone}</p>
                )}
              </div>

              {/* 职位 */}
              <div>
                <Label className="text-sm font-medium">
                  职位 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) =>
                    handleInputChange("position", value)
                  }
                >
                  <SelectTrigger
                    className={`mt-1 ${
                      errors.position ? "border-red-500" : ""
                    }`}
                  >
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
                {errors.position && (
                  <p className="text-xs text-red-500 mt-1">{errors.position}</p>
                )}
              </div>

              {/* 用户名 */}
              <div>
                <Label htmlFor="username" className="text-sm font-medium">
                  用户名 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  placeholder="默认为手机号"
                  className={`mt-1 ${
                    errors.username ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>

              {/* 密码 */}
              <div>
                <Label htmlFor="password" className="text-sm font-medium">
                  密码 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="默认为姓名首字母+手机号"
                  className={`mt-1 ${
                    errors.password ? "border-red-500 focus:border-red-500" : ""
                  }`}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* 负责区域 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  负责区域
                </CardTitle>
                <Button
                  onClick={addProvince}
                  size="sm"
                  variant="outline"
                  className="h-8 bg-transparent"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  添加省份
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {formData.regions.map((region, index) => (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-3"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-medium">省份选择</Label>
                      <Button
                        onClick={() => removeProvince(index)}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>

                    <Select
                      value={region.province}
                      onValueChange={(value) => updateProvince(index, value)}
                    >
                      <SelectTrigger className="mb-3">
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

                    {region.province && (
                      <div>
                        <Label className="text-sm font-medium mb-2 block">
                          城市选择
                        </Label>
                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                          {PROVINCES_CITIES[
                            region.province as keyof typeof PROVINCES_CITIES
                          ]?.map((city) => (
                            <div
                              key={city}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`${index}-${city}`}
                                checked={region.cities.includes(city)}
                                onCheckedChange={(checked) =>
                                  handleCityChange(
                                    index,
                                    city,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`${index}-${city}`}
                                className="text-xs cursor-pointer"
                              >
                                {city}
                              </Label>
                            </div>
                          ))}
                        </div>
                        {region.cities.length > 0 && (
                          <p className="text-xs text-gray-500 mt-2">
                            已选 {region.cities.length} 个城市
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                {formData.regions.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">
                      暂无负责区域，请点击"添加省份"开始设置
                    </p>
                  </div>
                )}
              </div>

              {/* 统计信息 */}
              {formData.regions.length > 0 && (
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      已选：{formData.regions.length} 个省份，
                      {getTotalSelectedCount()} 个城市
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setFormData((prev) => ({ ...prev, regions: [] }));
                        validateField("regions", []);
                      }}
                      className="text-xs text-gray-500 h-6 px-2"
                    >
                      清空所有
                    </Button>
                  </div>
                </div>
              )}

              {errors.regions && (
                <p className="text-xs text-red-500 mt-2">{errors.regions}</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* 固定底部保存按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full h-11 text-base font-medium"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            "保存"
          )}
        </Button>
      </div>
    </div>
  );
}
