const token = localStorage.getItem('jwt_token');
const userRole = localStorage.getItem('user_role');

if (!token || userRole !== 'ROLE_CANDIDATE') {
    window.location.href = 'login.html';
}

let allJobs = [];
let myApps = [];
let currentSelectedJobId = null;

function showToast(message, type = 'success') {
    const toastEl = document.getElementById('liveToast');
    const toastMessage = document.getElementById('toastMessage');
    toastEl.className = `toast align-items-center text-white border-0 bg-${type}`;
    toastMessage.innerText = message;
    bootstrap.Toast.getOrCreateInstance(toastEl).show();
}

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardData();

    document.getElementById('logoutBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to log out?")) {
            localStorage.clear();
            window.location.href = 'login.html';
        }
    });

    document.getElementById('applyJobForm').addEventListener('submit', function(e) {
        e.preventDefault();

        const file = document.getElementById('resumePdf').files[0];
        if (!file || file.type !== 'application/pdf') {
            showToast("Please upload a valid PDF document.", "danger");
            return;
        }

        const btn = document.getElementById('submitAppBtn');
        const originalText = btn.innerText;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';

        const formData = new FormData();
        formData.append('resume', file);
        formData.append('jobId', document.getElementById('applyJobId').value);

        fetch('http://localhost:8080/api/applications/apply', {
            method: 'POST',
            headers: { 'Authorization': 'Bearer ' + token },
            body: formData
        })
            .then(async res => {
                if (!res.ok) {
                    const errTxt = await res.text();
                    throw new Error(errTxt || 'Failed to apply.');
                }
                return res.text();
            })
            .then(msg => {
                showToast('Application submitted successfully!', 'success');
                bootstrap.Modal.getInstance(document.getElementById('applyJobModal')).hide();
                document.getElementById('applyJobForm').reset();

                loadDashboardData();
            })
            .catch(err => showToast(err.message, 'danger'))
            .finally(() => {
                btn.disabled = false;
                btn.innerText = originalText;
            });
    });
});

function loadDashboardData() {
    Promise.all([
        fetch('http://localhost:8080/api/jobs', { headers: { 'Authorization': 'Bearer ' + token } }).then(res => res.json()),
        fetch('http://localhost:8080/api/applications/my-applications', { headers: { 'Authorization': 'Bearer ' + token } }).then(res => res.json())
    ])
        .then(([jobs, apps]) => {
            allJobs = jobs;
            myApps = apps;

            renderJobs(allJobs);
            renderApplications(myApps);

            updateModalButtonState();
        })
        .catch(err => {
            console.error(err);
            showToast("Error connecting to server.", "danger");
        });
}

function renderJobs(jobsToRender) {
    const container = document.getElementById('availableJobsList');
    container.innerHTML = '';

    if (!jobsToRender.length) {
        container.innerHTML = '<div class="alert alert-light text-center fw-bold mt-4 border-0 shadow-sm text-muted">No jobs found matching your criteria.</div>';
        return;
    }

    jobsToRender.forEach(job => {
        const activeApp = myApps.find(app => app.jobId === job.id && app.status !== 'WITHDRAWN');
        const badgeHtml = activeApp ? `<div class="applied-badge"><i class="bi bi-check-circle-fill me-1"></i>Applied</div>` : '';

        const skills = (job.requiredSkills || '').split(',').map(s => `<span class="skill-badge">${s.trim()}</span>`).join('');
        container.innerHTML += `
        <div class="feed-card mb-4" onclick="viewJobDetails(${job.id})">
            ${badgeHtml}
            <h5 class="fw-bold mb-1" style="color: #2f3542;">${job.title}</h5>
            <p class="small fw-bold mb-2" style="color: #9c88ff;">
                <i class="bi bi-building me-1"></i> ${job.companyName || 'Confidential'} 
                <span class="text-muted fw-semibold ms-2"><i class="bi bi-geo-alt me-1"></i> ${job.location || 'Anywhere'}</span>
            </p>
            <p class="text-muted fw-semibold small mb-3">${(job.description || '').substring(0, 150)}...</p>
            <div>${skills}</div>
        </div>`;
    });
}

