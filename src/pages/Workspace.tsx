import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function Workspace() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="font-display text-4xl font-bold mb-4">Workspace</h1>
        <p className="text-muted-foreground mb-8">Coming soon...</p>
        <Button asChild variant="outline">
          <Link to="/" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
