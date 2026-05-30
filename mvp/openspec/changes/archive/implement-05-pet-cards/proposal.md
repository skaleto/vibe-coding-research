# 05 宠物心情卡片 MVP 实现 Proposal（原"猜狗翻译器"）

## 为什么

`light-products/detail-05-pet-translator.md` 已细化萌系 Prompt + 20 测试样本 + 3 套海报模板 + Day 1-7 plan。**codex review 强制改名**：产品从"翻译"改为"宠物心情卡片"，主卖点从"翻译"改为"萌宠对白生成"。原"假装解读"措辞改为"AI 生成宠物心情卡片"。

MVP 阶段聚焦"录音 → AI 拟人化对白 → 萌系海报 → 分享"闭环。

## 改什么

- 在 `mvp/products/05-pet-cards/` 下 Next.js 14 App Router 项目
- 录音 UI（MediaRecorder API）
- LLM 调用生成 3-5 句拟人化对白（**Prompt 严格按 codex 版**：禁用"翻译"措辞，强制 disclaimer 输出）
- 3 套海报模板（萌系卡通 / 简约可爱 / 复古胶片）
- "心情标签 + emoji" 配色映射
- 占位图 + codex-todo

## 影响范围

- 新目录：`mvp/products/05-pet-cards/`
- 依赖：`html2canvas`、`lucide-react`、`zod`
- 音频：浏览器 MediaRecorder API（不需要后端 ASR，**不做真识别**）
- LLM：env `DEEPSEEK_API_KEY`，mock fallback
- 部署：Vercel

## Tasks

### 1. 脚手架
- [ ] 1.1 `npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
- [ ] 1.2 依赖：`html2canvas`、`lucide-react`、`zod`
- [ ] 1.3 配色：萌粉 `#FFB6C1` + 奶黄 `#FFF8E1` + 棕 `#8B6F47`
- [ ] 1.4 字体：圆润可爱（思源黑体 + 系统 emoji）
- [ ] 1.5 README + .env.example

### 2. 路由
- [ ] 2.1 `app/page.tsx` 首页（大录音按钮 "按住录音解读心情" + 宠物类型选择 [猫/狗] + 名字输入）
- [ ] 2.2 `app/recording/page.tsx` 录音中（动画波形 + 倒计时）
- [ ] 2.3 `app/analyzing/page.tsx` AI 生成中（萌系加载动画）
- [ ] 2.4 `app/result/[id]/page.tsx` 结果页（3-5 句对白 + mood_tag + 3 套海报缩略图）
- [ ] 2.5 `app/poster/[id]/[style]/page.tsx` 单海报全屏预览 + 下载
- [ ] 2.6 `app/about/page.tsx` 关于 + 强调"娱乐用 / AI 生成 / 非真实翻译"

### 3. 录音 UI
- [ ] 3.1 `components/AudioRecorder.tsx` 用 MediaRecorder API
- [ ] 3.2 按住录音 / 松开停止（最长 10 秒）
- [ ] 3.3 录音后展示波形预览 + 时长 + 重录按钮
- [ ] 3.4 浏览器权限处理（拒绝时友好提示）
- [ ] 3.5 **重要**：录音 blob 仅用于"提取时长 + 简单频谱特征"喂给 LLM，**不做真识别**

### 4. LLM API（严格遵守 codex）
- [ ] 4.1 `app/api/generate-cards/route.ts` POST 接口
- [ ] 4.2 入参：petType (cat/dog) / petName / audioDurationSec / audioFeatures (high/low pitch 简单二分)
- [ ] 4.3 Prompt 严格按 `detail-05-pet-translator.md § A.1`（codex 修订版）：
  - 自定位"萌系绘本作家 + AI 生成内容"
  - **禁词**：翻译 / 准确 / 真实意图
  - **强制 disclaimer**：每次输出含 `disclaimer: "⚠️ 仅供娱乐，AI 生成宠物心情卡片"`
- [ ] 4.4 输出 schema：`{ translation: string[3-5], mood_tag: string, emoji_set: string[3], disclaimer: string }`
- [ ] 4.5 mock fallback：从 20 个预设场景里随机返回一组（覆盖：求食/撒娇/求摸摸/警惕/想睡觉等）

### 5. 3 套海报模板
- [ ] 5.1 `components/PosterStyle1.tsx` 萌系卡通（圆角粉色背景 + 大对话气泡 + emoji 贴纸）
- [ ] 5.2 `components/PosterStyle2.tsx` 简约可爱（白底 + 极细线条 + 中性灰）
- [ ] 5.3 `components/PosterStyle3.tsx` 复古胶片（牛皮纸纹理 + 胶片框 + 复古字体）
- [ ] 5.4 每个海报底部强制嵌入：disclaimer + "@宠物心情卡片" 水印 + 二维码 placeholder
- [ ] 5.5 html2canvas 导出 PNG / 复制到剪贴板

### 6. mood_tag 配色映射
- [ ] 6.1 `lib/moodColors.ts` 11 个 mood_tag → 配色映射：
  - 撒娇 / 求食 / 警惕 / 困倦 / 求摸摸 / 抱怨 / 想出门 / 开心 / 闹脾气 / 好奇 / 默认
- [ ] 6.2 海报根据 mood_tag 切换强调色

### 7. 强制 disclaimer（避免虚假宣传）
- [ ] 7.1 全局 footer："⚠️ 本产品仅供娱乐，AI 生成宠物心情卡片，不承诺真实翻译动物语言"
- [ ] 7.2 所有海报底部强制嵌入 disclaimer（不可删除）
- [ ] 7.3 App 标题 / metadata title 含"宠物心情卡片"，**不含"翻译"二字**
- [ ] 7.4 关于页详细说明"我们是娱乐应用，不是动物语言学工具"

### 8. 占位图
- [ ] 8.1 `codex-todo-illustrations.md`：
  - `hero-pet.png`（首页 banner：猫狗萌系插画）
  - `recording-wave.png`（录音波形装饰）
  - `loading-pet.png`（AI 生成中动画占位）
  - 3 套海报背景（`poster-bg-1.png` 萌系 / `poster-bg-2.png` 极简 / `poster-bg-3.png` 复古）

### 9. 验证
- [ ] 9.1 `npm install` / `npm run build` / `npm run dev` 通过
- [ ] 9.2 mock 路径：选择猫 + 录音 3 秒 → 看完整对白 + 3 套海报
- [ ] 9.3 真实 LLM 路径：用真实 DeepSeek key 测试，确认输出含 disclaimer
- [ ] 9.4 检查全站 grep：**"翻译"二字仅出现在 about 页面的免责声明里**，不在标题 / 海报 / Prompt 输出里
- [ ] 9.5 真机浏览器测试 MediaRecorder API（Chrome / Safari 移动版）

### 10. 不做
- 不接真实支付
- 不做"真实翻译"（永远不做）
- 不做海外版
- 不接真实 ASR API
- 不实现连续录音 / 编辑录音
