$(function () {
  populateDrawPile();
  populateTableauPiles();

  $('.foundation-pile').add('.tableau-pile').droppable({
    drop: handleDrop
  });
  $('#draw-pile').click(handleClick);
});

$.fn.isInDrawPile = function () {
  return $(this).parents('#draw-pile').length > 0;
};

$.fn.isInTableauPile = function () {
  return $(this).parents('.tableau-pile').length > 0;
};

$.fn.isInFoundationPile = function () {
  return $(this).parents('.foundation-pile').length > 0;
};

$.fn.isInDiscardPile = function () {
  return $(this).parents('#discard-pile').length > 0;
};

$.fn.isTop = function () {
  return $(this).children('.card').length == 0;
};

$.fn.isFlippedDown = function () {
  return $(this).children('img').attr('src') == 'cards/b.gif';
};

$.fn.flipUp = function () {
  $(this).children('img').attr('src', $(this).data('src'));
  return $(this);
};

$.fn.flipDown = function () {
  $(this).children().attr('src', 'cards/b.gif');
  return $(this);
};

$.fn.hasCards = function () {
  return $(this).children('.card').length > 0;
};

function handleClick(event) {
  event.stopPropagation();
  if ($(this).is('.card')) {
    if ($(this).isInDrawPile()) {
      if ($(this).isTop()) {
        putCardOnDiscardPile($(this));
      }
    } else if ($(this).isInTableauPile()) {
      if ($(this).isFlippedDown() && $(this).isTop()) {
        $(this).flipUp();
      }
    }
  } else if ($(this).is('#draw-pile')) {
    while ($('#discard-pile').hasCards()) {
      var card = $('#discard-pile .card:last').detach();
      card.children().attr('src', 'cards/b.gif');
      putCardOnDrawPile(card);
    }
  }
}

function handleDrop(event, ui) {
  ui.draggable.css('left', '0px');
  ui.draggable.css('top', '0px');

  if ($(this).is('.card')) {
    if ($(this).isInTableauPile()) {
      if (!$(this).isFlippedDown() &&
        ($(this).data('rank') == ui.draggable.data('rank') + 1) &&
        ($(this).data('color') != ui.draggable.data('color'))) {
        ui.draggable.css('top', '16px');
        ui.draggable.detach().appendTo($(this));
      }
    } else if ($(this).isInFoundationPile()) {
      if (($(this).data('rank') == ui.draggable.data('rank') - 1) &&
        ($(this).data('suit') == ui.draggable.data('suit'))) {
        var cardsCount = $(this).parents().length;
        if (cardsCount == 5 || cardsCount == 9 || cardsCount == 13) {
          ui.draggable.css('left', '2px');
          ui.draggable.css('top', '1px');
        }
        ui.draggable.detach().appendTo($(this));
        checkGameOver();
      }
    }
  } else if ($(this).is('.foundation-pile')) {
    if (ui.draggable.data('rank') == 1) {
      ui.draggable.detach().appendTo($(this));
    }
  } else if ($(this).is('.tableau-pile')) {
    if (ui.draggable.data('rank') == 13) {
      ui.draggable.detach().appendTo($(this));
    }
  }
}

function checkGameOver() {
  if ($('.foundation-pile .card').length == 52) {
    alert('Game Over!');
  }
}

function appendTarget(pile) {
  var element = $(pile + ' .card:last');
  if (!element.length) {
    element = $(pile);
  }
  return element;
}

function putCardOnDrawPile(card) {
  appendTarget('#draw-pile').append(card);

  var cardsCount = $('#draw-pile .card').length;
  var left = 0;
  var top = 0;

  if (cardsCount == 11 || cardsCount == 21) {
    left = 2;
    top = 1;
  }

  card.css('left', left + 'px');
  card.css('top', top + 'px');
}

function putCardOnDiscardPile(card) {
  appendTarget('#discard-pile').append(card.flipUp());

  var cardsCount = $('#discard-pile .card').length;
  var left = 0;
  var top = 0;

  if (cardsCount == 11 || cardsCount == 21) {
    left = 2;
    top = 1;
  }

  card.css('left', left + 'px');
  card.css('top', top + 'px');
}

function removeCardFromDrawPile() {
  var card = $('#draw-pile .card:last');
  card.detach();
  return card;
}

function filenameRank(rank) {
  switch (rank) {
    case 1:
      return 'a';
    case 10:
      return 't';
    case 11:
      return 'j';
    case 12:
      return 'q';
    case 13:
      return 'k';
    default:
      return rank;
  }
}

function suitColor(suit) {
  if (suit == 'h' || suit == 'd') {
    return 'red';
  }
  return 'black';
}

function createCard(rank, suit, faceUp) {
  faceUp = faceUp || false;
  var face = 'cards/' + filenameRank(rank) + suit + '.gif';
  var back = 'cards/b.gif';
  var card = $('<div class="card"><img src="' + (faceUp ? face : back) + '" alt="" /></div>');
  card.data('src', face);
  card.data('rank', rank);
  card.data('suit', suit);
  card.data('color', suitColor(suit));
  card.click(handleClick);
  card.draggable({
    start: function (event, ui) {
      if ($(this).isFlippedDown() || (($(this).isInDiscardPile() || $(this).isInFoundationPile()) && !$(this).isTop())) {
        event.preventDefault();
        return;
      }
      $(this).data('oldPositioning', {
        left: $(this).css('left'),
        top: $(this).css('top'),
        zIndex: $(this).css('z-index')
      })
      $(this).css('z-index', 10);
    },
    stop: function (event, ui) {
      var oldPositioning = $(this).data('oldPositioning');
      $(this).css('left', oldPositioning.left);
      $(this).css('top', oldPositioning.top);
      $(this).css('z-index', oldPositioning.zIndex);
    }
  });
  card.droppable({
    greedy: true,
    drop: handleDrop
  });
  return card;
}

// Returns a random integer between min and max
// Using Math.round() will give you a non-uniform distribution!
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createDeck(shuffle) {
  shuffle = shuffle || false;

  var deck = [];
  var ranks = [1, 2, 3, 4 ,5 ,6, 7, 8, 9, 10, 11, 12, 13];
  var suits = ['h', 's', 'd', 'c'];

  for (var rank in ranks) {
    for (var suit in suits) {
      deck.push(createCard(ranks[rank], suits[suit]));
    }
  }

  if (shuffle) {
    var movesCount = 500;

    for (var i = 0; i < movesCount; i++) {
      var card1 = getRandomInt(0, deck.length - 1);
      var card2 = getRandomInt(0, deck.length - 1);

      if (card1 != card2) {
        var temp = deck[card1];
        deck[card1] = deck[card2];
        deck[card2] = temp;
      }
    }
  }

  return deck;
}

function populateDrawPile() {
  var deck = createDeck(true);

  for (var i = 0; i < deck.length; i++) {
    putCardOnDrawPile(deck[i]);
  }
}

function putCardOnTableauPile(index, card) {
  if ($('#tableau-pile-' + index + ' .card').length) {
    card.css('left', '0px');
    card.css('top', '3px');
  }
  appendTarget('#tableau-pile-' + index).append(card);
}

function populateTableauPile(index) {
  for (var i = 0; i < index; i++) {
    putCardOnTableauPile(index, removeCardFromDrawPile());
  }
  $('#tableau-pile-' + index + ' .card:last').flipUp();
}

function populateTableauPiles() {
  for (var i = 1; i <= 7; i++) {
    populateTableauPile(i);
  }
}