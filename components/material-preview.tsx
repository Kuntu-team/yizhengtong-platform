"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Download, ZoomIn, ZoomOut } from "lucide-react"
import Image from "next/image"

interface MaterialPreviewProps {
  open: boolean
  onClose: () => void
  material: any
}

export default function MaterialPreview({ open, onClose, material }: MaterialPreviewProps) {
  const [imageZoom, setImageZoom] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!material) return null

  const renderPreviewContent = () => {
    switch (material.previewType) {
      case "pdf":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 max-h-[500px] overflow-y-auto">
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-line text-sm leading-relaxed">{material.previewContent}</div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">这是文档的预览版本，完整内容请下载查看</div>
          </div>
        )

      case "images":
        return (
          <div className="space-y-4">
            {/* 图片缩略图导航 */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {material.previewContent.map((image: any, index: number) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-16 h-16 rounded border-2 overflow-hidden ${
                    selectedImage === index ? "border-blue-500" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.name}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* 主图显示 */}
            <div className="relative bg-gray-50 rounded-lg overflow-hidden">
              <div className="flex justify-between items-center p-3 bg-white border-b">
                <h4 className="font-medium text-sm">{material.previewContent[selectedImage]?.name}</h4>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setImageZoom(Math.max(0.5, imageZoom - 0.25))}>
                    <ZoomOut className="h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setImageZoom(Math.min(3, imageZoom + 0.25))}>
                    <ZoomIn className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="p-4 max-h-[400px] overflow-auto">
                <div
                  style={{ transform: `scale(${imageZoom})`, transformOrigin: "top left" }}
                  className="transition-transform"
                >
                  <Image
                    src={material.previewContent[selectedImage]?.url || "/placeholder.svg"}
                    alt={material.previewContent[selectedImage]?.name}
                    width={600}
                    height={400}
                    className="rounded"
                  />
                </div>
              </div>
              <div className="p-3 bg-white border-t">
                <p className="text-xs text-gray-600">{material.previewContent[selectedImage]?.description}</p>
              </div>
            </div>
          </div>
        )

      case "chart":
        return (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-4">{material.previewContent.title}</h4>

              {/* 简化的图表展示 */}
              <div className="space-y-3">
                <div className="grid grid-cols-4 gap-2 text-xs font-medium text-gray-600 border-b pb-2">
                  <div>年份</div>
                  <div>投资(亿)</div>
                  <div>收入(亿)</div>
                  <div>利润(亿)</div>
                </div>
                {material.previewContent.data.map((row: any, index: number) => (
                  <div key={index} className="grid grid-cols-4 gap-2 text-sm">
                    <div>{row.year}</div>
                    <div className="text-red-600">{row.investment}</div>
                    <div className="text-green-600">{row.revenue}</div>
                    <div className={row.profit >= 0 ? "text-green-600" : "text-red-600"}>{row.profit}</div>
                  </div>
                ))}
              </div>

              {/* 关键指标 */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">总投资</div>
                  <div className="font-semibold text-blue-600">{material.previewContent.summary.totalInvestment}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">盈亏平衡年</div>
                  <div className="font-semibold text-green-600">{material.previewContent.summary.breakEvenYear}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">投资回报率</div>
                  <div className="font-semibold text-purple-600">{material.previewContent.summary.roi}</div>
                </div>
                <div className="bg-white rounded p-3">
                  <div className="text-xs text-gray-500">回收期</div>
                  <div className="font-semibold text-orange-600">{material.previewContent.summary.paybackPeriod}</div>
                </div>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">这是数据的预览版本，完整分析请下载Excel文件查看</div>
          </div>
        )

      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">该文件类型暂不支持预览</p>
            <p className="text-sm text-gray-400 mt-2">请下载文件查看完整内容</p>
          </div>
        )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-blue-600">{material.icon}</div>
              <div>
                <DialogTitle className="text-base">{material.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {material.type}
                  </Badge>
                  <span className="text-xs text-gray-500">{material.size}</span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // 下载逻辑
                  console.log("下载文件:", material.name)
                }}
              >
                <Download className="h-3 w-3 mr-1" />
                下载
              </Button>
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">{renderPreviewContent()}</div>
      </DialogContent>
    </Dialog>
  )
}
