// Global data storage
let siteData = null;
let currentSortOrder = 'newest';
let currentTagFilter = 'all';

const PROJECT_FILTER_GROUPS = [
    { key: 'all', label: 'Tous' },
    { key: 'web', label: 'Web' },
    { key: 'backend', label: 'Backend & DB' },
    { key: 'network', label: 'Reseaux & Protocoles' },
    { key: 'security', label: 'Securite' },
    { key: 'systems', label: 'Systemes & Infra' }
];

const PROJECT_GROUP_TAGS = {
    web: ['HTML', 'CSS', 'JavaScript', 'Next.js', 'E-commerce', 'UI/UX'],
    backend: ['PHP', 'Node.js', 'TypeScript', 'SQL', 'Authentication', 'REST API', 'Database Design'],
    network: ['TCP/IP', 'FTP', '5G Core', 'NRF', 'Simulation', 'Cyber Threat Intelligence'],
    security: ['Security', 'AI Moderation', 'Content Moderation', 'Threat Analysis'],
    systems: ['VMware', 'Virtualization', 'Containers', 'Linux', 'Python', 'Java']
};

const MONTHS_MAP = {
    janvier: 1,
    january: 1,
    fevrier: 2,
    february: 2,
    mars: 3,
    march: 3,
    avril: 4,
    april: 4,
    mai: 5,
    may: 5,
    juin: 6,
    june: 6,
    juillet: 7,
    july: 7,
    aout: 8,
    august: 8,
    septembre: 9,
    september: 9,
    octobre: 10,
    october: 10,
    novembre: 11,
    november: 11,
    decembre: 12,
    december: 12
};

function normalizeMonthLabel(value) {
    if (!value) return '';
    return value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .trim();
}

function toSortKey(year, month) {
    const safeYear = Number.isFinite(year) ? year : 0;
    const safeMonth = Number.isFinite(month) ? month : 1;
    return safeYear * 100 + safeMonth;
}

function parseProjectSortKey(project) {
    if (!project) return 0;

    if (typeof project.startDate === 'string') {
        const startMatch = project.startDate.match(/^(\d{4})-(\d{2})$/);
        if (startMatch) {
            const year = parseInt(startMatch[1], 10);
            const month = parseInt(startMatch[2], 10);
            return toSortKey(year, month);
        }
    }

    if (typeof project.duration === 'string') {
        const normalizedDuration = normalizeMonthLabel(project.duration);
        const monthNames = Object.keys(MONTHS_MAP).join('|');
        const monthYearPattern = new RegExp(`\\b(${monthNames})\\b\\s*(\\d{4})`);
        const match = normalizedDuration.match(monthYearPattern);
        if (match) {
            const month = MONTHS_MAP[match[1]] || 1;
            const year = parseInt(match[2], 10);
            return toSortKey(year, month);
        }
    }

    if (typeof project.date === 'string') {
        const yearMatch = project.date.match(/(\d{4})/);
        if (yearMatch) {
            return toSortKey(parseInt(yearMatch[1], 10), 1);
        }
    }

    return 0;
}

// Fetch and load data
async function loadData() {
    try {
        const response = await fetch('./data.json');
        const rawData = await response.json();

        // Backward-compatible loader: supports old single JSON and new manifest split.
        if (rawData && rawData.sources) {
            const sectionEntries = Object.entries(rawData.sources);
            const sectionPromises = sectionEntries.map(async ([key, path]) => {
                const sectionResponse = await fetch(path);
                const sectionData = await sectionResponse.json();
                return [key, sectionData];
            });

            const sectionResults = await Promise.all(sectionPromises);
            siteData = Object.fromEntries(sectionResults);
        } else {
            siteData = rawData;
        }

        return siteData;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Mobile menu toggle
function setupMobileMenu() {
    const header = document.querySelector('header');
    const nav = header ? header.querySelector('nav') : null;

    if (!header || !nav) return;

    if (!header.querySelector('.site-brand')) {
        const brand = document.createElement('a');
        brand.href = 'index.html';
        brand.className = 'site-brand';
        brand.innerHTML = '<span class="site-brand-badge">KR</span><span class="site-brand-text"><span class="site-brand-name">Khaled Ramdani</span><span class="site-brand-role">Cloud &middot; DevOps &middot; Reseau Systems</span></span>';
        header.insertBefore(brand, header.firstChild);
    }

    let menuButton = header.querySelector('.hamburger');
    if (!menuButton) {
        menuButton = document.createElement('button');
        menuButton.type = 'button';
        menuButton.className = 'hamburger';
        menuButton.setAttribute('aria-label', 'Ouvrir le menu');
        menuButton.setAttribute('aria-expanded', 'false');
        menuButton.innerHTML = '<span></span><span></span><span></span>';
        header.appendChild(menuButton);
    }

    const closeMenu = () => {
        nav.classList.remove('active');
        menuButton.classList.remove('active');
        menuButton.setAttribute('aria-expanded', 'false');
    };

    menuButton.addEventListener('click', () => {
        const open = nav.classList.toggle('active');
        menuButton.classList.toggle('active', open);
        menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    nav.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', closeMenu);
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            closeMenu();
        }
    });
}

// Navigation setup
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('nav-active');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('nav-active');
        }
    });
}

