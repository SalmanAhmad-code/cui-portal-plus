/* Reversible local presentation. Never submits forms, uploads files or changes academic records. */
(() => {
  let preferences = PortalSettings.normalize(null),
    undo = [],
    mounted = null,
    pending = false;
  const mark = (node, name) => {
    if (!node.classList.contains(name)) {
      node.classList.add(name);
      undo.push(() => node.classList.remove(name));
    }
  };
  const own = (node, parent, before = null) => {
    parent.insertBefore(node, before);
    undo.push(() => node.remove());
    return node;
  };
  function move(node, parent) {
    const marker = document.createComment("CUI original");
    node.before(marker);
    parent.append(node);
    undo.push(() => {
      if (marker.parentNode) marker.replaceWith(node);
    });
  }
  function wrap(node, name) {
    const box = document.createElement("div");
    box.className = name;
    const marker = document.createComment("CUI original");
    node.before(marker, box);
    box.append(node);
    undo.push(() => {
      if (marker.parentNode) marker.replaceWith(node);
      box.remove();
    });
    return box;
  }
  const text = (node) => (node.textContent || "").replace(/\s+/g, " ").trim();
  const el = (tag, name, value) => {
    const node = document.createElement(tag);
    if (name) node.className = name;
    if (value) node.textContent = value;
    return node;
  };
  const encoder = new TextEncoder();
  let crcTable = null;
  const bytes = (value) =>
    value instanceof Uint8Array ? value : new Uint8Array(value);
  const write16 = (view, offset, value) =>
    view.setUint16(offset, value & 0xffff, true);
  const write32 = (view, offset, value) =>
    view.setUint32(offset, value >>> 0, true);
  const crc32 = (value) => {
    if (!crcTable) {
      crcTable = new Uint32Array(256);
      for (let i = 0; i < 256; i++) {
        let code = i;
        for (let bit = 0; bit < 8; bit++)
          code = code & 1 ? 0xedb88320 ^ (code >>> 1) : code >>> 1;
        crcTable[i] = code >>> 0;
      }
    }
    let crc = 0xffffffff;
    for (const byte of value) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  };
  const dosTime = (date) =>
    ((date.getHours() & 0x1f) << 11) |
    ((date.getMinutes() & 0x3f) << 5) |
    ((Math.floor(date.getSeconds() / 2) & 0x1f) >>> 0);
  const dosDate = (date) =>
    (((Math.max(1980, date.getFullYear()) - 1980) & 0x7f) << 9) |
    (((date.getMonth() + 1) & 0x0f) << 5) |
    (date.getDate() & 0x1f);
  const zipStore = (entries) => {
    const local = [];
    const central = [];
    let offset = 0;
    for (const entry of entries) {
      const name = encoder.encode(entry.name);
      const data = bytes(entry.data);
      const localHeader = new ArrayBuffer(30);
      const localView = new DataView(localHeader);
      write32(localView, 0, 0x04034b50);
      write16(localView, 4, 20);
      write16(localView, 6, 0);
      write16(localView, 8, 0);
      write16(localView, 10, dosTime(entry.date));
      write16(localView, 12, dosDate(entry.date));
      write32(localView, 14, entry.crc);
      write32(localView, 18, data.byteLength);
      write32(localView, 22, data.byteLength);
      write16(localView, 26, name.byteLength);
      write16(localView, 28, 0);
      local.push(localHeader, name, data);
      const centralHeader = new ArrayBuffer(46);
      const centralView = new DataView(centralHeader);
      write32(centralView, 0, 0x02014b50);
      write16(centralView, 4, 20);
      write16(centralView, 6, 20);
      write16(centralView, 8, 0);
      write16(centralView, 10, 0);
      write16(centralView, 12, dosTime(entry.date));
      write16(centralView, 14, dosDate(entry.date));
      write32(centralView, 16, entry.crc);
      write32(centralView, 20, data.byteLength);
      write32(centralView, 24, data.byteLength);
      write16(centralView, 28, name.byteLength);
      write16(centralView, 30, 0);
      write16(centralView, 32, 0);
      write16(centralView, 34, 0);
      write16(centralView, 36, 0);
      write32(centralView, 38, 0);
      write32(centralView, 42, offset);
      central.push(centralHeader, name);
      offset += 30 + name.byteLength + data.byteLength;
    }
    const centralOffset = offset;
    const centralSize = central.reduce(
      (size, part) => size + bytes(part).byteLength,
      0,
    );
    const end = new ArrayBuffer(22);
    const endView = new DataView(end);
    write32(endView, 0, 0x06054b50);
    write16(endView, 4, 0);
    write16(endView, 6, 0);
    write16(endView, 8, entries.length);
    write16(endView, 10, entries.length);
    write32(endView, 12, centralSize);
    write32(endView, 16, centralOffset);
    write16(endView, 20, 0);
    return new Blob([...local, ...central, end], { type: "application/zip" });
  };
  function destroy() {
    for (const action of undo.reverse()) action();
    undo = [];
    mounted = null;
  }
  function ecard(main) {
    if (!/studentecard\.aspx$/i.test(location.pathname)) return;

    const actions = [
      ...main.querySelectorAll(
        'a, button, input[type="button"], input[type="submit"]',
      ),
    ].filter((action) => {
      const label = (action.value || action.textContent || "")
        .replace(/\s+/g, " ")
        .trim();

      return /^(Print E-Card|Download as PDF)$/i.test(label);
    });

    const candidates = [
      ...main.querySelectorAll("div,section,article,table"),
    ].filter(
      (node) =>
        /student\s*card/i.test(text(node)) &&
        node.querySelectorAll("img,canvas").length >= 2 &&
        !node.closest(".cp-profile-card") &&
        !actions.some((action) => node.contains(action)),
    );

    const cards = candidates.filter(
      (node) =>
        !candidates.some((other) => other !== node && node.contains(other)),
    );

    for (const card of cards) {
      mark(card, "cp-original-ecard");
    }

    for (const action of actions) {
      mark(action, "button");
    }
  }
  function grids(main) {
    for (const table of main.querySelectorAll("table")) {
      if (
        table.closest(
          ".cp-original-ecard,.cp-profile-card,.cp-customizer-host",
        ) ||
        table.parentElement.closest("table")
      )
        continue;
      const rows = [...table.rows];
      const heading = rows.find(
        (row) =>
          row.cells.length >= 3 &&
          /course|serial|daytitle|faculty|obtained|venue|credit|project\s*title/i.test(
            text(row),
          ),
      );
      if (!heading && !table.matches("table.Grid,table.grid-table")) continue;
      if (table.classList.contains("cp-data-grid")) continue;
      mark(table, "cp-data-grid");
      for (const row of rows) {
        if (row === heading) mark(row, "cp-grid-head");
        if (row.cells.length === 1 && row.cells[0].colSpan > 1)
          mark(row, "cp-grid-section");
      }
      if (/qamarks|quiz|assignmentmarks/i.test(location.pathname)) {
        for (const nested of table.querySelectorAll("table")) {
          const cells = [...nested.querySelectorAll("td")];
          const fills = cells.filter((cell) => {
            const color = (
              cell.getAttribute("bgcolor") ||
              cell.style.backgroundColor ||
              ""
            )
              .toLowerCase()
              .replace(/\s/g, "");
            return (
              color &&
              ![
                "black",
                "#000",
                "#000000",
                "transparent",
                "rgb(0,0,0)",
              ].includes(color)
            );
          });
          if (fills.length) {
            mark(nested, "cp-score-track");
            for (const cell of fills) mark(cell, "cp-score-fill");
          }
        }
      }
      if (!table.parentElement.classList.contains("cp-table-scroll")) {
        const box = wrap(table, "cp-table-scroll");
        box.tabIndex = 0;
        box.setAttribute("role", "region");
        box.setAttribute("aria-label", "Scrollable data table");
      }
    }
  }
  function files(main) {
    for (const input of main.querySelectorAll("input[type=file]")) {
      if (input.closest(".cp-file-drop,.cp-original-ecard")) continue;
      const uploadTable = input.closest("table");
      if (uploadTable) mark(uploadTable, "cp-upload-table");
      const zone = wrap(input, "cp-file-drop");
      const title = own(
        el("strong", null, "Drop your assignment file here"),
        zone,
        input,
      );
      own(
        el(
          "p",
          null,
          "or use the original file chooser below. Review your selection, then use Upload File.",
        ),
        zone,
        input,
      );
      const output = own(el("div", "cp-file-preview"), zone);
      output.setAttribute("role", "status");
      output.setAttribute("aria-live", "polite");
      let urls = [];
      function preview() {
        for (const url of urls) URL.revokeObjectURL(url);
        urls = [];
        output.replaceChildren();
        const selected = [...input.files];
        if (!selected.length) {
          output.textContent = "No file selected";
          return;
        }
        for (const file of selected) {
          const card = el("div", "cp-file-item");
          card.append(
            el("strong", null, file.name),
            el(
              "span",
              null,
              `${(file.size / 1048576).toFixed(2)} MB · ${file.type || "File"}`,
            ),
          );
          if (file.type === "application/pdf") {
            const url = URL.createObjectURL(file);
            urls.push(url);
            const link = el("a", null, "Open PDF preview ↗");
            link.href = url;
            link.target = "_blank";
            link.rel = "noopener noreferrer";
            card.append(link);
          }
          if (
            ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
              file.type,
            )
          ) {
            const url = URL.createObjectURL(file);
            urls.push(url);
            const image = el("img");
            image.src = url;
            image.alt = "Selected file preview";
            card.append(image);
          }
          output.append(card);
        }
      }
      function drag(event) {
        event.preventDefault();
        zone.classList.add("cp-dragging");
      }
      function leave(event) {
        if (!zone.contains(event.relatedTarget))
          zone.classList.remove("cp-dragging");
      }
      function drop(event) {
        event.preventDefault();
        event.stopPropagation();
        zone.classList.remove("cp-dragging");
        const selected = event.dataTransfer?.files;
        if (!selected?.length) return;
        if (!input.multiple && selected.length !== 1) {
          output.textContent = "Choose one file for this assignment.";
          return;
        }
        // Native FileList is retained, including the input's ID/name and server handler.
        const accept = (input.accept || "")
          .toLowerCase()
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        if (
          accept.length &&
          [...selected].some(
            (file) =>
              !accept.some((rule) =>
                rule.startsWith(".")
                  ? file.name.toLowerCase().endsWith(rule)
                  : rule.endsWith("/*")
                    ? file.type.startsWith(rule.slice(0, -1))
                    : file.type === rule,
              ),
          )
        ) {
          output.textContent =
            "This file type is not accepted by the original upload field.";
          return;
        }
        const transfer = new DataTransfer();
        for (const file of selected) transfer.items.add(file);
        input.files = transfer.files;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
      input.addEventListener("change", preview);
      zone.addEventListener("dragover", drag);
      zone.addEventListener("dragenter", drag);
      zone.addEventListener("dragleave", leave);
      zone.addEventListener("drop", drop);
      preview();
      undo.push(() => {
        for (const url of urls) URL.revokeObjectURL(url);
        input.removeEventListener("change", preview);
        zone.removeEventListener("dragover", drag);
        zone.removeEventListener("dragenter", drag);
        zone.removeEventListener("dragleave", leave);
        zone.removeEventListener("drop", drop);
      });
    }
  }
  function courseContents(main) {
    if (!/courseportalcontentssummary\.aspx$/i.test(location.pathname)) return;
    if (main.querySelector(".cp-bulk-toolbar")) return;
    const sanitize = (name) =>
      (name || "")
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, " ")
        .replace(/\s+/g, " ")
        .replace(/\.+$/g, "")
        .trim() || "content";
    const extension = (response, fallback) => {
      const fromName = (name) => {
        const match = /\.([a-z0-9]{1,12})$/i.exec(name || "");
        return match ? "." + match[1].toLowerCase() : "";
      };
      const disposition =
        response.headers.get("content-disposition") ||
        response.headers.get("Content-Disposition") ||
        "";
      const starred = /filename\*=UTF-8''([^;]+)/i.exec(disposition);
      const quoted = /filename="([^"]+)"/i.exec(disposition);
      const plain = /filename=([^;]+)/i.exec(disposition);
      const hintSource = starred?.[1] || quoted?.[1] || plain?.[1] || "";
      let hinted = hintSource;
      try {
        hinted = decodeURIComponent(hintSource);
      } catch {}
      const fromHint = fromName(hinted);
      if (fromHint) return fromHint;
      const type = (response.headers.get("content-type") || "")
        .split(";")[0]
        .trim()
        .toLowerCase();
      const map = {
        "application/pdf": ".pdf",
        "application/msword": ".doc",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
          ".docx",
        "application/vnd.ms-powerpoint": ".ppt",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation":
          ".pptx",
        "application/vnd.ms-excel": ".xls",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          ".xlsx",
        "application/zip": ".zip",
        "text/plain": ".txt",
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
        "image/gif": ".gif",
      };
      return map[type] || fromName(fallback) || "";
    };
    const unique = (name, used) => {
      if (!used.has(name)) {
        used.add(name);
        return name;
      }
      const parsed = /^(.*?)(\.[^.]+)?$/.exec(name) || [];
      const base = parsed[1] || name;
      const ext = parsed[2] || "";
      let n = 2;
      let candidate = `${base} (${n})${ext}`;
      while (used.has(candidate)) candidate = `${base} (${++n})${ext}`;
      used.add(candidate);
      return candidate;
    };
    let table = main.querySelector("#DataContent_gvPortalSummary");
    let header = table?.rows?.[0] || null;
    if (!table || !header) {
      for (const candidate of main.querySelectorAll("table")) {
        const row = [...candidate.rows].find((entry) => {
          const labels = [...entry.cells].map(text);
          return (
            labels.some((label) => /download\s*files?/i.test(label)) &&
            labels.some((label) => /upload\s*date/i.test(label))
          );
        });
        if (!row) continue;
        table = candidate;
        header = row;
        break;
      }
    }
    if (!table || !header) return;
    const labels = [...header.cells].map(text);
    const titleIndex = Math.max(0, labels.findIndex((label) => /title/i.test(label)));
    const rows = [...table.rows]
      .filter((row) => row !== header && row.cells.length)
      .map((row) => ({
        row,
        link:
          row.querySelector('a[href*="DownloadFile.aspx" i]') ||
          row.cells[
            labels.findIndex((label) => /download\s*files?/i.test(label))
          ]?.querySelector('a[href*="DownloadFile.aspx" i]'),
      }))
      .filter((entry) => entry.link);
    if (!rows.length) return;
    const toolbar = own(el("div", "cp-bulk-toolbar"), table.parentNode, table);
    const count = own(el("span", "cp-bulk-count", "0 selected"), toolbar);
    const button = own(
      el("button", "cp-bulk-download", "Download selected as ZIP"),
      toolbar,
    );
    button.type = "button";
    button.disabled = true;
    const status = own(el("span", "cp-bulk-status"), toolbar);
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    const checkHead = own(el("th", "cp-bulk-check-col"), header, header.firstChild);
    const selectAll = own(el("input"), checkHead);
    selectAll.type = "checkbox";
    selectAll.setAttribute("aria-label", "Select all course contents");
    const entries = rows.map(({ row, link }) => {
      const cell = own(el("td", "cp-bulk-check-col"), row, row.firstChild);
      const box = own(el("input"), cell);
      box.type = "checkbox";
      const titleCell =
        row.cells[Math.min(row.cells.length - 1, titleIndex + 1)] || row.cells[1];
      box.setAttribute(
        "aria-label",
        `Select ${sanitize(text(titleCell)) || "course content"}`,
      );
      return { row, link, box, titleCell };
    });
    const sync = () => {
      const selected = entries.filter((entry) => entry.box.checked).length;
      count.textContent = `${selected} selected`;
      button.disabled = !selected;
      selectAll.indeterminate = selected > 0 && selected < entries.length;
      selectAll.checked = selected === entries.length;
    };
    const onSelectAll = () => {
      for (const entry of entries) entry.box.checked = selectAll.checked;
      sync();
    };
    const onDownload = async () => {
      const picked = entries.filter((entry) => entry.box.checked);
      if (!picked.length) {
        status.textContent = "Select at least one file.";
        return;
      }
      button.disabled = true;
      selectAll.disabled = true;
      for (const entry of entries) entry.box.disabled = true;
      status.textContent = "Preparing ZIP…";
      try {
        const files = [];
        const used = new Set();
        for (let i = 0; i < picked.length; i++) {
          status.textContent = `Downloading ${i + 1}/${picked.length}…`;
          const entry = picked[i];
          const response = await fetch(entry.link.href, { credentials: "include" });
          if (!response.ok)
            throw new Error(`Download failed (${response.status})`);
          const data = new Uint8Array(await response.arrayBuffer());
          const base = sanitize(text(entry.titleCell)) || `content-${i + 1}`;
          const ext = extension(response, entry.link.href);
          const name = unique(base + ext, used);
          files.push({
            name,
            data,
            crc: crc32(data),
            date: new Date(),
          });
        }
        const blob = zipStore(files);
        const url = URL.createObjectURL(blob);
        const anchor = own(el("a"), document.body);
        anchor.href = url;
        const selectedCourse = text(
          main.querySelector("#DataContent_ddlCourses, select[name*='ddlCourses' i]")
            ?.selectedOptions?.[0],
        ).trim();
        anchor.download =
          selectedCourse && !/^-select course-$/i.test(selectedCourse)
            ? `${sanitize(selectedCourse)}.zip`
            : "course-contents.zip";
        anchor.click();
        URL.revokeObjectURL(url);
        status.textContent = `Downloaded ${picked.length} files.`;
      } catch (error) {
        status.textContent = `Could not build ZIP: ${error.message || "Download failed."}`;
      } finally {
        selectAll.disabled = false;
        for (const entry of entries) entry.box.disabled = false;
        sync();
      }
    };
    selectAll.addEventListener("change", onSelectAll);
    button.addEventListener("click", onDownload);
    for (const entry of entries) entry.box.addEventListener("change", sync);
    undo.push(() => {
      selectAll.removeEventListener("change", onSelectAll);
      button.removeEventListener("click", onDownload);
      for (const entry of entries) entry.box.removeEventListener("change", sync);
    });
    sync();
  }

  function timetable(main) {
    if (!/timetable\.aspx$/i.test(location.pathname)) return;
    mark(main, "cp-timetable-page");
    const attribute = (node, key, value) => {
      const original = node.getAttribute(key);
      node.setAttribute(key, value);
      undo.push(() =>
        original === null
          ? node.removeAttribute(key)
          : node.setAttribute(key, original),
      );
    };
    const signature = (cell) =>
      text(cell) +
      "|" +
      [...cell.querySelectorAll("a")]
        .map(
          (a) =>
            (a.getAttribute("href") || "") +
            "|" +
            (a.getAttribute("onclick") || ""),
        )
        .join("|");
    for (const table of main.querySelectorAll("table.cp-data-grid")) {
      if (
        table.classList.contains("cp-timetable") ||
        !/monday|tuesday|wednesday/i.test(text(table))
      )
        continue;
      mark(table, "cp-timetable");
      const rows = [...table.rows],
        header =
          rows.find((row) => row.classList.contains("cp-grid-head")) || rows[0];
      if (header?.cells[0] && /^daytitle$/i.test(text(header.cells[0]))) {
        const original = header.cells[0].textContent;
        header.cells[0].textContent = "Day";
        undo.push(() => (header.cells[0].textContent = original));
      }
      for (const row of rows) {
        if (
          row === header ||
          !row.cells.length ||
          !/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i.test(
            text(row.cells[0]),
          )
        )
          continue;
        const cells = [...row.cells].slice(1);
        if (
          cells.some((cell) => cell.rowSpan > 1 || cell.querySelector("table"))
        )
          continue;
        if (cells.length && cells.every((cell) => !text(cell))) {
          attribute(
            cells[0],
            "colspan",
            String(cells.reduce((n, cell) => n + cell.colSpan, 0)),
          );
          own(el("span", "cp-week-empty", "No classes scheduled"), cells[0]);
          for (const cell of cells.slice(1)) mark(cell, "cp-week-merged");
          continue;
        }
        for (let i = 0; i < cells.length; i++) {
          const cell = cells[i];
          if (!text(cell)) {
            own(el("span", "cp-week-gap", "–"), cell);
            continue;
          }
          // Merge only adjacent identical sessions. Keep original nodes in place for restore.
          let end = i,
            span = cell.colSpan;
          while (
            end + 1 < cells.length &&
            text(cells[end + 1]) &&
            signature(cells[end + 1]) === signature(cell)
          ) {
            span += cells[++end].colSpan;
          }
          if (end > i) {
            attribute(cell, "colspan", String(span));
            for (let n = i + 1; n <= end; n++) mark(cells[n], "cp-week-merged");
          }
          const slot = wrapContents(cell, "cp-class-slot");
          const title = own(
            el("span", "cp-class-title"),
            slot,
            slot.firstChild,
          );
          for (const node of [...slot.childNodes]) {
            if (node === title) continue;
            if (node.nodeName === "BR") break;
            move(node, title);
          }
          i = end;
        }
      }
    }
  }
  function wrapContents(node, name) {
    const box = el("div", name);
    own(box, node);
    for (const child of [...node.childNodes])
      if (child !== box) move(child, box);
    return box;
  }
  function panels(main) {
    const path = location.pathname.toLowerCase();
    if (/entrycoupon/.test(path)) mark(main, "cp-exam-page");
    if (/datesheet/.test(path)) mark(main, "cp-datesheet-page");
    for (const heading of main.querySelectorAll("h1,h2,h3,h4,strong")) {
      if (/important notice|no coupons|fee defaulters/i.test(text(heading))) {
        const parent = heading.closest("div,section,article");
        if (
          parent &&
          parent !== main &&
          !parent.classList.contains("content-box")
        )
          mark(parent, "cp-notice-panel");
      }
    }
    for (const table of main.querySelectorAll("table")) {
      if (table.closest(".cp-original-ecard,.cp-profile-card")) continue;
      if (
        !table.classList.contains("cp-result-summary") &&
        table.rows.length <= 2 &&
        /\bCGPA\s*:/i.test(text(table))
      ) {
        mark(table, "cp-result-summary");
        wrap(table, "cp-result-summary-panel");
      }
    }
    for (const box of main.querySelectorAll(".content-box")) {
      const heading = box.querySelector(".content-box-header");
      if (
        !box.classList.contains("cp-contact-settings") &&
        heading &&
        /cell.*email|profile settings|contact information/i.test(text(heading))
      ) {
        mark(box, "cp-contact-settings");
        for (const row of box.querySelectorAll("table tr")) {
          if (
            !row.querySelector(
              "input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea",
            ) ||
            row.cells.length < 2
          )
            continue;
          mark(row, "cp-field-row");
          const cells = [...row.cells];
          mark(cells[0], "cp-field-label");
          mark(cells[1], "cp-field-control");
          const group = own(el("div", "cp-field-controls"), cells[1]);
          for (const cell of cells.slice(1)) {
            if (cell !== cells[1]) mark(cell, "cp-field-empty");
            for (const node of [...cell.childNodes])
              if (node !== group) move(node, group);
          }
        }
      }
    }
  }
  function projects(main) {
    if (
      !/\/finalproject\/approvedprojects\.aspx$/i.test(location.pathname) ||
      main.querySelector(".cp-project-browser")
    )
      return;
    let table,
      header,
      titleIndex = -1,
      descriptionIndex = -1;
    for (const candidate of main.querySelectorAll("table")) {
      const row = [...candidate.rows].find((row) => {
        const labels = [...row.cells].map(text);
        return (
          labels.some((label) =>
            /project\s*title|project\s*name|^title$/i.test(label),
          ) &&
          labels.filter((label) =>
            /description|abstract|supervisor|domain|status|^s.?no|project\s*id|^title$|project\s*title/i.test(
              label,
            ),
          ).length >= 2
        );
      });
      if (!row) continue;
      const labels = [...row.cells].map(text);
      titleIndex = labels.findIndex((v) =>
        /project\s*title|project\s*name|^title$/i.test(v),
      );
      descriptionIndex = labels.findIndex((v) =>
        /description|abstract|detail/i.test(v),
      );
      table = candidate;
      header = row;
      break;
    }
    let sources = [],
      originals = [];
    if (table) {
      originals = [table];
      sources = [...table.rows]
        .filter(
          (row) =>
            row !== header &&
            row.cells.length >= header.cells.length &&
            text(row),
        )
        .map((row) => ({
          title: row.cells[titleIndex],
          fields: [...row.cells]
            .map((cell, index) => ({ cell, label: text(header.cells[index]) }))
            .filter((_, index) => index !== titleIndex),
          excerpt:
            descriptionIndex >= 0
              ? text(row.cells[descriptionIndex]).slice(0, 220)
              : "",
        }));
    } else
      for (const candidate of main.querySelectorAll("table")) {
        const rows = [...candidate.rows];
        const title = rows.find(
          (row) =>
            row.cells.length >= 2 &&
            /^(?:project\s*)?(?:title|name)\s*:?$/i.test(text(row.cells[0])),
        );
        if (!title) continue;
        const fields = rows
          .filter((row) => row !== title && row.cells.length >= 2)
          .map((row) => ({ label: text(row.cells[0]), cell: row.cells[1] }));
        if (
          !fields.some((field) =>
            /description|abstract|detail/i.test(field.label),
          )
        )
          continue;
        originals.push(candidate);
        sources.push({
          title: title.cells[1],
          fields,
          excerpt: text(
            fields.find((field) =>
              /description|abstract|detail/i.test(field.label),
            ).cell,
          ).slice(0, 220),
        });
      }
    if (!sources.length) return;
    let host = originals[0];
    while (host !== main && originals.some((node) => !host.contains(node)))
      host = host.parentElement;
    const shell = el("section", "cp-project-browser");
    if (host === main) {
      let before = originals[0];
      while (before.parentElement !== main) before = before.parentElement;
      own(shell, main, before);
    } else own(shell, host.parentNode, host);
    shell.setAttribute("aria-label", "Approved projects");
    const toolbar = el("div", "cp-project-toolbar"),
      search = el("input"),
      size = el("select"),
      count = el("span");
    search.type = "search";
    search.placeholder = "Search projects";
    search.setAttribute("aria-label", "Search approved projects");
    for (const n of [9, 18, 36]) {
      const option = el("option", null, n + " per page");
      option.value = n;
      size.append(option);
    }
    size.setAttribute("aria-label", "Projects per page");
    toolbar.append(search, size, count);
    shell.append(toolbar);
    const grid = el("div", "cp-project-grid");
    shell.append(grid);
    const pager = el("nav", "cp-project-pagination");
    pager.setAttribute("aria-label", "Project pages");
    const previous = el("button", null, "Previous"),
      next = el("button", null, "Next"),
      position = el("span");
    previous.type = next.type = "button";
    pager.append(previous, position, next);
    shell.append(pager);
    let page = 0;
    const entries = sources.map((source) => {
      const card = el("article", "cp-project-card"),
        title = el("h3");
      for (const node of [...source.title.childNodes]) move(node, title);
      card.append(title);
      if (source.excerpt)
        card.append(el("p", "cp-project-excerpt", source.excerpt));
      const details = el("details"),
        summary = el("summary", null, "View more");
      details.append(summary);
      source.fields.forEach(({ cell, label }) => {
        const group = el("div", "cp-project-field");
        group.append(el("h4", null, label));
        for (const child of [...cell.childNodes]) move(child, group);
        details.append(group);
      });
      card.append(details);
      grid.append(card);
      return {
        card,
        search: (title.textContent + " " + details.textContent).toLowerCase(),
      };
    });
    // The full original listing returns when the extension is disabled.
    if (host !== main) mark(host, "cp-project-original");
    else
      for (const original of originals) mark(original, "cp-project-original");
    function render() {
      const filtered = entries.filter((entry) =>
        entry.search.includes(search.value.trim().toLowerCase()),
      );
      const limit = Number(size.value),
        pages = Math.max(1, Math.ceil(filtered.length / limit));
      page = Math.max(0, Math.min(page, pages - 1));
      for (const entry of entries) entry.card.hidden = true;
      for (const entry of filtered.slice(page * limit, (page + 1) * limit))
        entry.card.hidden = false;
      count.textContent = filtered.length + " projects";
      position.textContent = `Page ${page + 1} of ${pages}`;
      previous.disabled = page === 0;
      next.disabled = page >= pages - 1;
    }
    search.addEventListener("input", () => {
      page = 0;
      render();
    });
    size.addEventListener("change", () => {
      page = 0;
      render();
    });
    previous.addEventListener("click", () => {
      page--;
      render();
    });
    next.addEventListener("click", () => {
      page++;
      render();
    });
    render();
    const beforePrint = () => {
      for (const entry of entries) {
        entry.open = entry.card.querySelector("details").open;
        entry.card.hidden = false;
        entry.card.querySelector("details").open = true;
      }
    };
    const afterPrint = () => {
      for (const entry of entries)
        entry.card.querySelector("details").open = !!entry.open;
      render();
    };
    addEventListener("beforeprint", beforePrint);
    addEventListener("afterprint", afterPrint);
    undo.push(() => {
      removeEventListener("beforeprint", beforePrint);
      removeEventListener("afterprint", afterPrint);
    });
  }
  function run() {
    pending = false;
    const main = document.getElementById("main-content");
    if (!preferences.enabled) {
      destroy();
      return;
    }
    if (mounted && !mounted.isConnected) destroy();
    if (!main) return;
    mounted = main;
    for (const adapter of [
      ecard,
      grids,
      files,
      courseContents,
      timetable,
      panels,
      projects,
    ]) {
      const before = undo.length;
      try {
        adapter(main);
      } catch {
        for (const action of undo.splice(before).reverse()) action();
      }
    }
  }
  function schedule() {
    if (!pending) {
      pending = true;
      requestAnimationFrame(run);
    }
  }
  PortalSettings.subscribe((value) => {
    preferences = value;
    schedule();
  });
  PortalSettings.get().then((value) => {
    preferences = value;
    schedule();
  });
  function start() {
    new MutationObserver(schedule).observe(document.body, {
      childList: true,
      subtree: true,
    });
    schedule();
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();
