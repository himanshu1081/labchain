import { useState } from "react";
import "./App.css";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import {
  CONTRACT_ADDRESS,
  ABI,
  TOKEN_ADDRESS,
  TOKEN_ABI,
} from "./constants";

function App() {
  const [wallet, setWallet] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [duration, setDuration] = useState("");

  const [txHash, setTxHash] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("")

  async function connectWallet() {

    if (!window.ethereum) {
      setError("No wallet found")
      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    setWallet(accounts[0]);
  }

  async function copyTxHash() {
    try {
      await navigator.clipboard.writeText(txHash);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);

    } catch (err) {
      console.log(err);
    }
  }

  async function handleBooking() {
    if (!window.ethereum) {
      setError("Wallet not connected")
      return;
    }

    try {
      setLoading(true);

      const provider = new ethers.BrowserProvider(window.ethereum);

      const signer = await provider.getSigner();

      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        ABI,
        signer
      );

      const tokenContract = new ethers.Contract(
        TOKEN_ADDRESS,
        TOKEN_ABI,
        signer
      );

      const approveTx = await tokenContract.approve(
        CONTRACT_ADDRESS,
        ethers.parseUnits("50", 18)
      );

      await approveTx.wait();

      const tx = await contract.bookEquipment(
        equipmentId,
        duration,
        ethers.parseUnits("50", 18)
      );

      await tx.wait();

      setTxHash(tx.hash);

      setShowModal(true);

      setEquipmentId("");
      setDuration("");

    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-white relative">

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl flex flex-col items-center justify-center gap-4">

            <div className="flex justify-center mb-5">

              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-3xl">
                ✓
              </div>

            </div>

            <h2 className="text-3xl font-bold text-center">
              Booking Successful
            </h2>

            <p className="text-slate-400 text-center mt-3">
              Your transaction has been confirmed on blockchain.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-black/30 p-4">

              <p className="text-xs text-slate-400 mb-2">
                Transaction Hash
              </p>

              <div className="flex gap-3 items-start">

                <p className="text-sm text-slate-200 break-all flex-1">
                  {txHash}
                </p>

                <button
                  onClick={copyTxHash}
                  className="bg-blue-600 cursor-pointer hover:bg-blue-700 transition px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                >
                  {copied ? "Copied" : "Copy"}
                </button>

              </div>


            </div>

            <div>
              <a className="p-2 px-4 bg-blue-600 rounded-lg" target="_blank" href={`https://sepolia.etherscan.io/tx/${txHash}`}>
                Show Transaction
              </a>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="w-full mt-6 bg-white/10 cursor-pointer hover:bg-white/20 transition py-3 rounded-xl font-semibold"
            >
              Close
            </button>

          </div>

        </div>
      )}

      <nav className="border-b border-white/10 backdrop-blur-md">

        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">

          <div>

            <h1 className="text-2xl font-semibold tracking-tight">
              LabChain
            </h1>

            <p className="text-sm text-slate-400">
              Smart Equipment Booking
            </p>

          </div>

          <button
            onClick={connectWallet}
            className="bg-white text-black px-5 py-2 rounded-xl font-medium hover:opacity-90 transition"
          >
            {wallet ? "Wallet Connected" : "Connect Wallet"}
          </button>

        </div>

      </nav>

      <main className="max-w-7xl mx-auto px-6 py-16 grid lg:grid-cols-2 gap-12 items-center">

        <div>

          <p className="text-blue-400 font-medium mb-4">
            Blockchain Powered Laboratory Management
          </p>

          <h2 className="text-5xl leading-tight font-bold mb-6">
            Secure booking and automated deposit handling for lab equipment.
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
            LabChain uses Ethereum smart contracts to manage bookings,
            security deposits, refunds, and penalties transparently without
            relying on manual administration.
          </p>

          <div className="flex gap-4 mt-10">

            <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-2xl w-40">

              <h3 className="text-3xl font-bold">
                24/7
              </h3>

              <p className="text-slate-400 mt-1 text-sm">
                Automated Smart Contract Execution
              </p>

            </div>

            <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-2xl w-40">

              <h3 className="text-3xl font-bold">
                100%
              </h3>

              <p className="text-slate-400 mt-1 text-sm">
                Transparent Transactions
              </p>

            </div>

          </div>

        </div>

        <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

          <div className="flex items-center justify-between mb-8">

            <div>

              <h3 className="text-2xl font-semibold">
                Book Equipment
              </h3>

              <p className="text-slate-400 mt-1 text-sm">
                Create a new lab equipment reservation
              </p>

            </div>

            <div className="h-3 w-3 rounded-full bg-green-500"></div>

          </div>

          <div className="space-y-5">

            <div>

              <div>

                <label className="text-sm text-slate-400 block mb-2">
                  Select Equipment
                </label>

                <select
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                >

                  <option value="">
                    Choose Equipment
                  </option>

                  <option value="MIC-204">
                    Microscope - MIC-204
                  </option>

                  <option value="OSC-102">
                    Oscilloscope - OSC-102
                  </option>

                  <option value="CMP-301">
                    Computer System - CMP-301
                  </option>

                  <option value="ROB-510">
                    Robotics Kit - ROB-510
                  </option>

                  <option value="PRN-110">
                    3D Printer - PRN-110
                  </option>

                </select>

              </div>

            </div>

            <div>

              <label className="text-sm text-slate-400 block mb-2">
                Duration (in hours)
              </label>

              <input
                type="number"
                placeholder="4"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
              />

            </div>

            <div>

              <label className="text-sm text-slate-400 block mb-2">
                Security Deposit
              </label>

              <input
                type="text"
                value="50 LAB Tokens"
                disabled
                className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 text-slate-400"
              />

            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition py-3 rounded-xl font-semibold mt-4 cursor-pointer"
              >
                {loading ? "Processing Transaction..." : "Confirm Booking"}
              </button>
              {error && (
                <p className="text-red-400 text-sm mt-2">
                  {error}
                </p>
              )}
              <div className="flex items-center gap-4 my-6">

                <div className="flex-1 h-px bg-white/10"></div>

                <p className="text-sm text-slate-400">
                  or
                </p>

                <div className="flex-1 h-px bg-white/10"></div>

              </div>
              <Link
                to="/return"
                className="border border-white/10 px-5 py-2 rounded-xl hover:bg-white/10 transition"
              >
                Return Equipment
              </Link>
            </div>

          </div>

          {wallet && (
            <div className="mt-6 bg-black/20 border border-white/10 rounded-xl p-4">

              <p className="text-xs text-slate-400 mb-1">
                Connected Wallet
              </p>

              <p className="text-sm break-all">
                {wallet}
              </p>

            </div>
          )}

        </div>

      </main>

    </div>
  );
}

export default App;