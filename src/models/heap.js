interface Item {
  id: string;
  scoreDays: float;
  scoreRandom: int;
  history: Array<int>;
}

// Spaced repetition algorithm: SM-2
//
// Returns the number of days until seeing a problem again based on the
// history of answers x to the problem, where the meaning of x is:
// x == 0: Incorrect, Hardest
// x == 1: Incorrect, Hard
// x == 2: Incorrect, Medium
// x == 3: Correct, Medium
// x == 4: Correct, Easy
// x == 5: Correct, Easiest
// Based on https://gist.github.com/doctorpangloss/13ab29abd087dc1927475e560f876797
const getDaysTilNextTime = (
  history: Array<int>,
  a = 6.0,
  b = -0.8,
  c = 0.28,
  d = 0.02,
  assumedScore = 2.5,
  minScore = 1.3,
  theta = 0.2
): int => {
  if (!history.length) {
    return 1
  }

  // If got the last question incorrect, just return 1
  const last = history.length - 1
  if (history[last] < 3) {
    return 1
  }

  // Calculate the latest consecutive answer numConsecutivelyCorrect
  let numConsecutivelyCorrect = 0
  for (let i = last; i >= 0; i--) {
    if (history[i] >= 3) {
      numConsecutivelyCorrect++
    } else {
      break
    }
  }

  // Sum up the history
  const historySum = history.reduce(
    (prev, val) => prev + (b + c * val + d * val * val),
    0
  )

  return (
    Math.round(
      a *
        Math.pow(
          Math.max(minScore, assumedScore + historySum),
          theta * numConsecutivelyCorrect
        ) *
        1000
    ) / 1000
  )
}

const RANDOM_RANGE = 10

class MinHeap {
  items: Array<Item> = []

  pop(): Item {
    if (!this.items.length) {
      return null
    }

    const lastIndex = this.items.length - 1
    this._swap(this.items, 0, lastIndex)
    this._heapify(this.items, 0, lastIndex)

    const last = this.items[lastIndex]
    this.items.splice(lastIndex, 1)
    return last
  }

  push(item: Item) {
    this.items.push(item)

    let index = this.items.length - 1
    let parent

    while (true) {
      parent = this._parent(index)
      if (parent < 0) {
        return
      }

      if (this._less(this.items[parent], this.items[index])) {
        return
      }

      this._swap(this.items, index, parent)
      index = parent
    }
  }

  fromArray(items: Array<Item>): Array<Item> {
    let i = Math.floor(items.length / 2 - 1)

    while (i >= 0) {
      this._heapify(items, i, items.length)
      i -= 1
    }

    this.items = items
    return this.items
  }

  fromRawArray(rawItems: Array<Item>): Array<Item> {
    const items = rawItems.map(i => ({
      ...i,
      scoreDays: getDaysTilNextTime(i.history),
      scoreRandom: this._random()
    }))

    return this.fromArray(items)
  }

  size(): int {
    return this.items.length
  }

  getItems(): Array<Item> {
    return this.items
  }

  _parent(index: int) {
    return Math.floor((index - 1) / 2)
  }

  _heapify(items: Array, i: int, max: int) {
    let index, left, right
    while (i < max) {
      index = i

      left = 2 * i + 1
      right = left + 1

      if (left < max && this._less(items[left], items[index])) {
        index = left
      }

      if (right < max && this._less(items[right], items[index])) {
        index = right
      }

      if (index === i) {
        return
      }

      this._swap(items, i, index)
      i = index
    }

    return items
  }

  _less(a: Item, b: Item) {
    if (a.scoreDays === b.scoreDays) {
      return a.scoreRandom < b.scoreRandom
    }

    return a.scoreDays < b.scoreDays
  }

  _swap(items: Array, a: int, b: int) {
    const t = items[a]
    items[a] = items[b]
    items[b] = t
  }

  _random() {
    return Math.random() * (RANDOM_RANGE - 0) + 0
  }
}

export { MinHeap, getDaysTilNextTime }
