'use strict';

// Content source: 모바일 청첩장 양식.md. Images are optimized local copies.
const wedding = {
  date: { year: 2026, month: 10, day: 18 },
  accounts: [
    { title: '신랑 측', people: [
      { role: '신랑', name: '김도현', bank: '기업은행', number: '974-001667-01-010' },
      { role: '어머니', name: '오정숙', bank: '신한은행', number: '110387219181' },
      { role: '아버지', name: '김택수', bank: 'SC제일은행', number: '614 20 241747' }
    ] },
    { title: '신부 측', people: [
      { role: '신부', name: '김혜지', bank: '농협은행', number: '1108-02-169980' },
      { role: '어머니', name: '김미옥', bank: '농협은행', number: '3028392130031' },
      { role: '아버지', name: '강학석', bank: '농협은행', number: '3017194485871' }
    ] }
  ]
};

{
  const $ = selector => document.querySelector(selector);
  let toastTimer;
  function notify(message) {
    $('.toast').textContent = message;
    $('.toast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('.toast').classList.remove('visible'), 2600);
  }
  async function copy(text, message = '계좌번호가 복사되었어요') {
    try {
      if (navigator.clipboard && window.isSecureContext) await navigator.clipboard.writeText(text);
      else {
        const field = document.createElement('textarea');
        field.value = text;
        field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
        document.body.append(field);
        field.select();
        const copied = document.execCommand('copy');
        field.remove();
        if (!copied) throw new Error('Copy unavailable');
      }
      notify(message);
    } catch { notify('복사하지 못했어요. 내용을 직접 선택해 주세요.'); }
  }
  document.addEventListener('click', event => {
    const button = event.target.closest('[data-copy]');
    if (button) copy(button.dataset.copy, button.dataset.message);
  });
  function onScroll() {
    const pastHero = window.scrollY > $('.hero').offsetHeight - 70;
    $('.invitation-header').classList.toggle('scrolled', pastHero);
    $('.floating-actions').classList.toggle('at-top', !pastHero);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const photos = Array.from({ length: 23 }, (_, index) => {
    const name = `gallery-${String(index + 1).padStart(2, '0')}`;
    return { src: `assets/images/${name}.jpg`, thumb: `assets/images/${name}-small.jpg`, alt: `김도현과 김혜지의 웨딩 사진 ${index + 1}` };
  });
  const featured = [0, 2, 7, 15, 18, 21];
  function photoButton(index, className = '') {
    const button = document.createElement('button');
    button.className = className;
    button.dataset.photo = index;
    button.setAttribute('aria-label', `${photos[index].alt} 크게 보기`);
    const image = document.createElement('img');
    image.src = photos[index].thumb;
    if (className === 'slide') {
      image.srcset = `${photos[index].thumb} 600w, ${photos[index].src} 1351w`;
      image.sizes = '(min-width: 768px) 40vw, 80vw';
    }
    image.alt = photos[index].alt;
    image.loading = 'lazy';
    image.decoding = 'async';
    image.draggable = false;
    button.append(image);
    return button;
  }
  featured.forEach(index => {
    $('.carousel-track').append(photoButton(index, 'slide'));
    $('.photo-grid').append(photoButton(index));
  });
  let slide = 0;
  const total = featured.length;
  for (let index = 0; index < total; index++) {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `${index + 1}번 사진 보기`);
    dot.addEventListener('click', () => setSlide(index));
    $('.dots').append(dot);
  }
  function setSlide(index) {
    slide = (index + total) % total;
    const width = $('.slide').getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle($('.carousel-track')).gap);
    const offset = ($('.carousel').clientWidth - width) / 2;
    $('.carousel-track').style.transform = `translateX(${offset - slide * (width + gap)}px)`;
    $('.slide-count').textContent = `${String(slide + 1).padStart(2, '0')}/${String(total).padStart(2, '0')}`;
    $('.dots').querySelectorAll('button').forEach((dot, i) => dot.setAttribute('aria-current', String(i === slide)));
  }
  window.addEventListener('resize', () => { setSlide(slide); onScroll(); });
  setSlide(0);
  let pointerStart = null;
  let dragged = false;
  $('.carousel-track').addEventListener('pointerdown', event => { pointerStart = event.clientX; dragged = false; });
  window.addEventListener('pointerup', event => {
    if (pointerStart === null) return;
    const distance = event.clientX - pointerStart;
    if (Math.abs(distance) > 40) { dragged = true; setSlide(slide + (distance < 0 ? 1 : -1)); }
    pointerStart = null;
  });
  window.addEventListener('pointercancel', () => { pointerStart = null; });

  const gallery = $('#gallery-dialog');
  const lightbox = $('#lightbox');
  let photo = 0;
  function showPhoto(index) {
    photo = (index + photos.length) % photos.length;
    $('#lightbox-count').textContent = `${String(photo + 1).padStart(2, '0')} / ${photos.length}`;
    $('.lightbox-photo').src = photos[photo].src;
    $('.lightbox-photo').alt = photos[photo].alt;
    if (!lightbox.open) lightbox.showModal();
  }
  photos.forEach((_, index) => $('.full-gallery').append(photoButton(index)));
  document.addEventListener('click', event => {
    const target = event.target.closest('[data-photo]');
    if (target) {
      if (target.closest('.carousel') && dragged) { dragged = false; return; }
      showPhoto(Number(target.dataset.photo));
    }
    if (event.target.closest('[data-open-gallery]')) gallery.showModal();
    if (event.target.closest('[data-close]')) event.target.closest('dialog').close();
  });
  $('.photo-prev').addEventListener('click', () => showPhoto(photo - 1));
  $('.photo-next').addEventListener('click', () => showPhoto(photo + 1));
  document.addEventListener('keydown', event => {
    if (!lightbox.open) return;
    if (event.key === 'ArrowLeft') showPhoto(photo - 1);
    if (event.key === 'ArrowRight') showPhoto(photo + 1);
  });
  let photoStart = null;
  $('.lightbox-photo').addEventListener('touchstart', event => { photoStart = event.changedTouches[0].clientX; }, { passive: true });
  $('.lightbox-photo').addEventListener('touchend', event => {
    const distance = event.changedTouches[0].clientX - photoStart;
    if (Math.abs(distance) > 40) showPhoto(photo + (distance < 0 ? 1 : -1));
    photoStart = null;
  }, { passive: true });

  const { year, month, day } = wedding.date;
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  for (let index = 0; index < firstDay + daysInMonth; index++) {
    const cell = document.createElement('div');
    if (index >= firstDay) {
      const number = index - firstDay + 1;
      const label = document.createElement('span');
      label.textContent = number;
      if (index % 7 === 0) label.classList.add('sunday');
      if (number === day) { label.classList.add('wedding-day'); label.setAttribute('aria-label', `${number}일 결혼식`); }
      cell.append(label);
    } else cell.setAttribute('aria-hidden', 'true');
    $('.calendar-days').append(cell);
  }
  wedding.accounts.forEach(group => {
    const section = document.createElement('div');
    section.className = 'account-group';
    const heading = document.createElement('h3');
    heading.className = 'account-title';
    heading.textContent = group.title;
    section.append(heading);
    group.people.forEach(person => {
      const row = document.createElement('div'); row.className = 'account-row';
      const info = document.createElement('div');
      const name = document.createElement('strong'); name.textContent = `${person.role} ${person.name}`.trim();
      const account = document.createElement('p'); account.textContent = person.number ? `${person.bank} ${person.number}` : '계좌 정보를 입력해 주세요';
      const button = document.createElement('button'); button.textContent = '복사';
      button.setAttribute('aria-label', `${person.name} 계좌번호 복사`);
      if (person.number) button.dataset.copy = person.number;
      else button.disabled = true;
      info.append(name, account); row.append(info, button); section.append(row);
    });
    $('#account-columns').append(section);
  });
}
