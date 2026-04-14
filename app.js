(function () {
  const config = window.SITE_CONFIG || {};

  const els = {
    brandName: document.getElementById("brand-name"),
    brandTagline: document.getElementById("brand-tagline"),
    heroName: document.getElementById("hero-name"),
    heroRole: document.getElementById("hero-role"),
    heroIntro: document.getElementById("hero-intro"),
    heroStatus: document.getElementById("hero-status"),
    emailLink: document.getElementById("email-link"),
    phoneLink: document.getElementById("phone-link"),
    linkedinLink: document.getElementById("linkedin-link"),
    githubLink: document.getElementById("github-link"),
    headerGithub: document.getElementById("header-github"),
    headerLinkedin: document.getElementById("header-linkedin"),
    projectsProfileLink: document.getElementById("projects-profile-link"),
    viewCvLink: document.getElementById("view-cv-link"),
    downloadCvLink: document.getElementById("download-cv-link"),
    inlineDownloadLink: document.getElementById("inline-download-link"),
    inlineOpenLink: document.getElementById("inline-open-link"),
    mobileOpenLink: document.getElementById("mobile-open-link"),
    mobileDownloadLink: document.getElementById("mobile-download-link"),
    openPdfButton: document.getElementById("open-pdf-button"),
    printCvButton: document.getElementById("print-cv-button"),
    cvFrame: document.getElementById("cv-frame"),
    cvUpdatedCopy: document.getElementById("cv-updated-copy"),
    projectsList: document.getElementById("projects-list"),
    highlightsList: document.getElementById("highlights-list"),
    focusPills: document.getElementById("focus-pills"),
    signalGrid: document.getElementById("signal-grid"),
    themeToggle: document.getElementById("theme-toggle")
  };

  function applyThemeColor(hex) {
    if (!hex || typeof hex !== "string") return;

    const normalized = hex.replace("#", "").trim();
    if (![3, 6].includes(normalized.length)) return;

    const fullHex =
      normalized.length === 3
        ? normalized
            .split("")
            .map((char) => char + char)
            .join("")
        : normalized;

    const int = Number.parseInt(fullHex, 16);
    if (Number.isNaN(int)) return;

    const r = (int >> 16) & 255;
    const g = (int >> 8) & 255;
    const b = int & 255;

    document.documentElement.style.setProperty("--accent", `#${fullHex}`);
    document.documentElement.style.setProperty("--accent-rgb", `${r}, ${g}, ${b}`);
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", `#${fullHex}`);
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem("preferred-theme", theme);
  }

  function initialiseTheme() {
    const storedTheme = window.localStorage.getItem("preferred-theme");
    const defaultTheme = config.defaultTheme === "light" ? "light" : "dark";
    setTheme(storedTheme || defaultTheme);

    els.themeToggle?.addEventListener("click", function () {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      setTheme(nextTheme);
    });
  }

  function setText(el, value) {
    if (el && value) el.textContent = value;
  }

  function setLink(el, href, label) {
    if (!el || !href) return;
    el.href = href;
    if (label) el.textContent = label;
  }

  function populateStaticContent() {
    document.title = `${config.name || "CV"} | Resume`;
    setText(els.brandName, config.name);
    setText(els.brandTagline, config.tagline);
    setText(els.heroName, config.name);
    setText(els.heroRole, config.title);
    setText(els.heroIntro, config.intro);
    setText(els.heroStatus, config.availabilityLabel);
    setText(els.cvUpdatedCopy, config.cvUpdatedLabel);

    if (els.emailLink && config.email) {
      els.emailLink.href = `mailto:${config.email}`;
      els.emailLink.textContent = config.email;
    }

    if (els.phoneLink && config.phone) {
      const cleanedPhone = config.phone.replace(/\s+/g, "");
      els.phoneLink.href = `tel:${cleanedPhone}`;
      els.phoneLink.textContent = config.phone;
    }

    setLink(els.linkedinLink, config.linkedinUrl, "Profile");
    setLink(els.headerLinkedin, config.linkedinUrl);
    setLink(els.githubLink, config.githubUrl, config.githubUsername);
    setLink(els.headerGithub, config.githubUrl);
    setLink(els.projectsProfileLink, config.githubUrl);

    const cvUrl = `${config.cvPath}#view=FitH`;
    setLink(els.downloadCvLink, config.cvPath);
    setLink(els.inlineDownloadLink, config.cvPath);
    setLink(els.inlineOpenLink, config.cvPath, "Open tab");
    setLink(els.mobileOpenLink, config.cvPath, "Open PDF");
    setLink(els.mobileDownloadLink, config.cvPath);

    if (els.cvFrame) {
      els.cvFrame.src = cvUrl;
    }

    if (els.openPdfButton) {
      els.openPdfButton.addEventListener("click", function () {
        window.open(config.cvPath, "_blank", "noopener,noreferrer");
      });
    }

    if (els.printCvButton) {
      els.printCvButton.addEventListener("click", function () {
        window.open(config.cvPath, "_blank", "noopener,noreferrer");
      });
    }

    if (els.highlightsList && Array.isArray(config.highlights)) {
      els.highlightsList.innerHTML = "";
      config.highlights.forEach(function (item) {
        const li = document.createElement("li");
        li.textContent = item;
        els.highlightsList.appendChild(li);
      });
    }

    if (els.focusPills && Array.isArray(config.focusAreas)) {
      els.focusPills.innerHTML = "";
      config.focusAreas.forEach(function (item) {
        const li = document.createElement("li");
        li.textContent = item;
        els.focusPills.appendChild(li);
      });
    }

    if (els.signalGrid && Array.isArray(config.quickFacts)) {
      els.signalGrid.innerHTML = "";
      config.quickFacts.forEach(function (fact) {
        if (!fact || !fact.value || !fact.label) return;
        const article = document.createElement("article");
        article.className = "signal-card";

        const strong = document.createElement("strong");
        strong.textContent = fact.value;

        const span = document.createElement("span");
        span.textContent = fact.label;

        article.append(strong, span);
        els.signalGrid.appendChild(article);
      });
    }
  }

  function renderStatus(message, className) {
    if (!els.projectsList) return;
    els.projectsList.innerHTML = "";
    const p = document.createElement("p");
    p.className = className;
    p.textContent = message;
    els.projectsList.appendChild(p);
  }

  function sortRepos(repos) {
    const pinned = Array.isArray(config.pinnedRepos) ? config.pinnedRepos : [];
    const pinnedSet = new Set(pinned.map((name) => name.toLowerCase()));

    return repos
      .slice()
      .sort(function (a, b) {
        const aPinned = pinnedSet.has(a.name.toLowerCase());
        const bPinned = pinnedSet.has(b.name.toLowerCase());

        if (aPinned && !bPinned) return -1;
        if (!aPinned && bPinned) return 1;

        return new Date(b.updated_at) - new Date(a.updated_at);
      });
  }

  function renderRepos(repos) {
    if (!els.projectsList) return;
    els.projectsList.innerHTML = "";

    const limit = Number.isFinite(config.repoDisplayLimit) ? config.repoDisplayLimit : 6;
    const shortlisted = sortRepos(repos)
      .filter(function (repo) {
        return !repo.fork;
      })
      .slice(0, limit);

    if (!shortlisted.length) {
      renderStatus("No public repositories available to display right now.", "status-text");
      return;
    }

    shortlisted.forEach(function (repo) {
      const article = document.createElement("article");
      article.className = "project-card";

      const title = document.createElement("h3");
      const link = document.createElement("a");
      link.href = repo.html_url;
      link.target = "_blank";
      link.rel = "noreferrer";
      link.textContent = repo.name;
      title.appendChild(link);

      const description = document.createElement("p");
      description.textContent = repo.description || "Public repository with no description provided.";

      const meta = document.createElement("div");
      meta.className = "project-meta";

      if (repo.language) {
        const language = document.createElement("span");
        language.className = "project-language";
        language.textContent = repo.language;
        meta.appendChild(language);
      }

      const stars = document.createElement("span");
      stars.textContent = `${repo.stargazers_count} star${repo.stargazers_count === 1 ? "" : "s"}`;
      meta.appendChild(stars);

      const updated = document.createElement("span");
      updated.textContent = `Updated ${new Date(repo.updated_at).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "short",
        day: "numeric"
      })}`;
      meta.appendChild(updated);

      const footer = document.createElement("div");
      footer.className = "project-footer";

      const repoLink = document.createElement("a");
      repoLink.href = repo.html_url;
      repoLink.target = "_blank";
      repoLink.rel = "noreferrer";
      repoLink.textContent = "Repository";

      footer.append(meta, repoLink);

      article.append(title, description, footer);
      els.projectsList.appendChild(article);
    });
  }

  async function fetchRepos() {
    if (!config.githubUsername) {
      renderStatus("GitHub username not configured.", "error-text");
      return;
    }

    const endpoint = `https://api.github.com/users/${encodeURIComponent(config.githubUsername)}/repos?sort=updated&per_page=100`;

    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/vnd.github+json"
        }
      });

      if (!response.ok) {
        throw new Error(`GitHub returned ${response.status}`);
      }

      const repos = await response.json();
      renderRepos(Array.isArray(repos) ? repos : []);
    } catch (error) {
      renderStatus(
        "Public repositories could not be loaded automatically. Use the GitHub profile link above instead.",
        "error-text"
      );
      console.error(error);
    }
  }

  applyThemeColor(config.themeColor);
  initialiseTheme();
  populateStaticContent();
  fetchRepos();
})();
