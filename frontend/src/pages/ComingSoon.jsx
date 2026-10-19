import { ArrowRight, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ComingSoon({ eyebrow, title, description }) {
  const navigate = useNavigate();

  return (
    <main className="dashboard-main">
      <section className="context-banner">
        <div className="context-content">
          <span className="eyebrow">{eyebrow}</span>
          <h2>{title}</h2>
          <p>{description}</p>
        </div>

        <div
          className="context-mountain"
          style={{ backgroundImage: "url(/dashboard/mountain.png)" }}
          aria-hidden="true"
        />
      </section>

      <section className="panel placeholder-page">
        <div className="large-mint-icon">
          <ShieldCheck size={27} />
        </div>

        <span className="eyebrow">POD ALPHA</span>
        <h2>{title}</h2>
        <p>
          This workspace is connected to the CyBreach Arena application
          structure and will be implemented against the real Pod Alpha API in
          its dedicated development stage.
        </p>

        <button
          type="button"
          className="placeholder-action"
          onClick={() => navigate("/")}
        >
          Return to Dashboard
          <ArrowRight size={17} />
        </button>
      </section>
    </main>
  );
}
