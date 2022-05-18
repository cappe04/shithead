let suits = ["♣", "♦", "♥", "♠"];
let ranks = [
  "Ace",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "Jack",
  "Queen",
  "King",
];
let rankValues = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10];

class Card {
  constructor(suit, rank, value) {
    this.rank = rank;
    this.suit = suit;
    this.value = value;
    this.rankValue = rankValues[ranks.indexOf(rank)];
  }

  getRankValue() {
    return Math.ceil(this.value / 4) + 1;
  }
}

class Stack {
  constructor(stackAmount) {
    this.stack = [];
    this.stackAmount = stackAmount;

    for (let i = 0; i < this.stackAmount; i++) {
      let count = 1;
      for (let rank in ranks) {
        for (let suit in suits) {
          this.stack.push(new Card(suits[suit], ranks[rank], count));
          count++;
        }
      }
    }
  }

  push(val) {
    this.stack.push(val);
  }

  pop() {
    this.stack.pop();
  }

  draw() {
    const drawnCard = this.stack.pop();
    return drawnCard;
  }

  shuffle() {
    for (let i = 0; i < this.stack.length; i++) {
      let loc1 = Math.floor(Math.random() * this.stack.length);
      let loc2 = Math.floor(Math.random() * this.stack.length);
      let temp = this.stack[loc1];
      this.stack[loc1] = this.stack[loc2];
      this.stack[loc2] = temp;
    }
    return this.stack;
  }

  sort() {
    function arraySorter(array) {
      for (let j = 0; j < array.length - 1; j++) {
        for (let i = 0; i < array.length - 1; i++) {
          if (array[i].value >= array[i + 1].value) {
            let temp = array[i];
            array[i] = array[i + 1];
            array[i + 1] = temp;
          }
        }
      }
    }

    let clubs_stack = [];
    let diamonds_stack = [];
    let hearts_stack = [];
    let spades_stack = [];
    let suit_stacks = [clubs_stack, diamonds_stack, hearts_stack, spades_stack];

    for (let key in this.stack) {
      if (this.stack[key].suit == "♠") {
        spades_stack.push(this.stack[key]);
      } else if (this.stack[key].suit == "♥") {
        hearts_stack.push(this.stack[key]);
      } else if (this.stack[key].suit == "♦") {
        diamonds_stack.push(this.stack[key]);
      } else if (this.stack[key].suit == "♣") {
        clubs_stack.push(this.stack[key]);
      }
    }

    for (let key in suit_stacks) {
      arraySorter(suit_stacks[key]);
    }
    this.stack = clubs_stack.concat(diamonds_stack, hearts_stack, spades_stack);
  }
}