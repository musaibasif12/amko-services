const heroSlides = Array.from(document.querySelectorAll('.hero-slide'));
const header = document.querySelector('header');
const menuToggle = document.querySelector('.menu-toggle');
const primaryNavigation = document.getElementById('primary-navigation');
const serviceTriggers = Array.from(document.querySelectorAll('.service-explore'));
const serviceDialog = document.getElementById('serviceDialog');
const serviceDialogTitle = document.getElementById('serviceDialogTitle');
const serviceDialogViews = Array.from(document.querySelectorAll('.service-dialog-view'));
const projectCards = Array.from(document.querySelectorAll('#projects .project-card'));
const projectModal = document.getElementById('projectModal');
const closeProjectModalBtn = document.getElementById('closeProjectModal');
const projectModalCta = document.getElementById('projectModalCta');
const processItems = Array.from(document.querySelectorAll('.process-item'));
const reelCards = Array.from(document.querySelectorAll('.reel-card, .spotlight-media'));
const reelModal = document.getElementById('reelModal');
const closeReelModalBtn = document.getElementById('closeReelModal');
const reelModalPlayer = document.getElementById('reelModalPlayer');
const reelModalPlaceholder = reelModal?.querySelector('.reel-modal-placeholder');
const whatsappFloat = document.querySelector('.whatsapp-float');
const whatsappFloatMessage = whatsappFloat?.querySelector('.whatsapp-float-message');
const backToTopButton = document.querySelector('.back-to-top');
const heroSection = document.querySelector('.hero');
let lastReelTrigger = null;

let heroIndex = 0;
let lastScrollY = window.scrollY;
let activeProjectCard = null;
let lastProjectTrigger = null;
let lastServiceTrigger = null;

function setBackToTopVisibility(isVisible) {
  if (!backToTopButton) return;

  backToTopButton.hidden = !isVisible;
  backToTopButton.setAttribute('aria-hidden', String(!isVisible));
  backToTopButton.tabIndex = isVisible ? 0 : -1;
}

if (backToTopButton && heroSection) {
  const updateBackToTopVisibility = () => {
    setBackToTopVisibility(heroSection.getBoundingClientRect().bottom <= 0);
  };
  window.addEventListener('scroll', updateBackToTopVisibility, { passive: true });
  window.addEventListener('resize', updateBackToTopVisibility);
  updateBackToTopVisibility();

  backToTopButton.addEventListener('click', () => {
    heroSection.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'auto'
        : 'smooth',
      block: 'start',
    });
  });
}

if (whatsappFloat && whatsappFloatMessage) {
  const revealWhatsAppPrompt = () => {
    whatsappFloatMessage.setAttribute('aria-hidden', 'false');
    whatsappFloat.classList.add('is-prompt-visible');
    window.setTimeout(() => {
      whatsappFloatMessage.setAttribute('aria-hidden', 'true');
      whatsappFloat.classList.remove('is-prompt-visible');
      window.setTimeout(revealWhatsAppPrompt, 6000);
    }, 4200);
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    whatsappFloatMessage.setAttribute('aria-hidden', 'false');
    whatsappFloat.classList.add('is-prompt-visible');
  } else {
    window.setTimeout(revealWhatsAppPrompt, 4000);
  }
}

function setPrimaryNavigationOpen(isOpen) {
  if (!menuToggle || !primaryNavigation) return;

  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
  primaryNavigation.classList.toggle('is-open', isOpen);
  header?.classList.toggle('has-open-nav', isOpen);
}

function keepModalFocusInside(event, modal) {
  if (event.key !== 'Tab') return;

  const focusableElements = Array.from(
    modal.querySelectorAll('a[href], button:not(:disabled), [tabindex]:not([tabindex="-1"])')
  ).filter((element) => !element.hidden && element.getClientRects().length);
  if (!focusableElements.length) return;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];
  if (event.shiftKey && document.activeElement === firstElement) {
    event.preventDefault();
    lastElement.focus();
  } else if (!event.shiftKey && document.activeElement === lastElement) {
    event.preventDefault();
    firstElement.focus();
  }
}

menuToggle?.addEventListener('click', () => {
  const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
  setPrimaryNavigationOpen(!isOpen);
});

primaryNavigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    const menuWasOpen = menuToggle?.getAttribute('aria-expanded') === 'true';
    setPrimaryNavigationOpen(false);
    if (menuWasOpen) menuToggle.focus();
  });
});

document.addEventListener('click', (event) => {
  if (header && !header.contains(event.target)) {
    setPrimaryNavigationOpen(false);
  }
});

window.matchMedia('(max-width: 1000px)').addEventListener('change', (event) => {
  if (!event.matches) setPrimaryNavigationOpen(false);
});

