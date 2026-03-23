(function () {
  'use strict';

  // ====================================
  // Elements
  // ====================================

  const filterBtns    = document.querySelectorAll('.filter-btn');
  const allCards      = document.querySelectorAll('.bento-card');
  const projectCards  = document.querySelectorAll('.bento-card[data-category]:not(.card-about)');

  const modalOverlay  = document.getElementById('modal-overlay');
  const modalClose    = document.getElementById('modal-close');
  const modalImage    = document.getElementById('modal-image');
  const modalTag      = document.getElementById('modal-tag');
  const modalTitle    = document.getElementById('modal-title');
  const modalSubtitle = document.getElementById('modal-subtitle');
  const modalContent  = document.getElementById('modal-content');

  const lightbox      = document.getElementById('lightbox');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxImage = document.getElementById('lightbox-image');

  // ====================================
  // Filter
  // ====================================

  const tagClasses = {
    software: 'tag-software',
    builds:   'tag-builds',
    random:   'tag-random',
  };

  const tagLabels = {
    software: 'Software',
    builds:   'Builds',
    random:   'Random',
  };

  function setFilter(filter) {
    // Update button states
    filterBtns.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });

    // Show/hide cards with animation
    projectCards.forEach(card => {
      const matches = filter === 'all' || card.dataset.category === filter;

      if (matches) {
        card.classList.remove('is-hidden', 'is-revealed');
        // Force reflow so animation triggers fresh each time
        void card.offsetWidth;
        card.classList.add('is-revealed');
      } else {
        card.classList.remove('is-revealed');
        card.classList.add('is-hidden');
      }
    });

    // Sync URL without page reload
    const url = new URL(window.location);
    if (filter === 'all') {
      url.searchParams.delete('filter');
    } else {
      url.searchParams.set('filter', filter);
    }
    history.replaceState(null, '', url);
  }

  // Wire up filter buttons
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter));
  });

  // Apply filter from URL on load (e.g. ?filter=software)
  const urlFilter = new URL(window.location).searchParams.get('filter');
  if (urlFilter && ['software', 'builds', 'random'].includes(urlFilter)) {
    setFilter(urlFilter);
  }

  // ====================================
  // Modal
  // ====================================

  let lastFocusedCard = null;

  function openModal(card) {
    const visual   = card.querySelector('.card-visual > img');
    const detail   = card.querySelector('.card-detail');
    const category = card.dataset.category;
    const title    = card.querySelector('.card-title').textContent;
    const subtitle = card.querySelector('.card-subtitle')?.textContent ?? '';

    // Populate modal fields
    modalImage.src = visual ? visual.src : '';
    modalImage.alt = visual ? visual.alt : '';

    const tagClass = tagClasses[category] ?? '';
    modalTag.textContent = tagLabels[category] ?? category;
    modalTag.className = 'modal-tag ' + tagClass;

    modalTitle.textContent    = title;
    modalSubtitle.textContent = subtitle;

    // Clone the hidden detail content into the modal
    modalContent.innerHTML = detail ? detail.innerHTML : '';

    // Attach lightbox to any gallery images inside the modal
    modalContent.querySelectorAll('.detail-gallery img').forEach(img => {
      img.addEventListener('click', () => openLightbox(img.src, img.alt));
    });

    // Initialize embedded games if present
    if (card.dataset.id === 'nqueens') {
      initNQueensGame(modalContent);
    }

    // Show modal
    modalOverlay.removeAttribute('hidden');
    document.body.style.overflow = 'hidden';

    // Remember which card opened the modal (for focus restoration)
    lastFocusedCard = card;

    // Move focus into modal
    modalClose.focus();
  }

  function closeModal() {
    // Stop any playing videos by clearing iframes
    modalContent.querySelectorAll('iframe').forEach(iframe => {
      iframe.src = iframe.src;
    });

    modalOverlay.setAttribute('hidden', '');
    document.body.style.overflow = '';

    // Restore focus to the card that opened the modal
    if (lastFocusedCard) {
      lastFocusedCard.focus();
      lastFocusedCard = null;
    }
  }

  // Open modal on card click or keyboard activation
  projectCards.forEach(card => {
    card.addEventListener('click', () => openModal(card));

    card.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openModal(card);
      }
    });
  });

  // Close via button or clicking the backdrop
  modalClose.addEventListener('click', closeModal);

  modalOverlay.addEventListener('click', e => {
    if (e.target === modalOverlay) closeModal();
  });

  // ====================================
  // Lightbox
  // ====================================

  function openLightbox(src, alt) {
    lightboxImage.src = src;
    lightboxImage.alt = alt ?? '';
    lightbox.removeAttribute('hidden');
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.setAttribute('hidden', '');
    lightboxImage.src = '';
  }

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxImage) closeLightbox();
  });

  // ====================================
  // Keyboard: Escape closes lightbox → modal
  // ====================================

  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;

    if (!lightbox.hasAttribute('hidden')) {
      closeLightbox();
    } else if (!modalOverlay.hasAttribute('hidden')) {
      closeModal();
    }
  });

  // ====================================
  // N Queens Game
  // ====================================

  function initNQueensGame(container) {
    let boardSize = 8;
    let queens = new Set(); // "row,col" strings

    function getEl(id)  { return container.querySelector('#nq-' + id); }
    function getBoard() { return container.querySelector('#nq-board'); }

    function initGame() {
      boardSize = parseInt(getEl('boardSize').value, 10);
      if (boardSize < 4)  boardSize = 4;
      if (boardSize > 12) boardSize = 12;
      queens.clear();
      updateCount();
      createBoard();
      clearMessage();
    }

    function createBoard() {
      const board = getBoard();
      board.innerHTML = '';
      board.style.gridTemplateColumns = `repeat(${boardSize}, 52px)`;
      board.style.gridTemplateRows    = `repeat(${boardSize}, 52px)`;

      for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
          const sq = document.createElement('div');
          sq.className     = `nq-square ${(row + col) % 2 === 0 ? 'nq-light' : 'nq-dark'}`;
          sq.dataset.row   = row;
          sq.dataset.col   = col;
          sq.addEventListener('click', () => toggleQueen(row, col));
          board.appendChild(sq);
        }
      }
      renderQueens();
    }

    function toggleQueen(row, col) {
      const pos = `${row},${col}`;
      if (queens.has(pos)) queens.delete(pos);
      else queens.add(pos);
      renderQueens();
      updateCount();
      clearMessage();
      if (queens.size === boardSize) checkSolution();
    }

    function threatened() {
      const arr = Array.from(queens);
      const set = new Set();
      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (attacks(arr[i], arr[j])) {
            set.add(arr[i]);
            set.add(arr[j]);
          }
        }
      }
      return set;
    }

    function attacks(a, b) {
      const [r1, c1] = a.split(',').map(Number);
      const [r2, c2] = b.split(',').map(Number);
      return r1 === r2 || c1 === c2 || Math.abs(r1 - r2) === Math.abs(c1 - c2);
    }

    function renderQueens() {
      const t = threatened();
      getBoard().querySelectorAll('.nq-square').forEach(sq => {
        const pos = `${sq.dataset.row},${sq.dataset.col}`;
        sq.textContent = queens.has(pos) ? '♛' : '';
        sq.classList.remove('nq-threatened', 'nq-safe');
        if (queens.has(pos) && t.has(pos)) sq.classList.add('nq-threatened');
      });
    }

    function checkSolution() {
      if (queens.size !== boardSize) {
        showMessage(`Need exactly ${boardSize} queens. Currently: ${queens.size}`, 'error');
        return;
      }
      const t = threatened();
      const hasConflict = t.size > 0;

      getBoard().querySelectorAll('.nq-square').forEach(sq => {
        const pos = `${sq.dataset.row},${sq.dataset.col}`;
        if (queens.has(pos)) {
          sq.classList.toggle('nq-threatened', t.has(pos));
          sq.classList.toggle('nq-safe', !t.has(pos));
        }
      });

      showMessage(
        hasConflict
          ? 'Not quite — some queens can attack each other (shown in red).'
          : '🎉 Solved! No queens are attacking each other.',
        hasConflict ? 'error' : 'success'
      );
    }

    function updateCount() {
      getEl('queensCount').textContent  = queens.size;
      getEl('queensNeeded').textContent = boardSize;
    }

    function showMessage(text, type) {
      const el = getEl('message');
      el.textContent = text;
      el.className   = 'nq-message-' + type;
    }

    function clearMessage() {
      const el = getEl('message');
      el.textContent = '';
      el.className   = '';
    }

    function resetBoard() {
      queens.clear();
      updateCount();
      renderQueens();
      clearMessage();
    }

    getEl('newGameBtn').addEventListener('click', initGame);
    getEl('resetBtn').addEventListener('click', resetBoard);
    getEl('checkBtn').addEventListener('click', checkSolution);

    initGame();
  }

  // ====================================
  // Focus trap inside modal (Tab / Shift+Tab)
  // ====================================

  modalOverlay.addEventListener('keydown', e => {
    if (e.key !== 'Tab') return;

    const focusable = [...modalOverlay.querySelectorAll(
      'button, a[href], input, textarea, select, [tabindex]:not([tabindex="-1"])'
    )].filter(el => !el.disabled && el.offsetParent !== null);

    if (focusable.length === 0) return;

    const first = focusable[0];
    const last  = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

})();
