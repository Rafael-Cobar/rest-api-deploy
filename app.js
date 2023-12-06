const express = require('express') // require -> commonJS
const crypto = require('node:crypto')
const cors = require('cors')
const movies = require('./json/movies.json')
const { validateMovie, validatePartialMovie } = require('./schemas/movies')

const app = express()
const PORT = process.env.PORT ?? 1234

app.disable('x-powered-by') // deshabilitar el header X-Powered-By: Express
app.use(express.json())
// app.use(cors()) // Acepta todas los dominios => *
app.use(cors({
  origin: (origin, callback) => {
    const ACCEPTED_ORIGINS = [
      'http://localhost:8080',
      'http://localhost:8081',
      'https://movies.com'
    ]
    if (ACCEPTED_ORIGINS.includes(origin) || !origin) { return callback(null, true) }

    return callback(new Error('Not Allowed by CORS'))
  }
}))

// ========================================================================================
// ? GETS
app.get('/', (req, res) => {
  res.json({ message: 'hola mundo' })
})

// Todos los recursos que sean movies se identifica con /movies
app.get('/movies', (req, res) => {
  const { genre } = req.query
  if (genre) {
    const filteredMovies = movies.filter(
      movie => movie.genre.some(g => g.toLowerCase() === genre.toLowerCase())
    )
    return res.json(filteredMovies)
  }
  res.json(movies)
})

app.get('/movies/:id', (req, res) => { // path-to-regexp
  const { id } = req.params
  const movie = movies.find((movie) => movie.id === id)
  if (movie) return res.json(movie)
  res.status(404).json({ message: 'Movie not found.' })
})

// ========================================================================================
// ? POSTS
app.post('/movies', (req, res) => {
  const result = validateMovie(req.body)

  if (result.error) return res.status(422).json({ error: JSON.parse(result.error.message) })

  const newMovie = {
    id: crypto.randomUUID(), // uuid V4
    ...result.data
  }

  movies.push(newMovie)
  res.status(201).json(newMovie)
})

// ========================================================================================
// ? PATCH
app.patch('/movies/:id', (req, res) => {
  const result = validatePartialMovie(req.body)
  if (!result.success) return res.status(422).json({ error: JSON.parse(result.error.message) })

  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex < 0) return res.status(404).json({ message: 'Movie not found' })

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data
  }

  movies[movieIndex] = updateMovie

  return res.json(updateMovie)
})

// ========================================================================================
// ? DELETE
app.delete('/movies/:id', (req, res) => {
  const { id } = req.params
  const movieIndex = movies.findIndex(movie => movie.id === id)

  if (movieIndex === -1) return res.status(404).json({ message: 'Movie not found' })

  movies.splice(movieIndex, 1)
  return res.json({ message: 'Movie deleted' })
})

// ========================================================================================
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`)
})