function openReelModal(reelCard) {
  if (!reelModal) return;

  lastReelTrigger = reelCard;
  setSpotlightVideosActive(false);
  setReelPreviewsActive(false);
  const title = reelCard.dataset.reelTitle || 'AMKO Reel';
  const copy = reelCard.dataset.reelCopy || '';
  const videoSrc = reelCard.dataset.videoSrc;
  document.getElementById('reelModalTitle').textContent = title;
  document.getElementById('reelModalCopy').textContent = copy;
  reelModal.querySelector('.reel-modal-panel')?.classList.toggle(
    'is-landscape',
    reelCard.classList.contains('spotlight-media')
  );
  if (reelModalPlayer && reelModalPlaceholder) {
    reelModalPlayer.pause();
    reelModalPlayer.loop = false;
    reelModalPlayer.muted = false;
    reelModalPlayer.controls = Boolean(videoSrc);
    reelModalPlayer.hidden = !videoSrc;
    reelModalPlaceholder.hidden = Boolean(videoSrc);
    if (videoSrc) {
      reelModalPlayer.src = videoSrc;
      reelModalPlayer.load();
      reelModalPlayer.play().catch((error) => {
        if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
          console.error('Unable to play featured project video.', error);
        }
      });
    } else {
      reelModalPlayer.removeAttribute('src');
      reelModalPlayer.load();
    }
  }
  reelModal.classList.add('is-open');
  reelModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  window.setTimeout(() => {
    if (reelModal.classList.contains('is-open')) closeReelModalBtn?.focus();
  }, 0);
}

function closeReelModal() {
  if (!reelModal) return;
  reelModal.classList.remove('is-open');
  reelModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  if (reelModalPlayer && reelModalPlaceholder) {
    reelModalPlayer.pause();
    reelModalPlayer.removeAttribute('src');
    reelModalPlayer.load();
    reelModalPlayer.controls = false;
    reelModalPlayer.muted = true;
    reelModalPlayer.hidden = true;
    reelModalPlaceholder.hidden = false;
  }
  setSpotlightVideosActive(true);
  setReelPreviewsActive(true);
  lastReelTrigger?.focus();
}

reelCards.forEach((card) => {
  card.addEventListener('click', () => openReelModal(card));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openReelModal(card);
    }
  });
});

const reelGrid = document.querySelector('.reel-grid');
const reelPageCards = Array.from(reelGrid?.querySelectorAll('.reel-card') || []);
const reelPageButtons = Array.from(document.querySelectorAll('[data-reel-page]'));
const reelPageStatus = document.querySelector('.reel-page-status');
const reelsPerPage = 4;
const reelPageCount = Math.ceil(reelPageCards.length / reelsPerPage);
let currentReelPage = 0;

function showReelPage(pageIndex) {
  if (!reelPageCards.length || !reelPageCount) return;

  const previousReelPage = currentReelPage;
  const direction = pageIndex >= currentReelPage ? 1 : -1;
  currentReelPage = Math.max(0, Math.min(pageIndex, reelPageCount - 1));
  reelPageCards.forEach((card, index) => {
    const isVisible = Math.floor(index / reelsPerPage) === currentReelPage;
    card.hidden = !isVisible;
    card.classList.remove('is-entering');
    card.style.removeProperty('--reel-enter-offset');
    card.style.removeProperty('animation-delay');
    if (
      isVisible &&
      previousReelPage !== currentReelPage &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      card.style.setProperty('--reel-enter-offset', `${direction * 14}px`);
      card.style.animationDelay = `${(index % reelsPerPage) * 45}ms`;
      card.classList.add('is-entering');
      card.addEventListener('animationend', () => {
        card.classList.remove('is-entering');
        card.style.removeProperty('--reel-enter-offset');
        card.style.removeProperty('animation-delay');
      }, { once: true });
    }
  });
  reelPageStatus.textContent = `${currentReelPage + 1} / ${reelPageCount}`;
  reelPageButtons.forEach((button) => {
    button.disabled =
      (button.dataset.reelPage === 'previous' && currentReelPage === 0) ||
      (button.dataset.reelPage === 'next' && currentReelPage === reelPageCount - 1);
    button.classList.toggle('is-suggested', !button.disabled);
  });
}

reelPageButtons.forEach((button) => {
  button.addEventListener('click', () => {
    showReelPage(currentReelPage + (button.dataset.reelPage === 'next' ? 1 : -1));
  });
});

showReelPage(0);

const spotlightVideoObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          video.muted = true;
          if (video.paused) {
            video.play().catch((error) => {
              if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
                console.error('Unable to play completed-home video preview.', error);
              }
            });
          }
        } else if (!video.paused) {
          video.pause();
        }
      });
    }, { threshold: 0.25, rootMargin: '50px' })
  : null;

