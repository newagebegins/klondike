$(function () {
  var appendTarget = function (pile) {
    var element = $(pile + ' .card:last');
    if (!element.length) {
      element = $(pile);
    }
    return element;
  };

  var flippedDown = function (card) {
    return card.children().attr('src') == 'cards/b.gif';
  };

  var flipUp = function (card) {
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
        }
      });
    }

    return card;
  };

  var handleDrawPileClick = function (event) {
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

  var putCardOnDrawPile = function (card) {
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

  var removeCardFromDrawPile = function () {
    var card = $('#draw-pile .card:last');
    card.unbind();
    card.parent().click(handleDrawPileClick);
    card.detach();
    return card;
  };

  var filenameRank = function (rank) {
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

  var suitColor = function (suit) {
    if (suit == 'h' || suit == 'd') {
      return 'red';
    }
    return 'black';
  };

  var createCard = function (rank, suit, faceUp) {
    faceUp = faceUp || false;
    var face = 'cards/' + filenameRank(rank) + suit + '.gif';
    var back = 'cards/b.gif';
    var card = $('<div class="card"><img src="' + (faceUp ? face : back) + '" alt="" /></div>');
    card.data('src', face);
    card.data('rank', rank);
    card.data('color', suitColor(suit));
    return card;
  }

  var populateDrawPile = function () {
    var ranks = [1, 2, 3, 4 ,5 ,6, 7, 8, 9, 10, 11, 12, 13];
    var suits = ['h', 's', 'd', 'c'];

    for (var rank in ranks) {
      for (var suit in suits) {
        putCardOnDrawPile(createCard(ranks[rank], suits[suit]));
      }
    }
  };

  var putCardOnTableauPile = function (index, card) {
    if ($('#tableau-pile-' + index + ' .card').length) {
      card.css('left', '0px');
      card.css('top', '3px');
    }
    appendTarget('#tableau-pile-' + index).append(card);
  };

  var populateTableauPile = function (index) {
    for (var i = 0; i < index; i++) {
      putCardOnTableauPile(index, removeCardFromDrawPile());
    }
    flipUp($('#tableau-pile-' + index + ' .card:last'));
  };

  var populateTableauPiles = function () {
    for (var i = 1; i <= 7; i++) {
      populateTableauPile(i);
    }
  };

  populateDrawPile();
  populateTableauPiles();

//  putCardOnTableauPile(1, createCard(2, 'c'));
//  putCardOnTableauPile(1, createCard(3, 'h'));
//  putCardOnTableauPile(1, createCard(4, 's'));
//  putCardOnTableauPile(1, createCard(5, 'h'));
//  flipUp($('#tableau-pile-1 .card:last'));
//
//  putCardOnTableauPile(2, createCard(6, 's'));
//  flipUp($('#tableau-pile-2 .card:last'));
});