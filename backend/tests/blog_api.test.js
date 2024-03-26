const mongoose = require('mongoose')
const supertest = require('supertest')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Blog = require('../models/blog')
const User = require('../models/user')


let token;

beforeEach(async () => {
  await Blog.deleteMany({})
  await Blog.insertMany(helper.initialBlogs)

  await User.deleteMany({})
  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })
  await user.save()

  const userForToken = {
    username: user.username,
    id: user._id,
  }
  token = jwt.sign(
    userForToken,
    process.env.SECRET,
  )
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('unique identifier is id instead of _id', async () => {
    const response = await api.get("/api/blogs")
    const ids = response.body.map((blog) => blog.id)
    ids.forEach(id => expect(id).toBeDefined())
  })
})

describe("addition of a new blog", () => {

  test('a valid post can be added', async () => {
    const newPost = {
      "title": "Makeup on the day you go on a trip!",
      "author": "Aya Asahina",
      "url": "https://www.youtube.com/watch?v=mKhq3vfv1Os",
      "likes": 211
    }

    await api
      .post('/api/blogs')
      .set("Authorization", `Bearer ${token}`)
      .send(newPost)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    const titles = blogsAtEnd.map(r => r.title)

    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)
    expect(titles).toContain(
      'Makeup on the day you go on a trip!'
    )
  })

  test("likes property will default to 0 if missing", async () => {
    const newPost = {
      "title": "Makeup on the day you go on a trip!",
      "author": "Aya Asahina",
      "url": "https://www.youtube.com/watch?v=mKhq3vfv1Os",
    }

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost)
      .expect(201)
      .expect("Content-Type", /application\/json/)

    const blogsAtEnd = await helper.blogsInDb();
    expect(blogsAtEnd[blogsAtEnd.length - 1].likes).toBe(0)
  })

  test("backend responds with status 400 if title and url are missing", async () => {
    const newPost = {
      likes: 1,
    };

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(newPost)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test("fails with the proper status code 401 Unauthorized if a token is not provided", async () => {
    const blogsAtStart = await helper.blogsInDb()
    const newPost = {
      "title": "Makeup on the day you go on a trip!",
      "author": "Aya Asahina",
      "url": "https://www.youtube.com/watch?v=mKhq3vfv1Os",
    }

    await api
      .post("/api/blogs")
      .send(newPost)
      .expect(401)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toEqual(blogsAtStart)
  })
})

describe('deletion of a blog', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    const blogToDelete = {
      "title": "Makeup on the day you go on a trip!",
      "author": "Aya Asahina",
      "url": "https://www.youtube.com/watch?v=mKhq3vfv1Os",
    }

    await api
      .post("/api/blogs")
      .set("Authorization", `Bearer ${token}`)
      .send(blogToDelete)
      .expect(201)
  })

  test('succeeds with status code 204 if id is valid', async () => {
    const blogsAtStart = await Blog.find({}).populate('user')
    const blogToDelete = blogsAtStart[0]
    console.log('hahaha', blogToDelete)

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(0)
  })
})

describe('update of a blog', () => {
  test('succeeds with status code 200 if id is valid', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send({ likes: 20501 })
      .expect(200)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length
    )

    const updatedBlog = blogsAtEnd[0]
    expect(updatedBlog.likes).toBe(20501)
  })
})



afterAll(async () => {
  await mongoose.connection.close()
})