function setSpotlightVideosActive(isActive) {
  document.querySelectorAll('.spotlight-video').forEach((video) => {
    if (!isActive) {
      video.pause();
      spotlightVideoObserver?.unobserve(video);
      return;
    }

    video.muted = true;
    video.loop = true;
    if (spotlightVideoObserver) {
      spotlightVideoObserver.observe(video);
    } else if (video.paused) {
      video.play().catch((error) => {
        if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
          console.error('Unable to play completed-home video preview.', error);
        }
      });
    }
  });
}

setSpotlightVideosActive(true);

const reelPreviewObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const preview = entry.target;
        if (entry.isIntersecting) {
          if (!preview.src) preview.src = preview.closest('.reel-card').dataset.videoSrc;
          if (preview.paused) {
            preview.play().catch((error) => {
              if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
                console.error('Unable to play featured project preview.', error);
              }
            });
          }
        } else if (!preview.paused) {
          preview.pause();
        }
      });
    }, { threshold: 0.25, rootMargin: '50px' })
  : null;

document.querySelectorAll('[data-reel-preview]').forEach((preview) => {
  if (reelPreviewObserver) {
    reelPreviewObserver.observe(preview);
  } else {
    preview.src = preview.closest('.reel-card').dataset.videoSrc;
    preview.play().catch((error) => {
      if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
        console.error('Unable to play featured project preview.', error);
      }
    });
  }
});

function setReelPreviewsActive(isActive) {
  document.querySelectorAll('[data-reel-preview]').forEach((preview) => {
    if (!isActive) {
      preview.pause();
      reelPreviewObserver?.unobserve(preview);
      return;
    }

    if (reelPreviewObserver) {
      reelPreviewObserver.observe(preview);
    } else if (preview.paused) {
      preview.play().catch((error) => {
        if (!['AbortError', 'NotAllowedError'].includes(error.name)) {
          console.error('Unable to play featured project preview.', error);
        }
      });
    }
  });
}

closeReelModalBtn?.addEventListener('click', closeReelModal);
reelModal?.addEventListener('click', (event) => {
  if (event.target === reelModal) closeReelModal();
});
reelModal?.addEventListener('keydown', (event) => keepModalFocusInside(event, reelModal));

serviceTriggers.forEach((trigger) => {
  trigger.addEventListener('click', () => {
    if (!serviceDialog || !serviceDialogTitle) return;

    const service = trigger.dataset.serviceTarget;
    const serviceCard = trigger.closest('.service-card');
    const serviceName = serviceCard?.querySelector('.service-card-label')?.textContent?.trim();
    const activeView = serviceDialogViews.find((view) => view.dataset.serviceDetail === service);
    if (!serviceName || !activeView) return;

    lastServiceTrigger = trigger;
    serviceDialogTitle.textContent = serviceName;
    serviceDialogViews.forEach((view) => {
      view.hidden = view !== activeView;
    });
    serviceDialog.showModal();
  });
});

document.querySelectorAll('.service-card').forEach((card) => {
  card.addEventListener('click', (event) => {
    if (event.target.closest('.service-explore')) return;
    card.querySelector('.service-explore')?.click();
  });
});

serviceDialog?.addEventListener('click', (event) => {
  if (event.target === serviceDialog) serviceDialog.close();
});

serviceDialog?.addEventListener('close', () => {
  lastServiceTrigger?.focus();
});

serviceDialog?.querySelector('.service-dialog-cta')?.addEventListener('click', () => {
  serviceDialog.close();
});

function showHeroSlide(index) {
  if (!heroSlides.length) return;

  heroIndex = (index + heroSlides.length) % heroSlides.length;
  heroSlides.forEach((slide, i) => {
    slide.classList.toggle('is-active', i === heroIndex);
  });
}

function animateStatNumber(element) {
  if (!element || element.dataset.animated === 'true') return;

  const targetText = element.dataset.target || '0';
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    element.textContent = targetText;
    element.dataset.animated = 'true';
    return;
  }

  const match = targetText.match(/\d+(?:\.\d+)?/);
  if (!match) return;

  const targetValue = Number.parseFloat(match[0]);
  const prefix = targetText.slice(0, targetText.indexOf(match[0]));
  const suffix = targetText.slice(targetText.indexOf(match[0]) + match[0].length);
  const duration = 1200;
  const startTime = performance.now();

  function update(currentTime) {
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentValue = targetValue * eased;
    const displayValue = Number.isInteger(targetValue)
      ? Math.round(currentValue)
      : currentValue.toFixed(1);

    element.textContent = `${prefix}${displayValue}${suffix}`;

    if (progress < 1) {
      requestAnimationFrame(update);
      return;
    }

    element.textContent = targetText;
    element.dataset.animated = 'true';
  }

  requestAnimationFrame(update);
}

const statNumbers = document.querySelectorAll('.stat-cell .num[data-target]');
if (statNumbers.length) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateStatNumber(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.35
  });

  statNumbers.forEach((number) => {
    number.textContent = '0';
    statObserver.observe(number);
  });
}

