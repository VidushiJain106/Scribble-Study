
import { useNoteStore } from "@/lib/store";
import { DrawPath, Point } from "@/types";
import { useEffect, useRef, useState } from "react";

interface DrawingCanvasProps {
  onDrawingComplete: (paths: DrawPath[]) => void;
}

export function DrawingCanvas({ onDrawingComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [paths, setPaths] = useState<DrawPath[]>([]);
  
  const activeTool = useNoteStore(state => state.activeTool);
  const penColor = useNoteStore(state => state.penColor);
  const penSize = useNoteStore(state => state.penSize);
  
  // Convert pen size to actual pixel width
  const getPenWidth = () => {
    switch (penSize) {
      case "small": return 2;
      case "medium": return 4;
      case "large": return 8;
      default: return 4;
    }
  };
  
  // Get color with opacity for highlighter
  const getStrokeStyle = () => {
    if (activeTool === "highlighter") {
      // Convert hex to rgba with opacity
      const hex = penColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    return penColor;
  };
  
  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      
      // Redraw all paths when canvas is resized
      redrawAllPaths();
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    return () => {
      window.removeEventListener("resize", resizeCanvas);
    };
  }, []);
  
  // Redraw all paths whenever paths change
  useEffect(() => {
    redrawAllPaths();
  }, [paths]);
  
  const redrawAllPaths = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw all paths
    for (const path of paths) {
      const { points, color, width } = path;
      if (!points.length) continue;
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };
  
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (activeTool === "select") return;
    
    const { x, y } = getPointerPosition(e);
    
    setIsDrawing(true);
    
    const newPath: DrawPath = {
      points: [{ x, y }],
      color: getStrokeStyle(),
      width: getPenWidth()
    };
    
    setCurrentPath(newPath);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || activeTool === "select") return;
    
    const { x, y } = getPointerPosition(e);
    
    setCurrentPath(prev => {
      if (!prev) return null;
      
      // Add new point to current path
      const updatedPath = {
        ...prev,
        points: [...prev.points, { x, y }]
      };
      
      // Draw the line
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      
      if (canvas && ctx && prev.points.length > 0) {
        const lastPoint = prev.points[prev.points.length - 1];
        
        ctx.beginPath();
        ctx.moveTo(lastPoint.x, lastPoint.y);
        ctx.lineTo(x, y);
        ctx.strokeStyle = prev.color;
        ctx.lineWidth = prev.width;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.stroke();
      }
      
      return updatedPath;
    });
  };
  
  const endDrawing = () => {
    if (!isDrawing || !currentPath) return;
    
    if (currentPath.points.length > 1) {
      // Add current path to paths
      setPaths(prev => [...prev, currentPath]);
    }
    
    setIsDrawing(false);
    setCurrentPath(null);
  };
  
  const getPointerPosition = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    
    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
    }
  };
  
  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      setPaths([]);
    }
  };
  
  const saveDrawing = () => {
    if (paths.length === 0) return;
    onDrawingComplete(paths);
    // Don't clear the canvas to let the user continue editing
  };
  
  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className={`drawing-canvas w-full h-full absolute top-0 left-0 z-10 ${isDrawing ? "cursor-crosshair" : "cursor-default"}`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      
      <div className="absolute bottom-4 right-4 z-20 flex gap-2">
        <Button onClick={clearCanvas} variant="outline" size="sm">
          Clear
        </Button>
        <Button onClick={saveDrawing} variant="default" size="sm">
          Save
        </Button>
      </div>
    </div>
  );
}

// Add a button component that wasn't defined above
function Button({
  onClick,
  variant = "default",
  size = "default",
  children,
  className = "",
}: {
  onClick: () => void;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  children: React.ReactNode;
  className?: string;
}) {
  const baseClasses = "rounded font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";
  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
  };
  const sizeClasses = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-xs"
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
