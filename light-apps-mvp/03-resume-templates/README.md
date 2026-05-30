# 简历模板 MVP · 填表单 → 自动排版 → 一键导出 PDF

垂直数字模板（简历方向）的 Web MVP。卖原创简历模板 + 配套「填表单 → 实时预览 → 导出 PDF」轻工具。
**纯前端、零网络请求、零 AI 调用、零后端**——模板套数据是确定性逻辑，运行时零边际成本，契合「一次性买断」商业模型。

对应 PRD：`../prd-03-resume-templates.md`
方案来源：`../../light-app-low-ai-2026/deep-dive/03-china-light-app-ideas.md`（方案三·首推）

---

## 本地运行

```bash
cd light-apps-mvp/03-resume-templates
npm install
npm run dev      # 起 http://localhost:3003
```

其他脚本：

```bash
npm run build        # 类型检查(tsc --noEmit) + 生产构建，输出 dist/
npm run preview      # 本地预览 dist 构建产物
npm run type-check   # 仅类型检查
```

> 要求 Node 18+。已在 Node 25 / npm 11 验证 `npm install && npm run build` 通过（0 error）。

---

## 功能清单（MVP 已实现）

- **模板选择**：4 套风格区分明显的简历模板，纯 CSS 缩略图预览、点击即切换
  - `极简灰`（免费）· `专业蓝` · `创意彩` · `学术黑`
- **填表单**：左侧表单，覆盖 基本信息 / 教育 / 实习工作 / 项目 / 技能 / 自我评价；
  教育/工作/项目/技能为**可重复条目**，支持 增 / 删 / 上移 / 下移
- **自动排版 + 实时预览**：右侧按 A4 比例（210×297mm @96dpi = 794×1123px）实时渲染，所见即所得；
  **数据与模板解耦**——换模板只换渲染层，**数据不丢**
- **导出 PDF**：两种方式
  - 「下载 PDF」：`html2canvas` 截图 + `jsPDF` 拼 A4、超长自动分页，**真·一键下载**
  - 「打印 / 高清」：`react-to-print` 走浏览器原生打印（文本矢量、中文最稳，可「另存为 PDF」）
- **草稿自动保存**：表单防抖写 `localStorage`，**刷新 / 关页不丢**；可「清空重填」
- **付费墙（mock）**：
  - 免费版：仅 `极简灰` 可用，导出**带平铺水印**
  - **¥9 一次买断**：解锁全部 4 套模板 + **去水印**（mock 支付，点击即模拟成功，**不接真实支付、不扣款**）
  - 付费状态存 `localStorage`，刷新保留
- **移动端友好**：桌面端左右双栏；窄屏（<1024px）切换为「编辑 / 预览」Tab，适配小红书来的手机用户

### 自验结果

`npm run build` → 0 error；Playwright headless 跑通 16/16 核心检查（选模板 → 填表 → 实时同步 → 水印 → 付费墙 → mock 解锁 → 去水印 → 4 套模板均渲染 → 换模板数据不丢 → 刷新草稿与付费状态均保留 → 无 console 错误）。

---

## 技术栈

| 维度 | 选型 |
|---|---|
| 构建 | Vite 5 |
| 框架 | React 18.3 |
| 语言 | TypeScript 5.5（strict + `noUncheckedIndexedAccess` + `noUnusedLocals`） |
| 样式 | Tailwind CSS 3.4 + 少量原生 CSS（A4 纸张 / `@media print`） |
| 图标 | lucide-react |
| PDF 导出 | html2canvas + jsPDF（下载，**懒加载**）/ react-to-print（打印，矢量） |
| 持久化 | localStorage（自写轻封装 + 防抖自动存） |
| 网络 / AI | **零**（纯本地确定性逻辑） |

> 导出库（html2canvas + jsPDF 合计 ~700KB）通过**动态 `import()` 懒加载**，仅在用户点「下载 PDF」时才拉取，主包仅 ~195KB（gzip ~62KB），保证移动端首屏快。

---

## 目录结构

