const lodash = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.length === 0
    ? 0
    : blogs.reduce(
      (total, blog) =>
        total + blog.likes, 0
    )
}

const favoriteBlogs = (blogs) => {
  if (blogs.length === 0)
    return null

  const mostLikedBlog = blogs.reduce(
    (mostLiked, blog) =>
      mostLiked.likes > blog.likes ? mostLiked : blog
  )

  return {
    title: mostLikedBlog.title,
    author: mostLikedBlog.author,
    likes: mostLikedBlog.likes,
  }
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0)
    return null

  const blogCountsByAuthor = lodash.countBy(blogs, "author")
  const authorWithMostBlogs = Object.keys(blogCountsByAuthor).reduce(
    (a, b) =>
      blogCountsByAuthor[a] > blogCountsByAuthor[b] ? a : b
  )

  return {
    author: authorWithMostBlogs,
    blogs: blogCountsByAuthor[authorWithMostBlogs]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0)
    return null

  const authorWithMostLikes = (
    // .chain and .value is to chain many operators
    lodash.chain(blogs)
      .groupBy('author')
      .map(
        (blogs, author) => ({
          author, likes: lodash.sumBy(blogs, 'likes')
        }))
      .maxBy('likes')
      .value()
  )
  return authorWithMostLikes
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlogs,
  mostBlogs,
  mostLikes
}