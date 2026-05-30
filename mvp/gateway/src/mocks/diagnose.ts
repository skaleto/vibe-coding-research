/**
 * 03 植物医生 mock 数据 —— 1:1 移植自
 * mvp/products/03-plant-doctor/lib/mockDiagnosis.ts
 */

import type { DiagnosisResult } from '../lib/lintAction';

export function mockSucculentBlackRot(): DiagnosisResult {
  return {
    plant_name: '玉露（多肉）',
    scientific_name: 'Haworthia cooperi',
    confidence: 0.88,
    image_quality_ok: true,
    image_quality_feedback: '',
    diagnosis: [
      {
        cause: '黑腐病初期（疑似浇水过多 + 根部腐烂）',
        likelihood: '高',
        evidence: '叶片透明发软 + 茎基部颜色变深，常见于近期频繁浇水的多肉植株',
        severity: '重',
      },
      {
        cause: '通风不足致真菌感染',
        likelihood: '中',
        evidence: '玉露品种在闷热环境易发软腐，照片中盆周看起来环境密闭',
        severity: '中',
      },
      {
        cause: '土壤板结致根系窒息',
        likelihood: '中',
        evidence: '无法从图片完全判断盆内情况，建议脱盆检查根系颜色',
        severity: '轻',
      },
    ],
    action_steps: [
      '第 1 步：今天立刻断水，把花盆从托盘中取出晾干，移至通风明亮但不直射阳光的位置',
      '第 2 步：明天清晨用消毒过的剪刀（酒精擦拭刀刃）剪去所有透明发软、颜色变深的叶片至健康组织',
      '第 3 步：保持切口干燥，可少量撒草木灰促进愈合，晾干 24-48 小时',
      '第 4 步：更换为颗粒土（如赤玉土 + 鹿沼土 + 蛭石混合），花盆建议小一号、底部有排水孔',
      '第 5 步：上盆后 7 天完全断水，第 8 天起沿盆边少量给水，若症状继续扩散请带照片咨询本地花卉店或园艺师',
    ],
    prognosis: {
      recovery_outlook: '中',
      time_to_observe: '2-3 周',
      fallback_if_fail:
        '若 14 天后茎基部仍持续黑褐色蔓延，建议剪取健康顶芽进行叶插或砍头扦插重新繁殖',
    },
    calendar_30d: [
      { day: 1, action: '断水脱盆，将植株移至通风处晾干', type: 'watering' },
      { day: 2, action: '剪除发软透明叶片，刀具消毒，切口晾干', type: 'observation' },
      { day: 3, action: '检查根系，剪除黑色烂根', type: 'observation' },
      { day: 4, action: '继续晾干切口，准备颗粒土和小号花盆', type: 'observation' },
      { day: 5, action: '重新上盆（颗粒土，盆底有排水孔）', type: 'repotting' },
      { day: 6, action: '保持断水，散光通风养护', type: 'ventilation' },
      { day: 7, action: '观察叶片状态，记录是否还有继续软化', type: 'observation' },
      { day: 8, action: '第一次少量给水（沿盆边，不淋叶片）', type: 'watering' },
      { day: 9, action: '继续观察，确认无新增腐烂部位', type: 'observation' },
      { day: 10, action: '日间散射光，避免直射暴晒', type: 'lighting' },
      { day: 11, action: '保持通风，不闷养', type: 'ventilation' },
      { day: 12, action: '观察新叶或新生长点是否萌发', type: 'observation' },
      { day: 13, action: '记录植株状态变化（拍照对比）', type: 'observation' },
      { day: 14, action: '若 14 天仍无改善，带照片咨询本地花卉店或园艺师', type: 'consult' },
      { day: 15, action: '第二次给水（少量，沿盆边）', type: 'watering' },
      { day: 16, action: '检查盆土干湿度', type: 'observation' },
      { day: 17, action: '保持散射光，避免暴晒', type: 'lighting' },
      { day: 18, action: '通风良好处养护', type: 'ventilation' },
      { day: 19, action: '观察是否有新叶展开', type: 'observation' },
      { day: 20, action: '清洁植株周边，检查盆内是否有积水', type: 'observation' },
      { day: 21, action: '第三次给水（视盆土干湿，少量补水）', type: 'watering' },
      { day: 22, action: '观察新叶颜色和饱满度', type: 'observation' },
      { day: 23, action: '保持通风，避免闷热', type: 'ventilation' },
      { day: 24, action: '若状态持续好转，可逐步增加散射光', type: 'lighting' },
      { day: 25, action: '检查根系是否稳定（轻轻晃动植株感觉是否扎根）', type: 'observation' },
      { day: 26, action: '继续散光养护', type: 'lighting' },
      { day: 27, action: '记录恢复进度', type: 'observation' },
      { day: 28, action: '第四次给水（视情况浇透）', type: 'watering' },
      { day: 29, action: '进入正常养护节奏前的最后观察', type: 'observation' },
      { day: 30, action: '进入正常养护节奏：颗粒土 + 通风 + 见干浇透', type: 'observation' },
    ],
    disclaimer:
      '本诊断由 AI 基于图像生成，仅供家庭园艺参考，不替代专业园艺师建议。严重病害或大面积扩散时，请带照片咨询本地花卉店、园艺师或农资人员。',
  };
}

export function mockUnableToIdentify(): DiagnosisResult {
  return {
    plant_name: '暂未识别',
    scientific_name: '',
    confidence: 0,
    image_quality_ok: false,
    image_quality_feedback:
      '图片信息不足以做出准确诊断，请补充以下照片：\n1. 叶片正面特写（距离 15-20cm，光线充足）\n2. 叶片背面特写\n3. 全株正面照（包括花盆）\n4. 出问题位置的近景',
    diagnosis: [],
    action_steps: ['请补充清晰图片后重新提交'],
    prognosis: {
      recovery_outlook: '中',
      time_to_observe: '—',
      fallback_if_fail: '',
    },
    calendar_30d: [],
    disclaimer:
      '本诊断由 AI 基于图像生成，仅供家庭园艺参考。无清晰图片无法诊断，请补图后再试。',
  };
}
