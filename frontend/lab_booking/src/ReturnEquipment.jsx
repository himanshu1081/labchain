import { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { CONTRACT_ADDRESS, ABI } from "./constants";

function ReturnEquipment() {
  const [bookingId, setBookingId] = useState("");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  function truncateAddress(addr) {
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      showToast({ kind: "warn", title: "No wallet", body: "Install MetaMask." });
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
    showToast({ kind: "ok", title: "Wallet connected", body: `${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}` });
  }

  async function handleReturn() {
    setError("");
    if (!bookingId.trim()) {
      setError("Please enter booking ID");
      return;
    }
    if (!window.ethereum || !wallet) {
      showToast({ kind: "warn", title: "Connect wallet", body: "Connect your wallet first." });
      return;
    }

    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);

      const tx = await contract.returnEquipment(bookingId);
      await tx.wait();

      setTxHash(tx.hash);
      setShowModal(true);
      setBookingId("");
    } catch (err) {
      console.log(err);
      if (err.reason?.includes("Too late")) {
        setError("Booking time is over. Deposit has been forfeited.");
      } else {
        setError("Transaction failed. Check console for details.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {/* Marquee */}
      <div className="marquee">
        <div className="marquee-track">
          {[
            <span key="a"><i>◆</i> LAB / USD <em>$1.24</em></span>,
            <span key="b">DEPOSITS HELD <em>4,820 LAB</em></span>,
            <span key="c"><i>◆</i> 142 LABS ONLINE</span>,
            <span key="d">GAS <em>11 GWEI</em></span>,
            <span key="e"><i>◆</i> RETURN WINDOW ACTIVE</span>,
            <span key="f">CONTRACT v2.1.0 <em>VERIFIED</em></span>,
          ]}
          {[
            <span key="a2"><i>◆</i> LAB / USD <em>$1.24</em></span>,
            <span key="b2">DEPOSITS HELD <em>4,820 LAB</em></span>,
            <span key="c2"><i>◆</i> 142 LABS ONLINE</span>,
            <span key="d2">GAS <em>11 GWEI</em></span>,
            <span key="e2"><i>◆</i> RETURN WINDOW ACTIVE</span>,
            <span key="f2">CONTRACT v2.1.0 <em>VERIFIED</em></span>,
          ]}
        </div>
      </div>

      {/* Nav */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div className="brand-name">Lab<em>Chain</em></div>
        </div>
        <div className="nav-links">
          <a href="#" className="live">Sepolia live</a>
          <button className={"btn " + (wallet ? "primary" : "")} onClick={connectWallet}>
            {wallet ? (
              <>
                <span style={{ display: "inline-block", width: 8, height: 8, borderRadius: 4, background: "#1A1814" }} />
                {truncateAddress(wallet)}
              </>
            ) : "Connect Wallet"}
          </button>
        </div>
      </nav>

      <main>
        <div className="hero">
          {/* Left */}
          <div>
            <span className="eyebrow"><span className="dot" />Blockchain · Based · Return · Management</span>

            <h1 className="headline">
              Return lab gear<br />
              <em>securely</em> and{" "}
              <span className="pill">instantly</span><br />
              get your <span className="underline">deposit back</span>.
            </h1>

            <p className="lede">
              Return your booked laboratory equipment through Ethereum smart contracts with <b>transparent refund</b> handling and automated verification.
            </p>

            <div className="chips">
              <span className="chip green"><i />INSTANT REFUND</span>
              <span className="chip coral"><i />ON-CHAIN VERIFICATION</span>
              <span className="chip"><i />AUTO SETTLEMENT</span>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="corner">01 / REFUND</div>
                <div className="num">Instant</div>
                <div className="lbl">Refund · Processing · On-Chain</div>
              </div>
              <div className="stat" style={{ transform: "rotate(-.6deg)" }}>
                <div className="corner">02 / VERIFY</div>
                <div className="num"><em>Secure</em></div>
                <div className="lbl">Blockchain · Verification · Always</div>
              </div>
            </div>
          </div>

          {/* Right — Ticket */}
          <div className="ticket-wrap">
            <div className="ticket">
              <div className="ticket-head">
                <div className="dots">
                  <span className="live" />
                  <span />
                  <span />
                </div>
                <div>RETURN TICKET</div>
                <div className="id">{wallet ? "WALLET·OK" : "AWAIT·SIG"}</div>
              </div>
              <div className="perf" />
              <div className="ticket-body">
                <div className="ticket-title">
                  <h2>Return <em>Equipment</em></h2>
                  <div className="stamp">
                    <div className="stamp-inner">
                      <b>RET.</b>
                      26<br />CHAIN
                    </div>
                  </div>
                </div>
                <div className="ticket-sub">SUBMIT · BOOKING · ID · TO · RETURN</div>

                <div className="field">
                  <div className="field-label">
                    <span>Booking ID <span className="req">*</span></span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>NUMERIC</span>
                  </div>
                  <div className="input-suffix">
                    <input
                      type="number"
                      placeholder="Enter Booking ID"
                      value={bookingId}
                      onChange={(e) => setBookingId(e.target.value)}
                    />
                    <div className="suffix">#ID</div>
                  </div>
                </div>

                {error && <div className="error-text">{error}</div>}

                <button className="confirm-btn" onClick={handleReturn} disabled={loading}>
                  <span>{loading ? "Processing Return…" : "Return Equipment"}</span>
                  <span className="arrow">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M12 7H2M6 3 2 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                <div className="or">or</div>

                <Link to="/" className="return-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Go to Booking Page
                </Link>

                <div className="ticket-foot">
                  <div>RETURN · GAS ≈ 11 GWEI</div>
                  <div className="barcode">
                    {[...Array(28)].map((_, i) => (
                      <i key={i} style={{ height: `${8 + ((i * 37) % 14)}px`, width: i % 5 === 0 ? 3 : (i % 3 === 0 ? 1 : 2) }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer>
        <div className="crumbs">
          <span>© 2026 LabChain Labs</span>
          <span>·</span>
          <span>Contract: {CONTRACT_ADDRESS.slice(0, 6)}…{CONTRACT_ADDRESS.slice(-4)}</span>
          <span>·</span>
          <span>Sepolia Testnet</span>
        </div>
        <div>Built with smart contracts, not spreadsheets.</div>
      </footer>

      {/* Success Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="success-icon">✓</div>
            <h2>Equipment Returned</h2>
            <p className="modal-sub">Your deposit has been refunded to your wallet.</p>

            <div className="modal-detail">
              <div className="detail-label">Transaction Hash</div>
              <div className="detail-value" style={{ fontSize: 13 }}>{txHash}</div>
            </div>

            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <a
                href={`https://sepolia.etherscan.io/tx/${txHash}`}
                target="_blank"
                className="btn primary"
                style={{ textDecoration: "none" }}
              >
                View on Etherscan →
              </a>
            </div>

            <button
              className="return-btn"
              style={{ marginTop: 8 }}
              onClick={() => setShowModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {toast && (
        <div className="toast show">
          <div className="x">{toast.kind === "ok" ? "✓" : "!"}</div>
          <div>
            <div><b>{toast.title}</b></div>
            <div style={{ opacity: .85, fontSize: 12 }}>{toast.body}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ReturnEquipment;
