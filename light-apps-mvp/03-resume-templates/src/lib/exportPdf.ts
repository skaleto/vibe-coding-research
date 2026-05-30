// A4 物理尺寸（mm）
const A4_W = 210;
const A4_H = 297;

/**
 * 把简历 A4 节点截图后贴进 PDF 并下载。
 * 方案：html2canvas 高分辨率截图 → jsPDF 按 A4 比例铺满，超高则自动分页。
 * 优点：真·一键下载、移动端也能存；缺点：文本变位图（react-to-print 是矢量兜底）。
 *
 * 用动态 import 懒加载 html2canvas / jsPDF（合计 ~700KB），
 * 让首屏 bundle 更小——小红书来的移动端用户首次打开更快。
 */
export async function exportNodeToPdf(node: HTMLElement, fileName: string): Promise<void> {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
    import('html2canvas'),
    import('jspdf'),
  ]);

  // scale=2 兼顾清晰度与体积；windowWidth 锁定 794px 保证 A4 宽度一致
  const canvas = await html2canvas(node, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
    windowWidth: node.scrollWidth,
  });

  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
  const imgData = canvas.toDataURL('image/jpeg', 0.92);

  // 按宽度铺满 A4，高度等比；若超过一页则分页绘制
  const imgWidth = A4_W;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
  heightLeft -= A4_H;

  while (heightLeft > 0) {
    position -= A4_H;
    pdf.addPage();
    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
    heightLeft -= A4_H;
  }

  pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
}
