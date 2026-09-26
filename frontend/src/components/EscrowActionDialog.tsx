import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type EscrowActionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;

  triggerLabel: string;
  triggerProcessingLabel: string;
  triggerVariant?: "default" | "outline";

  title: string;
  description: string;

  amount?: string;
  symbol?: string;

  confirmLabel: string;
  confirmProcessingLabel: string;

  isProcessing: boolean;
  onConfirm: () => void;
};

function EscrowActionDialog({
  open,
  onOpenChange,
  triggerLabel,
  triggerProcessingLabel,
  triggerVariant = "default",
  title,
  description,
  amount,
  symbol,
  confirmLabel,
  confirmProcessingLabel,
  isProcessing,
  onConfirm,
}: EscrowActionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="flex-1"
          size="lg"
          variant={triggerVariant}
          disabled={isProcessing}
        >
          {isProcessing ? triggerProcessingLabel : triggerLabel}
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>

          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {amount && symbol && (
          <div className="border-y py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Amount</span>

              <span className="font-medium">
                {amount} {symbol}
              </span>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>

          <Button onClick={onConfirm} disabled={isProcessing}>
            {isProcessing ? confirmProcessingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EscrowActionDialog;
