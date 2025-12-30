/**
 * Star Atlas landing (static) - extracted from inline <script> for:
 * - Better caching/performance (defer + browser cache)
 * - Maintainability (single file, grouped concerns)
 *
 * IMPORTANT: This file intentionally attaches functions to `window`
 * because the HTML uses inline `onclick="..."` handlers.
 */

(function () {
  'use strict';

  // -----------------------------
  // Game mode toggle
  // -----------------------------

  /**
   * @param {'3rdperson'|'rts'} mode
   * @param {Event} [evt]
   */
  function showGameMode(mode, evt) {
    document.querySelectorAll('.toggle-btn').forEach((btn) => btn.classList.remove('active'));
    document.querySelectorAll('.game-content').forEach((content) => content.classList.remove('active'));

    const targetBtn = evt?.target && evt.target instanceof HTMLElement ? evt.target : null;
    if (targetBtn) targetBtn.classList.add('active');

    const contentEl = document.getElementById(mode);
    if (contentEl) contentEl.classList.add('active');

    // Stop all auto-play timers
    stopAutoPlay('3rd');
    stopAutoPlay('rts');

    // Start auto-play for the new active carousel
    if (mode === '3rdperson') startAutoPlay('3rd');
    if (mode === 'rts') startAutoPlay('rts');
  }

  // Expose for inline handlers
  window.showGameMode = showGameMode;

  // -----------------------------
  // Video Carousel
  // -----------------------------

  const carousels = {
    '3rd': { currentSlide: 0, totalSlides: 4, interval: null },
    'rts': { currentSlide: 0, totalSlides: 3, interval: null },
  };

  function safePlay(video) {
    if (!video) return;
    // Ensure video has required attributes for mobile autoplay
    video.setAttribute('muted', '');
    video.setAttribute('playsinline', '');
    video.setAttribute('webkit-playsinline', '');
    video.play().catch((e) => console.log('Video play failed:', e));
  }

  function stopAndReset(video) {
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0;
    } catch {
      // Some browsers can throw if not seekable yet
    }
  }

  window.changeSlide = function changeSlide(carouselId, direction) {
    const carousel = carousels[carouselId];
    const track = document.getElementById(`carousel-${carouselId}`);
    if (!carousel || !track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    const thumbnails = track.parentElement?.parentElement?.querySelectorAll('.thumbnail-item') || [];

    // Hide current slide and stop video
    slides[carousel.currentSlide]?.classList.remove('active');
    stopAndReset(slides[carousel.currentSlide]?.querySelector('video'));
    thumbnails[carousel.currentSlide]?.classList.remove('active');

    // Calculate new slide index
    carousel.currentSlide += direction;
    if (carousel.currentSlide >= carousel.totalSlides) carousel.currentSlide = 0;
    if (carousel.currentSlide < 0) carousel.currentSlide = carousel.totalSlides - 1;

    // Show new slide and play video
    slides[carousel.currentSlide]?.classList.add('active');
    safePlay(slides[carousel.currentSlide]?.querySelector('video'));
    thumbnails[carousel.currentSlide]?.classList.add('active');
  };

  window.goToSlide = function goToSlide(carouselId, slideIndex) {
    const carousel = carousels[carouselId];
    const track = document.getElementById(`carousel-${carouselId}`);
    if (!carousel || !track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    const thumbnails = track.parentElement?.parentElement?.querySelectorAll('.thumbnail-item') || [];

    // Hide current slide and stop video
    slides[carousel.currentSlide]?.classList.remove('active');
    stopAndReset(slides[carousel.currentSlide]?.querySelector('video'));
    thumbnails[carousel.currentSlide]?.classList.remove('active');

    // Show new slide and play video
    carousel.currentSlide = slideIndex;
    slides[carousel.currentSlide]?.classList.add('active');
    safePlay(slides[carousel.currentSlide]?.querySelector('video'));
    thumbnails[carousel.currentSlide]?.classList.add('active');

    // Reset auto-play timer
    if (carousel.interval) {
      clearInterval(carousel.interval);
      startAutoPlay(carouselId);
    }
  };

  function startAutoPlay(carouselId) {
    const carousel = carousels[carouselId];
    if (!carousel) return;
    if (carousel.interval) clearInterval(carousel.interval);
    carousel.interval = setInterval(() => window.changeSlide(carouselId, 1), 30000);
  }

  function stopAutoPlay(carouselId) {
    const carousel = carousels[carouselId];
    if (!carousel?.interval) return;
    clearInterval(carousel.interval);
    carousel.interval = null;
  }

  function setupVideoEndListeners(carouselId) {
    const track = document.getElementById(`carousel-${carouselId}`);
    if (!track) return;
    const videos = track.querySelectorAll('video');
    videos.forEach((video) => {
      video.addEventListener('ended', () => window.changeSlide(carouselId, 1));
    });
  }

  // -----------------------------
  // Timestamp
  // -----------------------------

  function updateTimestamp() {
    const now = new Date();
    const futureDate = new Date(now);
    futureDate.setFullYear(now.getFullYear() + 600);

    // Update Star Atlas Log timestamp
    const starAtlasLog = document.getElementById('starAtlasLog');
    if (starAtlasLog) {
      const logDate = starAtlasLog.querySelector('.log-date');
      const logTime = starAtlasLog.querySelector('.log-time');

      if (logDate && logTime) {
        const year = futureDate.getFullYear();
        const month = String(futureDate.getMonth() + 1).padStart(2, '0');
        const day = String(futureDate.getDate()).padStart(2, '0');
        logDate.textContent = `${year}.${month}.${day}`;

        const hours = String(futureDate.getHours()).padStart(2, '0');
        const minutes = String(futureDate.getMinutes()).padStart(2, '0');
        const seconds = String(futureDate.getSeconds()).padStart(2, '0');
        logTime.textContent = `${hours}:${minutes}:${seconds}`;
      }
    }

    // Update footer bar timestamp
    const footerTimeEl = document.getElementById('footer-timestamp-time');
    const footerDateEl = document.getElementById('footer-timestamp-date');
    if (footerTimeEl && footerDateEl) {
      const year = futureDate.getFullYear();
      const month = String(futureDate.getMonth() + 1).padStart(2, '0');
      const day = String(futureDate.getDate()).padStart(2, '0');
      footerDateEl.textContent = `${year}.${month}.${day}`;

      const hours = String(futureDate.getHours()).padStart(2, '0');
      const minutes = String(futureDate.getMinutes()).padStart(2, '0');
      const seconds = String(futureDate.getSeconds()).padStart(2, '0');
      footerTimeEl.textContent = `${hours}:${minutes}:${seconds}`;
    }
  }

  // -----------------------------
  // Scroll reveal + counters
  // -----------------------------

  function animateValue(element) {
    const endValue = element.textContent;
    const duration = 2500;
    const start = 0;
    const end = parseFloat(endValue.replace(/[^0-9.]/g, ''));
    const isDecimal = endValue.includes('.');
    const prefix = endValue.match(/[^0-9.]*/)?.[0] || '';
    const suffix = endValue.match(/[^0-9.]*$/)?.[0] || '';

    let startTimestamp = null;
    const easeOutQuad = (t) => t * (2 - t);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutQuad(progress);
      const currentValue = Math.floor(easedProgress * (end - start) + start);

      if (isDecimal) {
        element.textContent = prefix + currentValue.toFixed(1) + suffix;
      } else {
        element.textContent = prefix + currentValue.toLocaleString() + suffix;
      }

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        element.textContent = endValue;
      }
    };

    window.requestAnimationFrame(step);
  }

  // -----------------------------
  // Parallax
  // -----------------------------

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  function updateParallax() {
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    document.querySelectorAll('.glow').forEach((glow, index) => {
      const speed = (index + 1) * 15;
      glow.style.transform = `translate(${targetX * speed}px, ${targetY * speed}px)`;
    });

    const gridDots = document.querySelector('.grid-layer.dots');
    if (gridDots) gridDots.style.transform = `translate(${targetX * 3}px, ${targetY * 3}px)`;

    requestAnimationFrame(updateParallax);
  }

  // -----------------------------
  // Smooth anchor scroll
  // -----------------------------

  function setupSmoothAnchors() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (!target) return;
        const offset = 100;
        const targetPosition = target.offsetTop - offset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      });
    });
  }

  // -----------------------------
  // Nav scroll behavior
  // -----------------------------

  function setupNavScroll() {
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const nav = document.querySelector('nav');
      if (!nav) return;
      const currentScroll = window.pageYOffset;

      if (currentScroll > 50) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');

      if (currentScroll > lastScroll && currentScroll > 300) nav.style.transform = 'translateY(-100%)';
      else nav.style.transform = 'translateY(0)';

      lastScroll = currentScroll;
    });
  }

  // -----------------------------
  // Tilt effect
  // -----------------------------

  function setupTilt() {
    document.querySelectorAll('.feature-card, .news-card, .stat-card').forEach((card) => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        // Clamp rotation to max 4 degrees
        const rotateX = Math.max(-4, Math.min(4, (y - centerY) / 40));
        const rotateY = Math.max(-4, Math.min(4, (centerX - x) / 40));
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(3px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  // -----------------------------
  // Typing effect
  // -----------------------------

  function setupHeroTyping() {
    const tagline = document.querySelector('.hero-tagline');
    if (!tagline) return;
    const spans = tagline.querySelectorAll('span');
    tagline.style.opacity = '1';

    const originalTexts = Array.from(spans).map((span) => span.textContent);
    spans.forEach((span) => (span.textContent = ''));

    let currentSpan = 0;
    let currentChar = 0;

    const typeWriter = () => {
      if (currentSpan >= spans.length) return;
      if (currentChar < originalTexts[currentSpan].length) {
        spans[currentSpan].textContent += originalTexts[currentSpan].charAt(currentChar);
        currentChar++;
        setTimeout(typeWriter, 50);
      } else {
        currentSpan++;
        currentChar = 0;
        setTimeout(typeWriter, 100);
      }
    };

    setTimeout(typeWriter, 1000);
  }

  // -----------------------------
  // Early access gate + forms
  // -----------------------------

  function updateEmailDisplay(input) {
    const display = document.getElementById('emailDisplay');
    if (!display) return;
    const value = input.value;

    if (value.includes('@')) {
      const [localPart, domainPart] = value.split('@');
      display.innerHTML = `<span class="email-local">${localPart}</span><span class="email-domain">@${domainPart}</span>`;
    } else {
      display.innerHTML = `<span class="email-local">${value}</span>`;
    }

    display.style.opacity = value ? '1' : '0';
  }
  window.updateEmailDisplay = updateEmailDisplay;

  function unlockContent() {
    document.body.classList.add('content-unlocked');
    const gated = document.getElementById('gatedContent');
    if (gated) gated.style.display = 'block';
    document.querySelectorAll('.gated-content').forEach((el) => (el.style.display = ''));

    const heroContent = document.getElementById('heroContent');
    const heroSection = document.querySelector('.hero');
    if (heroContent) {
      heroContent.classList.remove('center-bottom');
      heroContent.classList.add('bottom-left');
    }
    if (heroSection) {
      heroSection.style.alignItems = 'flex-end';
      heroSection.style.justifyContent = 'flex-start';
    }

    localStorage.setItem('contentUnlocked', 'true');
  }
  window.unlockContent = unlockContent;

  let terminalBoxClicks = 0;

  function bypassEmailGate(e) {
    e?.preventDefault?.();
    const terminalBox = document.querySelector('.terminal-box');
    const heroContent = document.getElementById('heroContent');
    terminalBoxClicks++;

    if (terminalBoxClicks === 1) {
      if (heroContent) {
        heroContent.classList.remove('center-bottom');
        heroContent.classList.add('bottom-left');
      }
      unlockContent();
    } else if (terminalBoxClicks >= 2) {
      if (terminalBox) {
        terminalBox.style.display = 'none';
        if (heroContent) {
          heroContent.classList.add('terminal-hidden');
          const heroLogo = heroContent.querySelector('.hero-logo');
          const heroTagline = heroContent.querySelector('.hero-tagline');
          if (heroLogo && heroTagline && heroTagline.parentNode) {
            heroTagline.parentNode.insertBefore(heroLogo, heroTagline);
          }
        }
      }
    }
  }
  window.bypassEmailGate = bypassEmailGate;

  function copyAccessKeyInline(key) {
    navigator.clipboard.writeText(key).then(() => {
      const copyBtn = document.querySelector('.copy-btn-inline');
      if (!copyBtn) return;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy Key'), 2000);
    });
  }
  window.copyAccessKeyInline = copyAccessKeyInline;

  async function submitEarlyAccessInline(e) {
    e.preventDefault();
    const emailInput = document.getElementById('heroEmailInput');
    if (!emailInput) return;

    const email = emailInput.value;
    const submitBtn = e.target.querySelector('.hero-submit-btn');
    const messageDiv = document.getElementById('heroMessage');
    const form = document.querySelector('.early-access-form');
    const bypassLink = document.querySelector('.bypass-link');

    if (!submitBtn || !messageDiv) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';
    messageDiv.style.display = 'none';

    const isLocalhost =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '' ||
      window.location.protocol === 'file:';

    if (isLocalhost || !navigator.onLine) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const mockKey = 'TEST-KEY-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      messageDiv.innerHTML = `
        <div class="success-inline">
          <p>Success! Your early access key: <strong>${mockKey}</strong></p>
          <button onclick="copyAccessKeyInline('${mockKey}')" class="copy-btn-inline">Copy Key</button>
        </div>
      `;
      messageDiv.className = 'hero-message success';
      messageDiv.style.display = 'block';
      if (form) form.style.display = 'none';
      if (bypassLink) bypassLink.style.display = 'none';

      setTimeout(() => {
        messageDiv.style.display = 'none';
        const closeButton = document.querySelector('.terminal-close');
        if (closeButton) closeButton.click();
      }, 10000);

      submitBtn.disabled = false;
      submitBtn.textContent = 'GET EARLY ACCESS NOW';
      return;
    }

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        const key = data.key || 'STAR-ATLAS-KEY-XXXX';
        messageDiv.innerHTML = `
          <div class="success-inline">
            <p>Success! Your early access key: <strong>${key}</strong></p>
            <button onclick="copyAccessKeyInline('${key}')" class="copy-btn-inline">Copy Key</button>
          </div>
        `;
        messageDiv.className = 'hero-message success';
        if (form) form.style.display = 'none';
        if (bypassLink) bypassLink.style.display = 'none';
        messageDiv.style.display = 'block';

        setTimeout(() => {
          messageDiv.style.display = 'none';
          const closeButton = document.querySelector('.terminal-close');
          if (closeButton) closeButton.click();
        }, 10000);
      } else {
        messageDiv.textContent = data.message || 'An error occurred. Please try again.';
        messageDiv.className = 'hero-message error';
        messageDiv.style.display = 'block';
      }
    } catch (error) {
      console.error('Error:', error);
      messageDiv.textContent = 'An error occurred. Please try again.';
      messageDiv.className = 'hero-message error';
      messageDiv.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'GET EARLY ACCESS NOW';
    }
  }
  window.submitEarlyAccessInline = submitEarlyAccessInline;

  // -----------------------------
  // Sticky footer bar
  // -----------------------------

  let footerBar = null;
  let heroSection = null;
  let isFooterBarVisible = false;
  let hasSubmittedEmail = false;
  let hasManuallyClosedFooter = false;
  let hasReturnedToTop = false;

  function closeFooterBar() {
    isFooterBarVisible = false;
    hasManuallyClosedFooter = true;
    hasReturnedToTop = false;
    if (!footerBar) return;
    footerBar.classList.remove('visible');
    document.body.classList.remove('footer-bar-visible');
  }
  window.closeFooterBar = closeFooterBar;

  async function submitFooterEmail(e) {
    e.preventDefault();
    const form = e.target;
    const emailInput = form.querySelector('.footer-email-input');
    const submitBtn = form.querySelector('.footer-submit-btn');
    if (!emailInput || !submitBtn) return;
    const email = emailInput.value;

    emailInput.disabled = true;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      localStorage.setItem('earlyAccessSubmitted', 'true');
      hasSubmittedEmail = true;

      isFooterBarVisible = false;
      footerBar?.classList.remove('visible');
      document.body.classList.remove('footer-bar-visible');

      submitBtn.textContent = 'Success!';
      submitBtn.style.background = '#10b981';

      const mainEmailInput = document.getElementById('heroEmailInput');
      if (mainEmailInput) {
        mainEmailInput.value = email;
        const mainForm = mainEmailInput.closest('form');
        if (mainForm) mainForm.dispatchEvent(new Event('submit'));
      }
    } catch (error) {
      emailInput.disabled = false;
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
      alert('An error occurred. Please try again.');
    }
  }
  window.submitFooterEmail = submitFooterEmail;

  function initStickyFooterBar() {
    footerBar = document.getElementById('stickyFooterBar');
    heroSection = document.querySelector('.hero');
    hasSubmittedEmail = localStorage.getItem('earlyAccessSubmitted') === 'true';
    if (!footerBar || !heroSection) return;

    function handleScroll() {
      const heroBottom = heroSection.getBoundingClientRect().bottom;
      if (hasSubmittedEmail) return;

      if (hasManuallyClosedFooter && heroBottom > window.innerHeight * 0.5) {
        hasReturnedToTop = true;
      }
      if (hasManuallyClosedFooter && hasReturnedToTop && heroBottom <= 0) {
        hasManuallyClosedFooter = false;
        hasReturnedToTop = false;
      }
      if (hasManuallyClosedFooter) return;

      if (heroBottom <= 0 && !isFooterBarVisible) {
        isFooterBarVisible = true;
        footerBar.classList.add('visible');
        document.body.classList.add('footer-bar-visible');
      } else if (heroBottom > 0 && isFooterBarVisible) {
        isFooterBarVisible = false;
        footerBar.classList.remove('visible');
        document.body.classList.remove('footer-bar-visible');
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    const footerEmailInput = footerBar.querySelector('.footer-email-input');
    const footerEmailDisplay = footerBar.querySelector('.footer-email-display');
    if (!footerEmailInput || !footerEmailDisplay) return;
    const footerEmailLocal = footerEmailDisplay.querySelector('.footer-email-local');
    const footerEmailDomain = footerEmailDisplay.querySelector('.footer-email-domain');
    if (!footerEmailLocal || !footerEmailDomain) return;

    footerEmailInput.addEventListener('input', function (e) {
      const value = e.target.value;
      if (value.includes('@')) {
        const [local, domain] = value.split('@');
        footerEmailLocal.textContent = local;
        footerEmailDomain.textContent = '@' + (domain || '');
        footerEmailDisplay.style.opacity = '1';
      } else {
        footerEmailLocal.textContent = value;
        footerEmailDomain.textContent = '';
        footerEmailDisplay.style.opacity = value ? '1' : '0';
      }
    });

    footerEmailInput.addEventListener('focus', function () {
      if (this.value) footerEmailDisplay.style.opacity = '1';
    });
    footerEmailInput.addEventListener('blur', function () {
      if (!this.value) footerEmailDisplay.style.opacity = '0';
    });
  }

  // -----------------------------
  // Mouse spotlight
  // -----------------------------

  function isIPadOS() {
    return navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /MacIntel/.test(navigator.platform);
  }
  function isTablet() {
    const userAgent = navigator.userAgent.toLowerCase();
    const isIPad = isIPadOS() || /ipad/.test(userAgent);
    const isAndroidTablet = /android/.test(userAgent) && !/mobile/.test(userAgent);
    const isSurfaceTablet = /windows nt/.test(userAgent) && /touch/.test(userAgent);
    return isIPad || isAndroidTablet || isSurfaceTablet;
  }

  function initMouseSpotlight() {
    const mouseSpotlight = document.querySelector('.mouse-spotlight');
    if (!mouseSpotlight) return;

    if (isTablet()) {
      mouseSpotlight.style.display = 'none';
      return;
    }

    let spotlightX = 0;
    let spotlightY = 0;
    let spotlightCurrentX = 0;
    let spotlightCurrentY = 0;
    let isSpotlightMoving = false;
    let spotlightFadeTimeout;

    document.addEventListener('mousemove', (e) => {
      spotlightX = e.clientX;
      spotlightY = e.clientY;

      if (!isSpotlightMoving) {
        isSpotlightMoving = true;
        mouseSpotlight.style.opacity = '1';
      }

      clearTimeout(spotlightFadeTimeout);
      spotlightFadeTimeout = setTimeout(() => {
        mouseSpotlight.style.opacity = '0';
        isSpotlightMoving = false;
      }, 1000);
    });

    function animateSpotlight() {
      spotlightCurrentX += (spotlightX - spotlightCurrentX) * 0.1;
      spotlightCurrentY += (spotlightY - spotlightCurrentY) * 0.1;
      mouseSpotlight.style.left = spotlightCurrentX + 'px';
      mouseSpotlight.style.top = spotlightCurrentY + 'px';
      requestAnimationFrame(animateSpotlight);
    }
    animateSpotlight();

    document.addEventListener('mouseleave', () => {
      mouseSpotlight.style.opacity = '0';
      isSpotlightMoving = false;
    });
  }

  // -----------------------------
  // Modal functions (legacy)
  // -----------------------------

  window.openEarlyAccessModal = function openEarlyAccessModal() {
    const modal = document.getElementById('earlyAccessModal');
    if (!modal) return;
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  };

  window.closeEarlyAccessModal = function closeEarlyAccessModal() {
    const modal = document.getElementById('earlyAccessModal');
    if (!modal) return;
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
  };

  window.submitEarlyAccess = async function submitEarlyAccess(e) {
    e.preventDefault();
    const emailEl = document.getElementById('earlyAccessEmail');
    const submitBtn = document.getElementById('submitEarlyAccess');
    const errorMsg = document.getElementById('errorMessage');
    const successMsg = document.getElementById('successMessage');
    const formContainer = document.getElementById('formContainer');
    if (!emailEl || !submitBtn || !errorMsg || !successMsg || !formContainer) return;

    const email = emailEl.value;
    errorMsg.style.display = 'none';
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        formContainer.style.display = 'none';
        successMsg.style.display = 'block';
        const accessKey = document.getElementById('accessKey');
        if (accessKey) accessKey.textContent = data.key || 'STAR-ATLAS-KEY-XXXX';
      } else {
        errorMsg.textContent = data.message || 'An error occurred. Please try again.';
        errorMsg.style.display = 'block';
      }
    } catch (error) {
      errorMsg.textContent = 'Connection error. Please try again.';
      errorMsg.style.display = 'block';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Get Access Now';
    }
  };

  window.copyAccessKey = function copyAccessKey() {
    const keyEl = document.getElementById('accessKey');
    if (!keyEl) return;
    const key = keyEl.textContent;
    navigator.clipboard.writeText(key).then(() => {
      const copyBtn = document.querySelector('.copy-btn');
      if (!copyBtn) return;
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Copy'), 2000);
    });
  };

  // Close modal on outside click
  window.addEventListener('click', (event) => {
    const modal = document.getElementById('earlyAccessModal');
    if (modal && event.target === modal) window.closeEarlyAccessModal();
  });

  // -----------------------------
  // Pixel effect component
  // -----------------------------

  class Pixel {
    constructor(canvas, context, x, y, color, speed, delay, distanceRatio, pixelSize = 3) {
      this.width = canvas.width;
      this.height = canvas.height;
      this.ctx = context;
      this.x = x;
      this.y = y;
      this.color = color;
      this.speed = this.getRandomValue(0.1, 0.9) * speed;
      this.size = 0;
      this.sizeStep = Math.random() * 0.4;
      this.minSize = 0.5;

      const vignetteScale = 1 - Math.pow(distanceRatio, 2) * 0.6;
      this.maxSizeInteger = pixelSize * vignetteScale;
      this.maxSize = this.getRandomValue(this.minSize, Math.max(this.minSize, this.maxSizeInteger));

      this.delay = delay;
      this.counter = 0;
      this.counterStep = Math.random() * 2 + 3;
      this.isIdle = false;
      this.isReverse = false;
      this.isShimmer = false;
      this.distanceRatio = distanceRatio;
    }

    getRandomValue(min, max) {
      return Math.random() * (max - min) + min;
    }

    draw() {
      const centerOffset = this.maxSizeInteger * 0.5 - this.size * 0.5;
      this.ctx.save();
      const vignetteOpacity = 1 - Math.pow(this.distanceRatio, 1.5) * 0.7;
      this.ctx.globalAlpha = this.ctx.globalAlpha * vignetteOpacity;
      this.ctx.fillStyle = this.color;
      this.ctx.fillRect(this.x + centerOffset, this.y + centerOffset, this.size, this.size);
      this.ctx.restore();
    }

    appear() {
      this.isIdle = false;

      if (this.counter <= this.delay) {
        this.counter += this.counterStep;
        return;
      }

      if (this.size >= this.maxSize) this.isShimmer = true;

      if (this.isShimmer) this.shimmer();
      else this.size += this.sizeStep;

      this.draw();
    }

    disappear() {
      this.isShimmer = false;
      this.counter = 0;

      if (this.size <= 0) {
        this.isIdle = true;
        return;
      }
      this.size -= 0.1;
      this.draw();
    }

    shimmer() {
      if (this.size >= this.maxSize) this.isReverse = true;
      else if (this.size <= this.minSize) this.isReverse = false;

      if (this.isReverse) this.size -= this.speed;
      else this.size += this.speed;
    }
  }

  class PixelCanvasElement extends HTMLElement {
    constructor() {
      super();
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
      this.pixels = [];
      this.animation = null;
      this.timeInterval = 1000 / 60;
      this.timePrevious = performance.now();
      this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this._initialized = false;
      this._resizeObserver = null;
      this._parent = null;

      const shadow = this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: grid;
          inline-size: 100%;
          block-size: 100%;
          overflow: hidden;
        }
      `;
      shadow.appendChild(style);
      shadow.appendChild(this.canvas);
    }

    get colors() {
      return this.dataset.colors?.split(',') || ['#32feff', '#ffffff', '#7dd3fc'];
    }
    get gap() {
      const value = Number(this.dataset.gap) || 5;
      return Math.max(4, Math.min(50, value));
    }
    get speed() {
      const value = Number(this.dataset.speed) || 35;
      return this.reducedMotion ? 0 : Math.max(0, Math.min(100, value)) * 0.001;
    }
    get variant() {
      return this.dataset.variant || 'default';
    }
    get opacity() {
      const value = Number(this.dataset.opacity);
      return isNaN(value) ? 1 : Math.max(0, Math.min(1, value));
    }
    get blend() {
      return this.dataset.blend || 'normal';
    }
    get pixelSize() {
      const value = Number(this.dataset.size);
      return isNaN(value) ? 3 : Math.max(1, Math.min(10, value));
    }

    connectedCallback() {
      if (this._initialized) return;
      this._initialized = true;
      this._parent = this.parentElement;

      requestAnimationFrame(() => {
        this.handleResize();

        const ro = new ResizeObserver((entries) => {
          if (!entries.length) return;
          requestAnimationFrame(() => this.handleResize());
        });
        ro.observe(this);
        this._resizeObserver = ro;
      });

      this._parent?.addEventListener('mouseenter', () => this.handleAnimation('appear'));
      this._parent?.addEventListener('mouseleave', () => this.handleAnimation('disappear'));
    }

    disconnectedCallback() {
      this._initialized = false;
      this._resizeObserver?.disconnect();

      if (this.animation) {
        cancelAnimationFrame(this.animation);
        this.animation = null;
      }
      this._parent = null;
    }

    handleResize() {
      if (!this.ctx || !this._initialized) return;

      const rect = this.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const width = Math.floor(rect.width);
      const height = Math.floor(rect.height);

      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = width * dpr;
      this.canvas.height = height * dpr;
      this.canvas.style.width = `${width}px`;
      this.canvas.style.height = `${height}px`;

      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.scale(dpr, dpr);

      this.createPixels();
    }

    getDistanceToCenter(x, y) {
      const rect = this.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    createPixels() {
      if (!this.ctx) return;
      this.pixels = [];

      const rect = this.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      const maxDistance = Math.sqrt(Math.pow(width / 2, 2) + Math.pow(height / 2, 2));

      for (let x = 0; x < width; x += this.gap) {
        for (let y = 0; y < height; y += this.gap) {
          const color = this.colors[Math.floor(Math.random() * this.colors.length)];
          let delay = 0;
          const distance = this.getDistanceToCenter(x, y);
          const distanceRatio = distance / maxDistance;

          if (!this.reducedMotion && this.variant === 'icon') {
            delay = distanceRatio * 200;
          }

          this.pixels.push(new Pixel(this.canvas, this.ctx, x, y, color, this.speed, delay, distanceRatio, this.pixelSize));
        }
      }
    }

    handleAnimation(name) {
      if (this.animation) cancelAnimationFrame(this.animation);

      const animate = () => {
        this.animation = requestAnimationFrame(animate);

        const timeNow = performance.now();
        const timePassed = timeNow - this.timePrevious;
        if (timePassed < this.timeInterval) return;
        this.timePrevious = timeNow - (timePassed % this.timeInterval);

        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.save();
        this.ctx.globalAlpha = this.opacity;
        if (this.blend === 'additive') this.ctx.globalCompositeOperation = 'overlay';

        let allIdle = true;
        for (const pixel of this.pixels) {
          pixel[name]();
          if (!pixel.isIdle) allIdle = false;
        }
        this.ctx.restore();

        if (allIdle) {
          cancelAnimationFrame(this.animation);
          this.animation = null;
        }
      };

      animate();
    }
  }

  // Register web component
  if (!customElements.get('pixel-canvas')) {
    customElements.define('pixel-canvas', PixelCanvasElement);
  }

  // -----------------------------
  // Boot
  // -----------------------------

  document.addEventListener('DOMContentLoaded', () => {
    // Carousels
    setupVideoEndListeners('3rd');
    setupVideoEndListeners('rts');
    // Only start autoplay if the carousel exists on this page.
    if (document.getElementById('carousel-3rd')) {
      startAutoPlay('3rd'); // matches current initial state: 3rd person tab is active
    }

    // Ensure playsinline + muted for all videos, and avoid eager full preload
    document.querySelectorAll('video').forEach((video) => {
      video.setAttribute('playsinline', '');
      video.setAttribute('webkit-playsinline', '');
      video.setAttribute('muted', '');
      // Keep autoplay behavior (existing site expects this), but reduce network:
      if (!video.hasAttribute('preload')) video.setAttribute('preload', 'metadata');
      video.setAttribute('autoplay', '');
    });

    // Intersection observer to play videos when in view
    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target;
          if (entry.isIntersecting && video.paused) safePlay(video);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.carousel-video').forEach((video) => videoObserver.observe(video));

    // Timestamps
    updateTimestamp();
    setInterval(updateTimestamp, 1000);

    // Scroll reveal observer
    const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('active');
        if (entry.target.classList.contains('stat-card')) {
          const value = entry.target.querySelector('.stat-value');
          if (value && !value.classList.contains('animated')) {
            value.classList.add('animated');
            animateValue(value);
          }
        }
      });
    }, observerOptions);
    document
      .querySelectorAll('.section-header, .stat-item, .stat-card, .feature-card, .news-card, .ship-showcase')
      .forEach((el) => {
        el.classList.add('scroll-reveal');
        revealObserver.observe(el);
      });

    // UI behaviors
    setupSmoothAnchors();
    setupNavScroll();
    setupTilt();
    setupHeroTyping();
    initStickyFooterBar();
    initMouseSpotlight();

    // Restore gated state
    if (localStorage.getItem('contentUnlocked') === 'true') {
      unlockContent();
      terminalBoxClicks = 1;
    }

    // Hero video autoplay robustness (mobile)
    const heroVideo = document.querySelector('.video-background');
    if (heroVideo) {
      const playVideo = () => heroVideo.play().catch(() => {});
      if (heroVideo.readyState >= 3) playVideo();
      else heroVideo.addEventListener('loadeddata', playVideo, { once: true });
      heroVideo.addEventListener('ended', () => {
        heroVideo.currentTime = 0;
        playVideo();
      });
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && heroVideo.paused) playVideo();
      });
    }
  });

  // Loading bar + fade-in (kept as load handlers)
  window.addEventListener('load', () => {
    setTimeout(() => document.querySelector('.loading-bar')?.classList.add('active'), 100);
    setTimeout(() => document.querySelector('.loading-bar')?.classList.remove('active'), 2600);

    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 1s ease';
      document.body.style.opacity = '1';
    }, 100);
  });

  // Mouse parallax input
  document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  updateParallax();

  // Keyboard escape behavior (kept)
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.active').forEach((el) => {
      if (!el.classList.contains('game-content')) el.classList.remove('active');
    });
  });
})();


