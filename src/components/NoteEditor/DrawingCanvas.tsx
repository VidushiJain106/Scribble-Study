
import { useNoteStore } from "@/lib/store";
import { DrawPath, Point, Shape } from "@/types";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface DrawingCanvasProps {
  onComplete: (paths: DrawPath[]) => void;
}

export function DrawingCanvas({ onComplete }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<DrawPath | null>(null);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  
  const activeTool = useNoteStore(state => state.activeTool);
  const penColor = useNoteStore(state => state.penColor);
  const penSize = useNoteStore(state => state.penSize);
  const penOpacity = useNoteStore(state => state.penOpacity);
  const activeShape = useNoteStore(state => state.activeShape);
  const paths = useNoteStore(state => state.currentPaths);
  const setIsDrawingStore = useNoteStore(state => state.setIsDrawing);
  
  // Convert pen size to actual pixel width
  const getPenWidth = () => {
    switch (penSize) {
      case "small": return 2;
      case "medium": return 4;
      case "large": return 8;
      case "xlarge": return 12;
      default: return 4;
    }
  };
  
  // Get color with opacity 
  const getStrokeStyle = () => {
    if (activeTool === "highlighter") {
      // Convert hex to rgba with opacity for highlighter
      const hex = penColor.replace("#", "");
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, 0.3)`;
    }
    
    // For other tools, use the penOpacity setting
    const hex = penColor.replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${penOpacity})`;
  };
  
  // Setup canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const tempCanvas = tempCanvasRef.current;
    if (!canvas || !tempCanvas) return;
    
    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
      tempCanvas.width = parent.clientWidth;
      tempCanvas.height = parent.clientHeight;
      
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
      const { points, color, width, tool = "pen" } = path;
      if (!points.length) continue;
      
      if (tool === "shape") {
        // Here we need the shape information which might be stored in the opacity field for now
        // In a real app, we would have a dedicated field for this
        const shapeType = path.tool as unknown as Shape;
        drawShape(ctx, points[0], points[1], color, width, shapeType);
        continue;
      }
      
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      if (tool === "pencil") {
        // For pencil, use quadraticCurveTo for smoother lines
        for (let i = 1; i < points.length; i++) {
          const xc = (points[i].x + points[i - 1].x) / 2;
          const yc = (points[i].y + points[i - 1].y) / 2;
          
          if (i === 1) {
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
          } else {
            ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
          }
        }
      } else {
        // For other tools, use regular lines
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }
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
    setIsDrawingStore(true);
    
    if (activeTool === "shape") {
      setStartPoint({ x, y });
      
      const newPath: DrawPath = {
        points: [{ x, y }, { x, y }],
        color: getStrokeStyle(),
        width: getPenWidth(),
        tool: "shape", // This is a Tool type, not a Shape type
        opacity: penOpacity
      };
      
      setCurrentPath(newPath);
      return;
    }
    
    const newPath: DrawPath = {
      points: [{ x, y }],
      color: getStrokeStyle(),
      width: getPenWidth(),
      tool: activeTool,
      opacity: penOpacity
    };
    
    setCurrentPath(newPath);
  };
  
  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !currentPath || activeTool === "select") return;
    
    const { x, y } = getPointerPosition(e);
    
    if (activeTool === "shape" && startPoint) {
      // For shapes, we only update the end point
      const tempCanvas = tempCanvasRef.current;
      const tempCtx = tempCanvas?.getContext("2d");
      
      if (tempCanvas && tempCtx) {
        // Clear temp canvas
        tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
        
        // Update path with new end point
        setCurrentPath(prev => {
          if (!prev || !startPoint) return prev;
          
          const updatedPath = {
            ...prev,
            points: [startPoint, { x, y }]
          };
          
          // Draw the shape on the temp canvas
          drawShape(
            tempCtx, 
            updatedPath.points[0], 
            updatedPath.points[1], 
            updatedPath.color, 
            updatedPath.width, 
            activeShape
          );
          
          return updatedPath;
        });
      }
      
      return;
    }
    
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
        
        if (activeTool === "pencil" && prev.points.length > 1) {
          // For pencil, create smoother lines with curves
          const prevPoint = prev.points[prev.points.length - 2];
          const xc = (lastPoint.x + x) / 2;
          const yc = (lastPoint.y + y) / 2;
          
          ctx.moveTo(prevPoint.x, prevPoint.y);
          ctx.quadraticCurveTo(lastPoint.x, lastPoint.y, xc, yc);
        } else {
          // For other tools, use regular lines
          ctx.moveTo(lastPoint.x, lastPoint.y);
          ctx.lineTo(x, y);
        }
        
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
    
    const tempCanvas = tempCanvasRef.current;
    const mainCanvas = canvasRef.current;
    const ctx = mainCanvas?.getContext("2d");
    
    if (activeTool === "shape" && tempCanvas && mainCanvas && ctx) {
      // Transfer the shape from temp canvas to main canvas
      ctx.drawImage(tempCanvas, 0, 0);
      
      // Clear temp canvas
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx?.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    if (currentPath.points.length > 1 || activeTool === "shape") {
      // Add current path to paths
      useNoteStore.setState(state => ({
        currentPaths: [...state.currentPaths, currentPath]
      }));
    }
    
    setIsDrawing(false);
    setIsDrawingStore(false);
    setCurrentPath(null);
    setStartPoint(null);
  };
  
  const drawShape = (
    ctx: CanvasRenderingContext2D, 
    start: Point, 
    end: Point, 
    color: string, 
    width: number, 
    shape: Shape
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    
    const x1 = start.x;
    const y1 = start.y;
    const x2 = end.x;
    const y2 = end.y;
    
    switch (shape) {
      case "rectangle":
        ctx.rect(
          Math.min(x1, x2),
          Math.min(y1, y2),
          Math.abs(x2 - x1),
          Math.abs(y2 - y1)
        );
        break;
      case "circle":
        const radiusX = Math.abs(x2 - x1) / 2;
        const radiusY = Math.abs(y2 - y1) / 2;
        const centerX = Math.min(x1, x2) + radiusX;
        const centerY = Math.min(y1, y2) + radiusY;
        
        ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, 2 * Math.PI);
        break;
      case "line":
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        break;
      case "arrow":
        // Draw the line
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        
        // Calculate the arrow head
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const headLength = 15;
        
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle - Math.PI / 6),
          y2 - headLength * Math.sin(angle - Math.PI / 6)
        );
        ctx.moveTo(x2, y2);
        ctx.lineTo(
          x2 - headLength * Math.cos(angle + Math.PI / 6),
          y2 - headLength * Math.sin(angle + Math.PI / 6)
        );
        break;
    }
    
    ctx.stroke();
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
    const tempCanvas = tempCanvasRef.current;
    const ctx = canvas?.getContext("2d");
    const tempCtx = tempCanvas?.getContext("2d");
    
    if (canvas && ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    
    if (tempCanvas && tempCtx) {
      tempCtx.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
    }
    
    useNoteStore.setState({ currentPaths: [] });
  };
  
  const saveDrawing = () => {
    if (paths.length === 0) return;
    onComplete(paths);
    // Don't clear the canvas to let the user continue editing
  };
  
  return (
    <div className="relative w-full h-full">
      {/* Main canvas for persisted drawings */}
      <canvas
        ref={canvasRef}
        className={`drawing-canvas w-full h-full absolute top-0 left-0 z-10 ${
          activeTool === "select" ? "cursor-default" : "cursor-crosshair"
        }`}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={endDrawing}
        onMouseLeave={endDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={endDrawing}
      />
      
      {/* Temporary canvas for shape preview */}
      <canvas
        ref={tempCanvasRef}
        className="w-full h-full absolute top-0 left-0 z-20 pointer-events-none"
      />
      
      <div className="absolute bottom-4 right-4 z-30 flex gap-2">
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
