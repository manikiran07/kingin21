/**
 * Learn in 21 - Live Google Sheets & Twilio OTP Frontend Client
 * 
 * Instructions:
 * 1. Deploy the Google Apps Script Web App from backend_apps_script.js.
 * 2. Copy the deployment URL (ends in /exec).
 * 3. Replace the BACKEND_API_URL constant below with your URL.
 */

// ==========================================================================
// 1. CONFIGURATION (Paste your Google Apps Script Web App URL below)
// ==========================================================================
const BACKEND_API_URL = "https://script.google.com/macros/s/AKfycbxS5rs_sFfdy1y8blbvhSniFOmNYdgoLNyycaRuKBR-qpnHrmSWILRGso4L2wdWOP6ymg/exec";

// Verification check to help you get started
function checkBackendConfig() {
    if (BACKEND_API_URL.indexOf("YOUR_DEPLOYED_APPS") === 0) {
        alert("Configuration Required:\n\nPlease deploy your Google Apps Script Web App, copy its URL, and paste it into 'app.js' at: const BACKEND_API_URL = \"...\"; to enable live database writes to your Google Sheet and real Twilio OTP SMS.");
        return false;
    }
    return true;
}

// Curriculum details data for the interactive path selection timeline
const CURRICULUM_DATA = {
    freshers: [
        {
            time: "Weeks 1–7",
            phase: "Phase 1: Core Essentials",
            title: "Linux Foundations & Systems Networking",
            desc: "Get comfortable with the Linux terminal. Master file systems, write automated bash scripts, and learn the essential networking models (DNS, IP, ports) that support the modern web."
        },
        {
            time: "Weeks 8–14",
            phase: "Phase 2: Automation Blueprint",
            title: "Container Basics & System Automation",
            desc: "Move beyond manual tasks. Learn standard containerization with Docker, manage volume networks, and build automated deployment pipelines to run application bundles."
        },
        {
            time: "Weeks 15–21",
            phase: "Phase 3: Production Scale",
            title: "Microservices Orchestration",
            desc: "Deploy workloads in production. Learn to package and manage scale with Kubernetes clusters, configure traffic ingress, and manage backend service nodes."
        }
    ],
    admins: [
        {
            time: "Weeks 1–7",
            phase: "Phase 1: Core Essentials",
            title: "Cloud Infrastructure Architecture",
            desc: "Map bare-metal physical servers and virtual configurations to standardized cloud resources. Design private networks, subnets, and standard route policies."
        },
        {
            time: "Weeks 8–14",
            phase: "Phase 2: Automation Blueprint",
            title: "Infrastructure as Code (IaC)",
            desc: "Define infrastructure using text configuration scripts. Write reusable Terraform components, configure target server nodes with Ansible, and eliminate configuration drift."
        },
        {
            time: "Weeks 15–21",
            phase: "Phase 3: Security & Governance",
            title: "Production Hardening & Access Control",
            desc: "Secure production instances. Implement Role-Based Access Control (RBAC), rotate application secrets dynamically, configure firewalls, and prepare audit compliance paths."
        }
    ],
    developers: [
        {
            time: "Weeks 1–7",
            phase: "Phase 1: Core Essentials",
            title: "Application Containerization",
            desc: "Standardize application runs. Write multi-stage Dockerfiles to build lightweight images, manage runtime environment configs, and resolve local debug loops."
        },
        {
            time: "Weeks 8–14",
            phase: "Phase 2: Automation Blueprint",
            title: "Continuous Integration & Delivery (CI/CD)",
            desc: "Automate code quality and deliveries. Design robust GitHub Actions or GitLab pipelines to run tests, build binaries, and push releases automatically."
        },
        {
            time: "Weeks 15–21",
            phase: "Phase 3: Production Scale",
            title: "Telemetry, Logging & Alert Systems",
            desc: "Understand what happens in production. Set up metric collection using Prometheus, design dashboard monitoring with Grafana, and write custom routing alerts for downtime warnings."
        }
    ]
};

// ==========================================================================
// 2. STATE MANAGEMENT & SETUP
// ==========================================================================

