import { type Pagination, pagination } from './pagination'

describe('pagination', () => {
  it('should be empty when there are no pages', () => {
    expect(pagination(1, 0, '?a=b&')).toEqual<Pagination>({})
  })

  it('should be empty when there’s only 1 page', () => {
    expect(pagination(1, 1, '?a=b&')).toEqual<Pagination>({})
  })

  it('should work on page 1 of 2', () => {
    expect(pagination(1, 2, '?a=b&')).toEqual<Pagination>({
      next: { text: 'Next', href: '?a=b&page=2' },
      items: [
        { text: '1', href: '?a=b&page=1', selected: true },
        { text: '2', href: '?a=b&page=2' },
      ],
    })
  })

  it('should work on page 2 of 2', () => {
    expect(pagination(2, 2, '?a=b&')).toEqual<Pagination>({
      previous: { text: 'Previous', href: '?a=b&page=1' },
      items: [
        { text: '1', href: '?a=b&page=1' },
        { text: '2', href: '?a=b&page=2', selected: true },
      ],
    })
  })

  it('should work on page 2 of 3', () => {
    expect(pagination(2, 3, '?a=b&')).toEqual<Pagination>({
      previous: { text: 'Previous', href: '?a=b&page=1' },
      next: { text: 'Next', href: '?a=b&page=3' },
      items: [
        { text: '1', href: '?a=b&page=1' },
        { text: '2', href: '?a=b&page=2', selected: true },
        { text: '3', href: '?a=b&page=3' },
      ],
    })
  })

  it('should work on page 1 of 7', () => {
    expect(pagination(1, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1', selected: true },
      { text: '2', href: '?a=b&page=2' },
      { type: 'dots' },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 2 of 7', () => {
    expect(pagination(2, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2', selected: true },
      { text: '3', href: '?a=b&page=3' },
      { type: 'dots' },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 3 of 7', () => {
    expect(pagination(3, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2' },
      { text: '3', href: '?a=b&page=3', selected: true },
      { text: '4', href: '?a=b&page=4' },
      { type: 'dots' },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 4 of 7', () => {
    expect(pagination(4, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2' },
      { text: '3', href: '?a=b&page=3' },
      { text: '4', href: '?a=b&page=4', selected: true },
      { text: '5', href: '?a=b&page=5' },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 5 of 7', () => {
    expect(pagination(5, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2' },
      { type: 'dots' },
      { text: '4', href: '?a=b&page=4' },
      { text: '5', href: '?a=b&page=5', selected: true },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 6 of 7', () => {
    expect(pagination(6, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2' },
      { type: 'dots' },
      { text: '5', href: '?a=b&page=5' },
      { text: '6', href: '?a=b&page=6', selected: true },
      { text: '7', href: '?a=b&page=7' },
    ])
  })

  it('should work on page 7 of 7', () => {
    expect(pagination(7, 7, '?a=b&')).toHaveProperty('items', [
      { text: '1', href: '?a=b&page=1' },
      { text: '2', href: '?a=b&page=2' },
      { type: 'dots' },
      { text: '6', href: '?a=b&page=6' },
      { text: '7', href: '?a=b&page=7', selected: true },
    ])
  })
})
