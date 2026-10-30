import { useApp } from "../context/AppContext";

/** Melding rechtsonder (komt uit de state in AppContext). */
export default function Toast() {
  const { toast } = useApp();

  if (!toast) return null;

  return (
    <div key={toast.id} className={`toast toast--${toast.kind}`} role="status">
      {toast.message}
    </div>
  );
}
