# Breton 克隆经验总结

## 目标
- 高还原克隆 `breton.it` 首页与二级页面。
- 保留可点击交互，不做纯切片。

## 有效方法
- 先锁定结构顺序，再做视觉细节。
- 使用“共用头尾 + 各页主体”的模式，减少重复改动。
- 统一交互脚本（菜单、联系抽屉、移动端入口、导航高亮）集中在一个文件维护。
- 对关键区块逐段截图对照（顶部、主体中段、底部），避免顺序错位。

## 关键实现
- 首页严格按区块顺序还原：
  - `Industries`
  - `Find your solution`
  - `What's New`
  - `Breton Deals`
  - `Articles and stories by Breton`
  - `BIT`
  - `News from Breton's world`
  - `A story told in numbers`
  - `Breton in the world`
  - `Breton Company profile`
- 顶部导航实现可点击菜单覆盖层。
- `Let's talk` + `Chat with us` 打开同一联系抽屉。
- 底部统一补齐 `Customer Service / Contacts / Terms`。
- `Company profile` 区替换为“翻页书”交互。

## 资源策略
- 优先使用站内公开资源 URL（图片、地图、新闻封面）。
- 对缺图位使用同风格真实素材补齐，不留灰块占位。

## 质量检查流程
- 每轮改动后执行桌面 + 移动端截图检查。
- 重点检查：
  - 区块顺序
  - 导航与菜单交互
  - 底部入口完整性
  - 小屏无横向溢出

## 交付文件
- 首页：`breton-homepage.html`
- 二级页：
  - `breton-engineering.html`
  - `breton-products.html`
  - `breton-services.html`
  - `breton-bit.html`
  - `breton-about.html`
  - `breton-news-events.html`
  - `breton-contacts.html`
- 共用资源：
  - `breton-secondary.css`
  - `breton-secondary.js`
