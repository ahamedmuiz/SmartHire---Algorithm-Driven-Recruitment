let currentClientJobs = []; // Global array to store fetched jobs for editing

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

    loadHRJobs();

    // 1. Create Job Form Submission
    const createJobForm = document.getElementById('createJobForm');
    if (createJobForm) {
        createJobForm.addEventListener('submit', function(e) {
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
                .then(response => {
                    if (!response.ok) throw new Error('Failed to post job');
                    alert('Job posted successfully!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createJobModal'));
                    modal.hide();
                    createJobForm.reset();
                    loadHRJobs();
                })
                .catch(error => alert(error.message));
        });
    }

    // 2. Edit Job Form Submission
    const editJobForm = document.getElementById('editJobForm');
    if (editJobForm) {
        editJobForm.addEventListener('submit', function(e) {
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
                .then(response => {
                    if (!response.ok) throw new Error('Failed to update job');
                    alert('Job updated successfully!');
                    const modal = bootstrap.Modal.getInstance(document.getElementById('editJobModal'));
                    modal.hide();
                    loadHRJobs(); // Refresh the list
                })
                .catch(error => alert(error.message));
        });
    }
});

// Fetch ONLY the jobs posted by the logged-in user
function loadHRJobs() {
    fetch('http://localhost:8080/api/jobs/my-jobs', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }
    })
        .then(response => response.json())
        .then(jobs => {
            currentClientJobs = jobs; // Save them globally so we can access them for editing
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
                                <button class="btn btn-sm btn-light text-primary border shadow-sm me-1" onclick="openEditModal(${job.id})" title="Edit Job">
                                    <i class="bi bi-pencil-square"></i>
                                </button>
                                <button class="btn btn-sm btn-light text-danger border shadow-sm" onclick="deleteJob(${job.id})" title="Delete Job">
                                    <i class="bi bi-trash"></i>
                                </button>
                            </div>
                        </div>
                        <p class="card-text text-muted small flex-grow-1">${job.description.substring(0, 100)}...</p>
                        <button class="btn btn-outline-primary w-100 mt-3 fw-semibold" onclick="loadRankedApplicants(${job.id})">
                            <i class="bi bi-people-fill me-1"></i> View Applicants
                        </button>
                    </div>
                </div>
            </div>
            `;
                jobsContainer.innerHTML += jobCard;
            });
        })
        .catch(error => console.error('Error fetching jobs:', error));
}

// Opens the Edit Modal and populates it with existing data
function openEditModal(jobId) {
    const job = currentClientJobs.find(j => j.id === jobId);
    if (job) {
        document.getElementById('editJobId').value = job.id;
        document.getElementById('editJobTitle').value = job.title;
        document.getElementById('editJobSkills').value = job.requiredSkills;
        document.getElementById('editJobDesc').value = job.description;

        const modal = new bootstrap.Modal(document.getElementById('editJobModal'));
        modal.show();
    }
}

// 3. Delete Job Function
function deleteJob(jobId) {
    if (confirm("Are you sure you want to delete this job posting? This will also permanently delete all applications associated with it.")) {
        fetch(`http://localhost:8080/api/jobs/${jobId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
            }
        })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete job');
                alert('Job deleted successfully!');
                loadHRJobs(); // Refresh the list
                // Clear the applicant table in case they were viewing applicants for the deleted job
                document.getElementById('applicantTableBody').innerHTML = '<tr><td colspan="5" class="text-center text-muted py-4 bg-transparent shadow-none">Waiting for selection...</td></tr>';
            })
            .catch(error => alert(error.message));
    }
}

// Fetches applicants for a specific job
function loadRankedApplicants(jobId) {
    fetch(`http://localhost:8080/api/applications/job/${jobId}`, {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }
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
                const row = `
            <tr>
                <td><i class="bi bi-person-circle text-muted me-2"></i>${app.candidateName}</td>
                <td>${app.jobTitle}</td>
                <td class="${scoreClass}">${app.matchScore}%</td>
                <td><span class="badge ${app.status === 'PENDING' ? 'bg-warning text-dark' : (app.status === 'HIRED' ? 'bg-success' : 'bg-danger')}">${app.status}</span></td>
                <td class="text-end">
                    <button class="btn btn-success btn-sm shadow-sm" onclick="updateStatus(${app.id}, 'HIRED')"><i class="bi bi-check-lg"></i> Hire</button>
                    <button class="btn btn-danger btn-sm shadow-sm ms-1" onclick="updateStatus(${app.id}, 'REJECTED')"><i class="bi bi-x-lg"></i> Reject</button>
                </td>
            </tr>
            `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching applicants:', error));
}

function updateStatus(applicationId, newStatus) {
    fetch(`http://localhost:8080/api/applications/${applicationId}/status?status=${newStatus}`, {
        method: 'PUT',
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update status');
            alert(`Candidate marked as ${newStatus}. An email notification has been sent.`);
        })
        .catch(error => alert(error.message));
}