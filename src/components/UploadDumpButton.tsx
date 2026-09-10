import { useRef, useState, type ChangeEvent } from "react";
import { Upload } from "lucide-react";
import en from "../i18n/en";
import { parseDump } from "../storage/dump";
import type { StorageDocument } from "../storage/schema";

type Props = {
  onRestore: (doc: StorageDocument) => void;
  disabled?: boolean;
};

const MAX_DUMP_BYTES = 5_000_000;

const UploadDumpButton = ({ onRestore, disabled = false }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadClick = () => {
    if (busy || disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (busy || disabled) return;
    setBusy(true);
    setError(null);
    try {
      if (file.size > MAX_DUMP_BYTES) {
        setError(en.settings.restoreError);
        return;
      }
      const result = parseDump(await file.text());
      if (!result.ok) {
        setError(en.settings.restoreError);
        return;
      }
      if (!window.confirm(en.settings.restoreConfirm)) return;
      onRestore(result.doc);
    } catch {
      setError(en.settings.restoreError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json,text/plain"
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleUploadClick}
        disabled={busy || disabled}
        aria-label={en.settings.uploadAria}
        className="w-full rounded-xl border border-border py-4 text-sm font-semibold min-h-11 flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Upload size={18} aria-hidden />
        {en.settings.upload}
      </button>
      {error && (
        <p className="text-red-500 text-xs mt-2 font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default UploadDumpButton;
