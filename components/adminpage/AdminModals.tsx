"use client";

import React, { useState } from "react";
import { X, Check, Wallet, Send, ArrowDown, CreditCard, Download } from "lucide-react";
import { PaymentHistoryItem } from "./AdminHistoryTable";

interface AdminModalsProps {
  activeModal: "add_wallet" | "send_money" | "receive_money" | "transaction_detail" | "recipients_list" | null;
  onClose: () => void;
  selectedTransaction?: PaymentHistoryItem | null;
}

export default function AdminModals({
  activeModal,
  onClose,
  selectedTransaction,
}: AdminModalsProps) {
  const [walletName, setWalletName] = useState("");
  const [targetGoal, setTargetGoal] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!activeModal) return null;

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Wallet "${walletName || "New Goal"}" created successfully!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1500);
  };

  const handleSendMoney = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(`Successfully sent ${amount} ${currency} to ${recipient}!`);
    setTimeout(() => {
      setSuccessMsg("");
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4 font-sans animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-8 max-w-md w-full relative">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-5 top-5 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-slate-500 hover:bg-gray-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal 1: Add New Wallet */}
        {activeModal === "add_wallet" && (
          <form onSubmit={handleCreateWallet} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Add New Wallet</h3>
                <p className="text-xs text-slate-400">Configure a new financial goal or balance card</p>
              </div>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMsg}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Wallet / Goal Title</label>
                  <input
                    type="text"
                    required
                    value={walletName}
                    onChange={(e) => setWalletName(e.target.value)}
                    placeholder="e.g. Premium Membership Revenue"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Goal Amount</label>
                    <input
                      type="text"
                      required
                      value={targetGoal}
                      onChange={(e) => setTargetGoal(e.target.value)}
                      placeholder="e.g. $100,000"
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Currency</label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#00875A] hover:bg-[#00754e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#00875A]/20 mt-2"
                >
                  Create Wallet
                </button>
              </>
            )}
          </form>
        )}

        {/* Modal 2: Send Money */}
        {activeModal === "send_money" && (
          <form onSubmit={handleSendMoney} className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#00875A]/10 text-[#00875A] flex items-center justify-center">
                <Send className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Send Payout</h3>
                <p className="text-xs text-slate-400">Transfer funds to a vendor or member refund</p>
              </div>
            </div>

            {successMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4" /> {successMsg}
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Recipient ID / Email</label>
                  <input
                    type="text"
                    required
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. sujon@example.com or USR-9021"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Amount ($ USD)</label>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="e.g. 500.00"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Note (Optional)</label>
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="e.g. Verification fee refund"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-semibold focus:bg-white focus:border-[#00875A] outline-hidden"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-[#00875A] hover:bg-[#00754e] text-white text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#00875A]/20 mt-2"
                >
                  Send Transfer Now
                </button>
              </>
            )}
          </form>
        )}

        {/* Modal 3: Receive Funds */}
        {activeModal === "receive_money" && (
          <div className="text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#00875A]/10 text-[#00875A] flex items-center justify-center mx-auto mb-2">
              <ArrowDown className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Receive Admin Funds</h3>
            <p className="text-xs text-slate-400">Share your admin deposit address or QR code</p>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center justify-center">
              <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-xs border border-gray-200 flex items-center justify-center font-mono text-[10px] text-slate-400">
                [QR CODE PLACEHOLDER]
              </div>
              <p className="text-xs font-bold text-slate-800 mt-3 font-mono">QUIX-ADMIN-9090-9921</p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}

        {/* Modal 4: Transaction Detail */}
        {activeModal === "transaction_detail" && selectedTransaction && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center text-sm ${selectedTransaction.logoBg}`}>
                {selectedTransaction.logoText}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900">{selectedTransaction.name}</h3>
                <p className="text-xs text-slate-400">{selectedTransaction.date} at {selectedTransaction.time}</p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Status</span>
                <span className="font-bold text-[#00875A]">● {selectedTransaction.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Total Amount</span>
                <span className="font-extrabold text-slate-900">{selectedTransaction.amount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 font-medium">Transaction ID</span>
                <span className="font-mono text-slate-700">TXN-{selectedTransaction.id}90281</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => alert("Receipt downloaded.")}
              className="w-full py-3 rounded-2xl bg-[#00875A] text-white text-xs font-bold flex items-center justify-center gap-2 hover:bg-[#00754e] transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" /> Download PDF Receipt
            </button>
          </div>
        )}

        {/* Modal 5: Recipients List */}
        {activeModal === "recipients_list" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 text-slate-700 flex items-center justify-center">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-800">Mandatory Payment Recipients</h3>
                <p className="text-xs text-slate-400">Active payout targets & recurring list</p>
              </div>
            </div>

            <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
              {[
                { name: "Sujon Ahmed", role: "Super Admin", amount: "$3,450.00" },
                { name: "Priya Sharma", role: "Verification Auditor", amount: "$1,200.00" },
                { name: "Rahul Verma", role: "Support Lead", amount: "$980.00" },
                { name: "Ananya Roy", role: "Moderator", amount: "$750.00" },
              ].map((rec, i) => (
                <div key={i} className="py-2.5 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#00875A]/10 text-[#00875A] font-bold text-xs flex items-center justify-center">
                      {rec.name[0]}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">{rec.name}</p>
                      <p className="text-[10px] text-slate-400">{rec.role}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">{rec.amount}</span>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
