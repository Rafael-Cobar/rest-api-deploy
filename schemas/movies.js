const Z = require('zod')

const movieSchema = Z.object({
  title: Z.string({
    invalid_type_error: 'Movie title must be a string',
    required_error: 'Movie title is require.'
  }),
  year: Z.number().int().min(1900).max(2024),
  director: Z.string(),
  duration: Z.number().int().positive(),
  rate: Z.number().min().max(10).default(5),
  poster: Z.string().url({ message: 'Poster must be a valid URL' }),
  genre: Z.array(
    Z.enum(['Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 'Thriller', 'Sci-Fi', 'Crime']),
    {
      required_error: 'Movie genre is required'
    }
  )
})

function validateMovie (object) {
  return movieSchema.safeParse(object)
}

function validatePartialMovie (object) {
  // partial = el partial hace que todos y cada una de las propiedades de movieSchema son opcionales
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
}