if (processItems.length) {
  const processObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -30px 0px'
  });

  processItems.forEach((item) => {
    processObserver.observe(item);
  });
}

const projectDetails = {
  'naya-nazimabad-400': {
    title: 'Naya Nazimabad — 400 Sq Yd',
    tag: 'G+1 · Fully Finished Construction',
    location: 'Naya Nazimabad',
    size: '400 sq yd',
    structure: 'G+1',
    duration: '8 months',
    story: 'A 400 sq yd residential build in Naya Nazimabad, delivered as a fully finished turnkey project. AMKO handled everything from grey structure to final finishing, including flooring, electrical, plumbing and interior completion.',
    includes: ['Structural work','Electrical & plumbing','Flooring & tiling','Paint & finishing','Kitchen & bathroom completion'],
    images: ['./3.webp']
  },
  'naya-nazimabad-block-a': {
    title: 'Naya Nazimabad, Block A — 240 Sq Yd',
    tag: 'G+1 · Fully Finished Construction',
    location: 'Naya Nazimabad, Block A',
    size: '240 sq yd',
    structure: 'G+1',
    duration: '7 months',
    story: 'A compact family residence in Naya Nazimabad, Block A built with a practical layout and complete finishing scope. The project included grey structure works, electrical rough-in, plumbing and final internal fit-out.',
    includes: ['Structural work','Electrical rough-in','Plumbing network','Tiling & flooring','Paint & finishing'],
    images: ['./2.webp']
  },
  'meerut-society': {
    title: 'Meerut Society — 240 Sq Yd',
    tag: 'G+1 · Fully Finished Construction',
    location: 'Meerut Society',
    size: '240 sq yd',
    structure: 'G+1',
    duration: '7 months',
    story: 'A complete residential project in Meerut Society developed with durable materials and coordinated finishing. AMKO supervised the structure, services and final home-ready finishes for a more predictable delivery process.',
    includes: ['Structural work','Brickwork & plaster','Electrical & plumbing','Flooring & finishing','Internal fixtures'],
    images: ['./4.webp']
  },
  'naya-nazimabad-160': {
    title: 'Naya Nazimabad — 160 Sq Yd',
    tag: 'G+1 · Fully Finished Construction',
    location: 'Naya Nazimabad',
    size: '160 sq yd',
    structure: 'G+1',
    duration: '6 months',
    story: 'A compact 160 sq yd home in Naya Nazimabad planned around space efficiency and finish quality. The build focused on practical room planning, high-use areas and a clean handover timeline.',
    includes: ['Structural work','Kitchen planning','Electrical & plumbing','Flooring & wall finish','Paint & final handover'],
    images: []
  },
  'naya-nazimabad-120': {
    title: 'Naya Nazimabad — 120 Sq Yd',
    tag: 'G+1 · Fully Finished Construction',
    location: 'Naya Nazimabad',
    size: '120 sq yd',
    structure: 'G+1',
    duration: '6 months',
    story: 'A practical 120 sq yd residential construction focused on efficient planning and durable finishing. The delivery included the structure, service lines and final surfaces ready for the homeowner’s move-in process.',
    includes: ['Structural work','Electrical & plumbing','Flooring & tiling','Paint & finishing','Entry & exterior touch-up'],
    images: []
  },
  'dha-phase-6-300': {
    title: 'DHA Phase 6 — 300 Sq Yd',
    tag: 'G+1 · Complete Construction',
    location: 'DHA Phase 6',
    size: '300 sq yd',
    structure: 'G+1',
    duration: '8 months',
    story: 'A 300 sq yd DHA residence with a practical family layout, coordinated services, and complete finishing works.',
    includes: ['Structural work', 'Electrical & plumbing', 'Flooring & tiling', 'Paint & finishing', 'Exterior completion'],
    images: []
  }
};

const projectImageFiles = [
  '11.jpg',
  '12.jpg',
  '13.jpg',
  '14.jpg',
  '15.jpg',
  '16.jpg',
  '25.jpg',
  '26.jpg',
  '27.jpg',
  '3.jpg',
  'IMG_20211203_094256_417.jpg',
  'IMG_20211211_103650_223.jpg',
  'IMG_20211211_103652_485.jpg',
  'IMG_20211211_103654_207.jpg',
  'IMG_20211211_151649_573.jpg',
  'IMG_20211211_151651_843.jpg',
  'IMG_20211216_130439_828.jpg',
  'IMG_20211224_093209_830-Recovered.jpg',
  'IMG_20211224_093209_830.jpg',
  'IMG_20211229_172214_367.jpg',
  'IMG_20220102_175325_537.jpg',
  'IMG_20220102_175338_210.jpg',
  'IMG_20220109_141832_568.jpg',
  'IMG_20220109_141929_297.jpg',
  'IMG_20220110_170334_509.jpg',
  'IMG_20220123_114451_116.jpg',
  'IMG_20220123_114638_263.jpg',
  'IMG_20220202_155812_513.jpg',
  'IMG_20220306_102117_195.jpg',
  'IMG_20220321_122803_758.jpg',
  'IMG_20221127_120323_635.jpg'
];
const shuffledProjectImages = [...projectImageFiles];
for (let index = shuffledProjectImages.length - 1; index > 0; index -= 1) {
  const randomIndex = Math.floor(Math.random() * (index + 1));
  [shuffledProjectImages[index], shuffledProjectImages[randomIndex]] =
    [shuffledProjectImages[randomIndex], shuffledProjectImages[index]];
}

