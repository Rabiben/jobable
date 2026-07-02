import { useNavigate } from "@/lib/use-navigate";
import { useAuth } from "@/hooks/useAuth";
import { LogIn, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url(/title-bg.jpg)" }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-in">
        <div className="glass-panel-strong p-8 space-y-6">
          <Button
            variant="ghost"
            className="text-white/60 hover:text-white hover:bg-white/10"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="text-center space-y-2">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <LogIn className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
            <p className="text-white/60">Sign in to save progress and compete on leaderboards</p>
          </div>

          <Button
            onClick={login}
            className="w-full game-btn text-lg py-6"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Sign In with Kimi
          </Button>

          <p className="text-center text-white/40 text-sm">
            Your game progress is saved locally. Sign in to sync across devices.
          </p>
        </div>
      </div>
    </div>
  );
}
