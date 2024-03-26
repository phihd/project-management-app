const listHelper = require('../utils/list_helper')
const { listWithOneBlog, listWithManyBlogs } = require('../tests/blogs_example_input')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe("total likes", () => {
  test('of empty list is zero', () => {
    const emptyBlogs = []

    const result = listHelper.totalLikes(emptyBlogs)
    expect(result).toBe(0)
  })

  test('when list has only one blog equals the likes of that', () => {
    const result = listHelper.totalLikes(listWithOneBlog)
    expect(result).toBe(5)
  })

  test('of a bigger list is calculated right', () => {
    const result = listHelper.totalLikes(listWithManyBlogs)
    expect(result).toBe(36)
  })
})

describe("favorite blogs", () => {
  test('of empty list is null', () => {
    const emptyBlogs = []

    const result = listHelper.favoriteBlogs(emptyBlogs)
    expect(result).toBe(null)
  })

  test('when list has only one blog equals to that one', () => {
    const result = listHelper.favoriteBlogs(listWithOneBlog)
    expect(result).toEqual({
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('of a bigger list is discovered right', () => {
    const result = listHelper.favoriteBlogs(listWithManyBlogs)
    expect(result).toEqual({
      title: "Canonical string reduction",
      author: "Edsger W. Dijkstra",
      likes: 12,
    })
  })
})

describe("author with most blogs", () => {
  test('of empty list is null', () => {
    const emptyBlogs = []

    const result = listHelper.mostBlogs(emptyBlogs)
    expect(result).toBe(null)
  })

  test('when list has only one blog, equals to that one', () => {
    const result = listHelper.mostBlogs(listWithOneBlog)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      blogs: 1
    })
  })

  test('of a bigger list is discovered right', () => {
    const result = listHelper.mostBlogs(listWithManyBlogs)
    expect(result).toEqual({
      author: "Robert C. Martin",
      blogs: 3,
    })
  })
})

describe("author with most likes", () => {
  test('of empty list is null', () => {
    const emptyBlogs = []

    const result = listHelper.mostLikes(emptyBlogs)
    expect(result).toBe(null)
  })

  test('when list has only one blog, equals to that one', () => {
    const result = listHelper.mostLikes(listWithOneBlog)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 5
    })
  })

  test('of a bigger list is discovered right', () => {
    const result = listHelper.mostLikes(listWithManyBlogs)
    expect(result).toEqual({
      author: "Edsger W. Dijkstra",
      likes: 17
    })
  })
})
