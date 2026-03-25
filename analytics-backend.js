// Backend Data Archive System for Mone Agency
// Collects visitor data and archives it via email and GitHub

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        emailEndpoint: 'https://formsubmit.co/mone.agency@mail.com',
        githubRepo: 'Evansxm/mone-agency',
        archiveInterval: 5 * 60 * 1000, // 5 minutes
        batchSize: 10
    };
    
    // Data Archive System
    const DataArchive = {
        // Initialize
        init: function() {
            this.sessionId = this.generateSessionId();
            this.visitorData = this.collectVisitorInfo();
            this.activityLog = [];
            
            // Start archiving
            this.startArchiving();
            
            // Track page unload
            window.addEventListener('beforeunload', () => {
                this.finalizeSession();
            });
            
            console.log('[Mone Analytics] Archive system initialized');
        },
        
        // Generate unique session ID
        generateSessionId: function() {
            return 'mone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },
        
        // Collect comprehensive visitor info
        collectVisitorInfo: function() {
            const ua = navigator.userAgent;
            const width = window.innerWidth;
            const height = window.innerHeight;
            
            // Detect device type
            let deviceType = 'Desktop';
            if (/Mobile|Android|iPhone/i.test(ua)) {
                deviceType = 'Mobile';
            } else if (/iPad|Tablet/i.test(ua) || (width > 768 && width < 1024)) {
                deviceType = 'Tablet';
            }
            
            // Detect browser
            let browser = 'Unknown';
            if (ua.includes('Chrome')) browser = 'Chrome';
            else if (ua.includes('Safari')) browser = 'Safari';
            else if (ua.includes('Firefox')) browser = 'Firefox';
            else if (ua.includes('Edge')) browser = 'Edge';
            
            // Detect OS
            let os = 'Unknown';
            if (ua.includes('Windows')) os = 'Windows';
            else if (ua.includes('Mac')) os = 'MacOS';
            else if (ua.includes('Linux')) os = 'Linux';
            else if (ua.includes('Android')) os = 'Android';
            else if (ua.includes('iOS')) os = 'iOS';
            
            return {
                sessionId: this.sessionId,
                timestamp: new Date().toISOString(),
                date: new Date().toLocaleDateString(),
                time: new Date().toLocaleTimeString(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                url: window.location.href,
                referrer: document.referrer || 'Direct',
                deviceType: deviceType,
                browser: browser,
                os: os,
                screenResolution: screen.width + 'x' + screen.height,
                viewport: width + 'x' + height,
                language: navigator.language,
                platform: navigator.platform,
                userAgent: ua.substring(0, 100), // Truncated for privacy
                cookiesEnabled: navigator.cookieEnabled,
                online: navigator.onLine,
                colorDepth: screen.colorDepth,
                pixelRatio: window.devicePixelRatio,
                memory: navigator.deviceMemory || 'Unknown',
                cores: navigator.hardwareConcurrency || 'Unknown',
                touch: 'ontouchstart' in window
            };
        },
        
        // Log activity
        logActivity: function(type, details) {
            this.activityLog.push({
                timestamp: new Date().toISOString(),
                type: type,
                details: details,
                section: this.getCurrentSection()
            });
            
            // Store in localStorage temporarily
            this.storeTempData();
        },
        
        // Get current visible section
        getCurrentSection: function() {
            const sections = ['home', 'gallery', 'locations', 'join', 'newsletter', 'contact'];
            for (const section of sections) {
                const el = document.getElementById(section);
                if (el) {
                    const rect = el.getBoundingClientRect();
                    if (rect.top >= 0 && rect.top <= window.innerHeight / 2) {
                        return section;
                    }
                }
            }
            return 'unknown';
        },
        
        // Store temporary data
        storeTempData: function() {
            const data = {
                visitor: this.visitorData,
                activities: this.activityLog,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('mone_archive_temp', JSON.stringify(data));
        },
        
        // Archive data via email
        archiveViaEmail: function(data) {
            const emailData = new FormData();
            emailData.append('_subject', `MONE ANALYTICS: ${data.visitor.date} ${data.visitor.time}`);
            emailData.append('_captcha', 'false');
            emailData.append('_template', 'table');
            
            // Add visitor info
            emailData.append('Session ID', data.visitor.sessionId);
            emailData.append('Date', data.visitor.date);
            emailData.append('Time', data.visitor.time);
            emailData.append('Timezone', data.visitor.timezone);
            emailData.append('Device Type', data.visitor.deviceType);
            emailData.append('Browser', data.visitor.browser);
            emailData.append('OS', data.visitor.os);
            emailData.append('Screen', data.visitor.screenResolution);
            emailData.append('Viewport', data.visitor.viewport);
            emailData.append('Language', data.visitor.language);
            emailData.append('Referrer', data.visitor.referrer);
            emailData.append('Online', data.visitor.online ? 'Yes' : 'No');
            emailData.append('Touch Device', data.visitor.touch ? 'Yes' : 'No');
            
            // Add activities summary
            const pageViews = data.activities.filter(a => a.type === 'page_view').length;
            const clicks = data.activities.filter(a => a.type === 'click').length;
            const formInteractions = data.activities.filter(a => a.type === 'form').length;
            
            emailData.append('Pages Viewed', pageViews);
            emailData.append('Total Clicks', clicks);
            emailData.append('Form Interactions', formInteractions);
            emailData.append('Time on Site', this.calculateTimeOnSite());
            
            // Add activity details as JSON
            emailData.append('Activity Log (JSON)', JSON.stringify(data.activities.slice(-20)));
            
            // Send email
            fetch(CONFIG.emailEndpoint, {
                method: 'POST',
                body: emailData
            }).then(response => {
                console.log('[Mone Analytics] Data archived to email');
            }).catch(error => {
                console.error('[Mone Analytics] Email archive failed:', error);
            });
        },
        
        // Calculate time on site
        calculateTimeOnSite: function() {
            const start = new Date(this.visitorData.timestamp);
            const now = new Date();
            const diff = Math.floor((now - start) / 1000);
            const minutes = Math.floor(diff / 60);
            const seconds = diff % 60;
            return `${minutes}m ${seconds}s`;
        },
        
        // Create GitHub issue with data
        createGitHubIssue: function(data) {
            // This would require a GitHub token, so we'll create a data file instead
            // that can be committed via GitHub Actions
            
            const issueData = {
                title: `Visitor: ${data.visitor.sessionId} - ${data.visitor.date}`,
                body: `## Visitor Analytics Data
                
**Date:** ${data.visitor.date}  
**Time:** ${data.visitor.time}  
**Session ID:** ${data.visitor.sessionId}  

### Device Info
- **Type:** ${data.visitor.deviceType}
- **Browser:** ${data.visitor.browser}
- **OS:** ${data.visitor.os}
- **Screen:** ${data.visitor.screenResolution}
- **Viewport:** ${data.visitor.viewport}
- **Language:** ${data.visitor.language}
- **Timezone:** ${data.visitor.timezone}

### Session Stats
- **Referrer:** ${data.visitor.referrer}
- **Time on Site:** ${this.calculateTimeOnSite()}
- **Pages Viewed:** ${data.activities.filter(a => a.type === 'page_view').length}
- **Total Interactions:** ${data.activities.length}

### Activity Log
${data.activities.map(a => `- ${a.time} [${a.type}] ${a.details || ''}`).join('\n')}
                `,
                timestamp: new Date().toISOString()
            };
            
            // Store in sessionStorage for potential GitHub Action pickup
            sessionStorage.setItem('mone_issue_data', JSON.stringify(issueData));
        },
        
        // Start automatic archiving
        startArchiving: function() {
            // Archive every 5 minutes
            setInterval(() => {
                const data = {
                    visitor: this.visitorData,
                    activities: this.activityLog
                };
                
                if (this.activityLog.length > 0) {
                    this.archiveViaEmail(data);
                    this.createGitHubIssue(data);
                    console.log('[Mone Analytics] Data archived');
                }
            }, CONFIG.archiveInterval);
            
            // Also archive on significant events
            this.setupEventTracking();
        },
        
        // Setup event tracking
        setupEventTracking: function() {
            // Track clicks
            document.addEventListener('click', (e) => {
                const target = e.target.closest('a, button, .btn');
                if (target) {
                    this.logActivity('click', {
                        element: target.tagName,
                        text: target.textContent?.substring(0, 50),
                        href: target.href || ''
                    });
                }
            });
            
            // Track form submissions
            document.querySelectorAll('form').forEach(form => {
                form.addEventListener('submit', () => {
                    this.logActivity('form', {
                        formType: form.querySelector('[name="_subject"]')?.value || 'Unknown'
                    });
                });
            });
            
            // Track section views
            const sections = document.querySelectorAll('section[id]');
            const sectionObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                        this.logActivity('page_view', {
                            section: entry.target.id
                        });
                    }
                });
            }, { threshold: 0.5 });
            
            sections.forEach(section => sectionObserver.observe(section));
        },
        
        // Finalize session on page unload
        finalizeSession: function() {
            const data = {
                visitor: this.visitorData,
                activities: this.activityLog,
                finalTimestamp: new Date().toISOString()
            };
            
            // Use sendBeacon for reliable data sending on unload
            const emailData = new FormData();
            emailData.append('_subject', `MONE SESSION END: ${data.visitor.sessionId}`);
            emailData.append('_captcha', 'false');
            emailData.append('Session ID', data.visitor.sessionId);
            emailData.append('Duration', this.calculateTimeOnSite());
            emailData.append('Total Activities', data.activities.length);
            emailData.append('Full Data', JSON.stringify(data));
            
            if (navigator.sendBeacon) {
                navigator.sendBeacon(CONFIG.emailEndpoint, emailData);
            }
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DataArchive.init());
    } else {
        DataArchive.init();
    }
    
    // Expose for debugging
    window.MoneAnalytics = DataArchive;
})();