function setupHeaderScrollState() {
    const header = document.querySelector('header');
    if (!header) return;

    const syncHeaderState = () => {
        header.classList.toggle('header-compact', window.scrollY > 24);
    };

    syncHeaderState();
    window.addEventListener('scroll', syncHeaderState, { passive: true });
}

function setupRevealAnimations() {
    const revealTargets = document.querySelectorAll(
        '.page-intro, .content-panel, .project-card, .project-detail-card, .skill-card, .skills-topic-card, .soft-trait-item, .interest-card, .stat-box, .timeline-item, .contact-link, .cv-panel'
    );

    if (!revealTargets.length) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const observerSupported = typeof IntersectionObserver !== 'undefined';

    revealTargets.forEach((element) => {
        if (prefersReducedMotion || !observerSupported) {
            element.classList.add('is-visible');
            return;
        }

        element.classList.add('reveal');

        // Ensure above-the-fold content is visible immediately.
        const rect = element.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.92) {
            element.classList.add('is-visible');
        }
    });

    if (prefersReducedMotion || !observerSupported) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.01,
        rootMargin: '0px 0px -10% 0px'
    });

    document.querySelectorAll('.reveal:not(.is-visible)').forEach((element) => observer.observe(element));
}

function setupCvInlinePreview() {
    const trigger = document.getElementById('loadCvInline');
    const frame = document.querySelector('.cv-embed[data-src]');
    if (!trigger || !frame) return;

    trigger.addEventListener('click', () => {
        if (frame.dataset.loaded === 'true') return;

        frame.src = frame.dataset.src;
        frame.dataset.loaded = 'true';
        trigger.disabled = true;
        trigger.classList.add('is-disabled');
        trigger.textContent = 'CV charge';
    });
}

function setupSkillsWowHover() {
    if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cards = document.querySelectorAll('.skills-page .skills-topic-card, .skills-page .soft-trait-item');
    if (!cards.length) return;

    cards.forEach((card) => {
        card.addEventListener('pointermove', (event) => {
            const rect = card.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            const px = (x / rect.width) * 100;
            const py = (y / rect.height) * 100;

            const rx = ((py - 50) / 50) * -2.8;
            const ry = ((px - 50) / 50) * 3.4;

            card.style.setProperty('--mx', `${px}%`);
            card.style.setProperty('--my', `${py}%`);
            card.style.transform = `translateY(-8px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.012)`;
        });

        card.addEventListener('pointerleave', () => {
            card.style.removeProperty('--mx');
            card.style.removeProperty('--my');
            card.style.removeProperty('transform');
        });
    });
}

// Render profile header
function renderProfileHeader() {
    if (!siteData) return;
    
    const profile = siteData.profile;
    const headerTitle = document.querySelector('.title');
    const headerSubtitle = document.querySelector('.subtitle');
    
    if (headerTitle) headerTitle.textContent = profile.title;
    if (headerSubtitle) headerSubtitle.textContent = profile.subtitle;
}

// Render education timeline
function renderEducation() {
    if (!siteData) return;
    
    const container = document.querySelector('.education-timeline');
    if (!container) return;
    
    container.innerHTML = siteData.education.map(edu => `
        <div class="timeline-item">
            <div class="year">${edu.year}</div>
            <h3>${edu.title}</h3>
            <p>${edu.description}</p>
        </div>
    `).join('');
}

