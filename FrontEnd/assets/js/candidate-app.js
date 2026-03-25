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

    loadAvailableJobs();

    // Handle the Application Submission (PDF Upload)
    const applyForm = document.getElementById('applyJobForm');
    if (applyForm) {
        applyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const jobId = document.getElementById('applyJobId').value;
            const fileInput = document.getElementById('resumePdf');
            const file = fileInput.files[0];

            // Use FormData for MultipartFile uploads
            const formData = new FormData();
            formData.append('resume', file);
            formData.append('jobId', jobId);

            // Note: When using FormData, DO NOT set the 'Content-Type' header manually.
            fetch(`http://localhost:8080/api/applications/apply`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('jwt_token')
                },
                body: formData
            })
                .then(response => {
                    if (!response.ok) throw new Error('Failed to submit application');
                    alert('Application submitted successfully! Our algorithm is calculating your score.');

                    // Close the modal
                    const modal = bootstrap.Modal.getInstance(document.getElementById('applyJobModal'));
                    modal.hide();
                    applyForm.reset();
                })
                .catch(error => alert(error.message));
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
                <span class="text-secondary small fw-semibold me-2"><i class="bi bi-tools me-1"></i>Skills:</span>
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

// This function passes the job ID to the hidden input in the modal
function openApplyModal(jobId, jobTitle) {
    document.getElementById('applyJobId').value = jobId;
    document.getElementById('modalJobTitle').innerText = jobTitle;

    const applyModal = new bootstrap.Modal(document.getElementById('applyJobModal'));
    applyModal.show();
}