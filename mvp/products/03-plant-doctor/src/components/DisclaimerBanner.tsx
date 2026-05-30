import { AlertTriangle, Info } from 'lucide-react';

export function DisclaimerBanner({ edible }: { edible?: boolean }) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-3 rounded-card border border-accent/40 bg-accent/10 px-4 py-3">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent-dark" />
        <div className="text-sm text-ink">
          <div className="font-medium">本诊断由 AI 基于图像生成，仅供家庭园艺参考</div>
          <div className="mt-1 text-xs text-ink-muted">
            不替代专业园艺师或农资人员现场判断。严重病害扩散或症状不明时，请带照片咨询本地花卉店、园艺师或农资人员，并遵循当地法规与产品标签。
          </div>
        </div>
      </div>
      {edible && (
        <div className="flex items-start gap-3 rounded-card border border-status-danger/40 bg-status-danger/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-status-danger" />
          <div className="text-sm text-ink">
            <div className="font-medium">食用作物额外提示</div>
            <div className="mt-1 text-xs text-ink-muted">
              食用植物处理后请咨询专业人员再食用；家中有孕妇 / 婴幼儿 / 宠物时请避免接触受影响部位。
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
