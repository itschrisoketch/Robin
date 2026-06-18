// Shared DOM rendering for popup + content panel. Vanilla, namespaced classes.

function robinEsc(s) {
  return String(s == null ? "" : s).replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

function robinLoading(el) {
  el.innerHTML = `
    <div class="robin-loading">
      <span class="robin-dots"><i></i><i></i><i></i></span>
      <span>Reading the repo&rsquo;s trajectory&hellip;</span>
    </div>
    <div class="robin-skel"></div>
    <div class="robin-skel"></div>
    <div class="robin-skel"></div>`;
}

function robinError(el, msg) {
  el.innerHTML = `<div class="robin-errcard">
    <strong>Robin needs a moment.</strong>
    <p>${robinEsc(msg)}</p>
    <p class="robin-hint">Is the backend running at the configured URL? Check the extension options.</p>
  </div>`;
}

function robinCardHTML(rec, isRedirect) {
  const evidence = (rec.evidence || [])
    .map((e) => `<li><span class="robin-bullet">&bull;</span>${robinEsc(e)}</li>`)
    .join("");
  const reads = (rec.readFirst || [])
    .map(
      (r) =>
        `<li>&#9656; <span class="robin-mono">${robinEsc(r.label)}</span>${
          r.note ? ` <span class="robin-note">&mdash; ${robinEsc(r.note)}</span>` : ""
        }</li>`,
    )
    .join("");
  return `
    <article class="robin-card${isRedirect ? " robin-redirect" : ""}">
      <div class="robin-card-head">
        <span class="robin-rank">${String(rec.rank).padStart(2, "0")}</span>
        <div>
          <div class="robin-repo robin-mono">${robinEsc(rec.repo)}</div>
          <div class="robin-area">${robinEsc(rec.area)}</div>
        </div>
      </div>
      ${rec.signal ? `<span class="robin-signal">${robinEsc(rec.signal)}</span>` : ""}
      <div class="robin-sec"><span class="robin-k">Why now</span><p>${robinEsc(rec.whyNow)}</p></div>
      ${evidence ? `<div class="robin-sec"><span class="robin-k">What Robin read</span><ul class="robin-list">${evidence}</ul></div>` : ""}
      ${reads ? `<div class="robin-sec"><span class="robin-k">Read first</span><ul class="robin-list">${reads}</ul></div>` : ""}
      <div class="robin-sec"><span class="robin-k">Honest fit</span><p>${robinEsc(rec.fit)}</p></div>
    </article>`;
}

function robinResults(el, d) {
  const isRedirect = d.mode === "redirect";
  const intro = (d.intro || [])
    .map((p) => `<p>${robinEsc(p)}</p>`)
    .join("");
  const banner =
    isRedirect && d.verdict
      ? `<div class="robin-banner">
           <div class="robin-banner-kicker">A fork in the trail</div>
           <div class="robin-banner-head">${robinEsc(d.verdict.headline)}</div>
           <p>${robinEsc(d.verdict.sub)}</p>
         </div>`
      : "";
  const cards = (d.recs || []).map((r) => robinCardHTML(r, isRedirect)).join("");
  const sources = (d.sources || [])
    .map((s) => `<li>${robinEsc(s)}</li>`)
    .join("");
  const live = d._source === "model" ? "live model" : "offline fallback";

  el.innerHTML = `
    <div class="robin-meta">
      <span class="robin-fit ${isRedirect ? "robin-fit-redirect" : ""}">fit ${Math.round(
        d.fitScore || 0,
      )}%</span>
      <span class="robin-src">${live}</span>
    </div>
    <div class="robin-voice">${intro}</div>
    ${banner}
    <div class="robin-cards">${cards}</div>
    ${d.closer ? `<p class="robin-closer">${robinEsc(d.closer)}</p>` : ""}
    ${sources ? `<div class="robin-prov"><span class="robin-k">Read to answer</span><ul class="robin-list">${sources}</ul></div>` : ""}`;
}
