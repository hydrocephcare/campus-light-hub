import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const GATE_PASSWORD = "Davis";

/**
 * Discreet footer entry point to the admin area.
 * The gate is a convenience shortcut only — real authorization is enforced
 * by auth + row level security on the admin dashboard itself.
 */
export const FooterAdminAccess = () => {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim() === GATE_PASSWORD) {
      setOpen(false);
      setPassword("");
      navigate("/admin");
    } else {
      toast.error("Incorrect password");
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-background/30 px-2.5 py-1 text-xs font-medium text-background/80 transition-colors hover:border-secondary hover:text-secondary"
        >
          <Lock className="h-3 w-3" /> Admin
        </button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="font-serif">Admin access</DialogTitle>
          <DialogDescription>Enter the access password to continue to the dashboard.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            type="password"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Admin access password"
          />
          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
