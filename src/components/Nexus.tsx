import { useState, useLayoutEffect, useRef } from "react";

const CELL = 32;

const ADJACENT = [
  { dc:  1, dr:  0 }, { dc:  0, dr:  1 },
  { dc: -1, dr:  0 }, { dc:  0, dr: -1 },
  { dc:  1, dr: -1 }, { dc:  1, dr:  1 },
  { dc: -1, dr:  1 }, { dc: -1, dr: -1 },
];

export default function Nexus() {
  const containerRef = useRef(null);
  const [size, setSize] = useState({ W: 0, H: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setSize({ W: containerRef.current.clientWidth, H: containerRef.current.clientHeight });
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const { W, H } = size;
  const cols = W > 0 ? Math.floor(W / CELL) : 0;
  const rows = H > 0 ? Math.floor(H / CELL) : 0;
  // Offset to center the grid exactly in the container
  const padX = (W - cols * CELL) / 2;
  const padY = (H - rows * CELL) / 2;

  const [active, setActive] = useState(false);
  const [expanded, setExpanded] = useState(null); // node id
  const [nodes, setNodes] = useState([]);
  const [labeling, setLabeling] = useState(false);
  const [labelText, setLabelText] = useState("");
  // Root starts at true center cell
  const [rootCell, setRootCell] = useState(null);
  const [drag, setDrag] = useState(null);

  // Set root to center once size is known
  const rootCol = rootCell?.col ?? Math.floor(cols / 2);
  const rootRow = rootCell?.row ?? Math.floor(rows / 2);

  // Convert col/row to pixel top-left
  const cellPx = (col, row) => ({
    x: padX + col * CELL,
    y: padY + row * CELL,
  });

  // Convert pixel to nearest col/row, clamped to grid bounds
  const pxToCell = (px, py) => ({
    col: Math.max(0, Math.min(cols - 1, Math.round((px - padX) / CELL))),
    row: Math.max(0, Math.min(rows - 1, Math.round((py - padY) / CELL))),
  });

  const clampCell = (col, row) => ({
    col: Math.max(0, Math.min(cols - 1, col)),
    row: Math.max(0, Math.min(rows - 1, row)),
  });

  const rootPos = cols > 0 ? cellPx(rootCol, rootRow) : { x: 0, y: 0 };
  const expandedNode = nodes.find(n => n.id === expanded);

  // Find free adjacent cell to root, clamped within grid
  const getAddNodePos = () => {
    for (const { dc, dr } of ADJACENT) {
      const col = Math.max(0, Math.min(cols - 1, rootCol + dc));
      const row = Math.max(0, Math.min(rows - 1, rootRow + dr));
      const occupied = nodes.some(n => n.col === col && n.row === row)
        || (col === rootCol && row === rootRow);
      if (!occupied) return { col, row };
    }
    return clampCell(rootCol + 1, rootRow);
  };

  // ── DRAG ──
  const getXY = (e) => {
    if (e.touches?.[0]) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
    if (e.changedTouches?.[0]) return { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    return { x: e.clientX, y: e.clientY };
  };

  const onDragStart = (e, id) => {
    e.stopPropagation();
    const { x, y } = getXY(e);
    setDrag({ id, startX: x, startY: y, curX: x, curY: y, moved: false });
  };

  const onDragMove = (e) => {
    if (!drag) return;
    const { x, y } = getXY(e);
    const moved = Math.abs(x - drag.startX) > 6 || Math.abs(y - drag.startY) > 6;
    setDrag(d => ({ ...d, curX: x, curY: y, moved: d.moved || moved }));
  };

  const onDragEnd = (e) => {
    if (!drag) return;
    if (drag.moved) {
      const { x, y } = getXY(e);
      const cell = pxToCell(x, y);
      if (drag.id === "root") {
        setRootCell(cell);
      } else {
        setNodes(ns => ns.map(n => n.id === drag.id ? { ...n, ...cell } : n));
      }
    }
    setDrag(null);
  };

  const addNode = () => {
    setLabelText("");
    setLabeling({ offset: getAddNodePos() });
  };

  const confirmLabel = () => {
    const label = labelText.trim() || "Node";
    setNodes(n => [...n, { id: Date.now().toString(), label, col: labeling.offset.col, row: labeling.offset.row }]);
    setLabeling(false);
  };

  const isDraggingId = (id) => drag?.id === id && drag.moved;

  if (W === 0) return <div ref={containerRef} style={{ width: "100%", height: "100vh", background: "#808080" }} />;

  return (
    <div
      ref={containerRef}
      onMouseMove={onDragMove} onMouseUp={onDragEnd}
      onTouchMove={onDragMove} onTouchEnd={onDragEnd}
      style={{ width: "100%", height: "100vh", background: "#808080", overflow: "hidden", position: "relative", fontFamily: "monospace", touchAction: drag?.moved ? "none" : "auto" }}
    >
      <style>{`
        @keyframes pulse-root { 0%,100%{box-shadow:0 0 0 0 rgba(255,255,255,0)} 50%{box-shadow:0 0 16px rgba(255,255,255,0.3)} }
        @keyframes cell-pop { 0%{opacity:0;transform:scale(0.8)} 70%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
        @keyframes zoom-in { from{opacity:0;transform:scale(1.06)} to{opacity:1;transform:scale(1)} }
      `}</style>

      {/* GRID — bounded hard to container edges */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
        {/* outer boundary */}
        <rect x={padX} y={padY} width={cols * CELL} height={rows * CELL} fill="none" stroke="rgba(0,0,0,0.3)" strokeWidth="1" />
        {/* inner vertical lines */}
        {Array.from({ length: cols - 1 }).map((_, i) => (
          <line key={`v${i}`} x1={padX + (i + 1) * CELL} y1={padY} x2={padX + (i + 1) * CELL} y2={padY + rows * CELL} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        ))}
        {/* inner horizontal lines */}
        {Array.from({ length: rows - 1 }).map((_, i) => (
          <line key={`h${i}`} x1={padX} y1={padY + (i + 1) * CELL} x2={padX + cols * CELL} y2={padY + (i + 1) * CELL} stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        ))}
      </svg>

      {/* T1 NODES */}
      {active && nodes.map((n, i) => {
        const p = cellPx(n.col, n.row);
        const dragging = isDraggingId(n.id);
        return (
          <div key={n.id}
            onMouseDown={e => onDragStart(e, n.id)}
            onTouchStart={e => onDragStart(e, n.id)}
            onClick={() => { if (!drag?.moved) setExpanded(id => id === n.id ? null : n.id); }}
            style={{
              position: "absolute", left: p.x, top: p.y,
              width: CELL, height: CELL,
              background: dragging ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.15)",
              border: `1px solid rgba(255,255,255,${dragging ? 0.9 : 0.5})`,
              cursor: dragging ? "grabbing" : "grab",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 5, letterSpacing: 1, color: "rgba(255,255,255,0.85)",
              textTransform: "uppercase", textAlign: "center",
              animation: dragging ? "none" : `cell-pop 0.35s cubic-bezier(0.34,1.4,0.64,1) ${i * 0.06}s both`,
              opacity: dragging ? 0.4 : 1, zIndex: dragging ? 20 : 5, userSelect: "none",
            }}
          >{n.label}</div>
        );
      })}

      {/* ADD NODE "+" */}
      {active && (() => {
        const { col, row } = getAddNodePos();
        const p = cellPx(col, row);
        return (
          <div onClick={addNode} style={{
            position: "absolute", left: p.x, top: p.y,
            width: CELL, height: CELL,
            background: "rgba(255,255,255,0.06)", border: "1px dashed rgba(255,255,255,0.35)",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, color: "rgba(255,255,255,0.5)", zIndex: 5,
          }}>+</div>
        );
      })()}

      {/* ROOT NODE */}
      {(() => {
        const dragging = isDraggingId("root");
        return (
          <div
            onMouseDown={e => onDragStart(e, "root")}
            onTouchStart={e => onDragStart(e, "root")}
            onClick={() => { if (!drag?.moved) { setActive(a => !a); setExpanded(null); } }}
            style={{
              position: "absolute", left: rootPos.x, top: rootPos.y,
              width: CELL, height: CELL,
              border: `1.5px solid rgba(255,255,255,${active ? 0.9 : 0.65})`,
              background: `rgba(255,255,255,${dragging ? 0.5 : active ? 0.22 : 0.12})`,
              cursor: dragging ? "grabbing" : "pointer",
              zIndex: dragging ? 25 : 10,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: dragging ? "none" : "background 0.3s, border-color 0.3s",
              animation: dragging ? "none" : "pulse-root 4s ease-in-out infinite",
              opacity: dragging ? 0.5 : 1, userSelect: "none",
            }}
          >
            <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff", boxShadow: active ? "0 0 10px rgba(255,255,255,0.9)" : "0 0 4px rgba(255,255,255,0.6)" }} />
            <span style={{ position: "absolute", top: "calc(100% + 5px)", left: 0, right: 0, textAlign: "center", fontSize: 6, letterSpacing: 3, color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Root</span>
          </div>
        );
      })()}

      {/* DRAG GHOST + SNAP TARGET */}
      {drag?.moved && (() => {
        const n = drag.id === "root" ? { label: "Root" } : nodes.find(x => x.id === drag.id);
        if (!n) return null;
        const snapped = pxToCell(drag.curX, drag.curY);
        const sp = cellPx(snapped.col, snapped.row);
        return (
          <>
            <div style={{ position: "absolute", left: drag.curX - CELL / 2, top: drag.curY - CELL / 2, width: CELL, height: CELL, background: "rgba(255,255,255,0.5)", border: "1.5px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 5, color: "#fff", textTransform: "uppercase", pointerEvents: "none", zIndex: 30 }}>{n.label}</div>
            <div style={{ position: "absolute", left: sp.x, top: sp.y, width: CELL, height: CELL, border: "1.5px dashed rgba(255,255,255,0.7)", pointerEvents: "none", zIndex: 15 }} />
          </>
        );
      })()}

      {/* LABEL INPUT */}
      {labeling && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(128,128,128,0.75)", backdropFilter: "blur(4px)" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 8, letterSpacing: 4, color: "rgba(255,255,255,0.5)", textTransform: "uppercase" }}>Name this node</span>
            <input autoFocus value={labelText} onChange={e => setLabelText(e.target.value)} onKeyDown={e => e.key === "Enter" && confirmLabel()} placeholder="Label..." style={{ background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 14, letterSpacing: 2, padding: "10px 16px", textAlign: "center", outline: "none", fontFamily: "monospace", width: 200 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={confirmLabel} style={{ padding: "6px 20px", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.4)", color: "#fff", fontSize: 8, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace" }}>Add</button>
              <button onClick={() => setLabeling(false)} style={{ padding: "6px 20px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.4)", fontSize: 8, letterSpacing: 3, textTransform: "uppercase", cursor: "pointer", fontFamily: "monospace" }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED NODE — grows in place, root stays visible */}
      {expanded && expandedNode && (() => {
        const EW = 5, EH = 4; // expand to 5x4 cells
        // Clamp so it stays within grid
        const col = Math.max(0, Math.min(cols - EW, expandedNode.col));
        const row = Math.max(0, Math.min(rows - EH, expandedNode.row));
        const p = cellPx(col, row);
        const SUB = [
          { c: 0, r: 0, w: 3, h: 2, label: "Focus" },
          { c: 3, r: 0, w: 2, h: 2, label: "Status" },
          { c: 0, r: 2, w: 2, h: 2, label: "AI" },
          { c: 2, r: 2, w: 3, h: 2, label: "Data" },
        ];
        return (
          <div style={{
            position: "absolute", left: p.x, top: p.y,
            width: EW * CELL, height: EH * CELL,
            background: "rgba(255,255,255,0.18)",
            border: "1.5px solid rgba(255,255,255,0.7)",
            zIndex: 15,
            animation: "cell-pop 0.3s cubic-bezier(0.34,1.4,0.64,1) both",
          }}>
            {/* node label */}
            <div style={{ position: "absolute", top: -18, left: 0, fontSize: 6, letterSpacing: 3, color: "rgba(255,255,255,0.6)", textTransform: "uppercase" }}>{expandedNode.label}</div>
            {/* sub-cells */}
            {SUB.map((s, i) => (
              <div key={i} style={{
                position: "absolute",
                left: s.c * CELL + 1, top: s.r * CELL + 1,
                width: s.w * CELL - 2, height: s.h * CELL - 2,
                border: "1px solid rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.06)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 6, letterSpacing: 2, color: "rgba(255,255,255,0.45)",
                textTransform: "uppercase",
              }}>{s.label}</div>
            ))}
            {/* close — tap expanded node to collapse */}
            <div onClick={() => setExpanded(null)} style={{ position: "absolute", top: 2, right: 4, fontSize: 10, color: "rgba(255,255,255,0.4)", cursor: "pointer", lineHeight: 1 }}>×</div>
          </div>
        );
      })()}

    </div>
  );
}