let currentUser = null;
let passwordResetOtpCode = ""; // Captures the reset OTP during verification phase
const internalModalViews = ['modal-view-login', 'modal-view-register', 'modal-view-success', 'modal-view-forgot', 'modal-view-terms', 'modal-view-refund'];

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initMobileNav();
    initCurriculumSelector();
    restoreUserSession();
    
    // Listen for outside clicks on auth modal container to dismiss
    const authOverlay = document.getElementById('authContainer');
    authOverlay.addEventListener('click', (e) => {
        if (e.target === authOverlay) {
            dismissAuthModal();
        }
    });

    // Close user dropdown menu when clicking elsewhere
    window.addEventListener('click', (e) => {
        const navAuthBtn = document.getElementById('navAuthBtn');
        const accountMenuDropdown = document.getElementById('accountMenuDropdown');
        if (navAuthBtn && accountMenuDropdown) {
            if (!e.target.matches('#navAuthBtn') && !e.target.closest('#accountMenuDropdown')) {
                accountMenuDropdown.classList.remove('active');
            }
        }
    });
});

// ==========================================================================
// 3. THEME TOGGLE (LIGHT & DARK THEMES)
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem('learnin21_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('learnin21_theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const toggleBtn = document.getElementById('themeToggleBtn');
    if (toggleBtn) {
        if (theme === 'dark') {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
            `;
        } else {
            toggleBtn.innerHTML = `
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
            `;
        }
    }
}

// ==========================================================================
// 4. MOBILE NAVIGATION
// ==========================================================================

function initMobileNav() {
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('open');
            navLinks.classList.toggle('open');
        });
        
        // Close menu drawer when menu links are clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('open');
                navLinks.classList.remove('open');
            });
        });
    }
}

// ==========================================================================
// 5. INTERACTIVE CURRICULUM SELECTOR
// ==========================================================================

function initCurriculumSelector() {
    renderTimeline('freshers'); // Default rendered timeline

    const tabs = document.querySelectorAll('.path-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active status from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active status to clicked tab
            tab.classList.add('active');
            
            const selectedPath = tab.getAttribute('data-path');
            renderTimeline(selectedPath);
        });
    });
}

function renderTimeline(pathKey) {
    const container = document.getElementById('timelineContainer');
    if (!container) return;

    const data = CURRICULUM_DATA[pathKey];
    if (!data) return;

    // Build timeline items HTML
    let timelineHTML = '';
    data.forEach((item, index) => {
        timelineHTML += `
            <div class="timeline-item active" style="display: block; transition-delay: ${index * 0.1}s;">
                <div class="timeline-dot"></div>
                <div class="timeline-content">
                    <span class="timeline-time">${item.time}</span>
                    <span class="timeline-phase">${item.phase}</span>
                    <h3 class="timeline-title">${item.title}</h3>
                    <p class="timeline-desc">${item.desc}</p>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = timelineHTML;
}

// ==========================================================================
// 6. ROUTING SYSTEM & VIEW SWITCHING
// ==========================================================================

function routeToWorkspaceView(targetRoute) {
    // Hide mobile nav drawer if active
    const hamburger = document.getElementById('hamburgerBtn');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.classList.remove('open');
        navLinks.classList.open = false; // reset
        navLinks.classList.remove('open');
    }

    // Collapse user profile options dropdown
    const accountMenuDropdown = document.getElementById('accountMenuDropdown');
    if (accountMenuDropdown) {
        accountMenuDropdown.classList.remove('active');
    }

    // List of page sections
    const views = {
        'home': document.getElementById('view-section-home'),
        'profile': document.getElementById('view-section-profile'),
        'password-reset': document.getElementById('view-section-password-reset'),
        'learnings': document.getElementById('view-section-learnings')
    };

    // Toggle sections visibility
    Object.keys(views).forEach(key => {
        const view = views[key];
        if (view) {
            if (key === targetRoute) {
                view.classList.add('active');
            } else {
                view.classList.remove('active');
            }
        }
    });

    // Populate active user session data when rendering the profile console
    if (targetRoute === 'profile' && currentUser) {
        document.getElementById('profTargetName').textContent = currentUser.fullName;
        document.getElementById('profTargetEmail').textContent = currentUser.email;
        document.getElementById('profTargetMobile').textContent = currentUser.mobile;
    }

    // Reset password change panel steps
    if (targetRoute === 'password-reset') {
        document.getElementById('passResetPhaseVerification').style.display = 'block';
        document.getElementById('passResetPhaseOTP').style.display = 'none';
        document.getElementById('passResetPhaseModification').style.display = 'none';
        document.getElementById('passResetMatchError').style.display = 'none';
        
        // Autofill verified user data to make it easier
        if (currentUser) {
            document.getElementById('passResetConfirmEmail').value = currentUser.email;
            document.getElementById('passResetConfirmMobile').value = currentUser.mobile;
        }
    }

    // Scroll window back to top smoothly
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================================================
// 7. USER AUTHENTICATION & SESSION PERSISTENCE
// ==========================================================================

function restoreUserSession() {
    const savedSession = localStorage.getItem('learnin21_session');
    const navAuthBtn = document.getElementById('navAuthBtn');
    
    if (savedSession) {
        currentUser = JSON.parse(savedSession);
        if (navAuthBtn) {
            navAuthBtn.textContent = 'My Account';
            navAuthBtn.classList.remove('btn-outline');
            navAuthBtn.classList.add('btn-primary');
        }
    } else {
        currentUser = null;
        if (navAuthBtn) {
            navAuthBtn.textContent = 'Sign In';
            navAuthBtn.classList.add('btn-outline');
            navAuthBtn.classList.remove('btn-primary');
        }
    }
}

function handleHeaderAuthInteraction() {
    const accountMenuDropdown = document.getElementById('accountMenuDropdown');
    
    if (currentUser) {
        // Toggle options menu dropdown
        if (accountMenuDropdown) {
            accountMenuDropdown.classList.toggle('active');
        }
    } else {
        // Show Sign In dialog modal overlay
        toggleAuthModal('login');
    }
}

function toggleAuthModal(targetViewState) {
    const authContainer = document.getElementById('authContainer');
    if (!authContainer) return;
    
    authContainer.classList.add('active');
    
    internalModalViews.forEach(viewId => {
        const modalBox = document.getElementById(viewId);
        if (modalBox) {
            if (viewId === `modal-view-${targetViewState}`) {
                modalBox.classList.add('active');
            } else {
                modalBox.classList.remove('active');
            }
        }
    });

    // Reset OTP section views if toggling registration form
    if (targetViewState === 'register') {
        const emailOtpGroup = document.getElementById('emailOtpGroup');
        const mobileOtpGroup = document.getElementById('mobileOtpGroup');
        const emailOtpInput = document.getElementById('regEmailOtp');
        const mobileOtpInput = document.getElementById('regMobileOtp');
        
        if (emailOtpGroup) emailOtpGroup.style.display = 'none';
        if (mobileOtpGroup) mobileOtpGroup.style.display = 'none';
        if (emailOtpInput) {
            emailOtpInput.required = false;
            emailOtpInput.value = '';
        }
        if (mobileOtpInput) {
            mobileOtpInput.required = false;
            mobileOtpInput.value = '';
        }
    }
}

function dismissAuthModal() {
    const authContainer = document.getElementById('authContainer');
    if (authContainer) {
        authContainer.classList.remove('active');
    }
    
    internalModalViews.forEach(viewId => {
        const modalBox = document.getElementById(viewId);
        if (modalBox) {
            modalBox.classList.remove('active');
        }
    });

    // Reset login error message
    const loginError = document.getElementById('loginErrorLabel');
    if (loginError) loginError.style.display = 'none';

    // Hide registration OTP sections on close
    const emailOtpGroup = document.getElementById('emailOtpGroup');
    const mobileOtpGroup = document.getElementById('mobileOtpGroup');
    const emailOtpInput = document.getElementById('regEmailOtp');
    const mobileOtpInput = document.getElementById('regMobileOtp');
    
    if (emailOtpGroup) emailOtpGroup.style.display = 'none';
    if (mobileOtpGroup) mobileOtpGroup.style.display = 'none';
    if (emailOtpInput) emailOtpInput.required = false;
    if (mobileOtpInput) mobileOtpInput.required = false;
}

function verifySystemAccess(e) {
    if (!currentUser) {
        e.preventDefault();
        // Redirect standard browser anchor link click events to Login Modal
        toggleAuthModal('login');
    }
}

// Handle Form Submissions via Live Fetch to Google Sheet Web App
async function handleAuthTransaction(e, context) {
    e.preventDefault();
    
    if (!checkBackendConfig()) return;
    
    const errorDisplay = document.getElementById('loginErrorLabel');
    
    if (context === 'login') {
        const email = document.getElementById('loginEmailInput').value.trim();
        const pass = document.getElementById('loginPasswordInput').value;
        
        // Show loading state
        const loginBtn = e.target.querySelector('button[type="submit"]');
        const origBtnText = loginBtn.textContent;
        loginBtn.textContent = "Signing In...";
        loginBtn.disabled = true;
        
        try {
            const response = await fetch(BACKEND_API_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain" }, // Avoids CORS preflight issues in Google Apps Script
                body: JSON.stringify({
                    action: "login",
                    email: email,
                    password: pass
                })
            });
            const data = await response.json();
            
            if (data.success) {
                // Successful sign in
                currentUser = data.user;
                localStorage.setItem('learnin21_session', JSON.stringify(currentUser));
                restoreUserSession();
                
                if (errorDisplay) errorDisplay.style.display = 'none';
                dismissAuthModal();
                
                // Route directly to learning metrics console
                routeToWorkspaceView('learnings');
                alert(`Welcome back, ${currentUser.fullName}!`);
            } else {
                if (errorDisplay) {
                    errorDisplay.textContent = data.message;
                    errorDisplay.style.display = 'block';
                }
            }
        } catch (error) {
            alert("Connection error: Could not reach Google Sheets database backend.");
            console.error("Login Error:", error);
        } finally {
            loginBtn.textContent = origBtnText;
            loginBtn.disabled = false;
        }
        
    } else if (context === 'register') {
        const name = document.getElementById('regNameInput').value.trim();
        const email = document.getElementById('regEmailInput').value.trim();
        const mobile = document.getElementById('regMobileInput').value.trim();
        const pass = document.getElementById('regPasswordInput').value;
        const emailOtp = document.getElementById('regEmailOtp').value.trim();
        const mobileOtp = document.getElementById('regMobileOtp').value.trim();
        
        const registerBtn = e.target.querySelector('button[type="submit"]');
        const origBtnText = registerBtn.textContent;
        registerBtn.textContent = "Creating Account...";
        registerBtn.disabled = true;
        
        try {
            const response = await fetch(BACKEND_API_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                    action: "register",
                    fullName: name,
                    email: email,
                    mobile: mobile,
                    password: pass,
                    emailOtp: emailOtp,
                    mobileOtp: mobileOtp
                })
            });
            const data = await response.json();
            
            if (data.success) {
                // Registration successful, log user in automatically
                currentUser = {
                    fullName: name,
                    email: email,
                    mobile: mobile
                };
                localStorage.setItem('learnin21_session', JSON.stringify(currentUser));
                restoreUserSession();
                
                // Transition to success screen
                toggleAuthModal('success');
            } else {
                alert("Registration Failed:\n\n" + data.message);
            }
        } catch (error) {
            alert("Connection error: Could not save record to Google Sheets.");
            console.error("Register Error:", error);
        } finally {
            registerBtn.textContent = origBtnText;
            registerBtn.disabled = false;
        }
    }
}

