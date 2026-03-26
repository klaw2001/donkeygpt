"use client";

interface CancelConfirmModalProps {
  open: boolean;
  onConfirm: () => void;
  onClose: () => void;
  periodEnd?: string | null;
}

export default function CancelConfirmModal({
  open,
  onConfirm,
  onClose,
  periodEnd,
}: CancelConfirmModalProps) {
  if (!open) return null;

  const formattedDate = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 flex flex-col gap-5">
        {/* Icon */}
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mx-auto">
          <span className="material-symbols-outlined text-3xl text-red-500">
            cancel
          </span>
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-xl font-black text-[#1a1b22] tracking-tight mb-2">
            Cancel your subscription?
          </h2>
          <p className="text-[#4f453c] text-sm leading-relaxed">
            You&apos;ll keep full Pro access until the end of your billing period
            {formattedDate ? (
              <>
                {" "}on{" "}
                <span className="font-semibold text-[#1a1b22]">{formattedDate}</span>
              </>
            ) : null}
            . After that, your account will revert to the Free plan.
          </p>
        </div>

        {/* What you'll lose */}
        <ul className="w-full space-y-2 text-sm text-[#4f453c] bg-[#f4f2fd] rounded-xl px-5 py-4">
          {[
            "Unlimited messages per day",
            "Priority response speed",
            "Early access to new features",
            "Unlimited chat history",
          ].map((feat) => (
            <li key={feat} className="flex items-center gap-2">
              <span className="material-symbols-outlined text-base text-red-400">
                remove_circle
              </span>
              {feat}
            </li>
          ))}
        </ul>

        {/* Actions */}
        <div className="flex flex-col gap-2 pt-1">
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#6b38d4] text-white font-bold rounded-xl hover:opacity-90 transition-all active:scale-95 cursor-pointer"
          >
            Keep my Pro plan
          </button>
          <button
            onClick={onConfirm}
            className="w-full py-3 text-red-500 text-sm font-semibold hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            Yes, cancel subscription
          </button>
        </div>
      </div>
    </div>
  );
}
