import React from 'react'
import '@testing-library/jest-dom/extend-expect'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Blog from './Blog'
import BlogForm from './BlogForm'

describe('<Blog />', () => {
  const blog = {
    title: 'Norwegian Wood',
    author: 'Haruki Murakami',
    url: 'https://www.goodreads.com/en/book/show/11297',
    likes: 0,
    user: {
      username: 'alfakyn',
      name: 'Quan Dang',
    },
  }

  let component
  let container
  const updateLikes = jest.fn()

  beforeEach(() => {
    component = render(
      <Blog blog={blog} updateLikes={updateLikes} />
    )
    container = component.container
  })

  test('renders title and author, but not URL or number of likes by default', () => {
    expect(container.querySelector('.title')).toHaveTextContent(
      blog.title
    )
    expect(container.querySelector('.author')).toHaveTextContent(
      blog.author
    )
    expect(component.queryByText(blog.url)).toBeNull()
    expect(component.queryByText('like')).toBeNull()
  })

  test('renders URL and number of likes when view button is clicked', async () => {
    const user = userEvent.setup()
    const button = screen.getByText('view')
    await user.click(button)

    const blogDetails = component.container.querySelector('.details')
    expect(blogDetails).toBeDefined()
  })

  test(`if the like button is clicked twice, the event handler 
  the component received as props is called twice`, async () => {
    const user = userEvent.setup()
    const viewButton = component.getByText('view')
    await user.click(viewButton)

    const likeButton = component.getByText('like')
    await user.click(likeButton)
    await user.click(likeButton)

    expect(updateLikes.mock.calls).toHaveLength(2)
  })

  test(`new blog form calls the event handler it received 
  as props with the right details when a new blog is created`, async () => {
    const createBlog = jest.fn()
    const { container } = render(<BlogForm createBlog={createBlog} />)

    const title_input = container.querySelector('#title-input')
    const author_input = container.querySelector('#author-input')
    const url_input = container.querySelector('#url-input')

    const user = userEvent.setup()
    await user.type(title_input, 'Moving to Man Utd')
    await user.type(author_input, 'Mason Mount')
    await user.type(url_input, 'masonmount.com/movingtomanutd')

    const createButton = screen.getByText('create')
    await user.click(createButton)

    expect(createBlog.mock.calls).toHaveLength(1)
    expect(createBlog.mock.calls[0][0].title).toBe('Moving to Man Utd')
    expect(createBlog.mock.calls[0][0].author).toBe('Mason Mount')
    expect(createBlog.mock.calls[0][0].url).toBe('masonmount.com/movingtomanutd')
  })

})