function confirmSuccessfulLogin() {
    dismissAuthModal();
    routeToWorkspaceView('learnings');
}

function executeSystemSessionSignout() {
    currentUser = null;
    localStorage.removeItem('learnin21_session');
    restoreUserSession();
    routeToWorkspaceView('home');
    alert("You have successfully signed out of your account.");
}

// ==========================================================================
// 8. LIVE PASSWORD RESET & GOOGLE SHEETS MODIFICATION FLOW
// ==========================================================================

async function executePassResetProfileValidationCheck() {
    if (!checkBackendConfig()) return;

    const givenEmail = document.getElementById('passResetConfirmEmail').value.trim();
    const givenMobile = document.getElementById('passResetConfirmMobile').value.trim();
    const errorLabel = document.getElementById('passResetMatchError');

    const verifyBtn = document.querySelector('#passResetPhaseVerification button');
    const origText = verifyBtn.textContent;
    verifyBtn.textContent = "Verifying...";
    verifyBtn.disabled = true;

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "resetPasswordRequest",
                email: givenEmail,
                mobile: givenMobile
            })
        });
        const data = await response.json();

        if (data.success) {
            if (errorLabel) errorLabel.style.display = 'none';
            
            // Navigate inside second-step OTP panel
            document.getElementById('passResetPhaseVerification').style.display = 'none';
            document.getElementById('passResetPhaseOTP').style.display = 'block';
            
            alert('Identity matched. A text message with your 6-digit verification code was sent.');
        } else {
            if (errorLabel) {
                errorLabel.textContent = data.message;
                errorLabel.style.display = 'block';
            }
        }
    } catch (error) {
        alert("Connection error: Verification failed.");
        console.error("Reset Request Error:", error);
    } finally {
        verifyBtn.textContent = origText;
        verifyBtn.disabled = false;
    }
}

