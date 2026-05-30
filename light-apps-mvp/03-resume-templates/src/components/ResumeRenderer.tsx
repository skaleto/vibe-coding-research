import { forwardRef } from 'react';
import type { ResumeData, TemplateId } from '@/lib/types';
import { MinimalTemplate } from '@/templates/MinimalTemplate';
import { BlueTemplate } from '@/templates/BlueTemplate';
import { CreativeTemplate } from '@/templates/CreativeTemplate';
import { AcademicTemplate } from '@/templates/AcademicTemplate';

interface ResumeRendererProps {
  data: ResumeData;
  templateId: TemplateId;
  /** 是否显示水印（免费未解锁时为 true） */
  watermark: boolean;
}

/**
 * 根据 templateId 渲染对应模板，并在未付费时叠加平铺水印。
 * 用 forwardRef 暴露 A4 根节点，供 html2canvas / react-to-print 抓取。
 */
export const ResumeRenderer = forwardRef<HTMLDivElement, ResumeRendererProps>(
  function ResumeRenderer({ data, templateId, watermark }, ref) {
    return (
      <div ref={ref} className="relative bg-white">
        {renderTemplate(templateId, data)}
        {watermark && <WatermarkOverlay />}
      </div>
    );
  },
);

function renderTemplate(id: TemplateId, data: ResumeData) {
  switch (id) {
    case 'blue':
      return <BlueTemplate data={data} />;
    case 'creative':
      return <CreativeTemplate data={data} />;
    case 'academic':
      return <AcademicTemplate data={data} />;
    case 'minimal':
    default:
      return <MinimalTemplate data={data} />;
  }
}

// 平铺水印：斜向重复文字，导出后清晰可见但不挡阅读。付费后整体移除。
function WatermarkOverlay() {
  const cells = Array.from({ length: 40 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="flex h-full w-full -rotate-[30deg] scale-150 flex-wrap content-center items-center justify-center gap-x-10 gap-y-14 opacity-[0.12]">
        {cells.map((_, i) => (
          <span key={i} className="whitespace-nowrap text-[15px] font-bold text-neutral-700">
            简历模板 · 试用版
          </span>
        ))}
      </div>
    </div>
  );
}
