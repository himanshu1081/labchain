import { useState, useEffect, useRef, useMemo } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import { useMutation, useAction } from "convex/react";
import { api } from "../convex/_generated/api";
import {
  CONTRACT_ADDRESS,
  ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
} from "./constants";

const EQUIPMENT = [
  { id: "MIC-204", name: "Microscope", rate: 8, tier: "TIER-B", available: true, spec: "200x · Optical" },
  { id: "OSC-102", name: "Oscilloscope", rate: 10, tier: "TIER-B", available: true, spec: "100MHz · 4-ch" },
  { id: "CMP-301", name: "Computer System", rate: 5, tier: "TIER-C", available: true, spec: "i7 · 32GB" },
  { id: "ROB-510", name: "Robotics Kit", rate: 15, tier: "TIER-A", available: true, spec: "6-DOF · Arm" },
  { id: "PRN-110", name: "3D Printer", rate: 12, tier: "TIER-A", available: true, spec: "FDM · 0.1mm" },
];

function Marquee() {
  const items = [
    <span key="a"><i>◆</i> LAB / USD <em>$1.24</em> <i>+2.4%</i></span>,
    <span key="b">BLOCK <em>#18,402,991</em></span>,
    <span key="c"><i>◆</i> 142 LABS ONLINE</span>,
    <span key="d">GAS <em>11 GWEI</em></span>,
    <span key="e">DEPOSITS HELD <em>4,820 LAB</em></span>,
    <span key="f"><i>◆</i> AVG BOOKING 6.3H</span>,
    <span key="g">CONTRACT v2.1.0 <em>VERIFIED</em></span>,
    <span key="h"><i>◆</i> ETH <em>$3,418</em></span>,
  ];
  return (
    <div className="marquee">
      <div className="marquee-track">{items}{items}</div>
    </div>
  );
}

function Toast({ kind, title, body }) {
  return (
    <div className="toast show">
      <div className="x">{kind === "ok" ? "✓" : "!"}</div>
      <div>
        <div><b>{title}</b></div>
        <div style={{ opacity: .85, fontSize: 12 }}>{body}</div>
      </div>
    </div>
  );
}

