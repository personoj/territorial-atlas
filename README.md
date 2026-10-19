# 灰绿山水 · 全国省域连续地图

React + TypeScript + Vite 前端工程，OpenLayers 负责连续地理渲染。接入全国34个省级区域的 imagegen 透明贴图、主分区与市县标签，支持点击省域、缩放和拖动。北京市、天津市、上海市、重庆市及港澳使用区县／堂区作为主分区。

## 开发与构建

使用 Node.js 20.19–20.x 或 22.12 及以上（本地验证版本为 24.10）。首次克隆后安装锁定依赖：

```sh
npm ci
npm run dev
```

打开 [本地地图](http://127.0.0.1:4173/#hubei)。原地址 `/geographic.html#hubei` 继续可用。

```sh
npm run check    # TypeScript 检查
npm run build    # 检查并从源码构建 dist
npm run preview  # 预览构建产物；先停止同端口的开发服务器
```

开发服务器与预览服务器默认仅绑定 `127.0.0.1:4173`；可以用 `-- --port 4174` 指定其他端口。`npm run format` 格式化源码。

## 目录职责

```text
src/
  app/          页面组合与 React 状态
  components/   精简工具栏和地图容器
  hooks/        地图生命周期与导航状态
  map/          独立 TypeScript 地图引擎、制图样式和类型
  styles/       界面 CSS，按基础、地图、控件和署名划分
  config/       资源入口等应用配置
  entries/      独立嵌入入口
public/
  assets/geo/   当前地图的运行贴图、GeoJSON 和区域配置
  licenses/     随运行库分发的许可证
index.html      React 主页面入口
geographic.html 兼容已有地址的页面入口
geographic-embed.html 独立地图嵌入入口
vite.config.ts  开发与生产构建配置
tsconfig.json   TypeScript 配置
package-lock.json 固定依赖版本
dist/           自动生成的构建产物，不提交 Git
```

所有应用修改在 `src/` 中进行；更换运行资源时修改 `public/`。`dist/` 可由源码重新生成，构建时会清空并重建，请勿直接编辑或保存制作原稿到其中。

主页面使用 React 管理界面，地图内部帧由 OpenLayers 绘制。地图引擎不依赖 React，可供其他界面框架或原生 JavaScript 宿主复用。

## 地图组件接入

宿主为容器设置明确的宽高，加载 OpenLayers CSS，并提供运行资源的 URL：

```ts
import 'ol/ol.css';
import './src/styles/attribution.css';
import { GeographicPlanningMap } from './src/map';

const map = new GeographicPlanningMap(container, { assetBase: './assets/geo/' });
await map.initialize();
map.fitRegion('hunan');
map.fitHubei();
map.fitNational();
map.setLabels(false);
map.setBusinessData(geojson); // WGS84 点、线、面
const unsubscribe = map.on('mapclick', ({ coordinate }) => console.log(coordinate));
// 宿主卸载时：unsubscribe(); map.destroy();
```

`src/hooks/usePlanningMap.ts` 展示了 React 中的创建、事件订阅和卸载清理；StrictMode 重挂载会取消旧实例的资源请求。`geographic-embed.html` 展示了不依赖 React 的独立入口。

地址片段支持 `national` 和各省 ID，例如 `hubei / sichuan / shanghai / xinjiang / tibet / taiwan / hong-kong / macau`；完整列表见 `public/assets/geo/regions-style-a.json`。所有影像共用同一坐标视图，市县边界、文字和标记独立绘制。

点击整块省域即可选中并平滑聚焦，点击地名也可选择所属省份。选中状态不受缩放或拖动影响；点击其他省、返回全国，或宿主显式调用导航接口才会改变选择。右上角只保留放大、缩小和返回全国，页面保留独立地名与轻量比例尺。

全国首载读取底图、区域配置与轻量地点索引 `places-style-a.json`。当前省请求完整纹理、市界及按缩放出现的县界；可视近邻省只请求720px透明上下文图，淡化至约28%，远处保留全国简底。省界使用浅色衬线和灰绿主线，焦点交接渐变450ms。渐进加载根据缩放和可视范围更新，与省份选择状态分离。

近邻表依据实际几何距离（60km内、最多8省）预计算，再按视口筛选；`contextImage` 与 `neighbors` 字段位于区域注册表中。资源并发最多3个，离屏缓存目标8个区域，可见图层受保护。已访问的完整图可直接作为淡化上下文复用；未访问邻省不会因此下载完整图或市县面。宿主可通过 `search()` 和 `focusPlace()` 自行接入地点搜索，台湾地名同时支持常见简体输入；演示页面不提供搜索面板。

`map.getLoadingState()` 返回 `fullTextures / contextTextures / wantedFull / wantedContext / roles / targetReady` 等状态，便于宿主集成和验证。34张上下文图合计约2.37MB，对应完整图约14.18MB（减少83.31%，不包括共用底图、代码及矢量数据）。

区域配置支持 `focusExtent`（EPSG:3857 默认取景范围）、`transitionZoom`、`maxZoom`、`cityFocusZoom` 和 `countyFocusZoom`。海南与台湾的默认取景聚焦主岛及近岸区域，远岛保持原始地理位置。缩放到不同大小的区域时，底图细节按该区域尺度渐显。

窄窗口会根据省域实际取景缩放适配细节阈值，保留当前省的清晰度；全国取景允许视口超出中心移动范围，避免宽屏裁掉地图南北两端。静态纹理在相机移动过程中即可准备，首次可绘制后开始淡入。

仓库只包含当前连续地图及其独立嵌入入口；早期图册、制作原稿和未使用的参考图层保存在本地归档中。

## 静态部署

执行 `npm ci`、`npm run build` 后，发布 `dist/` 的内容即可。Vite 使用相对资源基址，也可部署到静态站点的子目录。开发服务器只用于本地开发，`vite preview` 用于检查构建产物。

Git 跟踪源码、构建配置、依赖锁文件及运行资源。`dist/`、`node_modules/`、制作工具、QA 页面、过程文档和原始生成素材由 `.gitignore` 排除。本地制作原稿保存在 `work/authoring-assets/geo/`，运行资源位于 `public/assets/geo/`。

## 资源与许可

地图纹理由 imagegen 生成，大多数行政区划来自 DataV，台湾分区来自国土测绘中心开放资料；香港陆地轮廓参考地政总署海面数据，澳门与海南主岛海岸线来自 OpenStreetMap / Geofabrik。地形与河湖位置参考 Natural Earth、Mapzen Terrain Tiles。资料署名与数据许可见 `public/licenses/map-data-sources.txt`；地图引擎包含共享署名控件，嵌入时应保留。启动时展示来源，5秒后或开始操作地图时收起为左下角的 ⓘ；点击入口可再次展开。

生成地形和水系为视觉示意，不能用于位置测量或规划判读。贴图与边界采用不同来源和精度，小岛与海湾仍受生成分辨率影响；某些台湾标签使用区域内部点，不代表政府驻地坐标。湖北原图对照的来源保存在 `public/assets/geo/manifest.json`。

港澳主分区的显示面按陆地裁切，避免行政海面填色遮住海峡。原始分区未覆盖的少量陆地保留纹理和省界，不推断行政归属。

OpenLayers、React 的许可证位于 `public/licenses/`。
