/* French Prononciation — character select */
(function () {
  'use strict';

  const cards = Array.from(document.querySelectorAll('.fighter-card'));

  cards.forEach(function (card) {
    const image = card.querySelector('img');
    const stand = image.getAttribute('data-stand');
    const atk = image.getAttribute('data-atk');
    let selected = false;

    function showAttack() {
      if (!selected) image.src = atk;
    }

    function showStand() {
      if (!selected) image.src = stand;
    }

    card.addEventListener('pointerenter', showAttack);
    card.addEventListener('pointerleave', showStand);
    card.addEventListener('focus', showAttack);
    card.addEventListener('blur', showStand);

    card.addEventListener('click', function (event) {
      event.preventDefault();
      if (selected) return;
      selected = true;

      const hero = card.getAttribute('data-hero') === 'g' ? 'g' : 'b';
      FP.setHero(hero);
      FP.play('nav');
      card.classList.add('selected');
      image.src = atk;

      window.setTimeout(function () {
        window.location.href = 'game.html?hero=' + hero;
      }, 420);
    });
  });
})();
