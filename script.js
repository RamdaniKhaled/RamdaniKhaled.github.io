// Global data storage
let siteData = null;
let currentSortOrder = 'newest';
let currentTagFilter = 'all';

const PROJECT_FILTER_GROUPS = [
    { key: 'all', label: 'Tous' },
    { key: 'cloud', label: 'Cloud' },
    { key: 'delivery', label: 'CI/CD & Auto' },
    { key: 'security', label: 'Sécurité' },
    { key: 'observability', label: 'Observabilité' },
    { key: 'infrastructure', label: 'Infrastructure' }
];

const PROJECT_GROUP_TAGS = {
    cloud: ['AWS', 'Cloud', 'Kubernetes', 'Migration', 'Terraform', 'IaC', 'Multi-env'],
    delivery: ['GitLab CI', 'Automation', 'Ansible', 'Bash', 'Python', 'Security Scan'],
    security: ['Linux Security', 'Compliance', 'Encryption', 'Audit'],
    observability: ['Monitoring', 'Prometheus', 'Grafana', 'Observabilité', 'ELK'],
    infrastructure: ['Docker', 'Production', 'Terraform', 'IaC', 'Kubernetes']
};

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

// Mobile menu toggle (disabled - hamburger removed from headers)
function setupMobileMenu() {
    // Menu system disabled - all pages now have simple navigation
    return;
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
        sorted.sort((a, b) => parseInt(b.date) - parseInt(a.date));
    } else if (order === 'oldest') {
        sorted.sort((a, b) => parseInt(a.date) - parseInt(b.date));
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
    
    const imagesHtml = project.images.map(img => `
        <div class="modal-image">
            <img src="${img}" alt="${project.title}">
        </div>
    `).join('');
    
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
    
    const learnedContainer = document.getElementById('learned-skills');
    if (learnedContainer && siteData.skills.learned) {
        const learned = siteData.skills.learned;
        learnedContainer.innerHTML = `
            <h3 class="skills-section-title">${learned.title}</h3>
            <div class="skills-categories">
                ${Object.values(learned.categories).map(cat => `
                    <div class="skill-card">
                        <h3>${cat.title}</h3>
                        <ul>
                            ${cat.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const learningContainer = document.getElementById('learning-skills');
    if (learningContainer && siteData.skills.learning) {
        const learning = siteData.skills.learning;
        learningContainer.innerHTML = `
            <h3 class="skills-section-title">${learning.title}</h3>
            <div class="skills-categories">
                ${Object.values(learning.categories).map(cat => `
                    <div class="skill-card">
                        <h3>${cat.title}</h3>
                        <ul>
                            ${cat.items.map(item => `<li>${item}</li>`).join('')}
                        </ul>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    const softContainer = document.getElementById('soft-skills');
    if (softContainer && siteData.skills.soft_skills) {
        const soft = siteData.skills.soft_skills;
        softContainer.innerHTML = `
            <h3 class="skills-section-title">${soft.title}</h3>
            <div class="soft-skills-grid">
                ${soft.items.map(item => `
                    <div class="soft-skill-item">
                        <p>${item}</p>
                    </div>
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
    setTimeout(updateContactLinks, 100);
});

// Render detailed projects page
function renderDetailedProjects() {
    if (!siteData) return;
    
    const container = document.querySelector('.projects-detailed-grid');
    if (!container) return;
    
    container.innerHTML = siteData.projects.map(project => `
        <div class="project-detail-card">
            <div class="project-image">
                <img src="${project.image}" alt="${project.title}">
                <div class="project-overlay">
                    <h3>${project.title}</h3>
                </div>
            </div>
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
    `).join('');
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
