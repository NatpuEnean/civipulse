import { useState } from "react";
import { API } from "../services/api";

export default function StatusCheck() {
  const [serial, setSerial] = useState("");
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const checkStatus = async () => {
    if (!serial.trim()) {
      setError("Please enter a valid serial number");
      setData(null);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setData(null);

      const res = await API.get(`/issues/${serial}`);
      setData(res.data);
    } catch {
      setError("Issue not found or server error");
    } finally {
      setLoading(false);
    }
  };

  const renderAreaImpact = () => {
    if (!data?.areaImpact) return "No sensitive areas detected";

    const impacts: string[] = [];
    if (data.areaImpact.schools > 0) impacts.push("Schools nearby");
    if (data.areaImpact.hospitals > 0) impacts.push("Hospitals nearby");
    if (data.areaImpact.residential > 0) impacts.push("Residential area");

    return impacts.length ? impacts.join(", ") : "No sensitive areas detected";
  };

  return (
    <div className="status-page">
      <div className="container">
        <h1>Check Issue Status</h1>
        <p className="subtitle">
          Enter your serial number to track the progress of your reported issue.
        </p>

        <div className="card">
          <input
            placeholder="Enter Serial Number (e.g. CP-2026-XXXX)"
            value={serial}
            onChange={(e) => setSerial(e.target.value)}
          />

          <button onClick={checkStatus} disabled={loading}>
            {loading ? "Checking..." : "Check Status"}
          </button>

          {error && <p className="error">{error}</p>}
        </div>

        {data && (
          <div className="details">
            <h2>Issue Details</h2>

            <div className="grid">
              <p><strong>Serial:</strong> {data.serial}</p>
              <p><strong>Status:</strong> {data.status}</p>
              <p><strong>Department:</strong> {data.department}</p>
              <p><strong>Priority:</strong> {data.priority}</p>
              
              <p>
                <strong>Reported On:</strong>{" "}
                {new Date(data.reportedAt).toLocaleString()}
              </p>
            </div>

            <div className="block">
              <strong>Description</strong>
              <p>{data.message}</p>
            </div>

            <div className="block">
              <strong>Affected Area</strong>
              <p>{renderAreaImpact()}</p>
            </div>

            {data.media && (
              <div className="block">
                <strong>Proof</strong>
                <div className="media">
                  {data.media.endsWith(".mp4") || data.media.endsWith(".webm") ? (
                    <video
                      src={`http://localhost:8000/uploads/${data.media.split("/").pop()}`}
                      controls
                    />
                  ) : (
                    <img
                      src={`http://localhost:8000/uploads/${data.media.split("/").pop()}`}
                      alt="Proof"
                    />
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STYLES */}
      <style>{`
        .status-page {
          min-height: 100vh;
          width: 100%;
          background: #f8fafc;
          color: #0f172a;
          font-family: system-ui, sans-serif;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 60px 32px;
        }

        h1 {
          font-size: 32px;
          margin-bottom: 8px;
        }

        .subtitle {
          opacity: 0.7;
          margin-bottom: 32px;
        }

     .card {
  background: white;
  padding: 24px;
  border-radius: 12px;
  display: flex;
  gap: 16px;
  align-items: center;
}

input {
  flex: 3;                 /* ⬅️ more typing space */
  padding: 16px;           /* ⬅️ better comfort */
  border-radius: 10px;
  border: 1px solid #cbd5f5;
  font-size: 16px;
}

button {
  flex: 1;                 /* ⬅️ smaller than input */
  padding: 12px 16px;      /* ⬅️ reduced height */
  border-radius: 8px;
  border: none;
  background: #2563eb;
  color: white;
  font-size: 14px;
  cursor: pointer;
  white-space: nowrap;
}


        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error {
          margin-top: 12px;
          color: #dc2626;
        }

        .details {
          margin-top: 40px;
          background: white;
          padding: 32px;
          border-radius: 14px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.05);
        }

        .details h2 {
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .block {
          margin-bottom: 20px;
        }

        .block p {
          margin-top: 6px;
          opacity: 0.85;
        }

        .media img,
        .media video {
          max-width: 400px;
          border-radius: 10px;
          margin-top: 10px;
        }

        @media (max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .card {
            flex-direction: column;
            align-items: stretch;
          }

          button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
