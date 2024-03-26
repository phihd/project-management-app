const { listWithManyBlogs } = require('../../../bloglist-backend/tests/blogs_example_input')

describe('Blog app', function () {
  beforeEach(function () {
    cy.request('POST', 'http://localhost:3003/api/testing/reset')
    const user = {
      name: 'Phi Dang',
      username: 'phihd',
      password: 'uzakichandethuong'
    }
    cy.request('POST', 'http://localhost:3003/api/users/', user)
    cy.visit('http://localhost:3000')
  })

  it('login form is shown', function () {
    cy.contains('login').click()
    cy.contains('username')
    cy.contains('password')
  })

  describe('Login', function () {
    it('succeeds with correct credentials', function () {
      cy.contains('login').click()
      cy.get('#username').type('phihd')
      cy.get('#password').type('uzakichandethuong')
      cy.get('#login-button').click()

      cy.contains('Phi Dang logged in')
    })

    it('fails with wrong credentials', function () {
      cy.contains('login').click()
      cy.get('#username').type('phihd')
      cy.get('#password').type('uzakichankodethuong')
      cy.get('#login-button').click()

      cy.contains('wrong username or password')
      cy.get('.error-message').should('have.css', 'color', 'rgb(255, 0, 0)')
    })
  })

  describe('When logged in', function () {
    beforeEach(function () {
      cy.login({
        username: 'phihd',
        password: 'uzakichandethuong'
      })
    })

    it('A blog can be created', function () {
      cy.contains('new blog').click()
      cy.get('#title-input').type('Spy x Family')
      cy.get('#author-input').type('Anya Forger')
      cy.get('#url-input').type('bondforger.com')
      cy.get('#create-form-button').click()
      cy.contains('A new blog Spy x Family by Anya Forger added')
    })

    describe('and a list of all blogs exists', function () {
      beforeEach(function () {
        listWithManyBlogs.forEach(blog =>
          cy.createBlog({
            title: blog.title,
            author: blog.author,
            url: blog.url
          })
        )
      })

      it('user can like one of those', function () {
        cy.contains('React patterns').parent().find('button').click()
        cy.get('#like-button').click()
      })

      describe('with different creators', function () {
        beforeEach(function () {
          const user = {
            name: 'Khoa Nguyen',
            username: 'khoamap',
            password: 'nhidethuong'
          }
          cy.request('POST', 'http://localhost:3003/api/users/', user)
          cy.login({
            username: 'khoamap',
            password: 'nhidethuong'
          })
          cy.createBlog({
            title: 'How to play Akali quadra kills',
            author: 'Proffesor K',
            url: 'proffesork.com/akali'
          })
        })

        it('only the creator can see the delete button of a blog, not anyone else', function () {
          cy.contains('Type wars').parent().find('button').click()
          cy.get('#delete-button').should('not.exist')
          cy.contains('Akali').parent().find('button').click()
          cy.get('#delete-button').should('exist')
        })
      })

      it('they are ordered by the number of likes in descending order', function () {
        // 1 like
        cy.contains('Canonical').parent().find('button').click()
        cy.get('#like-button').click()
        cy.contains('Canonical').parent().find('button').click()
        // 2 likes
        cy.contains('React patterns').parent().find('button').click()
        cy.get('#like-button').click().click()
        cy.contains('React patterns').parent().find('button').click()
        // 3 likes
        cy.contains('TDD').parent().find('button').click()
        cy.get('#like-button').click().click().click()
        cy.contains('TDD').parent().find('button').click()

        cy.get('.blog').eq(0).should('contain', 'TDD')
        cy.get('.blog').eq(1).should('contain', 'React patterns')
        cy.get('.blog').eq(2).should('contain', 'Canonical')
      })
    })
  })
})