document.getElementById("pasteBtn").addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById("reelUrl").value = text;
  } catch {
    alert("Clipboard access denied. Paste manually.");
  }
});

document.getElementById("downloadBtn").addEventListener("click", async () => {
  const reelUrl = document.getElementById("reelUrl").value.trim();
  if (!reelUrl) return alert("Paste a reel link first!");

  const btn = document.getElementById("downloadBtn");
  btn.textContent = "Fetching...";
  btn.disabled = true;

  const res = await fetch("/api/download", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ reelUrl }),
  });

  const data = await res.json();
  btn.textContent = "⬇ Fetch Reel";
  btn.disabled = false;

  if (data.success) {
    const link = /download/${data.fileName};
    const resultDiv = document.getElementById("result");
    const preview = document.getElementById("preview");
    const downloadLink = document.getElementById("downloadLink");

    preview.src = link;
    downloadLink.href = link;
    resultDiv.style.display = "block";
  } else {
    alert("Download failed, please check the link or try again.");
  }
});
