/**
 * oddtranslator Installer - Frontend Engine
 */

let currentStep = 1;
const totalSteps = 5;
let isDbValidated = false;

// Custom Functional Purple Styled Icons
const eyeSVG = `<svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye text-purple-600"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10 12a2 2 0 1 0 4 0a2 2 0 0 0 -4 0" /><path d="M21 12c-2.4 4 -5.4 6 -9 6c-3.6 0 -6.6 -2 -9 -6c2.4 -4 5.4 -6 9 -6c3.6 0 6.6 2 9 6" /></svg>`;
const eyeOffSVG = `<svg xmlns="w3.org" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icon-tabler-eye-off text-purple-600"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M10.585 10.587a2 2 0 0 0 2.829 2.828" /><path d="M16.681 16.673a8.717 8.717 0 0 1 -4.681 1.327c-3.6 0 -6.6 -2 -9 -6c1.272 -2.12 2.712 -3.678 4.32 -4.674m2.86 -1.146a9.055 9.055 0 0 1 1.82 -.18c3.6 0 6.6 2 9 6c-.666 1.11 -1.379 2.067 -2.138 2.87" /><path d="M3 3l18 18" /></svg>`;

function showToast(message, type = 'error') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast px-6 py-4 rounded-2xl shadow-xl text-white font-medium flex items-center gap-3 ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
    toast.innerHTML = `<span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 4000);
}

function togglePasswordVisibility(inputId, btn) {
    const input = document.getElementById(inputId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = eyeOffSVG;
    } else {
        input.type = 'password';
        btn.innerHTML = eyeSVG;
    }
}

// Security Reset: Forces passwords to mask instantly on navigation
function resetPasswordVisibility() {
    ['admin_pass', 'admin_pass_confirm'].forEach(id => {
        const input = document.getElementById(id);
        if (input) input.type = 'password';
    });
    const buttons = document.querySelectorAll('#step-3 button[type="button"]');
    buttons.forEach(btn => btn.innerHTML = eyeSVG);
}

function updateProgress() {
    const percent = ((currentStep / totalSteps) * 100) + '%';
    document.getElementById('progress').style.width = percent;
}

function nextStep() {
    if (currentStep === 2 && !isDbValidated) {
        showToast('Please test and validate database configurations to continue.');
        return;
    }
    resetPasswordVisibility();
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep++;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    updateProgress();
}

function prevStep() {
    if (currentStep <= 1) return;
    resetPasswordVisibility();
    document.getElementById(`step-${currentStep}`).classList.remove('active');
    currentStep--;
    document.getElementById(`step-${currentStep}`).classList.add('active');
    updateProgress();
}

function checkPasswordStrength(password) {
    let score = 0;
    if (!password) return { score: 0, text: 'Enter a password', color: 'bg-slate-200' };
    if (password.length >= 6) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
        case 1: return { score, text: 'Weak', color: 'bg-rose-500' };
        case 2: return { score, text: 'Fair', color: 'bg-amber-500' };
        case 3: return { score, text: 'Good', color: 'bg-indigo-500' };
        case 4: return { score, text: 'Strong', color: 'bg-emerald-500' };
        default: return { score: 1, text: 'Weak', color: 'bg-rose-500' };
    }
}

function validateAdminStep() {
    // Structural Grooming: Remove dangerous trailing spaces before validation checks
    const email = document.getElementById('admin_email').value.trim();
    const pass = document.getElementById('admin_pass').value.trim();
    const confirmPass = document.getElementById('admin_pass_confirm').value.trim();
    const nextBtn = document.getElementById('admin-next-btn');
    const matchText = document.getElementById('match-text');

    // Real-Time Strength Meter Tracker
    const strength = checkPasswordStrength(pass);
    document.getElementById('strength-text').innerText = `Strength: ${strength.text}`;
    for (let i = 1; i <= 4; i++) {
        const bar = document.getElementById(`strength-bar-${i}`);
        if (i <= strength.score && pass.length > 0) {
            bar.className = `h-full w-1/4 ${strength.color} transition-colors duration-300`;
        } else {
            bar.className = 'h-full w-1/4 bg-slate-100 transition-colors duration-300';
        }
    }

    // Passwords Match Feedback Validation Block
    if (confirmPass.length > 0 && pass !== confirmPass) {
        matchText.classList.remove('hidden');
    } else {
        matchText.classList.add('hidden');
    }

    // Next step verification rule
    const isFormValid = email.includes('@') && strength.score >= 2 && pass === confirmPass;

    if (isFormValid) {
        nextBtn.disabled = false;
        nextBtn.className = "flex-1 bg-[#1E1E1E] text-white py-4 rounded-2xl text-lg font-semibold hover:bg-slate-800 transition";
    } else {
        nextBtn.disabled = true;
        nextBtn.className = "flex-1 bg-slate-200 text-slate-400 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed transition";
    }
}

function preparePreviewAndNext() {
    document.getElementById('preview_db_host').innerText = document.getElementById('db_host').value.trim();
    document.getElementById('preview_db_name').innerText = document.getElementById('db_name').value.trim();
    document.getElementById('preview_db_user').innerText = document.getElementById('db_user').value.trim();
    document.getElementById('preview_admin_email').innerText = document.getElementById('admin_email').value.trim();
    nextStep();
}

function testDatabase() {
    const formData = new FormData();
    formData.append('action', 'test_db');
    formData.append('install_token', document.getElementById('install_token').value); // Security Token
    formData.append('db_host', document.getElementById('db_host').value.trim());
    formData.append('db_name', document.getElementById('db_name').value.trim());
    formData.append('db_user', document.getElementById('db_user').value.trim());
    formData.append('db_pass', document.getElementById('db_pass').value);

    const nextBtn = document.getElementById('db-next-btn');

    fetch('installer.php', { method: 'POST', body: formData })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                showToast(data.message, 'success');
                isDbValidated = true;
                nextBtn.disabled = false;
                nextBtn.className = "flex-1 bg-[#1E1E1E] text-white py-4 rounded-2xl text-lg font-semibold hover:bg-slate-800 transition";
            } else {
                showToast(data.message, 'error');
                isDbValidated = false;
                nextBtn.disabled = true;
                nextBtn.className = "flex-1 bg-slate-200 text-slate-400 py-4 rounded-2xl text-lg font-semibold cursor-not-allowed transition";
            }
        })
        .catch(() => {
            showToast('Network error verifying connection settings.');
        });
}

function startInstallation() {
    const formData = new FormData();
    formData.append('action', 'install');
    formData.append('install_token', document.getElementById('install_token').value); // Security Token
    formData.append('db_host', document.getElementById('db_host').value.trim());
    formData.append('db_name', document.getElementById('db_name').value.trim());
    formData.append('db_user', document.getElementById('db_user').value.trim());
    formData.append('db_pass', document.getElementById('db_pass').value);
    formData.append('admin_email', document.getElementById('admin_email').value.trim());
    formData.append('admin_pass', document.getElementById('admin_pass').value.trim());

    const installBtn = document.getElementById('install-btn');
    installBtn.disabled = true;
    installBtn.innerText = "Installing Engine...";

    fetch('installer.php', { method: 'POST', body: formData })
        .then(res => {
            if (!res.ok) throw new Error('HTTP Server Issue');
            return res.json();
        })
        .then(data => {
            if (data.status === 'success') {
                document.getElementById(`step-${currentStep}`).classList.remove('active');
                currentStep = 5;
                document.getElementById(`step-${currentStep}`).classList.add('active');
                updateProgress();
            } else {
                showToast(data.message || 'Installation routine failed.');
                installBtn.disabled = false;
                installBtn.innerText = "Install Now";
            }
        })
        .catch(() => {
            showToast('Network processing error. Ensure server execution configuration limits match application scale.');
            installBtn.disabled = false;
            installBtn.innerText = "Install Now";
        });
}