// Render professional experience timeline
function renderExperience() {
    if (!siteData) return;
    
    const container = document.querySelector('.experience-timeline');
    if (!container) return;
    
    container.innerHTML = siteData.experience.map(exp => `
        <div class="timeline-item">
            <div class="year">${exp.year}</div>
            <h3>${exp.title}</h3>
            <p>${exp.description}</p>
        </div>
    `).join('');
}

// Sort projects
function sortProjects(order) {
    if (!siteData || !Array.isArray(siteData.projects)) return [];
    
    const sorted = [...siteData.projects];
    if (order === 'newest') {
        sorted.sort((a, b) => parseProjectSortKey(b) - parseProjectSortKey(a));
    } else if (order === 'oldest') {
        sorted.sort((a, b) => parseProjectSortKey(a) - parseProjectSortKey(b));
    }
    return sorted;
}

function getFilteredProjects(projects) {
    if (currentTagFilter === 'all') return projects;

    const groupTags = PROJECT_GROUP_TAGS[currentTagFilter] || [];
    return projects.filter(project =>
        Array.isArray(project.tags) && project.tags.some(tag => groupTags.includes(tag))
    );
}

// Render projects on home page (first 3)
function renderProjects() {
    if (!siteData) return;
    
    const container = document.querySelector('.projects-grid');
    if (!container) return;
    
    const projects = sortProjects('newest').slice(0, 3);
    
    container.innerHTML = projects.map(project => `
        <div class="project-card clickable" onclick="openProjectModal(${project.id})">
            <div class="project-header">
                <h3>${project.title}</h3>
            </div>
            <div class="project-content">
                <p><strong>${project.date}</strong> • ${project.duration}</p>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <span class="status-badge ${project.status}">${project.status === 'completed' ? 'Terminé' : 'En cours'}</span>
            </div>
        </div>
    `).join('');
}

// Render all projects with sorting
function renderAllProjects() {
    if (!siteData) return;
    
    const container = document.querySelector('.projects-grid');
    if (!container) return;
    
    const sortedProjects = sortProjects(currentSortOrder);
    const projects = getFilteredProjects(sortedProjects);
    
    container.innerHTML = projects.map(project => `
        <div class="project-card clickable" onclick="openProjectModal(${project.id})">
            <div class="project-header">
                <h3>${project.title}</h3>
            </div>
            <div class="project-content">
                <p><strong>${project.date}</strong> • ${project.duration}</p>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <span class="status-badge ${project.status}">${project.status === 'completed' ? 'Terminé' : 'En cours'}</span>
            </div>
        </div>
    `).join('');
}

// Open project modal
function openProjectModal(projectId) {
    if (!siteData) return;
    
    const project = siteData.projects.find(p => p.id === projectId);
    if (!project) return;
    
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    
    // Populate modal
    const modalHeader = modal.querySelector('.modal-header');
    const modalBody = modal.querySelector('.modal-body');
    
    modalHeader.innerHTML = `
        <h2>${project.title}</h2>
        <span class="modal-status ${project.status}">${project.status === 'completed' ? 'Terminé' : 'En cours'}</span>
        <button class="modal-close" onclick="closeProjectModal()">&times;</button>
    `;
    
    const images = Array.isArray(project.images)
        ? project.images
        : (project.image ? [project.image] : []);

    const imagesHtml = images.length
        ? images.map(img => `
            <div class="modal-image">
                <img src="${img}" alt="${project.title}">
            </div>
        `).join('')
        : '<p>Aucune image disponible pour ce projet.</p>';
    
    modalBody.innerHTML = `
        <div class="modal-gallery">
            ${imagesHtml}
        </div>
        <div class="modal-details">
            <div class="modal-detail-item">
                <label>Année</label>
                <p>${project.date}</p>
            </div>
            <div class="modal-detail-item">
                <label>Durée</label>
                <p>${project.duration}</p>
            </div>
        </div>
        <div class="modal-description">
            ${project.details}
        </div>
        <div class="modal-tags">
            ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
    `;
    
    modal.classList.add('active');
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    if (modal) {
        modal.classList.remove('active');
    }
}

