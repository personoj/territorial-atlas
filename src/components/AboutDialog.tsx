import { useEffect, useRef } from "react";

export function AboutDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (open && !dialog.current?.open) dialog.current?.showModal();
    if (!open && dialog.current?.open) dialog.current.close();
  }, [open]);
  return (
    <dialog id="about-dialog" ref={dialog} onClose={onClose} onCancel={onClose}>
      <form method="dialog">
        <button className="dialog-close" aria-label="关闭说明">
          ×
        </button>
      </form>
      <h2>灰绿山水</h2>
      <p>
        全国与34个省级区域使用统一的灰绿山水风格，透明地形贴图按地理轮廓定位叠加。
        市县边界、名称和标记由程序独立绘制，支持连续缩放、点击区域和地点搜索。
      </p>
      <p>
        当前用于体验底图风格与缩放过渡。生成纹理中的地形和水系为视觉示意，不能用于位置测量或规划判读。定位湖北后可查看旧规划原稿对照。
      </p>
      <p>
        <a
          href="https://www.naturalearthdata.com/"
          target="_blank"
          rel="noreferrer"
        >
          定位参考：Natural Earth
        </a>{" "}
        ·{" "}
        <a
          href="https://datav.aliyun.com/portal/school/atlas/area_selector"
          target="_blank"
          rel="noreferrer"
        >
          行政区划来源
        </a>
        {" · "}
        <a
          href="https://data.gov.tw/dataset/7441"
          target="_blank"
          rel="noreferrer"
        >
          台湾分区资料
        </a>
        {" · "}
        <a
          href="./licenses/map-data-sources.txt"
          target="_blank"
          rel="noreferrer"
        >
          完整资料与署名
        </a>
      </p>
    </dialog>
  );
}
