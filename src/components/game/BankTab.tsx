import { useState } from "react";
import { useGame } from "@/game/GameProvider";
import { Landmark, FileText, AlertCircle, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

export default function BankTab() {
  const { state, applyLoan, getLoanOptions, makePayment } = useGame();
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null);
  const [loanAmount, setLoanAmount] = useState(10000);
  const [signed, setSigned] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(0);

  const loanOptions = getLoanOptions();
  const activeLoans = state.loans.filter((l) => !l.isPaidOff);

  const selectedOption = loanOptions.find((o) => o.type === selectedLoan);

  const handleApply = () => {
    if (selectedLoan && signed) {
      applyLoan(selectedLoan, loanAmount);
      setSelectedLoan(null);
      setSigned(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="relative h-40 rounded-xl overflow-hidden">
        <img src="/bank-interior.jpg" alt="Bank" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a] to-transparent" />
        <div className="absolute bottom-4 left-4">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Landmark className="w-6 h-6 text-amber-400" />
            Casablanca Central Bank
          </h2>
          <p className="text-white/60 text-sm">Apply for loans and manage your debt</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Loan Application */}
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-400" />
              Loan Application
            </h3>

            {!state.loanApproved && (
              <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-amber-400 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  You need a loan to start trading. Choose wisely!
                </p>
              </div>
            )}

            {/* Loan Types */}
            <div className="space-y-3 mb-4">
              {loanOptions.map((option) => (
                <button
                  key={option.type}
                  onClick={() => { setSelectedLoan(option.type); setSigned(false); }}
                  className={`w-full p-4 rounded-lg border transition-all text-left ${
                    selectedLoan === option.type
                      ? "border-amber-500/50 bg-amber-500/10"
                      : "border-white/10 bg-white/5 hover:bg-white/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{option.name}</p>
                      <p className="text-white/50 text-xs mt-1">{option.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-400 font-mono font-bold">{(option.interestRate * 100).toFixed(0)}%</p>
                      <p className="text-white/40 text-xs">interest</p>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-2 text-xs text-white/40">
                    <span>Max: {option.maxAmount.toLocaleString()} MAD</span>
                    <span>{option.months} months</span>
                    <span>Penalty: {(option.penaltyRate * 100).toFixed(0)}%</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Amount Slider */}
            {selectedOption && (
              <div className="space-y-3 mb-4 animate-fade-in">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Loan Amount</span>
                  <span className="text-amber-400 font-mono font-bold">{loanAmount.toLocaleString()} MAD</span>
                </div>
                <Slider
                  value={[loanAmount]}
                  onValueChange={(v) => setLoanAmount(v[0])}
                  min={1000}
                  max={selectedOption.maxAmount}
                  step={1000}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-white/30">
                  <span>1,000 MAD</span>
                  <span>{selectedOption.maxAmount.toLocaleString()} MAD</span>
                </div>

                {/* Loan Summary */}
                <div className="glass-panel p-3 space-y-2">
                  <p className="text-white/60 text-xs font-semibold">Loan Summary</p>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Principal</span>
                    <span className="text-white font-mono">{loanAmount.toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Interest</span>
                    <span className="text-amber-400 font-mono">{Math.round(loanAmount * selectedOption.interestRate).toLocaleString()} MAD</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/50">Monthly Payment</span>
                    <span className="text-emerald-400 font-mono">
                      {Math.round((loanAmount + loanAmount * selectedOption.interestRate) / selectedOption.months).toLocaleString()} MAD
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                    <span className="text-white/50">Total Repayment</span>
                    <span className="text-white font-mono font-bold">
                      {Math.round(loanAmount + loanAmount * selectedOption.interestRate).toLocaleString()} MAD
                    </span>
                  </div>
                </div>

                {/* Contract Signing */}
                <label className="flex items-center gap-3 p-3 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    signed ? "bg-emerald-500 border-emerald-500" : "border-white/30"
                  }`}>
                    {signed && <Check className="w-3 h-3 text-white" />}
                  </div>
                  <span className="text-white/60 text-sm">
                    I agree to the loan terms and understand the consequences of default
                  </span>
                  <input
                    type="checkbox"
                    checked={signed}
                    onChange={(e) => setSigned(e.target.checked)}
                    className="sr-only"
                  />
                </label>

                <Button
                  onClick={handleApply}
                  disabled={!signed}
                  className="w-full game-btn-gold"
                >
                  <ArrowRight className="w-4 h-4 mr-2" />
                  Sign Contract & Receive Funds
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Active Loans */}
        <div className="space-y-4">
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-4">Your Loans</h3>
            {activeLoans.length === 0 ? (
              <div className="text-center py-8 text-white/40">
                <Landmark className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No active loans</p>
                <p className="text-sm mt-1">Apply for a loan to start your journey</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeLoans.map((loan) => (
                  <div key={loan.id} className="glass-panel p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white font-semibold capitalize">{loan.type.replace("_", " ")} Loan</p>
                        <p className="text-white/40 text-xs">Original: {loan.amount.toLocaleString()} MAD</p>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 font-mono font-bold">{loan.remainingBalance.toLocaleString()} MAD</p>
                        <p className="text-white/40 text-xs">remaining</p>
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-white/50">Progress</span>
                        <span className="text-emerald-400">
                          {Math.round(((loan.totalMonths - loan.monthsRemaining) / loan.totalMonths) * 100)}%
                        </span>
                      </div>
                      <Progress
                        value={((loan.totalMonths - loan.monthsRemaining) / loan.totalMonths) * 100}
                        className="h-2"
                      />
                    </div>

                    <div className="flex gap-4 text-xs text-white/40">
                      <span>Monthly: {loan.monthlyPayment.toLocaleString()} MAD</span>
                      <span>{loan.monthsRemaining} months left</span>
                    </div>

                    {loan.isDefaulted && (
                      <div className="p-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                        <p className="text-red-400 text-xs flex items-center gap-2">
                          <AlertCircle className="w-3 h-3" />
                          DEFAULTED - Stocks may be confiscated!
                        </p>
                      </div>
                    )}

                    {/* Extra Payment */}
                    <div className="pt-2 border-t border-white/10">
                      <div className="flex gap-2">
                        <input
                          type="number"
                          placeholder="Extra payment"
                          value={paymentAmount || ""}
                          onChange={(e) => setPaymentAmount(Number(e.target.value))}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder:text-white/30"
                        />
                        <Button
                          onClick={() => {
                            if (paymentAmount > 0 && state.cash >= paymentAmount) {
                              makePayment(loan.id, paymentAmount);
                              setPaymentAmount(0);
                            }
                          }}
                          disabled={paymentAmount <= 0 || state.cash < paymentAmount}
                          className="game-btn text-sm"
                        >
                          Pay
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credit Score Info */}
          <div className="glass-panel p-4">
            <h3 className="text-white font-semibold mb-3">Credit Score</h3>
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold ${
                state.creditScore > 600 ? "bg-emerald-500/20 text-emerald-400" :
                state.creditScore > 400 ? "bg-amber-500/20 text-amber-400" :
                "bg-red-500/20 text-red-400"
              }`}>
                {state.creditScore}
              </div>
              <div className="flex-1">
                <Progress value={(state.creditScore / 850) * 100} className="h-3" />
                <div className="flex justify-between mt-1">
                  <span className="text-white/30 text-[10px]">Poor</span>
                  <span className="text-white/30 text-[10px]">Excellent</span>
                </div>
              </div>
            </div>
            <div className="mt-3 space-y-1 text-xs text-white/50">
              <p>Higher credit score unlocks better loans</p>
              <p>Pay on time: +5 points</p>
              <p>Default: -50 points</p>
              <p>Get loan approved: +10 points</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
