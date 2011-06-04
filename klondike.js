$(function () {
  populateDrawPile();
  populateTableauPiles();

  $('.foundation-pile').droppable({
    drop: function (event, ui) {
      if (ui.draggable.data('rank') == 1) {
        if (flippedDown(ui.draggable.parent())) {
          ui.draggable.parent().click(function () {
            flipUp($(this).unbind());
          });
        }
        ui.draggable.draggable('option', 'revert', false);
        ui.draggable.css('left', '0px');
        ui.draggable.css('top', '0px');
        ui.draggable.detach().appendTo($(this));
      }
    }
  });
});

function appendTarget(pile) {
  var element = $(pile + ' .card:last');
  if (!element.length) {
    element = $(pile);
  }
  return element;
};

function flippedDown(card) {
  return card.children().attr('src') == 'cards/b.gif';
};

function flipUp(card) {
  card.children().attr('src', card.data('src'));
  card.draggable({
    start: function (event, ui) {
      $(this).draggable('option', 'revert', true);
    },
    revertDuration: 0,
    zIndex: 100
  });

  if (card.parents('.tableau-pile').length) {
    card.droppable({
      greedy: true,
      drop: function (event, ui) {
        if ($(this).parents('.tableau-pile').length) {
          if (($(this).data('rank') == ui.draggable.data('rank') + 1) &&
            ($(this).data('color') != ui.draggable.data('color'))) {
            if (flippedDown(ui.draggable.parent())) {
              ui.draggable.parent().click(function () {
                flipUp($(this).unbind());
              });
            }
            ui.draggable.draggable('option', 'revert', false);
            ui.draggable.css('left', '0px');
            ui.draggable.css('top', '16px');
            ui.draggable.detach().appendTo($(this));
          }
        } else {
          if (($(this).data('rank') == ui.draggable.data('rank') - 1) &&
            ($(this).data('suit') == ui.draggable.data('suit'))) {
            if (flippedDown(ui.draggable.parent())) {
              ui.draggable.parent().click(function () {
                flipUp($(this).unbind());
              });
            }
            ui.draggable.draggable('option', 'revert', false);

            var cardsCount = $(this).parents().length;
            var left = 0;
            var top = 0;

            if (cardsCount == 5 || cardsCount == 9 || cardsCount == 13) {
              left = 2;
              top = 1;
            }

            ui.draggable.css('left', left + 'px');
            ui.draggable.css('top', top + 'px');

            ui.draggable.detach().appendTo($(this));
          }
        }
      }
    });
  }

  return card;
};

function handleDrawPileClick(event) {
  event.stopPropagation();
  if ($(this).parent().is($('#draw-pile'))) {
    $(this).parent().click(function () {
      while ($('#discard-pile .card').length) {
        var card = $('#discard-pile .card:last').detach();
        card.draggable('destroy');
        card.children().attr('src', 'cards/b.gif');
        putCardOnDrawPile(card);
      }
    });
  } else {
    $(this).parent().click(handleDrawPileClick);
  }
  $(this).detach().appendTo(appendTarget('#discard-pile')).unbind();
  flipUp($(this));
  $(this).parent().draggable('destroy');
};

function putCardOnDrawPile(card) {
  appendTarget('#draw-pile').append(card);
  card.parent().unbind();
  card.click(handleDrawPileClick);

  var cardsCount = $('#draw-pile .card').length;
  var left = 0;
  var top = 0;

  if (cardsCount == 11 || cardsCount == 21) {
    left = 2;
    top = 1;
  }

  card.css('left', left + 'px');
  card.css('top', top + 'px');
};

function removeCardFromDrawPile() {
  var card = $('#draw-pile .card:last');
  card.unbind();
  card.parent().click(handleDrawPileClick);
  card.detach();
  return card;
};

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
};

function suitColor(suit) {
  if (suit == 'h' || suit == 'd') {
    return 'red';
  }
  return 'black';
};

function createCard(rank, suit, faceUp) {
  faceUp = faceUp || false;
  var face = 'cards/' + filenameRank(rank) + suit + '.gif';
  var back = 'cards/b.gif';
  var card = $('<div class="card"><img src="' + (faceUp ? face : back) + '" alt="" /></div>');
  card.data('src', face);
  card.data('rank', rank);
  card.data('suit', suit);
  card.data('color', suitColor(suit));
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
};

function putCardOnTableauPile(index, card) {
  if ($('#tableau-pile-' + index + ' .card').length) {
    card.css('left', '0px');
    card.css('top', '3px');
  }
  appendTarget('#tableau-pile-' + index).append(card);
};

function populateTableauPile(index) {
  for (var i = 0; i < index; i++) {
    putCardOnTableauPile(index, removeCardFromDrawPile());
  }
  flipUp($('#tableau-pile-' + index + ' .card:last'));
};

function populateTableauPiles() {
  for (var i = 1; i <= 7; i++) {
    populateTableauPile(i);
  }
};