function App() {
  const [wallet, setWallet] = useState("");
  const [equipment, setEquipment] = useState(null);
  const [duration, setDuration] = useState(4);
  const [open, setOpen] = useState(false);

  const [txHash, setTxHash] = useState("");
  const [bookingId, setBookingId] = useState("—");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const [email, setEmail] = useState("");
  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  const [modalEquipmentId, setModalEquipmentId] = useState("");
  const [modalDuration, setModalDuration] = useState(0);

  const dropdownRef = useRef(null);

  const saveBooking = useMutation(api.bookings.saveBooking);
  const sendEmail = useAction(api.email.sendBookingEmail);

  const deposit = useMemo(() => 50, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3200);
  };

  function truncateAddress(addr) {
    return addr.slice(0, 6) + "…" + addr.slice(-4);
  }

  async function connectWallet() {
    if (!window.ethereum) {
      showToast({ kind: "warn", title: "No wallet found", body: "Install MetaMask to continue." });
      return;
    }
    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
    setWallet(accounts[0]);
    showToast({ kind: "ok", title: "Wallet connected", body: `${accounts[0].slice(0, 6)}…${accounts[0].slice(-4)}` });
  }

  async function handleSendEmail() {
    if (!email.trim()) return;
    try {
      setEmailSending(true);
      setEmailError("");
      await sendEmail({
        to: email,
        bookingId,
        txHash,
        equipmentId: modalEquipmentId,
        duration: modalDuration,
      });
      setEmailSent(true);
    } catch (err) {
      console.log(err);
      setEmailError(err.message || "Failed to send email");
    } finally {
      setEmailSending(false);
    }
  }

  async function handleBooking() {
    if (!window.ethereum || !wallet) {
      showToast({ kind: "warn", title: "Connect a wallet", body: "You need a connected wallet to sign." });
      return;
    }
    if (!equipment) {
      showToast({ kind: "warn", title: "Pick equipment", body: "Select something to book first." });
      return;
    }

    try {
      setLoading(true);
      setError("");

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const signerAddress = await signer.getAddress();

      const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, signer);
      const tokenContract = new ethers.Contract(TOKEN_ADDRESS, TOKEN_ABI, signer);

      const balance = await tokenContract.balanceOf(signerAddress);
      const depositAmount = ethers.parseUnits("50", 18);

      if (balance < depositAmount) {
        setError(`Insufficient LAB tokens. You have ${ethers.formatUnits(balance, 18)} LAB, need 50.`);
        setLoading(false);
        return;
      }

      const currentCount = await contract.bookingCount();
      const newBookingId = currentCount.toString();

      const approveTx = await tokenContract.approve(CONTRACT_ADDRESS, depositAmount);
      await approveTx.wait();

      const tx = await contract.bookEquipment(equipment.id, duration, depositAmount);
      await tx.wait();

      setTxHash(tx.hash);
      setBookingId(newBookingId);

      await saveBooking({
        bookingId: newBookingId,
        walletAddress: wallet,
        equipmentId: equipment.id,
        duration: Number(duration),
        depositAmount: "50",
        txHash: tx.hash,
        approveTxHash: approveTx.hash,
        status: "booked",
        bookedAt: Date.now(),
      });

      setModalEquipmentId(equipment.id);
      setModalDuration(Number(duration));
      setShowModal(true);
      setEquipment(null);
      setDuration(4);
      setEmailSent(false);
      setEmail("");
      setEmailError("");
    } catch (err) {
      console.log(err);
      setError("Transaction failed. Check console for details.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Marquee />

      {/* Nav */}
      <nav className="nav">
        <div className="brand">
          <div className="brand-mark">L</div>
          <div className="brand-name">Lab<em>Chain</em></div>
        </div>
        <div className="nav-links">
          <a href="#equipment">Equipment</a>
          <a href="#how">How it works</a>
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

      {/* Hero */}
      <main>
        <div className="hero">
          {/* Left */}
          <div>
            <span className="eyebrow"><span className="dot" />Blockchain · Powered · Laboratory · Management</span>

            <h1 className="headline">
              Book lab gear<br />
              <em>without</em> the{" "}
              <span className="pill">paperwork</span><br />
              <span className="underline">smart contracts</span> handle the rest.
            </h1>

            <p className="lede">
              LabChain runs on Ethereum. Reservations, <b>security deposits</b>, refunds, and overdue penalties all settle on-chain — transparently, automatically, without a lab manager's clipboard.
            </p>

            <div className="chips">
              <span className="chip green"><i />NON-CUSTODIAL ESCROW</span>
              <span className="chip coral"><i />SUB-MINUTE SETTLEMENT</span>
              <span className="chip"><i />ERC-20 TOKEN</span>
              <span className="chip"><i />OPEN SOURCE</span>
            </div>

            <div className="stats">
              <div className="stat">
                <div className="corner">01 / UPTIME</div>
                <div className="num">24/7</div>
                <div className="lbl">Automated · Smart Contract · Execution</div>
              </div>
              <div className="stat" style={{ transform: "rotate(-.6deg)" }}>
                <div className="corner">02 / LEDGER</div>
                <div className="num"><em>100%</em></div>
                <div className="lbl">Transparent · Transactions · On-Chain</div>
              </div>
              <div className="stat">
                <div className="corner">03 / FEES</div>
                <div className="num">0<span style={{ fontStyle: "italic", color: "var(--coral)" }}>¢</span></div>
                <div className="lbl">No middlemen · You pay gas only</div>
              </div>
            </div>

            <div className="scribble" style={{ marginTop: 28, transform: "rotate(-1deg)" }}>
              <svg width="40" height="22" viewBox="0 0 40 22" fill="none">
                <path d="M2 11 C 12 2, 28 20, 38 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M32 6 L38 11 L32 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
              Pick a piece of equipment, set a duration, sign once.
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
                <div>BOOKING TICKET · #{bookingId}</div>
                <div className="id">{wallet ? "WALLET·OK" : "AWAIT·SIG"}</div>
              </div>
              <div className="perf" />
              <div className="ticket-body">
                <div className="ticket-title">
                  <h2>Book <em>Equipment</em></h2>
                  <div className="stamp">
                    <div className="stamp-inner">
                      <b>EST.</b>
                      26<br />CHAIN
                    </div>
                  </div>
                </div>
                <div className="ticket-sub">CREATE · NEW · LAB · EQUIPMENT · RESERVATION</div>

                {/* Select Equipment */}
                <div className="field" ref={dropdownRef} style={{ position: "relative" }}>
                  <div className="field-label">
                    <span>Select Equipment <span className="req">*</span></span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>{equipment ? equipment.id : "—"}</span>
                  </div>
                  <div className="select-wrap" onClick={() => setOpen(o => !o)}>
                    <div className="field-input" style={{ cursor: "pointer", color: equipment ? "var(--ink)" : "var(--muted)" }}>
                      {equipment ? equipment.name : "Choose Equipment"}
                    </div>
                  </div>
                  {open && (
                    <div className="menu">
                      {EQUIPMENT.map(eq => (
                        <div
                          key={eq.id}
                          className={"opt " + (eq.available ? "" : "unavail")}
                          onClick={() => { if (eq.available) { setEquipment(eq); setOpen(false); } }}
                        >
                          <div>
                            <div style={{ fontWeight: 600 }}>{eq.name}</div>
                            <div className="meta">{eq.id} · {eq.spec}</div>
                          </div>
                          <div className="meta" style={{ textAlign: "right" }}>
                            <div>{eq.tier}</div>
                            <div><b>{eq.available ? `${eq.rate} LAB/h` : "BOOKED"}</b></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Duration */}
                <div className="field">
                  <div className="field-label">
                    <span>Duration (in hours) <span className="req">*</span></span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>MIN 1 · MAX 72</span>
                  </div>
                  <div className="input-suffix">
                    <input
                      type="number" min="1" max="72"
                      value={duration}
                      onChange={(e) => setDuration(Math.max(1, Math.min(72, Number(e.target.value) || 1)))}
                    />
                    <div className="suffix">HRS</div>
                  </div>
                </div>

                {/* Security Deposit */}
                <div className="field">
                  <div className="field-label">
                    <span>Security Deposit</span>
                    <span className="mono" style={{ fontSize: 10, color: "var(--muted)" }}>FIXED</span>
                  </div>
                  <div className="input-suffix">
                    <input value={`${deposit} LAB Tokens`} readOnly />
                    <div className="suffix">
                      <span className="coin">L</span>
                      LAB
                    </div>
                  </div>
                  <div className="mono" style={{ fontSize: 10.5, color: "var(--muted)", marginTop: 6, letterSpacing: ".04em" }}>
                    ↳ Refunded on-chain when equipment is returned in spec.
                  </div>
                </div>

                <button className="confirm-btn" onClick={handleBooking} disabled={loading}>
                  <span>{loading ? "Processing Transaction…" : "Confirm Booking"}</span>
                  <span className="arrow">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                </button>

                {error && <div className="error-text">{error}</div>}

                <div className="or">or</div>

                <Link to="/return" className="return-btn">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M12 7H2M6 3 2 7l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Return Equipment
                </Link>

                <div className="ticket-foot">
                  <div>NO. #{bookingId} · GAS ≈ 11 GWEI</div>
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

      {/* Footer */}
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
            <h2>Booking Confirmed</h2>
            <p className="modal-sub">Your transaction has been confirmed on the blockchain.</p>

            <div className="modal-detail">
              <div className="detail-label">Booking ID</div>
              <div className="detail-value big">#{bookingId}</div>
            </div>

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

            <div className="modal-detail">
              <div className="detail-label">Send confirmation email</div>
              {emailSent ? (
                <div className="email-success">✓ Email sent successfully!</div>
              ) : (
                <>
                  <div className="email-row">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button onClick={handleSendEmail} disabled={emailSending || !email.trim()}>
                      {emailSending ? "Sending…" : "Send"}
                    </button>
                  </div>
                  {emailError && <div className="email-error">{emailError}</div>}
                </>
              )}
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

      {toast && <Toast {...toast} />}
    </div>
  );
}

export default App;