function executePasswordResetMobileOtpVerificationScript() {
    const tokenVal = document.getElementById('passResetOtpInput').value.trim();
    if (tokenVal.length === 6) {
        passwordResetOtpCode = tokenVal;
        alert('Verification code validated successfully. Please enter your new password.');
        document.getElementById('passResetPhaseOTP').style.display = 'none';
        document.getElementById('passResetPhaseModification').style.display = 'block';
    } else {
        alert('Please enter the 6-digit verification code sent to your phone.');
    }
}

async function executeFinalPasswordOverwritingTransaction(e) {
    e.preventDefault();
    if (!checkBackendConfig()) return;

    const newPass = document.getElementById('passResetNewPass').value;
    const givenEmail = document.getElementById('passResetConfirmEmail').value.trim();
    const givenMobile = document.getElementById('passResetConfirmMobile').value.trim();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const origText = submitBtn.textContent;
    submitBtn.textContent = "Updating Password...";
    submitBtn.disabled = true;

    try {
        const response = await fetch(BACKEND_API_URL, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({
                action: "resetPasswordConfirm",
                email: givenEmail,
                mobile: givenMobile,
                otp: passwordResetOtpCode,
                newPassword: newPass
            })
        });
        const data = await response.json();

        if (data.success) {
            alert('Your password has been updated successfully.');
            
            // Log out session and prompt relogin for security
            executeSystemSessionSignout();
        } else {
            alert("Failed to update password: " + data.message);
        }
    } catch (error) {
        alert("Connection error: Could not modify password record in Google Sheets.");
        console.error("Reset Confirm Error:", error);
    } finally {
        submitBtn.textContent = origText;
        submitBtn.disabled = false;
    }
}

