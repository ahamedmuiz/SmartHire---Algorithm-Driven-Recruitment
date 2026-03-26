document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = 'login.html';
        return;
    }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user_role');
                window.location.href = 'login.html';
            }
        });
    }

    // Load initial data
    loadAvailableJobs();
    loadMyApplications();

    // Handle Application Submission (PDF Upload)
    const applyForm = document.getElementById('applyJobForm');
    if (applyForm) {
        applyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const submitBtn = document.getElementById('submitAppBtn');
            const originalBtnText = submitBtn.innerHTML;

            // Basic Frontend Validation
            const fileInput = document.getElementById('resumePdf');
            const file = fileInput.files[0];
            if (file.type !== 'application/pdf') {
                alert("Please upload a valid PDF document.");
                return;
            }

            // UX: Show loading state because PDF parsing takes a moment
            submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Processing AI Score...';
            submitBtn.disabled = true;

            const jobId = document.getElementById('applyJobId').value;
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jobId', jobId);

            fetch(`http://localhost:8080/api/applications/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to submit application. You may have already applied.');
                    alert('Success! Your application was submitted and scored.');

                    // Reset modal and refresh tracking list
                    const modal = bootstrap.Modal.getInstance(document.getElementById('applyJobModal'));
                    modal.hide();
                    applyForm.reset();
                    loadMyApplications(); // Dynamically update the sidebar
                })
                .catch(error => alert(error.message))
                .finally(() => {
                    // Restore button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
        });
    }
});

function loadAvailableJobs() {
    fetch('http://localhost:8080/api/jobs', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(jobs => {
            const jobsContainer = document.getElementById('availableJobsList');
            jobsContainer.innerHTML = '';

            if (jobs.length === 0) {
                jobsContainer.innerHTML = '<div class="alert alert-light border">No jobs are currently available. Check back later!</div>';
                return;
            }

            jobs.forEach(job => {
                const jobCard = `
            <div class="card feed-card shadow-sm mb-4 border-0">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold text-dark mb-0">${job.title}</h5>
                        <button class="btn btn-primary px-4 rounded-pill shadow-sm" onclick="openApplyModal(${job.id}, '${job.title}')">Apply Now</button>
                    </div>
                    <p class="card-text text-muted mb-3" style="font-size: 0.95rem;">${job.description}</p>
                    <div class="d-flex flex-wrap align-items-center">
                        <span class="text-secondary small fw-semibold me-2"><i class="bi bi-tools me-1"></i>Skills Required:</span>
                        ${job.requiredSkills.split(',').map(skill => `<span class="skill-badge">${skill.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>
            `;
                jobsContainer.innerHTML += jobCard;
            });
        })
        .catch(error => console.error('Error fetching jobs:', error));
}

function loadMyApplications() {
    fetch('http://localhost:8080/api/applications/my-applications', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }
    })
        .then(response => response.json())
        .then(applications => {
            const appList = document.getElementById('myApplicationsList');
            appList.innerHTML = '';

            if (applications.length === 0) {
                appList.innerHTML = '<li class="list-group-item bg-transparent text-muted px-0 border-0">You have not applied to any jobs yet.</li>';
                return;
            }

            applications.forEach(app => {
                // Determine styling based on status
                let badgeClass = 'bg-warning text-dark';
                let borderClass = 'pending';

                if (app.status === 'HIRED') {
                    badgeClass = 'bg-success';
                    borderClass = 'hired';
                } else if (app.status === 'REJECTED') {
                    badgeClass = 'bg-danger';
                    borderClass = 'rejected';
                }

                const listItem = `
            <li class="list-group-item bg-white shadow-sm app-list-item ${borderClass} py-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark text-truncate" style="max-width: 60%;">${app.jobTitle}</span>
                    <span class="badge ${badgeClass}">${app.status}</span>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted"><i class="bi bi-cpu me-1"></i>Algorithm Score:</small>
                    <span class="fw-bold text-primary">${app.matchScore}% Match</span>
                </div>
            </li>
            `;
                appList.innerHTML += listItem;
            });
        })
        .catch(error => console.error('Error fetching applications:', error));
}

function openApplyModal(jobId, jobTitle) {
    document.getElementById('applyJobId').value = jobId;
    document.getElementById('modalJobTitle').innerText = jobTitle;

    // Reset file input in case they closed it previously
    document.getElementById('applyJobForm').reset();

    const applyModal = new bootstrap.Modal(document.getElementById('applyJobModal'));
    applyModal.show();
}