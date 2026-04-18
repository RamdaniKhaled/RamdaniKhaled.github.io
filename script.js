// Global data storage
let siteData = null;

// Fetch and load data
async function loadData() {
    try {
        const response = await fetch('./data.json');
        siteData = await response.json();
        return siteData;
    } catch (error) {
        console.error('Error loading data:', error);
        return null;
    }
}

// Navigation setup
function setupNavigation() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.style.borderColor = 'rgba(99, 102, 241, 0.8)';
            link.style.background = 'rgba(99, 102, 241, 0.15)';
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

// Render experience timeline
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

// Render projects
function renderProjects() {
    if (!siteData) return;
    
    const container = document.querySelector('.projects-grid');
    if (!container) return;
    
    container.innerHTML = siteData.projects.map(project => `
        <div class="project-card">
            <div class="project-header">
                <h3>${project.emoji} ${project.title}</h3>
            </div>
            <div class="project-content">
                <p><strong>Durée:</strong> ${project.duration}</p>
                <p>${project.description}</p>
                <div class="project-tags">
                    ${project.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
            </div>
        </div>
    `).join('');
}

// Render skills
function renderSkills() {
    if (!siteData) return;
    
    const container = document.querySelector('.skills-grid');
    if (!container) return;
    
    const skillsData = siteData.skills;
    container.innerHTML = Object.values(skillsData).map(skillCategory => `
        <div class="skill-card">
            <h3>${skillCategory.title}</h3>
            <ul>
                ${skillCategory.items.map(item => `<li>${item}</li>`).join('')}
            </ul>
        </div>
    `).join('');
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
                    <h3>${project.emoji} ${project.title}</h3>
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

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    setupNavigation();
    
    // Only render on the homepage
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        renderProfileHeader();
        renderStats();
    }
    
    // Render sections if they exist
    renderExperience();
    renderProjects();
    renderSkills();
    renderDetailedProjects();
});

// Update profile links
function updateContactLinks() {
    if (!siteData) return;
    
    const profile = siteData.profile;
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    const githubLinks = document.querySelectorAll('a[href*="github"]');
    const linkedinLinks = document.querySelectorAll('a[href*="linkedin"]');
    
    emailLinks.forEach(link => {
        link.href = `mailto:${profile.email}`;
        link.textContent = profile.email;
    });
    
    githubLinks.forEach(link => {
        link.href = profile.github;
        link.textContent = 'RamdaniKhaled';
    });
    
    linkedinLinks.forEach(link => {
        link.href = profile.linkedin;
        link.textContent = 'Ramdani Khaled';
    });
}

// Re-run this after loading data
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateContactLinks, 100);
});
