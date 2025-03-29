import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";

export type ImageTilerRef = {
  copyToClipboard: () => string | undefined;
};

interface ImageTilerProps {
  ref?: React.RefObject<ImageTilerRef> | null;
  props: {
    image: File;
    tileWidth: number;
    tileHeight: number;
    offsetX: number;
    offsetY: number;
    graphic: number;
    animationSpeed: number;
    initialIndex: number;
  };
}

export function ImageTiler({
  ref,
  props: {
    image,
    tileWidth,
    tileHeight,
    offsetX,
    offsetY,
    graphic,
    animationSpeed,
    initialIndex,
  },
}: ImageTilerProps) {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [styleHelpers, setStyleHelpers] = useState({
    width: 0,
    height: 0,
    scale: 1,
  });
  const [selected, setSelected] = useState<{ x: number; y: number }[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useImperativeHandle(ref, () => ({
    copyToClipboard,
  }));

  const copyToClipboard = useCallback((): string | undefined => {
    if (!selected.length) {
      return;
    }

    const sorted = selected.sort(
      (a, b) => a.x + a.y * imageSize.width - (b.x + b.y * imageSize.width)
    );

    const graphics: Array<
      | {
          type: "graphic";
          index: number;
          x: number;
          y: number;
        }
      | {
          type: "animation";
          index: number;
          graphics: number[];
        }
    > = sorted.map((cell, index) => ({
      type: "graphic",
      index: index + initialIndex,
      x: cell.x,
      y: cell.y,
    }));

    for (const group of Object.values(
      Object.groupBy(
        graphics.filter((line) => line.type === "graphic"),
        (cell) => cell.y
      )
    )) {
      if (!group) return;

      graphics.push({
        type: "animation",
        index: graphics.length + initialIndex,
        graphics: group.map((cell) => cell.index),
      });
    }

    return graphics
      .map((line) => {
        if (line.type === "graphic") {
          return `Grh${line.index}=1-${graphic}-${line.x}-${line.y}-${tileWidth}-${tileHeight}`;
        }
        return `Grh${line.index}=${line.graphics.length}-${line.graphics.join(
          "-"
        )}-${animationSpeed}`;
      })
      .join("\n");
  }, [
    animationSpeed,
    graphic,
    imageSize.width,
    initialIndex,
    selected,
    tileHeight,
    tileWidth,
  ]);

  const toggleSelected = useCallback(
    (x: number, y: number) => {
      const selection: typeof selected = [];
      let deleted = false;
      for (const cell of selected) {
        if (cell.x === x && cell.y === y) {
          deleted = true;
          continue;
        }
        selection.push(cell);
      }
      if (!deleted) {
        selection.push({ x, y });
      }
      setSelected(selection);
      copyToClipboard();
    },
    [copyToClipboard, selected]
  );

  const cols = useMemo(
    () => imageSize.width / tileWidth,
    [imageSize.width, tileWidth]
  );
  const rows = useMemo(
    () => imageSize.height / tileHeight,
    [imageSize.height, tileHeight]
  );

  // reset selection on image or tile size change
  useEffect(() => {
    setSelected([]);
  }, [image, tileWidth, tileHeight]);

  const drawGrid = useCallback(() => {
    const img = imageRef.current;
    if (img) {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (canvas && ctx) {
        ctx.drawImage(img, 0, 0);
        ctx.strokeStyle = "rgb(255, 0, 0)";
        ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
        ctx.lineWidth = Math.max(
          (imageSize.width + imageSize.height) / 1000,
          1
        );
        for (let y = 0; y < rows; y++) {
          for (let x = 0; x < cols; x++) {
            ctx.beginPath();
            ctx.rect(
              x * tileWidth + offsetX,
              y * tileHeight + offsetY,
              tileWidth,
              tileHeight
            );
            if (selected.find((cell) => cell.x === x && cell.y === y)) {
              ctx.fill();
            }
            ctx.stroke();
          }
        }
      }
    }
  }, [
    cols,
    imageSize.height,
    imageSize.width,
    offsetX,
    offsetY,
    rows,
    selected,
    tileHeight,
    tileWidth,
  ]);

  useEffect(() => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        imageRef.current = img;
        if (!canvas || !ctx) return;
        ctx.imageSmoothingEnabled = false;
        canvas.width = img.width;
        canvas.height = img.height;
        setImageSize({ width: img.width, height: img.height });
        drawGrid();

        const parent = canvasRef.current?.parentElement;
        if (!parent) return;

        const parentWidth = parent.clientWidth;
        const parentHeight = parent.clientHeight;

        let { width, height } = img;
        const scale = Math.min(parentWidth / width, parentHeight / height);
        width *= scale;
        height *= scale;

        setStyleHelpers({ width, height, scale });
      };
    };
    reader.readAsDataURL(image);
  }, [drawGrid, image]);

  // draw grid when its deps change
  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  return (
    <canvas
      className="rounded-none"
      ref={canvasRef}
      width={imageSize.width}
      height={imageSize.height}
      style={{
        width: styleHelpers.width,
        height: styleHelpers.height,
      }}
      onClick={(e) => {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;
        const width = rect.width / cols;
        const height = rect.height / rows;
        const x = Math.floor(
          (e.clientX - offsetX * styleHelpers.scale - rect.left) / width
        );
        const y = Math.floor(
          (e.clientY - offsetY * styleHelpers.scale - rect.top) / height
        );
        toggleSelected(x, y);
      }}
    />
  );
}

export default ImageTiler;
