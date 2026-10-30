/* Reversible visual layout. Existing fields, forms and portal handlers are retained.
   Never reads input values, academic records, cookies, tokens, or credentials. */
(() => {
  "use strict";
  const api = PortalSettings;
  const layoutScriptURL = document.currentScript?.src;
  const logoURL = globalThis.chrome?.runtime?.id
    ? chrome.runtime.getURL("assets/comsats-logo.jpg")
    : new URL(
        "assets/comsats-logo.jpg",
        layoutScriptURL || new URL("../extension/layout.js", location.href),
      ).href;
  let preferences = api.normalize(null);
  let mounted = null;
  let scheduled = false;
  // Lucide Static 1.61.0; ISC license in vendor/lucide-LICENSE.
  const icons = {
    grid: '<svg data-lucide="layout-dashboard" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>',
    book: '<svg data-lucide="book-open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 5v16" /><path d="M20.001 19A2 2 0 0022 17V5a2 2 0 00-1.999-2L16 3.002A5 5 0 0012 5a5 5 0 00-4-2H4a2 2 0 00-2 2v12a2 2 0 001.999 2H8a5 5 0 014 2 5 5 0 014-2z" /></svg>',
    calendar:
      '<svg data-lucide="calendar-days" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 2v3" /><path d="M16 2v3" /><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18" /><path d="M8 13h.01" /><path d="M12 13h.01" /><path d="M16 13h.01" /><path d="M8 17h.01" /><path d="M12 17h.01" /><path d="M16 17h.01" /></svg>',
    chart:
      '<svg data-lucide="chart-no-axes-combined" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 16v5" /><path d="M16 14.639V21" /><path d="M20 10.656V21" /><path d="m22 3-8.646 8.646a.5.5 0 0 1-.708 0L9.354 8.354a.5.5 0 0 0-.707 0L2 15" /><path d="M4 18.463V21" /><path d="M8 14.656V21" /></svg>',
    user: '<svg data-lucide="user-round" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="8" r="5" /><path d="M20 21a8 8 0 0 0-16 0" /></svg>',
    moon: '<svg data-lucide="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" /></svg>',
    sun: '<svg data-lucide="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="m4.93 4.93 1.41 1.41" /><path d="m17.66 17.66 1.41 1.41" /><path d="M2 12h2" /><path d="M20 12h2" /><path d="m6.34 17.66-1.41 1.41" /><path d="m19.07 4.93-1.41 1.41" /></svg>',
    arrow:
      '<svg data-lucide="arrow-right" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>',
    shield:
      '<svg data-lucide="shield-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" /><path d="m9 12 2 2 4-4" /></svg>',
    chevronDown:
      '<svg data-lucide="chevron-down" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6" /></svg>',
    idCard:
      '<svg data-lucide="id-card" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M13 19a4 4 0 00-8 0" /><path d="M16 10h2" /><path d="M16 14h2" /><circle cx="9" cy="12" r="3" /><rect x="2" y="5" width="20" height="14" rx="2" /></svg>',
    clipboard:
      '<svg data-lucide="clipboard-list" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" /><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><path d="M12 11h4" /><path d="M12 16h4" /><path d="M8 11h.01" /><path d="M8 16h.01" /></svg>',
    phone:
      '<svg data-lucide="smartphone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>',
    bus: '<svg data-lucide="bus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M8 6v6" /><path d="M15 6v6" /><path d="M2 12h19.6" /><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3" /><circle cx="7" cy="18" r="2" /><path d="M9 18h5" /><circle cx="16" cy="18" r="2" /></svg>',
    users:
      '<svg data-lucide="users-round" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M18 21a8 8 0 0 0-16 0" /><circle cx="10" cy="8" r="5" /><path d="M22 20c0-3.37-2-6.5-4-8a5 5 0 0 0-.45-8.3" /></svg>',
    folder:
      '<svg data-lucide="folder-kanban" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" /><path d="M8 10v4" /><path d="M12 10v2" /><path d="M16 10v6" /></svg>',
    wallet:
      '<svg data-lucide="wallet" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" /><path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" /></svg>',
    library:
      '<svg data-lucide="library-big" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect width="8" height="18" x="3" y="3" rx="1" /><path d="M7 3v18" /><path d="M20.4 18.9c.2.5-.1 1.1-.6 1.3l-1.9.7c-.5.2-1.1-.1-1.3-.6L11.1 5.1c-.2-.5.1-1.1.6-1.3l1.9-.7c.5-.2 1.1.1 1.3.6Z" /></svg>',
    award:
      '<svg data-lucide="graduation-cap" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" /><path d="M22 10v6" /><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" /></svg>',
    settings:
      '<svg data-lucide="settings" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" /><circle cx="12" cy="12" r="3" /></svg>',
    file: '<svg data-lucide="file-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" /><path d="M14 2v5a1 1 0 0 0 1 1h5" /><path d="m9 15 2 2 4-4" /></svg>',
  };
  function element(tag, className, markup) {
    const node = document.createElement(tag);
    node.className = className;
    if (markup) node.innerHTML = markup; // Static extension-owned templates only.
    return node;
  }
  function transaction(anchor, type) {
    const undo = [];
    return {
      anchor,
      type,
      undo,
      own(node, parent, before = null) {
        parent.insertBefore(node, before);
        undo.push(() => node.remove());
        return node;
      },
      class(node, name) {
        const had = node.classList.contains(name);
        node.classList.add(name);
        if (!had) undo.push(() => node.classList.remove(name));
      },
      text(node, value) {
        const old = node.textContent;
        node.textContent = value;
        undo.push(() => (node.textContent = old));
      },
      attr(node, key, value) {
        const old = node.getAttribute(key);
        node.setAttribute(key, value);
        undo.push(() =>
          old === null
            ? node.removeAttribute(key)
            : node.setAttribute(key, old),
        );
      },
      move(node, parent, before = null) {
        const marker = document.createComment("CUI original position");
        node.before(marker);
        parent.insertBefore(node, before);
        undo.push(() => {
          if (marker.parentNode) marker.replaceWith(node);
        });
      },
      wrap(node, wrapper) {
        const marker = document.createComment("CUI Portal+ original location");
        node.before(marker, wrapper);
        wrapper.append(node);
        undo.push(() => {
          if (marker.parentNode) marker.replaceWith(node);
          wrapper.remove();
        });
        return wrapper;
      },
      destroy() {
        for (const revert of undo.reverse()) revert();
      },
    };
  }
  function themeControl(tx, parent) {
    const button = tx.own(element("button", "cp-theme-toggle"), parent);
    button.type = "button";
    let lastTheme;
    function paint() {
      const isDark =
        document.documentElement.getAttribute("data-cui-plus") === "dark";
      if (lastTheme === isDark) return;
      lastTheme = isDark;
      button.innerHTML = isDark ? icons.sun : icons.moon;
      button.setAttribute(
        "aria-label",
        isDark ? "Switch to light theme" : "Switch to dark theme",
      );
    }
    button.addEventListener("click", async () => {
      try {
        const value = await api.get();
        await api.set({
          ...value,
          theme:
            document.documentElement.getAttribute("data-cui-plus") === "dark"
              ? "light"
              : "dark",
        });
      } catch {
        button.title = "Could not save theme. Use the extension popup.";
      }
    });
    tx.paint = paint;
    paint();
  }
  function login(wrapper, button) {
    const tx = transaction(wrapper, "login");
    const shell = tx.wrap(wrapper, element("div", "cp-auth-shell"));
    const hero = tx.own(
      element(
        "section",
        "cp-auth-story cp-university-story",
        '<img class="cp-login-seal" alt="COMSATS University Islamabad logo" width="100" height="100"><div class="cp-original-university-heading"></div><div class="cp-login-purpose"><span class="cp-eyebrow">STUDENT PORTAL</span><h2>Your academic<br>information, together.</h2><p>Courses, attendance, results, and campus essentials.</p></div>',
      ),
      shell,
      wrapper,
    );
    hero.querySelector(".cp-login-seal").src = logoURL;
    const originalBrand = wrapper.querySelector("#login-top");
    if (originalBrand)
      tx.move(
        originalBrand,
        hero.querySelector(".cp-original-university-heading"),
      );
    tx.class(wrapper, "cp-auth-card");
    const content = wrapper.querySelector("#login-content") || wrapper;
    tx.own(
      element(
        "div",
        "cp-auth-heading",
        '<span class="cp-eyebrow">STUDENT ACCESS</span><h2>Welcome back.</h2><p>Sign in with your university roll number.</p>',
      ),
      wrapper,
      wrapper.firstChild,
    );
    tx.own(
      element(
        "div",
        "cp-auth-card-footer",
        `${icons.shield}<span>Your university login. A fresh new look.</span>`,
      ),
      wrapper,
    );
    const session = wrapper.querySelector("#ddl_Session");
    const program = wrapper.querySelector("#ddl_Program");
    const roll =
      wrapper.querySelector("#txt_RollNo") ||
      wrapper.querySelector('input[type="text"]');
    if (session && program && roll) {
      let row = session.parentElement;
      while (
        row &&
        row !== content &&
        (!row.contains(program) || !row.contains(roll))
      )
        row = row.parentElement;
      if (row && row !== content) {
        tx.class(row, "cp-roll-row");
        const label = row.querySelector("label");
        if (
          label &&
          label.children.length === 0 &&
          /^roll\s*(no|number)\.?$/i.test(label.textContent.trim())
        )
          tx.text(label, "Roll number");
      }
      [
        [session, "Session"],
        [program, "Program"],
        [roll, "Roll number"],
      ].forEach(([node, label]) => {
        if (!node.getAttribute("aria-label") && !node.labels?.length)
          tx.attr(node, "aria-label", label);
      });
    }
    const password = wrapper.querySelector('input[type="password"]');
    if (password) {
      let row = password.parentElement;
      if (row !== content && row !== wrapper) tx.class(row, "cp-password-row");
      if (!password.getAttribute("aria-label") && !password.labels?.length)
        tx.attr(password, "aria-label", "Password");
    }
    // The portal can render its roll-number confirmation after typing.
    // Tag the native display without replacing it or touching form values.
    const previews = new WeakSet();
    tx.paint = () => {
      const nativePreview = content.querySelector(
        "#ErrorMessage > .notification",
      );
      if (nativePreview) {
        const isEnrollment =
          /^CIIT\s*\/?\s*(?:FA|SP)\d{2}\s*-\s*[A-Z]{2,6}\s*-\s*\d{0,4}\s*\/\s*[A-Z]{0,6}$/i.test(
            nativePreview.textContent.trim(),
          );
        if (isEnrollment && !previews.has(nativePreview)) {
          previews.add(nativePreview);
          tx.class(nativePreview, "cp-roll-preview");
        }
        nativePreview.classList.toggle("cp-roll-preview", isEnrollment);
      }
      for (const node of content.querySelectorAll("div,span,p,output")) {
        if (
          previews.has(node) ||
          node.closest("#ErrorMessage,[role=alert]") ||
          node.querySelector("input,select,textarea,button,div,span,p,output")
        )
          continue;
        if (
          /^CIIT\s*\/?\s*(?:FA|SP)\d{2}\s*-\s*[A-Z]{2,6}\s*-\s*\d{1,4}\s*\/\s*ATD$/i.test(
            node.textContent.trim(),
          )
        ) {
          previews.add(node);
          tx.class(node, "cp-roll-preview");
        }
      }
    };
    tx.paint();
    const rollLabel = content.querySelector(".cp-roll-row > label");
    const passwordLabel = content.querySelector(".cp-password-row label");
    if (rollLabel)
      tx.own(
        element("span", "cp-field-icon", icons.idCard),
        rollLabel,
        rollLabel.firstChild,
      );
    if (passwordLabel)
      tx.own(
        element("span", "cp-field-icon", icons.shield),
        passwordLabel,
        passwordLabel.firstChild,
      );
    tx.class(button, "cp-auth-submit");
    // Icon lives in CSS; the original sign-in element is never replaced.
    tx.own(
      element(
        "footer",
        "cp-auth-bottom",
        '<span>COMSATS University Islamabad · Abbottabad Campus</span><span>Powered by <a href="https://comsatshub.vercel.app/" target="_blank" rel="noopener noreferrer">ComsatsHub</a></span>',
      ),
      shell.parentNode,
      shell.nextSibling,
    );
    return tx;
  }
  function workspace(main) {
    const tx = transaction(main, "workspace");
    for (const heading of main.querySelectorAll(".content-box-header h3"))
      if (/^dash\s*board$/i.test(heading.textContent.trim())) {
        tx.text(heading, "Dashboard");
        tx.class(heading.closest(".content-box"), "cp-dashboard-box");
      }
    const details = main.querySelector("#divStudentDetails");
    if (details) {
      const card = tx.wrap(details, element("section", "cp-profile-card"));
      card.setAttribute("aria-label", "Your academic profile");
      card.insertBefore(
        element(
          "header",
          "cp-profile-heading",
          `${icons.user}<div><h2>Your academic profile</h2><p>Personal details & academic enrollment</p></div><span class="cp-profile-badge">STUDENT PROFILE</span>`,
        ),
        details,
      );
    }
    const sidebar = document.querySelector("#sidebar-wrapper");
    if (sidebar) {
      tx.class(sidebar, "cp-university-sidebar");
      const profile = sidebar.querySelector("#profile-links");
      tx.own(
        element(
          "div",
          "cp-university-name",
          "<b>COMSATS University<br>Islamabad</b><span>Abbottabad Campus</span><small>STUDENT PORTAL</small>",
        ),
        sidebar,
        profile || sidebar.querySelector("#main-nav"),
      );
      if (profile) {
        const nodes = [...profile.childNodes];
        const firstBreak = nodes.findIndex((n) => n.nodeName === "BR");
        const greeting = tx.own(
          element("div", "cp-sidebar-greeting"),
          profile,
          profile.firstChild,
        );
        for (const node of nodes.slice(0, firstBreak < 0 ? 0 : firstBreak))
          tx.move(node, greeting);
        const actions = tx.own(element("div", "cp-sidebar-actions"), profile);
        for (const link of [...profile.children].filter(
          (e) => e.tagName === "A",
        ))
          tx.move(link, actions);
        for (const node of [...profile.childNodes])
          if (node.nodeType === 3 && /^[\s|]*$/.test(node.textContent))
            tx.wrap(node, element("span", "cp-sidebar-separator"));
      }

      const mappings = {
        lnk_Dashboard: "grid",
        A15: "idCard",
        lnk_Courses: "book",
        lnk_CoursePortal: "book",
        lnkEntryCoupon: "file",
        lnkTimeTableMain: "calendar",
        lnkDatesheet: "calendar",
        lnkStudentApp: "phone",
        lnkBoarding: "bus",
        lnk_Sibling: "users",
        lnk_Result: "chart",
        lnkOBE: "chart",
        lnkProjectMain: "folder",
        lnk_FeeChallan: "wallet",
        lnkLibraryMain: "library",
        lnkScholarships: "award",
        lnkClearanceMain: "file",
        lnkapsmain: "clipboard",
        lnk_Settings: "settings",
      };
      for (const link of sidebar.querySelectorAll("#main-nav>li>a")) {
        const icon = mappings[link.id] || "grid";
        tx.own(
          element("span", "cp-nav-icon", icons[icon]),
          link,
          link.firstChild,
        );
      }
    }
    const nav = document.querySelector("#main-nav");
    let selectedLink,
      studioOpen = false;
    function selectNav(link) {
      selectedLink = link;
      for (const a of nav?.querySelectorAll("a") || []) {
        a.classList.remove("cp-nav-active", "cp-nav-parent");
        if (a.getAttribute("aria-current") === "page")
          a.removeAttribute("aria-current");
      }
      if (!link) return;
      link.classList.add("cp-nav-active");
      link.setAttribute("aria-current", "page");
      const top = link.closest("#main-nav>li");
      const parent = top?.querySelector(":scope>a");
      if (parent && parent !== link) parent.classList.add("cp-nav-parent");
      nav.classList.add("cp-has-active");
    }
    if (nav) {
      const path = location.pathname.toLowerCase();
      const links = [...nav.querySelectorAll("a")];
      const direct = links.find((a) => {
        const href = a.getAttribute("href") || "";
        const route = href.match(/[a-z0-9_/-]+\.aspx(?:\?[^\"' ]*)?/i)?.[0];
        if (!route) return false;
        try {
          const url = new URL(route, location.href);
          return (
            url.pathname.toLowerCase() === path &&
            url.search === location.search
          );
        } catch {
          return false;
        }
      });
      const map = {
        "dashboard.aspx": "lnk_Dashboard",
        "summary.aspx": "lnk_Summary",
        "classproceedings.aspx": "lnk_ClassProceedings",
        "qamarks.aspx": "lnk_QAMarks",
        "quizassignmentmarks.aspx": "lnk_QAMarks",
        "result.aspx": "lnk_ResultCard",
        "resultcard.aspx": "lnk_ResultCard",
        "studentprofile.aspx": "lnk_Profile",
        "changepassword.aspx": "lnk_ChangePassword",
        "loginhistory.aspx": "lnk_LoginHistory",
      };
      selectNav(
        direct ||
          document.getElementById(map[path.split("/").pop()]) ||
          nav.querySelector("a.current:not(.nav-top-item)") ||
          nav.querySelector("a.current"),
      );
      const active = (event) => {
        const a = event.target.closest("a");
        if (
          !a ||
          !nav.contains(a) ||
          a.classList.contains("cp-customizer-link")
        )
          return;
        // Opening an accordion is not a page change.
        if (
          a.parentElement.parentElement === nav &&
          a.parentElement.querySelector(":scope>ul")
        )
          return;
        if (
          a.getAttribute("href") &&
          !/^(#|javascript:void)/.test(a.getAttribute("href"))
        )
          selectNav(a);
      };
      nav.addEventListener("click", active, true);
      tx.undo.push(() => {
        nav.removeEventListener("click", active, true);
        nav.classList.remove("cp-has-active");
        for (const a of nav.querySelectorAll("a")) {
          a.classList.remove("cp-nav-active", "cp-nav-parent");
          if (a.getAttribute("aria-current") === "page")
            a.removeAttribute("aria-current");
        }
      });
    }

    if (nav) {
      const item = tx.own(element("li", "cp-customizer-nav"), nav);
      const link = element(
        "a",
        "cp-customizer-link",
        `<span class="cp-nav-icon">${icons.settings}</span><span>CUI Portal+</span>`,
      );
      link.href = "#cui-portal-customize";
      link.setAttribute("aria-controls", "cp-customizer-page");
      link.setAttribute("aria-expanded", "false");
      item.append(link);
      let frame;
      function close() {
        frame?.remove();
        frame = null;
        main.classList.remove("cp-customizing");
        link.setAttribute("aria-expanded", "false");
        if (studioOpen) {
          studioOpen = false;
          selectNav(selectedBeforeStudio);
        }
      }
      let selectedBeforeStudio;
      function open(event) {
        event.preventDefault();
        event.stopPropagation();
        if (frame) {
          close();
          return;
        }
        frame = element("iframe", "cp-customizer-host");
        frame.id = "cp-customizer-page";
        frame.title = "CUI Portal+ customization";
        frame.src = globalThis.chrome?.runtime?.id
          ? chrome.runtime.getURL("customizer.html")
          : new URL(
              "customizer.html",
              layoutScriptURL ||
                new URL("../extension/layout.js", location.href),
            ).href;
        selectedBeforeStudio = selectedLink;
        studioOpen = true;
        selectNav(link);
        main.append(frame);
        main.classList.add("cp-customizing");
        link.setAttribute("aria-expanded", "true");
        frame.focus();
      }
      link.addEventListener("click", open);
      function message(event) {
        if (
          frame &&
          event.source === frame.contentWindow &&
          event.data === "cui-customizer-close"
        ) {
          close();
          link.focus();
        }
      }
      window.addEventListener("message", message);
      function navigate(event) {
        if (!link.contains(event.target)) {
          if (studioOpen && selectedLink !== link)
            selectedBeforeStudio = selectedLink;
          close();
        }
      }
      nav.addEventListener('click', navigate, true);
      tx.undo.push(() => {
        close();
        window.removeEventListener("message", message);
        nav.removeEventListener('click', navigate, true);
      });
    }
    const footer = main.querySelector("#footer") || main;
    tx.own(
      element(
        "div",
        "cp-powered-by",
        'Powered by <a href="https://comsatshub.vercel.app/" target="_blank" rel="noopener noreferrer">ComsatsHub</a>',
      ),
      footer,
    );
    return tx;
  }
  function reconcile() {
    const blocked =
      /^(Just a moment|Attention Required)/i.test(document.title) ||
      document.querySelector(
        "#challenge-running,#challenge-stage,.cf-turnstile",
      );
    if (!preferences.enabled || blocked) {
      if (mounted) {
        mounted.destroy();
        mounted = null;
      }
      return;
    }
    if (mounted && !mounted.anchor.isConnected) {
      mounted.destroy();
      mounted = null;
    }
    if (mounted) {
      mounted.paint?.();
      return;
    }
    const signIn = document.getElementById("btn_StudentSignIn");
    const wrapper = document.getElementById("login-wrapper");
    if (signIn && wrapper && wrapper.contains(signIn)) {
      mounted = login(wrapper, signIn);
      return;
    }
    const main = document.getElementById("main-content");
    if (main && document.getElementById("sidebar-wrapper"))
      mounted = workspace(main);
  }
  function schedule() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      reconcile();
    });
  }
  api.subscribe((value) => {
    preferences = value;
    reconcile();
  });
  async function start() {
    try {
      preferences = await api.get();
      reconcile();
      new MutationObserver(schedule).observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    } catch {
      /* Leave the original form usable if enhancement fails. */
    }
  }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
  matchMedia("(prefers-color-scheme: dark)").addEventListener(
    "change",
    schedule,
  );
})();