let nextProjectImageIndex = 0;
Object.values(projectDetails).forEach((project) => {
  const images = project.images[0]?.startsWith('./') && !project.images[0].startsWith('./Project-Images/')
    ? [project.images[0]]
    : [];
  while (images.length < 4 && nextProjectImageIndex < shuffledProjectImages.length) {
    images.push(`./Project-Images/${shuffledProjectImages[nextProjectImageIndex]}`);
    nextProjectImageIndex += 1;
  }
  project.images = images;
});

function buildModalGallery(images) {
  const dots = document.getElementById('modalProjectDots');

  if (!dots) return [];

  dots.innerHTML = images
    .map((_, index) => `<button class="project-modal-dot${index === 0 ? ' is-active' : ''}" type="button" data-slide="${index}" aria-label="Show project image ${index + 1}"></button>`)
    .join('');

  return images;
}

function showProjectImage(imageIndex, images) {
  const modalImage = document.getElementById('modalProjectImage');
  const dots = document.getElementById('modalProjectDots');
  if (!modalImage || !dots || !images.length) return;

  const cleanIndex = (imageIndex + images.length) % images.length;
  modalImage.classList.add('project-modal-photo-fading');

  setTimeout(() => {
    modalImage.src = images[cleanIndex];
    modalImage.alt = `${document.getElementById('modalProjectTitle')?.textContent || 'Project'}, image ${cleanIndex + 1}`;
    modalImage.classList.remove('project-modal-photo-fading');
  }, 280);

  Array.from(dots.children).forEach((dot, i) => {
    dot.classList.toggle('is-active', i === cleanIndex);
  });
}

function openProjectModal(projectCard) {
  if (!projectModal) return;

  lastProjectTrigger = projectCard;
  activeProjectCard?.classList.remove('is-open');
  activeProjectCard?.setAttribute('aria-expanded', 'false');
  activeProjectCard = projectCard;
  activeProjectCard.classList.add('is-open');
  activeProjectCard.setAttribute('aria-expanded', 'true');

  const projectKey = projectCard.dataset.project || 'naya-nazimabad-400';
  const cardData = projectDetails[projectKey] || projectDetails['naya-nazimabad-400'];

  const modalTitle = document.getElementById('modalProjectTitle');
  const modalLocation = document.getElementById('modalProjectLocation');
  const modalSize = document.getElementById('modalProjectSize');
  const modalStructure = document.getElementById('modalProjectStructure');
  const modalDuration = document.getElementById('modalProjectDuration');
  const modalStory = document.getElementById('modalProjectStory');
  const modalIncludes = document.getElementById('modalProjectIncludes');
  const modalImage = document.getElementById('modalProjectImage');

  if (modalTitle) modalTitle.textContent = cardData.title;
  if (modalLocation) modalLocation.textContent = cardData.location;
  if (modalSize) modalSize.textContent = cardData.size;
  if (modalStructure) modalStructure.textContent = cardData.structure;
  if (modalDuration) modalDuration.textContent = cardData.duration;
  if (modalStory) modalStory.textContent = cardData.story;
  if (modalImage) {
    modalImage.src = cardData.images[0];
    modalImage.alt = `${cardData.title}, image 1`;
  }

  if (modalIncludes) {
    modalIncludes.innerHTML = cardData.includes.map((item) => `<li>${item}</li>`).join('');
  }

  let images = buildModalGallery(cardData.images || []);
  let imageIndex = 0;
  const dots = document.getElementById('modalProjectDots');

  if (dots) {
    dots.querySelectorAll('button').forEach((dot) => {
      dot.addEventListener('click', () => {
        imageIndex = Number(dot.dataset.slide);
        showProjectImage(imageIndex, images);
      });
    });
  }

  const modalMedia = document.querySelector('.project-modal-media');
  if (modalMedia) {
    modalMedia.onmouseenter = () => clearInterval(window.projectCarouselTimer);
    modalMedia.onmouseleave = () => {
      clearInterval(window.projectCarouselTimer);
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.projectCarouselTimer = setInterval(() => {
          imageIndex = (imageIndex + 1) % images.length;
          showProjectImage(imageIndex, images);
        }, 3500);
      }
    };
  }

  clearInterval(window.projectCarouselTimer);
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.projectCarouselTimer = setInterval(() => {
      imageIndex = (imageIndex + 1) % images.length;
      showProjectImage(imageIndex, images);
    }, 3500);
  }

  projectModal.classList.add('is-open');
  projectModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  window.setTimeout(() => {
    if (projectModal.classList.contains('is-open')) closeProjectModalBtn?.focus();
  }, 0);
}

