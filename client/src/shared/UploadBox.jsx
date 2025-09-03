import React, { useRef, useState } from "react";
import { useApi } from "../api.js";

export default function UploadBox({ onUploaded, parentId }) {
  const api = useApi();
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");

  async function onPickFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setProgress("Uploading file…");
    try {
      await api.upload("/files/upload", file, { folder_id: parentId ?? "" });
      onUploaded?.();
    } catch (err) {
      alert("Upload failed: " + (err?.message || "unknown error"));
    } finally {
      setBusy(false);
      setProgress("");
      e.target.value = "";
    }
  }

  async function onPickFolder(e) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setBusy(true);
    try {
    
      const folderCache = new Map(); 

      
      async function ensureChildFolder(parent, name) {
        const key = `${parent || "root"}/${name}`;
        if (folderCache.has(key)) return folderCache.get(key);

      
        const qs = parent ? `?parent_id=${parent}` : "";
        const { folders } = await api.get(`/folders${qs}`);
        let found = folders.find(f => f.name === name);
        if (!found) {
          const { folder } = await api.post("/folders", { name, parent_id: parent || null });
          found = folder;
        }
        folderCache.set(key, found.id);
        return found.id;
      }

      
      const topName = files[0].webkitRelativePath.split("/")[0];
      const topId = await ensureChildFolder(parentId || null, topName);

      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        setProgress(`Uploading ${i + 1}/${files.length}…`);

        const parts = f.webkitRelativePath.split("/"); 
        const dirParts = parts.slice(1, -1); 

        
        let currentParent = topId;
        for (const seg of dirParts) {
          currentParent = await ensureChildFolder(currentParent, seg);
        }

        await api.upload("/files/upload", f, { folder_id: currentParent || "" });
      }

      onUploaded?.();
    } catch (err) {
      console.error(err);
      alert("Folder upload failed: " + (err?.message || "unknown error"));
    } finally {
      setBusy(false);
      setProgress("");
      e.target.value = "";
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={busy}
        className="border px-4 py-2 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
      >
        {busy && progress ? progress : "Upload File"}
      </button>
      <button
        onClick={() => folderInputRef.current?.click()}
        disabled={busy}
        className="border px-4 py-2 rounded bg-sky-50 text-sky-700 hover:bg-sky-100"
        title="Upload a folder (Chrome/Edge supported)"
      >
        Upload Folder
      </button>

      {/* hidden inputs */}
      <input ref={fileInputRef} type="file" hidden onChange={onPickFile} />
      {/* webkitdirectory works on Chromium-based browsers */}
      <input
        ref={folderInputRef}
        type="file"
        hidden
        webkitdirectory="true"
        directory="true"
        multiple
        onChange={onPickFolder}
      />
    </div>
  );
}
