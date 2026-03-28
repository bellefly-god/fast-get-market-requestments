import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

const FooterCta = () => {
  return (
    <section className="px-6 py-16">
      <div className="max-w-md mx-auto text-center">
        <p className="text-lg font-semibold text-foreground mb-2">
          Unlock unlimited plans
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          Get new plans daily, track progress, and access premium exercises
        </p>
        <Button variant="upgrade" size="lg">
          <Crown className="w-4 h-4" />
          Upgrade
        </Button>
      </div>
    </section>
  );
};

export default FooterCta;
