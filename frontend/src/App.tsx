import { Linkedin, Sparkles } from "lucide-react";
import { ChangeEvent, useEffect, useMemo, useState } from "react";

type PortfolioData = {
  name: string;
  title: string;
  bio: string;
  linkedinUrl: string;
  profileImageDataUrl: string;
};

const DEFAULT_DATA: PortfolioData = {
  name: "Your Name",
  title: "Software Engineer",
  bio: "I build thoughtful products and scalable systems.",
  linkedinUrl: "https://www.linkedin.com/in/your-profile/",
  profileImageDataUrl: "",
};

const STORAGE_KEY = "portfolio-generator-data";

function normalizeLinkedInUrl(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function isValidLinkedInUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return /(^|\.)linkedin\.com$/i.test(url.hostname);
  } catch {
    return false;
  }
}

function analyzeMarketFit(portfolio: PortfolioData): string {
  const skillSignals = [portfolio.title, portfolio.bio].join(" ").toLowerCase();
  const score =
    (portfolio.bio.length > 80 ? 35 : 20) +
    (portfolio.linkedinUrl ? 20 : 0) +
    (skillSignals.includes("engineer") || skillSignals.includes("developer") ? 25 : 10) +
    (portfolio.profileImageDataUrl ? 20 : 10);

  if (score >= 85) {
    return "Strong market fit: profile looks recruiter-ready with clear positioning and complete social proof.";
  }
  if (score >= 65) {
    return "Moderate market fit: improve specificity in your bio and keep your LinkedIn profile fully updated.";
  }
  return "Early market fit: add more details about outcomes, skills, and proof points to improve recruiter conversion.";
}

function PublicPreview({ portfolio }: { portfolio: PortfolioData }) {
  const linkedInHref = normalizeLinkedInUrl(portfolio.linkedinUrl);
  const hasLinkedIn = linkedInHref && isValidLinkedInUrl(linkedInHref);

  return (
    <div className="page">
      <header className="public-banner">Recruiter View - Read Only</header>
      <section className="card preview-card">
        <div className="name-row">
          <div className="avatar-box">
            {portfolio.profileImageDataUrl ? (
              <img src={portfolio.profileImageDataUrl} alt={`${portfolio.name} profile`} />
            ) : (
              <span className="avatar-placeholder">{portfolio.name.slice(0, 1).toUpperCase()}</span>
            )}
          </div>
          <div>
            <h1>{portfolio.name}</h1>
            <p className="subtitle">{portfolio.title}</p>
          </div>
        </div>

        <p className="bio">{portfolio.bio}</p>

        <div className="social-row">
          {hasLinkedIn ? (
            <a className="icon-link" href={linkedInHref} target="_blank" rel="noreferrer">
              <Linkedin size={18} />
              LinkedIn
            </a>
          ) : (
            <span className="icon-link disabled">
              <Linkedin size={18} />
              LinkedIn not set
            </span>
          )}
        </div>
      </section>
    </div>
  );
}

export function App() {
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return DEFAULT_DATA;
    }
    try {
      return { ...DEFAULT_DATA, ...(JSON.parse(stored) as Partial<PortfolioData>) };
    } catch {
      return DEFAULT_DATA;
    }
  });
  const [analysis, setAnalysis] = useState("");
  const [copied, setCopied] = useState(false);

  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode");
  const isPublicPreview = mode === "public";

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
  }, [portfolio]);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timeout = window.setTimeout(() => setCopied(false), 1400);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const shareLink = useMemo(() => {
    const url = new URL(window.location.href);
    url.searchParams.set("mode", "public");
    return url.toString();
  }, []);

  if (isPublicPreview) {
    return <PublicPreview portfolio={portfolio} />;
  }

  const onInput = (field: keyof PortfolioData) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPortfolio((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const onImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setPortfolio((prev) => ({ ...prev, profileImageDataUrl: result }));
    };
    reader.readAsDataURL(file);
  };

  const linkedInHref = normalizeLinkedInUrl(portfolio.linkedinUrl);
  const hasLinkedIn = linkedInHref && isValidLinkedInUrl(linkedInHref);

  return (
    <div className="page">
      <section className="card editor">
        <h1>Portfolio Editor</h1>
        <p className="subtitle">Build your portfolio and share a read-only recruiter link.</p>

        <div className="two-col">
          <label>
            Name
            <input value={portfolio.name} onChange={onInput("name")} />
          </label>

          <label>
            Title
            <input value={portfolio.title} onChange={onInput("title")} />
          </label>
        </div>

        <label>
          Bio
          <textarea rows={4} value={portfolio.bio} onChange={onInput("bio")} />
        </label>

        <div className="two-col">
          <label>
            LinkedIn URL
            <input
              placeholder="https://www.linkedin.com/in/your-profile/"
              value={portfolio.linkedinUrl}
              onChange={onInput("linkedinUrl")}
            />
          </label>

          <div className="profile-image-upload">
            <span>Profile Image</span>
            <label className="avatar-box uploader">
              {portfolio.profileImageDataUrl ? (
                <img src={portfolio.profileImageDataUrl} alt="Profile preview" />
              ) : (
                <span className="avatar-placeholder">Upload</span>
              )}
              <input type="file" accept="image/*" onChange={onImageUpload} />
            </label>
          </div>
        </div>

        <div className="actions">
          <button onClick={() => setAnalysis(analyzeMarketFit(portfolio))}>
            <Sparkles size={16} />
            Analyze Market Fit
          </button>

          <button
            className="secondary"
            onClick={async () => {
              await navigator.clipboard.writeText(shareLink);
              setCopied(true);
            }}
          >
            Copy Recruiter Link
          </button>
        </div>

        {analysis ? <p className="analysis">{analysis}</p> : null}

        <div className="preview-divider" />
        <h2>Live Preview</h2>
        <section className="preview-card">
          <div className="name-row">
            <div className="avatar-box">
              {portfolio.profileImageDataUrl ? (
                <img src={portfolio.profileImageDataUrl} alt={`${portfolio.name} profile`} />
              ) : (
                <span className="avatar-placeholder">{portfolio.name.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h3>{portfolio.name}</h3>
              <p className="subtitle">{portfolio.title}</p>
            </div>
          </div>
          <p className="bio">{portfolio.bio}</p>
          <div className="social-row">
            {hasLinkedIn ? (
              <a className="icon-link" href={linkedInHref} target="_blank" rel="noreferrer">
                <Linkedin size={18} />
                LinkedIn
              </a>
            ) : (
              <span className="icon-link disabled">
                <Linkedin size={18} />
                LinkedIn not set
              </span>
            )}
          </div>
        </section>

        {copied ? <p className="copy-toast">Recruiter link copied.</p> : null}
      </section>
    </div>
  );
}
