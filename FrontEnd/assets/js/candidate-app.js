document.addEventListener('DOMContentLoaded', () => {
    // Ensure the user is logged in
    if (!localStorage.getItem('jwt_token')) {
        window.location.href = 'login.html';
        return;
    }

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
            // The browser will automatically set it to 'multipart/form-data' with the correct boundary.
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
                <div class="card shadow-sm mb-3">
                    <div class="card-body">
                        <h5 class="card-title text-primary">${job.title}</h5>
                        <p class="card-text">${job.description}</p>
                        <p class="card-text"><small class="text-muted">Required: ${job.requiredSkills}</small></p>
                        <button class="btn btn-sm btn-success" onclick="openApplyModal(${job.id}, '${job.title}')">Apply Now</button>
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