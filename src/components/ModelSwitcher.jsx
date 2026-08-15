import { models } from "../data/models.js";

// Segmented control for choosing which car is on the stand — the team's own
// monopost, or the customer vehicle the same hybrid system drops into.
export function ModelSwitcher({ activeId, onSelect }) {
  if (models.length < 2) return null;

  return (
    <div className="model-switcher" role="group" aria-label="Model">
      {models.map((model) => {
        const active = model.id === activeId;
        return (
          <button
            key={model.id}
            className={`model-switcher-btn${active ? " active" : ""}`}
            aria-pressed={active}
            onClick={() => onSelect(model.id)}
          >
            <span className="model-switcher-label">{model.label}</span>
            <span className="model-switcher-caption">{model.caption}</span>
          </button>
        );
      })}
    </div>
  );
}
