import { MinHeap, getDaysTilNextTime } from './heap'

describe('MinHeap', () => {
  it('fromArray sorts empty array', () => {
    const h = new MinHeap()

    const items: Array<Item> = []

    const r = h.fromArray(items)
    expect(r).toMatchSnapshot()
  })

  it('fromArray sorts array with one item', () => {
    const h = new MinHeap()

    const items: Array<Item> = [
      {
        id: 'component',
        score_days: 5.0,
        score_random: 1
      }
    ]

    const r = h.fromArray(items)
    expect(r).toMatchSnapshot()
  })

  it('fromArray sorts items with multiple items have unique days properly', () => {
    const h = new MinHeap()

    const items: Array<Item> = [
      {
        id: 'component',
        score_days: 5.0,
        score_random: 1
      },
      {
        id: 'infrastructure',
        score_days: 4.0,
        score_random: 2
      },
      {
        id: 'hook',
        score_days: 3.0,
        score_random: 2
      },
      {
        id: 'walnut',
        score_days: 2.0,
        score_random: 2
      },
      {
        id: 'wonder',
        score_days: 1.0,
        score_random: 2
      }
    ]

    const r = h.fromArray(items)
    expect(r).toMatchSnapshot()
  })

  it('fromArray sorts items with multiple items have same days properly', () => {
    const h = new MinHeap()

    const items: Array<Item> = [
      {
        id: 'component',
        score_days: 2.0,
        score_random: 1
      },
      {
        id: 'infrastructure',
        score_days: 2.0,
        score_random: 3
      },
      {
        id: 'hook',
        score_days: 2.0,
        score_random: 2
      },
      {
        id: 'walnut',
        score_days: 2.0,
        score_random: 4
      },
      {
        id: 'wonder',
        score_days: 1.0,
        score_random: 5
      }
    ]

    const r = h.fromArray(items)
    expect(r).toMatchSnapshot()
  })

  it('fromArray sorts items with multiple items have same days, same random score properly', () => {
    const h = new MinHeap()

    const items: Array<Item> = [
      {
        id: 'component',
        score_days: 2.0,
        score_random: 3
      },
      {
        id: 'infrastructure',
        score_days: 2.0,
        score_random: 3
      },
      {
        id: 'hook',
        score_days: 2.0,
        score_random: 3
      },
      {
        id: 'walnut',
        score_days: 2.0,
        score_random: 3
      },
      {
        id: 'wonder',
        score_days: 1.0,
        score_random: 5
      }
    ]

    const r = h.fromArray(items)
    expect(r).toMatchSnapshot()
  })

  it('push then pop works correctly', () => {
    const h = new MinHeap()
    h.push({
      id: 'wonder',
      score_days: 1.0,
      score_random: 5
    })

    const popped = h.pop()
    expect(popped).toMatchSnapshot()
    expect(h.size()).toBe(0)
  })

  it('many pushes then pop works correctly', () => {
    const h = new MinHeap()
    h.push({
      id: 'wonder',
      score_days: 3.0,
      score_random: 5
    })
    h.push({
      id: 'walnut',
      score_days: 2.0,
      score_random: 3
    })
    h.push({
      id: 'infrastructure',
      score_days: 1.0,
      score_random: 3
    })
    expect(h.getItems()).toMatchSnapshot()

    const popped = h.pop()
    expect(popped).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()
  })

  it('so many pushes with many pop works correctly', () => {
    const h = new MinHeap()
    h.push({
      id: 'wonder',
      score_days: 3.0,
      score_random: 5
    })
    h.push({
      id: 'walnut',
      score_days: 2.0,
      score_random: 3
    })
    h.push({
      id: 'infrastructure',
      score_days: 8.0,
      score_random: 3
    })
    expect(h.getItems()).toMatchSnapshot()

    // pop one
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()

    // add 2 more
    h.push({ id: 'component', score_days: 4, score_random: 3.0 })
    h.push({ id: 'hook', score_days: 1, score_random: 3.0 })
    expect(h.getItems()).toMatchSnapshot()

    // 4 left
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()

    // 3 left
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()

    // 2 items left
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()

    // last element
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()

    // nothing in the heap
    expect(h.pop()).toMatchSnapshot()
    expect(h.getItems()).toMatchSnapshot()
  })
})

describe('getDaysTilNextTime', () => {
  test.each([
    [[], 1],
    [[0], 1],
    [[3], 7.329],
    [[0, 0, 1], 1],
    [[0, 0, 1, 2], 1],
    [[0, 1, 2, 3], 6.323],
    [[0, 1, 2, 3, 3], 7.019],
    [[0, 1, 2, 3, 2], 1],
    [[0, 1, 2, 3, 3, 5], 10.596],
    [[5, 5, 5, 5, 5, 5, 5], 154.95]
  ])(
    'getDaysTilNextTime(%s) returns correct days until next time',
    (input, expected) => {
      const got = getDaysTilNextTime(input)
      expect(got).toEqual(expected)
    }
  )
})
