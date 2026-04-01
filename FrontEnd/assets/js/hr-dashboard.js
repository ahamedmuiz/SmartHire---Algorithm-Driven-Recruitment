let currentClientJobs = [];
let currentViewingJobId = null;

function hideModalSafe(modalId) {
    const modalEl = document.getElementById(modalId);
    const modalInstance = bootstrap.Modal.getInstance(modalEl) || new bootstrap.Modal(modalEl);
    modalInstance.hide();
}

function escapeHtml(str) {
    return (str || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
}

document.addEventListener('DOMContentLoaded', () => {
    if (!localStorage.getItem('jwt_token') || localStorage.getItem('user_role') !== 'ROLE_HR') {
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

    loadHRJobs();

    // Create Job
    document.getElementById('createJobForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const payload = {
            title: document.getElementById('jobTitle').value,
            description: document.getElementById('jobDesc').value,
            requiredSkills: document.getElementById('jobSkills').value
        };

        fetch('http://localhost:8080/api/jobs', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(() => {
                alert('Job posted successfully!');
                hideModalSafe('createJobModal');
                document.getElementById('createJobForm').reset();
                loadHRJobs();
            });
    });

    // Edit Job
    document.getElementById('editJobForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        const jobId = document.getElementById('editJobId').value;
        const payload = {
            title: document.getElementById('editJobTitle').value,
            description: document.getElementById('editJobDesc').value,
            requiredSkills: document.getElementById('editJobSkills').value
        };

        fetch(`http://localhost:8080/api/jobs/${jobId}`, {
            method: 'PUT',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwt_token'),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(() => {
                alert('Job updated successfully!');
                hideModalSafe('editJobModal');
                loadHRJobs();
            });
    });
});

function loadHRJobs() {
    fetch('http://localhost:8080/api/jobs/my-jobs', {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
    })
        .then(response => response.json())
        .then(jobs => {
            currentClientJobs = jobs;
            const jobsContainer = document.getElementById('jobPostingsList');
            jobsContainer.innerHTML = '';

            if (jobs.length === 0) {
                jobsContainer.innerHTML = '<p class="text-muted text-center w-100 py-3">You have not posted any jobs yet.</p>';
                return;
            }

            jobs.forEach(job => {
                const jobCard = `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card job-card h-100 shadow-sm">
                    <div class="card-body d-flex flex-column">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title fw-bold text-dark mb-0">${job.title}</h5>
                            <div>
                                <button class="btn btn-sm btn-light text-primary border shadow-sm me-1" onclick="openEditModal(${job.id})" title="Edit Job"><i class="bi bi-pencil-square"></i></button>
                                <button class="btn btn-sm btn-light text-danger border shadow-sm" onclick="deleteJob(${job.id})" title="Delete Job"><i class="bi bi-trash"></i></button>
                            </div>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${job.description.substring(0, 100)}...</p>
                        <button class="btn btn-outline-primary w-100 mt-3 fw-semibold" onclick="loadRankedApplicants(${job.id})">
                            <i class="bi bi-people-fill me-1"></i> View Applicants
                        </button>
                    </div>
                </div>
            </div>`;
                jobsContainer.innerHTML += jobCard;
            });
        });
}

function openEditModal(jobId) {
    const job = currentClientJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('editJobId').value = job.id;
        document.getElementById('editJobTitle').value = job.title;
        document.getElementById('editJobSkills').value = job.requiredSkills;
        document.getElementById('editJobDesc').value = job.description;
        new bootstrap.Modal(document.getElementById('editJobModal')).show();
    }
}

function deleteJob(jobId) {
    if (confirm("Are you sure you want to delete this job posting? This will also permanently delete all applications associated with it.")) {
        fetch(`http://localhost:8080/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
        })
            .then(() => {
                alert('Job deleted successfully!');
                loadHRJobs();
                document.getElementById('applicantTableBody').innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4 bg-transparent shadow-none">Waiting for selection...</td></tr>';
            });
    }
}

function loadRankedApplicants(jobId) {
    currentViewingJobId = jobId;
    fetch(`http://localhost:8080/api/applications/job/${jobId}`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
    })
        .then(response => response.json())
        .then(applicants => {
            const tbody = document.getElementById('applicantTableBody');
            tbody.innerHTML = '';

            if (applicants.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4">No applications received yet.</td></tr>';
                return;
            }

            applicants.forEach(app => {
                const scoreClass = app.matchScore > 75 ? 'text-success fw-bold' : '';

                let actionButtons = '';
                if (app.status === 'PENDING') {
                    actionButtons = `
                    <button class="btn btn-success btn-sm shadow-sm" onclick="updateStatus(${app.id}, 'HIRED')"><i class="bi bi-check-lg"></i> Hire</button>
                    <button class="btn btn-danger btn-sm shadow-sm ms-1" onclick="updateStatus(${app.id}, 'REJECTED')"><i class="bi bi-x-lg"></i> Reject</button>
                `;
                } else {
                    actionButtons = `<span class="text-muted small fw-bold"><i class="bi bi-lock-fill"></i> Locked</span>`;
                }

                const row = `
            <tr>
                <td><i class="bi bi-person-circle text-muted me-2"></i>${app.candidateName}</td>
                <td>
                    ${app.jobTitle}
                    <button class="btn btn-link btn-sm text-danger fw-bold text-decoration-none ms-2" onclick="downloadResume(${app.id})" title="Download PDF Resume">
                        <i class="bi bi-file-earmark-pdf-fill"></i> PDF
                    </button>
                </td>
                <td class="${scoreClass}">${app.matchScore}%</td>
                <td><span class="badge ${app.status === 'PENDING' ? 'bg-warning text-dark' : (app.status === 'HIRED' ? 'bg-success' : 'bg-danger')}">${app.status}</span></td>
                <td class="text-end">${actionButtons}</td>
            </tr>`;
                tbody.innerHTML += row;
            });
        });
}

function updateStatus(applicationId, newStatus) {
    if(confirm(`Are you sure you want to mark this candidate as ${newStatus}? This action cannot be undone.`)) {
        fetch(`http://localhost:8080/api/applications/${applicationId}/status?status=${newStatus}`, {
            method: 'PUT',
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
        })
            .then(() => {
                alert(`Candidate marked as ${newStatus}.`);
                if(currentViewingJobId) loadRankedApplicants(currentViewingJobId);
            });
    }
}

function downloadResume(applicationId) {
    fetch(`http://localhost:8080/api/applications/${applicationId}/download`, {
        headers: { 'Authorization': 'Bearer ' + localStorage.getItem('jwt_token') }
    })
        .then(response => {
            if(!response.ok) throw new Error("Could not download file.");
            return response.blob();
        })
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `resume_application_${applicationId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        })
        .catch(err => alert(err.message));
}