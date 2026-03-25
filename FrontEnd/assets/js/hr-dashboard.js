document.addEventListener('DOMContentLoaded', () => {
    // Ensure the user is logged in
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = 'login.html';
        return;
    }

    // --- LOGOUT LOGIC WITH CONFIRMATION ---
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user_role');
                window.location.href = 'login.html'; // Redirect back to login
            }
        });
    }
    // --------------------------------------

    loadHRJobs();

    // Handle Creating a New Job
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

                    // Close modal and refresh list
                    const modal = bootstrap.Modal.getInstance(document.getElementById('createJobModal'));
                    modal.hide();
                    createJobForm.reset();
                    loadHRJobs();
                })
                .catch(error => alert(error.message));
        });
    }
});

function loadHRJobs() {
    fetch('http://localhost:8080/api/jobs', {
        headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
        }
    })
        .then(response => response.json())
        .then(jobs => {
            const jobsContainer = document.getElementById('jobPostingsList');
            jobsContainer.innerHTML = '';

            jobs.forEach(job => {
                const jobCard = `
                <div class="col-md-4 mb-3">
                    <div class="card shadow-sm border-primary">
                        <div class="card-body">
                            <h5 class="card-title">${job.title}</h5>
                            <button class="btn btn-outline-primary btn-sm w-100 mt-2" onclick="loadRankedApplicants(${job.id})">View Applicants</button>
                        </div>
                    </div>
                </div>
            `;
                jobsContainer.innerHTML += jobCard;
            });
        })
        .catch(error => console.error('Error fetching jobs:', error));
}

// Fetches applicants for a specific job, assuming the backend sends them sorted by Match Score
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
                tbody.innerHTML = '<tr><td colspan="5" class="text-center text-muted">No applicants yet.</td></tr>';
                return;
            }

            applicants.forEach(app => {
                // Highlight high scores in green
                const scoreClass = app.matchScore > 75 ? 'text-success fw-bold' : '';

                const row = `
                <tr>
                    <td>${app.candidateName}</td>
                    <td>${app.jobTitle}</td>
                    <td class="${scoreClass}">${app.matchScore}%</td>
                    <td><span class="badge bg-secondary">${app.status}</span></td>
                    <td>
                        <button class="btn btn-success btn-sm" onclick="updateStatus(${app.id}, 'HIRED')">Hire</button>
                        <button class="btn btn-danger btn-sm" onclick="updateStatus(${app.id}, 'REJECTED')">Reject</button>
                    </td>
                </tr>
            `;
                tbody.innerHTML += row;
            });
        })
        .catch(error => console.error('Error fetching applicants:', error));
}

function updateStatus(applicationId, newStatus) {
    // Assuming you have an endpoint to update status that triggers the email notification
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