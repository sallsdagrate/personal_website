(function () {
  const config = window.SITE_CONFIG || {};

  const els = {
    brandName: document.getElementById("brand-name"),
    brandTagline: document.getElementById("brand-tagline"),
    heroName: document.getElementById("hero-name"),
    heroRole: document.getElementById("hero-role"),
    heroIntro: document.getElementById("hero-intro"),
    cvButton: document.getElementById("cv-button"),
    emailLink: document.getElementById("email-link"),
    linkedinLink: document.getElementById("linkedin-link"),
    githubLink: document.getElementById("github-link"),
    projectsProfileLink: document.getElementById("projects-profile-link"),
    projectsList: document.getElementById("projects-list"),
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
            .map(function (char) {
              return char + char;
            })
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

  function renderFocusAreas() {
    if (!els.focusPills || !Array.isArray(config.focusAreas)) return;

    els.focusPills.innerHTML = "";
    config.focusAreas.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item;
      els.focusPills.appendChild(li);
    });
  }

  function renderQuickFacts() {
    if (!els.signalGrid || !Array.isArray(config.quickFacts)) return;

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

  function populateStaticContent() {
    document.title = `${config.name || "CV"} | Resume`;

    setText(els.brandName, config.name);
    setText(els.brandTagline, config.tagline);
    setText(els.heroName, config.name);
    setText(els.heroRole, config.title);
    setText(els.heroIntro, config.intro);

    setLink(els.cvButton, config.cvPath, "Open CV");
    setLink(els.linkedinLink, config.linkedinUrl, "LinkedIn");
    setLink(els.githubLink, config.githubUrl, "GitHub");
    setLink(els.projectsProfileLink, config.githubUrl, "View profile");

    if (els.emailLink && config.email) {
      els.emailLink.href = `mailto:${config.email}`;
      els.emailLink.textContent = "Email";
    }

    renderFocusAreas();
    renderQuickFacts();
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
    const pinnedSet = new Set(
      pinned.map(function (name) {
        return name.toLowerCase();
      })
    );

    return repos.slice().sort(function (a, b) {
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

      const heading = document.createElement("div");
      heading.className = "project-heading";

      const title = document.createElement("h3");
      const titleLink = document.createElement("a");
      titleLink.href = repo.html_url;
      titleLink.target = "_blank";
      titleLink.rel = "noreferrer";
      titleLink.textContent = repo.name;
      title.appendChild(titleLink);

      const meta = document.createElement("p");
      meta.className = "project-meta";

      const metaParts = [];
      if (repo.language) metaParts.push(repo.language);
      metaParts.push(`${repo.stargazers_count} star${repo.stargazers_count === 1 ? "" : "s"}`);
      metaParts.push(
        `Updated ${new Date(repo.updated_at).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })}`
      );
      meta.textContent = metaParts.join("  •  ");

      heading.append(title, meta);

      const description = document.createElement("p");
      description.className = "project-description";
      description.textContent = repo.description || "Public repository with no description provided.";

      const footer = document.createElement("div");
      footer.className = "project-footer";

      const repoLink = document.createElement("a");
      repoLink.href = repo.html_url;
      repoLink.target = "_blank";
      repoLink.rel = "noreferrer";
      repoLink.textContent = "Repository";

      footer.appendChild(repoLink);

      article.append(heading, description, footer);
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
        "Public repositories could not be loaded automatically. Use the GitHub profile link instead.",
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