function closeProjectModal() {
  if (!projectModal) return;

  clearInterval(window.projectCarouselTimer);
  projectModal.classList.remove('is-open');
  projectModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  activeProjectCard?.classList.remove('is-open');
  activeProjectCard?.setAttribute('aria-expanded', 'false');
  activeProjectCard = null;
  lastProjectTrigger?.focus();
  lastProjectTrigger = null;
}

projectModal?.addEventListener('keydown', (event) => keepModalFocusInside(event, projectModal));

function initializeProjectCarousel(card) {
  const carousel = card.querySelector('.project-media-stack');
  const slides = Array.from(carousel?.querySelectorAll('.mini-media') || []);
  if (!carousel || !slides.length) return;

  const projectName = card.querySelector('.project-body h3')?.textContent.trim() || 'Project';
  const projectImages = projectDetails[card.dataset.project]?.images || [];
  slides.forEach((slide, index) => {
    if (!projectImages[index]) return;
    slide.src = projectImages[index];
    slide.alt = `${projectName}, project image ${index + 1}`;
  });
  let activeIndex = 0;
  let touchStart = null;
  carousel.setAttribute('role', 'region');
  carousel.setAttribute('aria-roledescription', 'carousel');
  carousel.setAttribute('aria-label', `${projectName} project images`);

  const controls = document.createElement('div');
  controls.className = 'project-carousel-controls';
  controls.setAttribute('aria-label', 'Project image controls');

  const dots = document.createElement('div');
  dots.className = 'project-carousel-dots';

  const updateSlide = (nextIndex) => {
    activeIndex = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, index) => {
      const isActive = index === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      slide.alt = `${projectName}, project image ${index + 1}`;
    });
    Array.from(dots.children).forEach((dot, index) => {
      dot.setAttribute('aria-pressed', String(index === activeIndex));
    });
  };

  const createArrow = (direction, label, symbol) => {
    const button = document.createElement('button');
    button.className = 'project-carousel-arrow';
    button.type = 'button';
    button.setAttribute('aria-label', label);
    button.textContent = symbol;
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      updateSlide(activeIndex + direction);
    });
    button.addEventListener('keydown', (event) => event.stopPropagation());
    return button;
  };

  slides.forEach((_, index) => {
    const dot = document.createElement('button');
    dot.className = 'project-carousel-dot';
    dot.type = 'button';
    dot.setAttribute('aria-label', `Show ${projectName} image ${index + 1} of ${slides.length}`);
    dot.addEventListener('click', (event) => {
      event.stopPropagation();
      updateSlide(index);
    });
    dot.addEventListener('keydown', (event) => event.stopPropagation());
    dots.append(dot);
  });

  controls.append(
    createArrow(-1, `Previous ${projectName} image`, '\u2190'),
    dots,
    createArrow(1, `Next ${projectName} image`, '\u2192')
  );
  controls.addEventListener('click', (event) => event.stopPropagation());
  controls.addEventListener('keydown', (event) => event.stopPropagation());
  carousel.append(controls);
  updateSlide(0);

  carousel.addEventListener('pointerdown', (event) => {
    if (event.pointerType !== 'touch' || event.target.closest('button')) return;
    touchStart = { x: event.clientX, y: event.clientY };
  });
  carousel.addEventListener('pointerup', (event) => {
    if (!touchStart || event.target.closest('button')) {
      touchStart = null;
      return;
    }
    const deltaX = event.clientX - touchStart.x;
    const deltaY = event.clientY - touchStart.y;
    if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
      updateSlide(activeIndex + (deltaX < 0 ? 1 : -1));
    }
    touchStart = null;
  });
  carousel.addEventListener('pointercancel', () => {
    touchStart = null;
  });

  card.tabIndex = 0;
  card.setAttribute('role', 'group');
  card.setAttribute('aria-label', `${projectName} project card. Press Enter for details.`);
  card.setAttribute('aria-haspopup', 'dialog');
  card.setAttribute('aria-expanded', 'false');

  card.addEventListener('keydown', (event) => {
    if (event.target !== card) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      updateSlide(activeIndex + (event.key === 'ArrowRight' ? 1 : -1));
      return;
    }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openProjectModal(card);
    }
  });
}

projectCards.forEach((card) => {
  initializeProjectCarousel(card);
  card.addEventListener('click', (event) => {
    if (event.target.closest('.project-carousel-controls')) return;
    openProjectModal(card);
  });
});

