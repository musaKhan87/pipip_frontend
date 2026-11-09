import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog";
import { Button } from "./button";
import { Badge } from "./badge";
import {
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Info,
  Loader2,
} from "lucide-react";

export default function ConfirmationDialog({
  open,
  onOpenChange,
  title = "Confirm Action",
  description,
  type = "warning", // "danger" | "warning" | "info" | "success"
  icon: CustomIcon,
  details = [], // Array of { label, value, badge, icon: IconComponent }
  confirmText = "Confirm & Proceed",
  cancelText = "Cancel",
  onConfirm,
  isLoading = false,
}) {
  const getIcon = () => {
    if (CustomIcon) return <CustomIcon className="w-6 h-6" />;
    switch (type) {
      case "danger":
        return <ShieldAlert className="w-6 h-6 text-destructive" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      case "info":
      default:
        return <ShieldCheck className="w-6 h-6 text-primary" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case "danger":
        return "border-destructive/40";
      case "warning":
        return "border-amber-500/40";
      case "success":
        return "border-green-500/40";
      case "info":
      default:
        return "border-primary/40";
    }
  };

  const getBadgeBg = () => {
    switch (type) {
      case "danger":
        return "bg-destructive/15 text-destructive border-destructive/30";
      case "warning":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30";
      case "success":
        return "bg-green-500/15 text-green-400 border-green-500/30";
      case "info":
      default:
        return "bg-primary/15 text-primary border-primary/30";
    }
  };

  const getConfirmButtonClasses = () => {
    switch (type) {
      case "danger":
        return "bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-lg shadow-destructive/20";
      case "warning":
        return "bg-amber-500 hover:bg-amber-600 text-black font-semibold shadow-lg shadow-amber-500/20";
      case "success":
        return "bg-green-600 hover:bg-green-700 text-white font-semibold";
      case "info":
      default:
        return "bg-primary hover:bg-primary/90 text-primary-foreground";
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !isLoading && onOpenChange?.(val)}>
      <DialogContent className={`max-w-md bg-card/95 backdrop-blur-xl border ${getBorderColor()} shadow-2xl p-6 sm:rounded-2xl`}>
        <DialogHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${getBadgeBg()}`}>
              {getIcon()}
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-foreground">
                {title}
              </DialogTitle>
              {type === "danger" && (
                <Badge variant="outline" className="mt-1 text-[10px] bg-destructive/10 text-destructive border-destructive/30">
                  Critical Action
                </Badge>
              )}
            </div>
          </div>

          {description && (
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>

        {/* Detailed Info Card */}
        {details && details.length > 0 && (
          <div className="my-2 p-3.5 rounded-xl bg-muted/50 border border-border/70 space-y-2.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Action Summary & Details
            </p>
            <div className="space-y-2">
              {details.map((item, idx) => {
                const ItemIcon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0"
                  >
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                      {ItemIcon && <ItemIcon className="w-3.5 h-3.5 text-muted-foreground/80" />}
                      <span>{item.label}:</span>
                    </div>
                    <div className="flex items-center gap-1.5 font-medium text-foreground truncate max-w-[220px]">
                      <span className="truncate">{item.value}</span>
                      {item.badge && (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <DialogFooter className="mt-4 flex sm:justify-end gap-2 pt-2 border-t border-border/40">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange?.(false)}
            disabled={isLoading}
            className="text-xs h-9 px-4"
          >
            {cancelText}
          </Button>

          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs h-9 px-4 ${getConfirmButtonClasses()}`}
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