// Setup sort buttons
function setupProjectSorting() {
    const newestBtn = document.getElementById('sortNewest');
    const oldestBtn = document.getElementById('sortOldest');
    
    if (newestBtn) {
        newestBtn.addEventListener('click', () => {
            currentSortOrder = 'newest';
            newestBtn.classList.add('active');
            if (oldestBtn) oldestBtn.classList.remove('active');
            renderAllProjects();
        });
    }
    
    if (oldestBtn) {
        oldestBtn.addEventListener('click', () => {
            currentSortOrder = 'oldest';
            oldestBtn.classList.add('active');
            if (newestBtn) newestBtn.classList.remove('active');
            renderAllProjects();
        });
    }
}

function setupProjectFilters() {
    if (!siteData || !Array.isArray(siteData.projects)) return;

    const filtersContainer = document.getElementById('projectFilters');
    if (!filtersContainer) return;

    const availableGroups = PROJECT_FILTER_GROUPS.filter(group => {
        if (group.key === 'all') return true;
        const groupTags = PROJECT_GROUP_TAGS[group.key] || [];
        return siteData.projects.some(project =>
            Array.isArray(project.tags) && project.tags.some(tag => groupTags.includes(tag))
        );
    });

    const filterButtonsHtml = availableGroups.map(group => {
        const count = group.key === 'all'
            ? siteData.projects.length
            : siteData.projects.filter(project =>
                Array.isArray(project.tags) && project.tags.some(tag => (PROJECT_GROUP_TAGS[group.key] || []).includes(tag))
            ).length;
        const activeClass = group.key === 'all' ? ' active' : '';
        return `<button class="filter-btn${activeClass}" data-filter="${group.key}">${group.label} (${count})</button>`;
    }).join('');

    filtersContainer.innerHTML = filterButtonsHtml;

    filtersContainer.querySelectorAll('.filter-btn').forEach(button => {
        button.addEventListener('click', () => {
            const selectedFilter = button.getAttribute('data-filter');
            if (!selectedFilter) return;

            currentTagFilter = selectedFilter;
            filtersContainer.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            renderAllProjects();
        });
    });
}

// Close modal when clicking outside
function setupModalClosing() {
    const modal = document.getElementById('projectModal');
    if (!modal) return;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });
}