if (closeProjectModalBtn) {
  closeProjectModalBtn.addEventListener('click', closeProjectModal);
}

if (projectModalCta) {
  projectModalCta.addEventListener('click', closeProjectModal);
}

if (projectModal) {
  projectModal.addEventListener('click', (event) => {
    if (event.target === projectModal) closeProjectModal();
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setPrimaryNavigationOpen(false);
    menuToggle.focus();
  }
  if (event.key === 'Escape' && reelModal?.classList.contains('is-open')) {
    closeReelModal();
  }
  if (event.key === 'Escape' && projectModal?.classList.contains('is-open')) {
    closeProjectModal();
  }
});

window.addEventListener('scroll', () => {
  if (!header) return;
  if (header.classList.contains('has-open-nav')) return;

  const currentScrollY = window.scrollY;
  const scrollingDown = currentScrollY > lastScrollY;

  if (currentScrollY <= 24) {
    header.classList.remove('is-hidden');
    header.classList.remove('is-light');
  } else if (scrollingDown) {
    header.classList.add('is-hidden');
    header.classList.remove('is-light');
  } else {
    header.classList.remove('is-hidden');
    header.classList.add('is-light');
  }

  lastScrollY = currentScrollY;
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    showHeroSlide(heroIndex + 1);
  }, 5500);
}

function sendContactForm(){
  const nameField = document.getElementById('cName');
  const phoneField = document.getElementById('cPhone');
  const areaField = document.getElementById('cArea');
  const typeField = document.getElementById('cType');
  const fields = [nameField, phoneField, areaField, typeField];
  const invalidField = fields.find((field) => !field.checkValidity());
  if (invalidField) {
    invalidField.reportValidity();
    invalidField.focus();
    return;
  }
  const name = nameField.value.trim();
  const phone = phoneField.value.trim();
  const area = areaField.value.trim();
  const type = typeField.value;
  const msg = `Hi AMKO, my name is ${name}.\nPhone: ${phone}\nArea: ${area}\nProject type: ${type}`;
  window.open('https://wa.me/923222538025?text=' + encodeURIComponent(msg), '_blank');
}

const quoteForm = document.getElementById('quoteForm');
let latestQuote = null;
const quoteRateByScope = { grey: 2500, turnkey: 4500 };
const quoteScopeLabels = {
  grey: 'Grey structure construction',
  turnkey: 'Complete / turnkey construction'
};

document.getElementById('quoteSize')?.addEventListener('input', (event) => {
  event.currentTarget.setCustomValidity('');
});

quoteForm?.querySelectorAll('input[name="scope"]').forEach((input) => {
  input.addEventListener('change', () => {
    quoteForm.querySelectorAll('.quote-choice').forEach((choice) => {
      choice.classList.toggle('is-selected', choice.contains(input) && input.checked);
    });
  });
});

function quoteText(value, maxLength = 220) {
  return String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength);
}

function formatPKR(value) {
  return `PKR ${new Intl.NumberFormat('en-PK', { maximumFractionDigits: 0 }).format(value)}`;
}

