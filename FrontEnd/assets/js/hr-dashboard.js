const token = localStorage.getItem('jwt_token');
const userRole = localStorage.getItem('user_role');

if (!token || userRole !== 'ROLE_HR') {
    window.location.href = 'login.html';
}

let currentJobs = [];
let viewingJobId = null;

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');

    toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.innerText = message;

    const toast = new bootstrap.Toast(toastEl);
    toast.show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadHRJobs();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to log out of the HR Dashboard?")) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });

    document.getElementById('createJobForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const submitBtn = document.getElementById('submitJobBtn');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';

        const payload = {
            title: document.getElementById('jobTitle').value,
            companyName: document.getElementById('jobCompany').value,
            location: document.getElementById('jobLoc').value,
            jobType: document.getElementById('jobType').value,
            experience: document.getElementById('jobExp').value,
            salaryRange: document.getElementById('jobSal').value,
            requiredSkills: document.getElementById('jobSkills').value,
            description: document.getElementById('jobDesc').value,
            responsibilities: document.getElementById('jobResp').value,
            benefits: document.getElementById('jobBen').value,
        };

        fetch('http://localhost:8080/api/jobs', {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
            .then(async response => {
                if (!response.ok) {
                    const errText = await response.text();
                    throw new Error(errText || 'Failed to save job posting.');
                }
                return response.json();
            })
            .then(data => {
                showToast('Job posted successfully!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('createJobModal')).hide();
                document.getElementById('createJobForm').reset();
                loadHRJobs();
            })
            .catch(error => {
                showToast('Error: ' + error.message, 'danger');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerText = 'Publish Job';
            });
    });
});

function loadHRJobs() {
    fetch('http://localhost:8080/api/jobs/my-jobs', {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(jobs => {
            currentJobs = jobs;
            const container = document.getElementById('jobPostingsList');
            container.innerHTML = '';

            if (jobs.length === 0) {
                container.innerHTML = '<p class="text-muted w-100 text-center mt-3">You haven\'t posted any jobs yet.</p>';
                return;
            }

            jobs.forEach(job => {
                container.innerHTML += `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card job-card h-100 shadow-sm" onclick="loadApplicants(${job.id})">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <h5 class="fw-bold mb-1 text-truncate">${job.title}</h5>
                            <button class="btn btn-sm text-danger border-0 p-0" onclick="event.stopPropagation(); deleteJob(${job.id})"><i class="bi bi-trash"></i></button>
                        </div>
                        <p class="small text-muted mb-3">${job.location || 'Remote'} · ${job.jobType}</p>
                        
                        <div class="d-flex flex-wrap mt-auto">
                            <span class="stat-badge"><i class="bi bi-file-earmark me-1"></i>${job.applicationCount} Applied</span>
                            <span class="stat-badge text-warning"><i class="bi bi-star-fill me-1"></i>${job.shortlistedCount} Shortlist</span>
                            <span class="stat-badge text-success"><i class="bi bi-check-circle-fill me-1"></i>${job.hiredCount} Hired</span>
                        </div>
                    </div>
                </div>
            </div>`;
            });
        });
}

function deleteJob(id) {
    if(confirm("Are you sure? This will delete the job and all associated applications.")) {
        fetch(`http://localhost:8080/api/jobs/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(() => {
                showToast('Job deleted successfully', 'success');
                document.getElementById('applicantTableBody').innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Select a job above to view pipeline.</td></tr>';
                loadHRJobs();
            })
            .catch(() => showToast('Failed to delete job', 'danger'));
    }
}

function loadApplicants(jobId) {
    viewingJobId = jobId;
    fetch(`http://localhost:8080/api/applications/job/${jobId}`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.json())
        .then(apps => {
            const tbody = document.getElementById('applicantTableBody');
            tbody.innerHTML = '';
            if(!apps.length) return tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">No applicants yet.</td></tr>';

            apps.forEach(app => {
                const actions = app.status === 'WITHDRAWN' ? `<span class="badge bg-secondary">Candidate Withdrew</span>` : `
            <select class="form-select form-select-sm d-inline-block w-auto" onchange="updateStatus(${app.id}, this.value)">
                <option value="APPLIED" ${app.status==='APPLIED'?'selected':''}>Applied</option>
                <option value="SCREENING" ${app.status==='SCREENING'?'selected':''}>Screening</option>
                <option value="SHORTLISTED" ${app.status==='SHORTLISTED'?'selected':''}>Shortlisted</option>
                <option value="HIRED" ${app.status==='HIRED'?'selected':''}>Hired</option>
                <option value="REJECTED" ${app.status==='REJECTED'?'selected':''}>Rejected</option>
            </select>
            <button class="btn btn-sm btn-light ms-1 border" onclick="downloadResume(${app.id})" title="Download PDF"><i class="bi bi-download text-primary"></i></button>`;

                tbody.innerHTML += `
            <tr>
                <td class="fw-bold"><i class="bi bi-person-circle text-muted me-2"></i>${app.candidateName}</td>
                <td><span class="badge bg-primary fs-6">${app.matchScore}%</span></td>
                <td><span class="badge bg-dark">${app.status}</span></td>
                <td class="text-end">${actions}</td>
            </tr>`;
            });
        });
}

function updateStatus(id, newStatus) {
    if (confirm(`Change this candidate's status to ${newStatus}?`)) {
        fetch(`http://localhost:8080/api/applications/${id}/status?status=${newStatus}`, {
            method: 'PUT',
            headers: {'Authorization': 'Bearer ' + token}
        }).then(() => {
            showToast(`Status updated to ${newStatus}`, 'success');
            loadApplicants(viewingJobId);
            loadHRJobs();
        });
    } else {

        loadApplicants(viewingJobId);
    }
}

function downloadResume(id) {
    fetch(`http://localhost:8080/api/applications/${id}/download`, {
        headers: { 'Authorization': 'Bearer ' + token }
    })
        .then(res => res.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url; a.download = `resume_${id}.pdf`;
            document.body.appendChild(a); a.click(); a.remove();
        });
}