```
src/
├── main.tsx                 # 入口（单页，无路由）
├── App.tsx                  # 编排：状态/持久化/响应式布局/付费 gate
├── styles.css               # Tailwind + A4 + 打印样式
├── lib/
│   ├── types.ts             # ResumeData 等数据模型（与模板解耦）
│   ├── templates.ts         # 4 套模板元信息（免费/付费、主题色）
│   ├── sampleData.ts        # 默认示例数据 / 空白数据 / genId
│   ├── storage.ts           # localStorage 读写 + 防抖
│   └── exportPdf.ts         # html2canvas + jsPDF 导出（懒加载）
├── templates/               # 4 套简历模板渲染组件（A4 布局）
│   ├── MinimalTemplate.tsx  # 极简灰
│   ├── BlueTemplate.tsx     # 专业蓝（左侧栏）
│   ├── CreativeTemplate.tsx # 创意彩（时间线）
│   └── AcademicTemplate.tsx # 学术黑（衬线）
└── components/
    ├── ResumeForm.tsx       # 主表单（含数组增删改/移动）
    ├── ResumeRenderer.tsx   # 按 templateId 选模板 + 水印叠加（forwardRef）
    ├── PreviewPane.tsx      # 等比缩放预览（导出抓原始 794px 节点）
    ├── TemplatePicker.tsx   # 缩略图选择 + 锁标
    ├── ExportBar.tsx        # 下载 PDF / 打印按钮
    ├── PaywallModal.tsx     # 付费墙（mock 支付）
    ├── SectionCard.tsx      # 表单分区卡 / 可重复条目壳
    ├── fields.tsx           # 输入框 / 文本域 / 字段行
    └── Multiline.tsx        # 多行文本渲染（模板复用）
```

---

## 已知限制

- **支付为 mock**：点击「解锁」直接置 `localStorage` 的 `resume:paid=true`，**未接微信虚拟支付 / Apple 内购**。
  上线需替换 `PaywallModal` 的 `pay()` 与 `App` 的 `handlePaid()`。
- **「下载 PDF」是位图**（html2canvas 截图）：文本不可选、体积略大；要矢量文本请用「打印 / 高清」（react-to-print）。
- **超 1 页未做精细分页控制**：内容过长时「下载 PDF」按 A4 高度硬切，可能在条目中间断开；「打印」走浏览器分页更自然。后续可加「分页符 / 内容溢出提示」。
- **字体依赖系统**：用 `PingFang SC / 思源 / 宋体` 等系统字体，未内嵌字体文件（规避商业字体侵权）；不同系统渲染略有差异。要完全一致需自带可商用开源字体（如思源黑体）并在 `react-to-print` 的 `fonts` 注入。
- **未做多份简历管理**：当前仅一份草稿。投不同岗位用不同版本属 P1。
- **localStorage 单端**：数据仅存本机浏览器，不跨设备同步（也是隐私卖点：简历不上传）。

---

## 如何扩展模板（新增一套简历模板）

1. 在 `src/templates/` 新建 `XxxTemplate.tsx`，入参 `{ data: ResumeData }`，根节点加 `className="a4-sheet ..."`（保证 A4 宽度）。可复用 `<Multiline>` 渲染多行 detail。
2. 在 `src/lib/types.ts` 的 `TemplateId` 联合类型加上新 id（如 `'compact'`）。
3. 在 `src/lib/templates.ts` 的 `TEMPLATES` 数组加一条元信息（`name / desc / free / accent`）；`storage.ts` 的 `loadTemplateId` 白名单同步加上新 id。
4. 在 `src/components/ResumeRenderer.tsx` 的 `renderTemplate` switch 加一个 case。
5. 在 `src/components/TemplatePicker.tsx` 的 `Thumb` 加对应缩略图骨架（纯 CSS，可选；不加会落到 minimal 骨架）。

> 模板上新即小红书更新选题：每出 1 套新模板就能发一篇「新增 XX 风格简历模板」笔记。

---

## 合规说明

- 运行时**零 AI 生成、零深度合成** → 规避算法备案 / 深度合成新规。
- 模板为**原创设计**，字体 / 图标用系统字体 + lucide 开源图标，**不内嵌商业字体 / 侵权图库**。
- 用户简历数据**全部存本地、零上传**，可作隐私卖点。
- 真实收款上线走微信小程序虚拟支付 / 小红书店铺挂链（注意主体资质与费率，详见 PRD 第 10 节）。