function makeQuotePdf(quote) {
  const commands = [];
  const addText = (text, x, y, size, font = 'F1', color = '0.16 0.18 0.20') => {
    const safe = quoteText(text, 150).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    commands.push(`BT /${font} ${size} Tf ${color} rg 1 0 0 1 ${x} ${y} Tm (${safe}) Tj ET`);
  };
  const addLine = (x1, y1, x2, y2, color = '0.83 0.81 0.76', width = 0.7) => {
    commands.push(`${color} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`);
  };
  const addRect = (x, y, width, height, color) => {
    commands.push(`${color} rg ${x} ${y} ${width} ${height} re f`);
  };
  const money = formatPKR(quote.total);
  const today = new Intl.DateTimeFormat('en-PK', { dateStyle: 'long', timeZone: 'Asia/Karachi' }).format(new Date());

  addRect(0, 640, 595, 202, '0.055 0.063 0.071');
  addRect(48, 640, 5, 202, '0.80 0.61 0.22');
  addText('AMKO', 72, 780, 18, 'F2', '0.96 0.76 0.30');
  addText('ENGINEERING SERVICES  /  KARACHI', 72, 759, 9, 'F2', '0.91 0.91 0.88');
  addText('PRELIMINARY PROJECT ESTIMATE', 72, 709, 22, 'F2', '1 1 1');
  addText(`Prepared ${today}`, 72, 686, 10, 'F1', '0.77 0.78 0.76');
  addText(`Reference  AMKO-${String(quote.reference).slice(-8)}`, 72, 668, 9, 'F1', '0.77 0.78 0.76');

  addText('PREPARED FOR', 54, 600, 8, 'F2', '0.45 0.44 0.40');
  addText(quote.name, 54, 579, 15, 'F2');
  addText(`Phone: ${quote.phone}`, 54, 559, 10);
  addText(`Project area: ${quote.area}`, 54, 542, 10);
  addLine(54, 518, 541, 518);

  addText('SCOPE AND BUDGET', 54, 492, 8, 'F2', '0.45 0.44 0.40');
  addText(quoteScopeLabels[quote.scope], 54, 466, 14, 'F2');
  addText(`Covered area  ${new Intl.NumberFormat('en-PK').format(quote.size)} sq. ft.`, 54, 443, 10);
  addText(`Indicative rate  ${formatPKR(quote.rate)} per sq. ft.`, 54, 425, 10);
  addRect(54, 346, 487, 54, '0.96 0.94 0.89');
  addText('PRELIMINARY BUDGET', 72, 379, 8, 'F2', '0.38 0.36 0.31');
  addText(money, 72, 355, 22, 'F2', '0.30 0.23 0.10');

  let y = 314;
  if (quote.notes) {
    addText('PROJECT NOTES', 54, y, 8, 'F2', '0.45 0.44 0.40');
    y -= 20;
    const words = quote.notes.split(' ');
    let row = '';
    words.forEach((word) => {
      const next = row ? `${row} ${word}` : word;
      if (next.length > 86) {
        addText(row, 54, y, 9);
        y -= 15;
        row = word;
      } else row = next;
    });
    if (row) addText(row, 54, y, 9);
    y -= 28;
  }
  addLine(54, y, 541, y);
  addText('IMPORTANT INFORMATION', 54, y - 22, 8, 'F2', '0.45 0.44 0.40');
  addText('This is a budgetary estimate based on the starting per-square-foot rates published by AMKO.', 54, y - 42, 9);
  addText('It is not a fixed-price offer. Final pricing requires approved drawings, site review,', 54, y - 57, 9);
  addText('material specifications, and a written scope agreed with AMKO Engineering Services.', 54, y - 72, 9);
  addText('Contact  +92 322 2538025   |   asif.amko@gmail.com', 54, 54, 9, 'F2', '0.30 0.29 0.26');
  addLine(54, 72, 541, 72);
  addText('AMKO ENGINEERING SERVICES  /  KARACHI', 54, 38, 8, 'F2', '0.45 0.44 0.40');

  const stream = commands.join('\n');
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>',
    `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`
  ];
  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new Blob([pdf], { type: 'application/pdf' });
}

quoteForm?.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!quoteForm.reportValidity()) return;
  const values = new FormData(quoteForm);
  const size = Number(values.get('size'));
  const scope = values.get('scope');
  const rate = quoteRateByScope[scope];
  if (!Number.isFinite(size) || size < 100 || size > 100000) {
    document.getElementById('quoteSize').setCustomValidity('Enter a covered area between 100 and 100,000 square feet.');
    document.getElementById('quoteSize').reportValidity();
    return;
  }
  document.getElementById('quoteSize').setCustomValidity('');
  latestQuote = {
    name: quoteText(values.get('name'), 80),
    phone: quoteText(values.get('phone'), 40),
    area: quoteText(values.get('area'), 100),
    size,
    scope,
    rate,
    total: size * rate,
    notes: quoteText(values.get('notes'), 220),
    reference: Date.now()
  };

  document.getElementById('quoteEmpty').hidden = true;
  document.getElementById('quoteReady').hidden = false;
  document.getElementById('quoteResultLabel').textContent = quoteScopeLabels[scope];
  document.getElementById('quoteAmount').textContent = formatPKR(latestQuote.total);
  document.getElementById('quoteRate').textContent = `Based on ${new Intl.NumberFormat('en-PK').format(size)} sq. ft. × ${formatPKR(rate)} / sq. ft.`;
  const summary = document.getElementById('quoteSummary');
  summary.replaceChildren();
  [latestQuote.name, latestQuote.area, `${new Intl.NumberFormat('en-PK').format(size)} sq. ft. covered area`].forEach((value) => {
    const row = document.createElement('span');
    row.textContent = value;
    summary.append(row);
  });
  const message = `Hi AMKO, I prepared a preliminary estimate. Name: ${latestQuote.name}. Phone: ${latestQuote.phone}. Area: ${latestQuote.area}. Scope: ${quoteScopeLabels[scope]}. Covered area: ${size} sq. ft. Indicative budget: ${formatPKR(latestQuote.total)}. Please help me confirm the project quotation.`;
  document.getElementById('quoteWhatsApp').href = `https://wa.me/923222538025?text=${encodeURIComponent(message)}`;
});

document.getElementById('downloadQuote')?.addEventListener('click', () => {
  if (!latestQuote) return;
  const blobUrl = URL.createObjectURL(makeQuotePdf(latestQuote));
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `AMKO-estimate-${String(latestQuote.reference).slice(-8)}.pdf`;
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
});