function renderApplications(apps) {
    const list = document.getElementById('myApplicationsList');
    list.innerHTML = '';

    if (!apps.length) {
        list.innerHTML = '<div class="p-4 text-center text-muted fw-bold">You haven\'t applied to any jobs yet.</div>';
        return;
    }

    apps.forEach(app => {
        let badgeClass = 'bg-secondary';
        if(app.status === 'APPLIED') badgeClass = 'bg-primary';
        if(app.status === 'SCREENING') badgeClass = 'bg-info text-dark';
        if(app.status === 'SHORTLISTED') badgeClass = 'bg-warning text-dark';
        if(app.status === 'HIRED') badgeClass = 'bg-success';
        if(app.status === 'REJECTED') badgeClass = 'bg-danger';

        const withdrawBtn = ['APPLIED', 'SCREENING'].includes(app.status)
            ? `<button class="btn btn-sm btn-light text-danger fw-bold border-0 p-0 mt-2" onclick="withdrawApp(${app.id})"><i class="bi bi-x-circle-fill me-1"></i>Withdraw</button>`
            : '';

        list.innerHTML += `
        <div class="app-list-item d-flex justify-content-between align-items-start">
            <div>
                <h6 class="fw-bold text-dark mb-1">${app.jobTitle}</h6>
                ${withdrawBtn}
            </div>
            <span class="status-badge ${badgeClass}">${app.status}</span>
        </div>`;
    });
}

function clearFilter() {
    document.getElementById('searchInput').value = '';
    document.getElementById('typeFilter').value = '';
    renderJobs(allJobs);
}

function filterJobs() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const type = document.getElementById('typeFilter').value;

    const filtered = allJobs.filter(job => {
        const matchSearch = (job.title + (job.requiredSkills||'') + (job.companyName||'')).toLowerCase().includes(search);
        const matchType = type ? job.jobType === type : true;
        return matchSearch && matchType;
    });
    renderJobs(filtered);
}

function viewJobDetails(jobId) {
    const job = allJobs.find(j => j.id === jobId);
    if (!job) return;

    currentSelectedJobId = jobId;

    document.getElementById('detailTitle').innerText = job.title;
    document.getElementById('detailCompany').innerText = job.companyName || 'Confidential';
    document.getElementById('detailLocation').innerText = job.location || 'Remote';
    document.getElementById('detailType').innerText = job.jobType || 'Full Time';
    document.getElementById('detailSalary').innerText = job.salaryRange || 'Not Disclosed';
    document.getElementById('detailExp').innerText = (job.experience || 'Entry') + ' exp';

    document.getElementById('detailDesc').innerText = job.description;
    document.getElementById('detailResp').innerText = job.responsibilities || 'N/A';
    document.getElementById('detailReqs').innerText = job.requiredSkills;

    updateModalButtonState();

    bootstrap.Modal.getOrCreateInstance(document.getElementById('jobDetailsModal')).show();
}

function updateModalButtonState() {
    if(!currentSelectedJobId) return;

    const activeApp = myApps.find(app => app.jobId === currentSelectedJobId && app.status !== 'WITHDRAWN');
    const applyBtn = document.getElementById('modalApplyBtn');

    if (activeApp) {
        applyBtn.innerText = "Already Applied";
        applyBtn.className = "btn btn-secondary w-100 py-3 mt-2 shadow-sm fw-bold text-white opacity-75";
        applyBtn.disabled = true;
    } else {
        applyBtn.innerText = "Apply for this Job";
        applyBtn.className = "btn btn-primary-custom w-100 py-3 mt-2 shadow-sm";
        applyBtn.disabled = false;
    }
}

function openApplyModal() {
    bootstrap.Modal.getInstance(document.getElementById('jobDetailsModal')).hide();
    document.getElementById('applyJobId').value = currentSelectedJobId;
    document.getElementById('applyJobForm').reset();

    setTimeout(() => {
        bootstrap.Modal.getOrCreateInstance(document.getElementById('applyJobModal')).show();
    }, 200);
}

function withdrawApp(id) {
    if (confirm("Are you certain you want to withdraw your application? This action cannot be undone.")) {
        fetch(`http://localhost:8080/api/applications/${id}/withdraw`, {
            method: 'DELETE',
            headers: { 'Authorization': 'Bearer ' + token }
        })
            .then(() => {
                showToast('Application withdrawn successfully.', 'warning');
                loadDashboardData();
            })
            .catch(() => showToast('Error withdrawing application', 'danger'));
    }
}