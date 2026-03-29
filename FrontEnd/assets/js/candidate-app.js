function hideModalSafe(modalId) {
    const modalEl = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
}

function escapeHtml(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
    // SECURITY: Ensure correct user role is on this page
    if (!localStorage.getItem('jwt_token') || localStorage.getItem('user_role') !== 'ROLE_CANDIDATE') {
        window.location.href = 'login.html';
        return;
    }

    document.getElementById('logoutBtn')?.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('jwt_token');
            localStorage.removeItem('user_role');
            window.location.href = 'login.html';
        }
    });

    // Profile Logic
    document.getElementById('profileModal')?.addEventListener('show.bs.modal', function () {
        fetch('http://localhost:8080/api/users/profile', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
        })
            .then(res => res.json())
            .then(data => {
                document.getElementById('profileEmail').value = data.email;
                document.getElementById('profileName').value = data.fullName;
            });
    });

    document.getElementById('profileForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const payload = {
            fullName: document.getElementById('profileName').value,
            password: document.getElementById('profilePassword').value
        };
        fetch('http://localhost:8080/api/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        }).then(() => {
            alert('Profile updated successfully!');
            hideModalSafe('profileModal');
            document.getElementById('profilePassword').value = '';
        });
    });

    loadAvailableJobs();
    loadMyApplications();

    // Apply Job Submit
    document.getElementById('applyJobForm')?.addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitAppBtn');
        const originalBtnText = submitBtn.innerHTML;
        const fileInput = document.getElementById('resumePdf');
        const file = fileInput.files[0];

        if (file.type !== 'application/pdf') {
            alert("Please upload a valid PDF document.");
            return;
        }

        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Processing AI Score...';
        submitBtn.disabled = true;

        const jobId = document.getElementById('applyJobId').value;
        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', jobId);

        fetch(`http://localhost:8080/api/applications/apply`, {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') },
            body: formData
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to submit application. You may have already applied.');
                alert('Success! Your application was submitted and scored.');
                hideModalSafe('applyJobModal');
                document.getElementById('applyJobForm').reset();
                loadMyApplications();
            })
            .catch(error => alert(error.message))
            .finally(() => {
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
    });
});

function loadAvailableJobs() {
    fetch('http://localhost:8080/api/jobs', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
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
                // Null check for skills array
                const skillsArray = job.requiredSkills ? job.requiredSkills.split(',') : [];

                const jobCard = `
            <div class="card feed-card shadow-sm mb-4 border-0">
                <div class="card-body p-4">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <h5 class="card-title fw-bold text-dark mb-0">${job.title}</h5>
                        <button class="btn btn-primary px-4 rounded-pill shadow-sm" onclick="openApplyModal(${job.id}, '${escapeHtml(job.title)}')">Apply Now</button>
                    </div>
                    <p class="card-text text-muted mb-3" style="font-size: 0.95rem;">${job.description}</p>
                    <div class="d-flex flex-wrap align-items-center">
                        <span class="text-secondary small fw-semibold me-2"><i class="bi bi-tools me-1"></i>Skills:</span>
                        ${skillsArray.map(skill => `<span class="skill-badge">${skill.trim()}</span>`).join('')}
                    </div>
                </div>
            </div>`;
                jobsContainer.innerHTML += jobCard;
            });
        });
}

function loadMyApplications() {
    fetch('http://localhost:8080/api/applications/my-applications', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
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
                let badgeClass = 'bg-warning text-dark';
                let borderClass = 'pending';
                let withdrawBtn = '';

                if (app.status === 'HIRED') { badgeClass = 'bg-success'; borderClass = 'hired'; }
                else if (app.status === 'REJECTED') { badgeClass = 'bg-danger'; borderClass = 'rejected'; }
                else {
                    withdrawBtn = `<button class="btn btn-sm btn-outline-danger py-0 px-2" onclick="withdrawApplication(${app.id})" title="Withdraw Application"><i class="bi bi-trash"></i></button>`;
                }

                const listItem = `
            <li class="list-group-item bg-white shadow-sm app-list-item ${borderClass} py-3">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="fw-bold text-dark text-truncate" style="max-width: 60%;">${app.jobTitle}</span>
                    <div>${withdrawBtn} <span class="badge ${badgeClass} ms-1">${app.status}</span></div>
                </div>
                <div class="d-flex justify-content-between align-items-center mt-2">
                    <small class="text-muted"><i class="bi bi-cpu me-1"></i>Algorithm Score:</small>
                    <span class="fw-bold text-primary">${app.matchScore}% Match</span>
                </div>
            </li>`;
                appList.innerHTML += listItem;
            });
        });
}

function withdrawApplication(applicationId) {
    if(confirm("Are you sure you want to withdraw your application? This cannot be undone.")) {
        fetch(`http://localhost:8080/api/applications/${applicationId}/withdraw`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
        })
            .then(() => {
                alert('Application withdrawn successfully.');
                loadMyApplications();
            });
    }
}

function openApplyModal(jobId, jobTitle) {
    document.getElementById('applyJobId').value = jobId;
    document.getElementById('modalJobTitle').innerText = jobTitle;
    document.getElementById('applyJobForm').reset();
    new bootstrap.Modal(document.getElementById('applyJobModal')).show();
}