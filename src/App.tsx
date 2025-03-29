import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useId, useRef, useState } from "react";
import background from "./assets/logo.png";
import github from "./assets/github.svg";
import ImageTiler, { ImageTilerRef } from "./components/image-tiler";
import { ModeToggle } from "./components/mode-toggle";
import { Button } from "./components/ui/button";
import { toast } from "sonner";

function App() {
  const [image, setImage] = useState<File | undefined>(undefined);
  const [settings, setSettings] = useState({
    width: 32,
    height: 32,
    offsetX: 0,
    offsetY: 0,
    graphic: 0,
    animationSpeed: 1,
    initialIndex: 1,
  });
  const ref = useRef<ImageTilerRef>({
    copyToClipboard: () => undefined,
  });

  return (
    <div
      style={{
        backgroundImage: `url(${background})`,
        backgroundSize: "contain",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <main className="relative grid grid-rows-3 divide-red-500 md:grid-rows-1 grid-cols-1 md:grid-cols-3 overflow-hidden p-6 gap-4 items-center justify-center h-screen w-screen backdrop-blur dark:backdrop-blur-lg bg-white/80 dark:bg-black/80">
        <div className="absolute top-4 right-4 flex items-center justify-center gap-4">
          <a
            href="https://github.com/undoredoundo/rhember-ao-indexer"
            target="_blank"
            rel="noreferrer"
          >
            <img src={github} className="size-6 transition-all dark:invert" />
          </a>
          <ModeToggle />
        </div>
        <div className="row-span-2 md:row-span-1 col-span-1 md:col-span-2 flex flex-col gap-2 items-center justify-center h-full">
          {image && (
            <ImageTiler
              ref={ref}
              props={{
                image,
                tileWidth: settings.width,
                tileHeight: settings.height,
                offsetX: settings.offsetX,
                offsetY: settings.offsetY,
                graphic: settings.graphic,
                animationSpeed: settings.animationSpeed,
                initialIndex: settings.initialIndex,
              }}
            />
          )}
        </div>
        <div className="flex flex-col gap-4">
          <div className="hidden md:flex items-center justify-center">
            <img src={background} className="w-48" />
          </div>
          <div className="space-y-1.5">
            <FormRow
              label="Imagen"
              type="file"
              name="file"
              onChange={(e) => setImage(e.target.files?.[0])}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormRow
              label="Ancho"
              type="number"
              name="width"
              value={settings.width}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  width: e.target.valueAsNumber,
                })
              }
            />
            <FormRow
              label="Alto"
              type="number"
              name="height"
              value={settings.height}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  height: e.target.valueAsNumber,
                })
              }
            />
            <FormRow
              label="Offset X"
              type="number"
              name="offset-x"
              value={settings.offsetX}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offsetX: e.target.valueAsNumber,
                })
              }
            />
            <FormRow
              label="Offset Y"
              type="number"
              name="offset-y"
              value={settings.offsetY}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  offsetY: e.target.valueAsNumber,
                })
              }
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormRow
              label="Número del Gráfico"
              type="number"
              name="graphic"
              value={settings.graphic}
              onChange={(e) =>
                setSettings({ ...settings, graphic: e.target.valueAsNumber })
              }
            />
            <FormRow
              label="Velocidad de Animación"
              type="number"
              name="animationSpeed"
              value={settings.animationSpeed}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  animationSpeed: Math.min(
                    4,
                    Math.max(1, e.target.valueAsNumber)
                  ),
                })
              }
            />
            <FormRow
              label="Índice Inicial"
              type="number"
              name="initialIndex"
              value={settings.initialIndex}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  initialIndex: Math.max(1, e.target.valueAsNumber),
                })
              }
            />
          </div>
          <Button
            onClick={() => {
              const text = ref.current?.copyToClipboard();
              if (text) {
                navigator.clipboard
                  .writeText(text)
                  .then(() => toast.success("Copiado al portapapeles"));
              }
            }}
          >
            Copiar al portapapeles
          </Button>
        </div>
      </main>
    </div>
  );
}

function FormRow(
  props: React.ComponentPropsWithoutRef<"input"> & { label: string }
) {
  const id = useId();

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{props.label}</Label>
      <Input id={id} {...props} />
    </div>
  );
}

export default App;
