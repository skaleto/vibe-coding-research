# 03 AI 植物医生 MVP 实现 Proposal

## 为什么

`light-products/detail-03-plant-doctor.md` 已细化 Prompt v1 + 25 病害知识库 + 四层缓存策略 + Workers 代码骨架。**codex review 强制**：禁止任何农药商品名/通用名/剂量/稀释比例；AI 必须标注"仅供参考"；概率改"高/中/低"非百分比。

MVP web 版核心闭环：拍照/上传图 → LLM 视觉 API 诊断 → 输出诊断结果 + 30 天护理日历 + 安全 disclaimer。

## 改什么

- 在 `mvp/products/03-plant-doctor/` 下 Next.js 14 App Router 项目
- 实现拍照/上传图 UI（input type="file" + camera capture 属性 + 桌面端 drag-drop）
- 实现 `/api/diagnose` POST API route（接收 image base64 + 文字补充）
- 视觉 LLM 调用：主调智谱 GLM-4V（如有 env），备 OpenAI GPT-4V，mock fallback
- **严格遵守 codex review 的 prompt 约束**：禁止任何药剂名 / 剂量 / 稀释比例
- 病害知识库：从 detail-03 § B 抽取 25 个高频病害成 JSON
- 30 天护理日历组件（按 day 1-30 渲染待办）
- 占位图 + codex-todo 文档

## 影响范围

- 新目录：`mvp/products/03-plant-doctor/`
- 依赖：`html2canvas`、`lucide-react`、`zod`
- LLM：env `ZHIPU_API_KEY` / `OPENAI_API_KEY` / 都没有则 mock
- 部署：Vercel + 国内 LLM proxy（智谱/通义优先）

## Tasks

### 1. 脚手架
- [ ] 1.1 `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [ ] 1.2 依赖：`html2canvas`、`lucide-react`、`zod`、`@vercel/blob`（可选，存图）
- [ ] 1.3 配色：暖绿主 `#527064` + 暖橙辅 `#E8A45E` + 米黄背景 `#FFF8EE`（参考 ai-baby-growth-companion 配色）
- [ ] 1.4 README + .env.example

### 2. 路由
- [ ] 2.1 `app/page.tsx` 首页（hero banner + "拍照诊断" 大按钮 + "我的植物" 入口）
- [ ] 2.2 `app/capture/page.tsx` 拍照/上传页（拖拽区 + 相机调用 + 多图预览）
- [ ] 2.3 `app/diagnose/page.tsx` 诊断中（loading 动画 "AI 正在分析叶片..."）
- [ ] 2.4 `app/result/[id]/page.tsx` 结果页（病因 + likelihood 高/中/低 + 处理步骤 + 30 天日历 + disclaimer）
- [ ] 2.5 `app/my-plants/page.tsx` 我的植物（localStorage 列表）
- [ ] 2.6 `app/about/page.tsx` 关于 + 免责声明全文

### 3. 拍照 / 上传 UI
- [ ] 3.1 `components/ImageCapture.tsx` 组件：`<input type="file" accept="image/*" capture="environment">` 移动端调相机，桌面拖拽
- [ ] 3.2 多图支持：最多 3 张（特写 / 全株 / 环境）
- [ ] 3.3 客户端压缩到 200KB 以内（用 `canvas` resize）
- [ ] 3.4 EXIF 删除（保护隐私）

### 4. LLM 视觉 API（严格遵守 codex 合规）
- [ ] 4.1 `app/api/diagnose/route.ts` POST 接口，入参 `images[]` (base64) + `description?` (用户补充)
- [ ] 4.2 主调智谱 GLM-4V `https://open.bigmodel.cn/api/paas/v4/chat/completions` model `glm-4v-flash`
- [ ] 4.3 备调 OpenAI GPT-4V（如智谱失败）
- [ ] 4.4 **Prompt 必须完整复制 `detail-03-plant-doctor.md § A.1.1`（codex 修订版）**：
  - AI 自定位"AI 助手"，不是"15 年专家"
  - **绝对禁止**输出农药商品名 / 通用名 / 剂量 / 稀释比例
  - 处理方案只能给非药物动作 + 咨询专业人员提示
  - 概率用"高/中/低"，**不**用百分比
- [ ] 4.5 输出 JSON schema 严格按 codex 版（recovery_outlook / likelihood / 不含 recovery_chance / 不含 probability）
- [ ] 4.6 mock fallback：返回一个"多肉黑腐"完整诊断示例

### 5. 病害知识库
- [ ] 5.1 `lib/diseases-db.json` 从 detail-03 § B 抽 25 个病害结构化样本
- [ ] 5.2 `lib/lintAction.ts` 函数：扫描 LLM 输出，剔除可能漏网的药剂名（多菌灵 / 波尔多液 / 吡虫啉 / 代森锰锌 / 嘧霉胺 / 三唑酮 / 农用链霉素 / 咪鲜胺 / 阿维菌素等）
- [ ] 5.3 LLM 返回前用 lintAction 二次过滤，命中则替换为"咨询本地园艺师或农资人员"

### 6. 30 天护理日历组件
- [ ] 6.1 `components/CareCalendar.tsx` 7×5 网格视图（30 天）
- [ ] 6.2 每天展示 action 文字 + type icon（浇水💧 / 施肥🌱 / 光照☀️ / 通风💨 / 观察👁 / 咨询💬）
- [ ] 6.3 可勾选完成状态（localStorage 持久化）

### 7. Disclaimer 强制嵌入
- [ ] 7.1 结果页顶部 banner："本诊断由 AI 基于图像生成，仅供家庭园艺参考"
- [ ] 7.2 每个 action_step 底部小字："如症状扩散，请带照片咨询本地园艺师或农资人员"
- [ ] 7.3 食用作物（番茄/草莓/辣椒）页面额外提示："食用植物处理后请咨询专业人员再食用"

### 8. 占位图
- [ ] 8.1 `codex-todo-illustrations.md` 列出：
  - `hero-plant.png`（首页 hero：绿萝 / 多肉等多种家庭植物，暖色 pastel）
  - `empty-my-plants.png`（空态：盆栽剪影）
  - `loading-leaf.png`（诊断中动画占位）

### 9. 验证
- [ ] 9.1 `npm install` / `npm run build` / `npm run dev` 通过
- [ ] 9.2 mock 路径：上传任一图片 → 看到完整诊断结果 + 30 天日历
- [ ] 9.3 真实 LLM 路径：用真实多肉叶子图测试一次，肉眼检查输出 **不含任何药剂名**
- [ ] 9.4 lintAction 单元测试（喂故意带农药名的 mock 输出，确认被替换）

### 10. 不做
- 不接真实支付
- 不做"我的植物"长期追踪（结果只存 localStorage）
- 不做海外英文版
- 不实现 affiliate 农资推荐链接
