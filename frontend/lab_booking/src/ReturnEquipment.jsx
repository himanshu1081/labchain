import { useState } from "react";
import { ethers } from "ethers";
import { Link } from "react-router-dom";
import {
    CONTRACT_ADDRESS,
    ABI,
} from "./constants";

function ReturnEquipment() {

    const [bookingId, setBookingId] = useState("");
    const [wallet, setWallet] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const [showModal, setShowModal] = useState(false);

    const [txHash, setTxHash] = useState("");

    const [copied, setCopied] = useState(false);

    async function connectWallet() {

        if (!window.ethereum) {
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

    async function handleReturn() {
        setError("")
        if (!bookingId.trim()) {

            setError("Please enter booking ID");

            return;
        }

        setError("");

        if (!window.ethereum) {
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

            const tx = await contract.returnEquipment(bookingId);

            await tx.wait();

            setTxHash(tx.hash);

            setShowModal(true);

            setBookingId("");

        } catch (error) {

            console.log(error);

            if (error.reason?.includes("Too late")) {

                setError("Booking time is over. Deposit has been forfeited.");

            } else {

                setError("Transaction failed");
            }

        } finally {

            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-[#0b1120] text-white relative">

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">

                    <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">

                        <div className="flex justify-center mb-5">

                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/20 text-green-400 text-3xl">
                                ✓
                            </div>

                        </div>

                        <h2 className="text-3xl font-bold text-center">
                            Equipment Returned
                        </h2>

                        <p className="text-slate-400 text-center mt-3">
                            Your return transaction has been confirmed successfully.
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
                                    className="bg-blue-600 hover:bg-blue-700 transition px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                                >
                                    {copied ? "Copied" : "Copy"}
                                </button>

                            </div>

                        </div>

                        <button
                            onClick={() => setShowModal(false)}
                            className="w-full mt-6 bg-white/10 hover:bg-white/20 transition py-3 rounded-xl font-semibold"
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
                            Return Laboratory Equipment
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

            <main className="max-w-5xl mx-auto px-6 py-20">

                <div className="grid lg:grid-cols-2 gap-12 items-center">

                    <div>

                        <p className="text-blue-400 font-medium mb-4">
                            Blockchain Based Return Management
                        </p>

                        <h2 className="text-5xl leading-tight font-bold mb-6">
                            Return lab equipment securely and receive your deposit instantly.
                        </h2>

                        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
                            Return your booked laboratory equipment through Ethereum smart
                            contracts with transparent refund handling and automated
                            verification.
                        </p>

                        <div className="flex gap-4 mt-10">

                            <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-2xl w-40">

                                <h3 className="text-3xl font-bold">
                                    Instant
                                </h3>

                                <p className="text-slate-400 mt-1 text-sm">
                                    Refund Processing
                                </p>

                            </div>

                            <div className="bg-white/5 border border-white/10 px-6 py-5 rounded-2xl w-40">

                                <h3 className="text-3xl font-bold">
                                    Secure
                                </h3>

                                <p className="text-slate-400 mt-1 text-sm">
                                    Blockchain Verification
                                </p>

                            </div>

                        </div>

                    </div>

                    <div className="bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">

                        <div className="flex items-center justify-between mb-8">

                            <div>

                                <h3 className="text-2xl font-semibold">
                                    Return Equipment
                                </h3>

                                <p className="text-slate-400 mt-1 text-sm">
                                    Submit your booking ID to return equipment
                                </p>

                            </div>

                            <div className="h-3 w-3 rounded-full bg-green-500"></div>

                        </div>

                        <div className="space-y-5">

                            <div>

                                <label className="text-sm text-slate-400 block mb-2">
                                    Booking ID
                                </label>

                                <input
                                    type="number"
                                    placeholder="Enter Booking ID"
                                    value={bookingId}
                                    onChange={(e) => setBookingId(e.target.value)}
                                    className="w-full bg-[#111827] border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-blue-500 transition"
                                />
                            </div>
                            {error && (
                                <p className="text-red-400 text-sm mt-2">
                                    {error}
                                </p>
                            )}
                            <button
                                onClick={handleReturn}
                                disabled={loading}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 transition py-3 rounded-xl font-semibold mt-4"
                            >
                                {loading ? "Processing Return..." : "Return Equipment"}
                            </button>
                            <div className="flex items-center gap-4 my-6">

                                <div className="flex-1 h-px bg-white/10"></div>

                                <p className="text-sm text-slate-400">
                                    or
                                </p>

                                <div className="flex-1 h-px bg-white/10"></div>

                            </div>

                            <Link
                                to="/"
                                className="block text-center border border-white/10 px-5 py-3 rounded-xl hover:bg-white/10 transition font-semibold"
                            >
                                Go To Booking Page
                            </Link>

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

                </div>

            </main>

        </div>
    );
}

export default ReturnEquipment;