// Render skills
function renderSkills() {
    if (!siteData) return;

    const renderSkillsStage = (container, stageData, variant) => {
        if (!container || !stageData) return;

        const categories = Object.values(stageData.categories || {});
        container.classList.add('skills-stage', `skills-stage-${variant}`);
        container.innerHTML = `
            <div class="skills-stage-head">
                <p class="skills-stage-kicker">${variant === 'learned' ? 'Maitrise' : 'Roadmap'}</p>
                <h3 class="skills-section-title">${stageData.title}</h3>
            </div>
            <div class="skills-categories-premium">
                ${categories.map(cat => `
                    <article class="skills-topic-card">
                        <div class="skills-topic-head">
                            <h4>${cat.title}</h4>
                            <span>${Array.isArray(cat.items) ? cat.items.length : 0} items</span>
                        </div>
                        <ul class="skills-topic-list">
                            ${(cat.items || []).map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </article>
                `).join('')}
            </div>
        `;
    };
    
    const learnedContainer = document.getElementById('learned-skills');
    if (learnedContainer && siteData.skills.learned) {
        renderSkillsStage(learnedContainer, siteData.skills.learned, 'learned');
    }
    
    const learningContainer = document.getElementById('learning-skills');
    if (learningContainer && siteData.skills.learning) {
        renderSkillsStage(learningContainer, siteData.skills.learning, 'learning');
    }
    
    const softContainer = document.getElementById('soft-skills');
    if (softContainer && siteData.skills.soft_skills) {
        const soft = siteData.skills.soft_skills;
        softContainer.classList.add('skills-stage', 'skills-stage-soft');
        softContainer.innerHTML = `
            <div class="skills-stage-head">
                <p class="skills-stage-kicker">People Skills</p>
                <h3 class="skills-section-title">${soft.title}</h3>
            </div>
            <div class="soft-traits-grid">
                ${soft.items.map(item => `
                    <article class="soft-trait-item">
                        <p>${item}</p>
                    </article>
                `).join('')}
            </div>
        `;
    }
}

// Render stats
function renderStats() {
    if (!siteData) return;
    
    const container = document.querySelector('.stats-container');
    if (!container) return;
    
    container.innerHTML = siteData.stats.map(stat => `
        <div class="stat-box">
            <div class="number">${stat.number}</div>
            <div class="label">${stat.label}</div>
        </div>
    `).join('');
}

function renderInterests() {
    if (!siteData || !siteData.interests) return;

    const interestsData = siteData.interests;
    const kicker = document.getElementById('interestsKicker');
    const title = document.getElementById('interestsTitle');
    const description = document.getElementById('interestsDescription');
    const grid = document.getElementById('interestsGrid');

    if (interestsData.intro) {
        if (kicker) kicker.textContent = interestsData.intro.kicker;
        if (title) title.textContent = interestsData.intro.title;
        if (description) description.textContent = interestsData.intro.description;
    }

    if (!grid || !Array.isArray(interestsData.items)) return;

    grid.innerHTML = interestsData.items.map((item) => `
        <article class="interest-card">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span>${Array.isArray(item.tags) ? item.tags.join(', ') : ''}</span>
        </article>
    `).join('');
}

function renderHomeInterestsPreview() {
    if (!siteData || !siteData.interests || !Array.isArray(siteData.interests.items)) return;

    const container = document.getElementById('interestsPreviewGrid');
    if (!container) return;

    const previewItems = siteData.interests.items.slice(0, 3);
    container.innerHTML = previewItems.map((item) => `
        <article class="interest-card">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <span>${Array.isArray(item.tags) ? item.tags.join(', ') : ''}</span>
        </article>
    `).join('');
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    
    setupMobileMenu();
    setupHeaderScrollState();
    setupNavigation();
    renderProfileHeader();
    renderStats();
    
    // Determine which page we're on and render appropriately
    const currentPage = window.location.pathname;
    
    if (currentPage.includes('projects.html')) {
        renderAllProjects();
    } else {
        renderProjects(); // Home page - 3 featured projects
    }
    
    renderEducation();
    renderExperience();
    renderSkills();
    renderInterests();
    renderHomeInterestsPreview();
    renderDetailedProjects();
    setupProjectSorting();
    setupProjectFilters();
    setupModalClosing();
    setupRevealAnimations();
    setupCvInlinePreview();
    setupSkillsWowHover();

    setTimeout(() => {
        updateContactLinks();
    }, 100);
});

// Render detailed projects page
function renderDetailedProjects() {
    if (!siteData) return;
    
    const container = document.querySelector('.projects-detailed-grid');
    if (!container) return;
    
    container.innerHTML = siteData.projects.map(project => {
        const imageBlock = project.image
            ? `
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-overlay">
                    <h3>${project.title}</h3>
                </div>
            </div>
            `
            : `
            <div class="project-image project-image-empty">
                <div class="project-overlay">
                    <h3>${project.title}</h3>
                    <p>Visuel bientot disponible</p>
                </div>
            </div>
            `;

        return `
        <div class="project-detail-card">
            ${imageBlock}
            <div class="project-detail-content">
                <h3>${project.title}</h3>
                <p class="duration"><strong>Durée:</strong> ${project.duration}</p>
                <p class="description">${project.description}</p>
                <p class="details">${project.details}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `;
    }).join('');
}

// Update profile links
function updateContactLinks() {
    if (!siteData) return;
    
    const profile = siteData.profile;
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const githubLinks = document.querySelectorAll('a[href*="github"]');
    const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');

    const isPlainTextLink = (link) => !link.querySelector('img') && !link.querySelector('h1, h2, h3, h4, h5, h6, p, div, span');
    
    emailLinks.forEach(link => {
        link.href = `mailto:${profile.email}`;
        if (isPlainTextLink(link)) {
            link.textContent = profile.email;
        }
    });
    
    githubLinks.forEach(link => {
        link.href = profile.github;
        if (isPlainTextLink(link)) {
            link.textContent = 'RamdaniKhaled';
        }
    });
    
    linkedinLinks.forEach(link => {
        link.href = profile.linkedin;
        if (isPlainTextLink(link)) {
            link.textContent = 'Ramdani Khaled';
        }
    });
}
