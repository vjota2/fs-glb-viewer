import { PartViewer } from "./PartViewer.jsx";
import { CloseIcon } from "./icons.jsx";

export function InfoPanel({ spot, onClose }) {
  const open = !!spot;

  return (
    <div className={`info-panel${open ? " open" : ""}`}>
      {open && (
        <>
          <div className="info-panel-head">
            <button className="info-panel-close" onClick={onClose} aria-label="Close">
              <CloseIcon />
            </button>
            <div className="info-panel-doc">DOC: {spot.doc} · REV: 1.0</div>
            <div className="info-panel-title">{spot.title}</div>
          </div>
          <div className="info-panel-body">
            {spot.partModel && (
              <div className="part-viewer">
                <div className="part-viewer-label">COMPONENT MODEL — DRAG TO ROTATE</div>
                <div className="part-viewer-canvas">
                  <PartViewer modelPath={spot.partModel} />
                </div>
              </div>
            )}
            <p className="info-panel-summary">{spot.summary}</p>
            {spot.specs.map((row) => (
              <div className="spec-row" key={row.k}>
                <span className="k">{row.k}</span>
                <span className="v">{row.v}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