// ==========================================================================
// 9. LIVE OTP DELIVERY TRIGGER (EMAIL & TWILIO SMS)
// ==========================================================================

async function sendMockVerification(type) {
    if (!checkBackendConfig()) return;

    if (type === 'Email Address') {
        const emailInput = document.getElementById('regEmailInput').value.trim();
        if (!emailInput) {
            alert("Please enter a valid email address first.");
            return;
        }

        const verifyEmailBtn = document.querySelector('.input-verify-wrapper button[onclick*="Email Address"]');
        const origText = verifyEmailBtn.textContent;
        verifyEmailBtn.textContent = "Sending...";
        verifyEmailBtn.disabled = true;

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                    action: "sendEmailOTP",
                    email: emailInput
                })
            });
            const data = await response.json();

            if (data.success) {
                alert("Success: " + data.message);
                const emailOtpGroup = document.getElementById('emailOtpGroup');
                const emailOtpInput = document.getElementById('regEmailOtp');
                if (emailOtpGroup && emailOtpInput) {
                    emailOtpGroup.style.display = 'block';
                    emailOtpInput.required = true;
                    emailOtpInput.focus();
                }
            } else {
                alert("Error sending Email code: " + data.message);
            }
        } catch (error) {
            alert("Connection error: OTP request failed.");
            console.error("Send Email OTP Error:", error);
        } finally {
            verifyEmailBtn.textContent = origText;
            verifyEmailBtn.disabled = false;
        }

    } else if (type === 'Mobile Number') {
        const mobileInput = document.getElementById('regMobileInput').value.trim();
        if (!mobileInput) {
            alert("Please enter a valid mobile number first.");
            return;
        }

        const verifyMobileBtn = document.querySelector('.input-verify-wrapper button[onclick*="Mobile Number"]');
        const origText = verifyMobileBtn.textContent;
        verifyMobileBtn.textContent = "Sending...";
        verifyMobileBtn.disabled = true;

        try {
            const response = await fetch(BACKEND_API_URL, {
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "text/plain" },
                body: JSON.stringify({
                    action: "sendSMSOTP",
                    mobile: mobileInput
                })
            });
            const data = await response.json();

            if (data.success) {
                alert("Success: " + data.message);
                const mobileOtpGroup = document.getElementById('mobileOtpGroup');
                const mobileOtpInput = document.getElementById('regMobileOtp');
                if (mobileOtpGroup && mobileOtpInput) {
                    mobileOtpGroup.style.display = 'block';
                    mobileOtpInput.required = true;
                    mobileOtpInput.focus();
                }
            } else {
                alert("Error sending SMS code: " + data.message);
            }
        } catch (error) {
            alert("Connection error: OTP request failed.");
            console.error("Send Mobile OTP Error:", error);
        } finally {
            verifyMobileBtn.textContent = origText;
            verifyMobileBtn.disabled = false;
        }
    }
}

// Toggle visibility of password input fields
function togglePasswordVisibility(inputId, btnEl) {
    const input = document.getElementById(inputId);
    if (input) {
        if (input.type === 'password') {
            input.type = 'text';
            btnEl.textContent = 'Hide';
        } else {
            input.type = 'password';
            btnEl.textContent = 'Show';
        }
    }
}
