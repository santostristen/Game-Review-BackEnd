const express = require('express')

const passport = require('passport')

const Review = require('../models/review')

const customErrors = require('../../lib/custom_errors')

const handle404 = customErrors.handle404

const requireOwnership = customErrors.requireOwnership

const requireToken = passport.authenticate('bearer', { session: false })

const router = express.Router()

router.post('/reviews', requireToken, (req, res, next) => {
  req.body.review.owner = req.user.id

  Review.create(req.body.review)
    .then(review => {
      res.status(201).json({ review: review.toObject() })
    })
    .catch(next)
})

router.get('/reviews', requireToken, (req, res, next) => {
  Review.find()
    .then(reviews => {
      return reviews.map(review => review.toObject())
    })
    .then(reviews => res.status(200).json({ reviews: reviews }))
    .catch(next)
})

router.get('/reviews/:id', requireToken, (req, res, next) => {
  Review.findById(req.params.id)
    .then(handle404)
    .then(review => res.status(200).json({ review: review.toObject() }))
    .catch(next)
})

router.patch('/reviews/:id', requireToken, (req, res, next) => {
  delete req.body.review.owner

  Review.findById(req.params.id)
    .then(handle404)
    .then(review => {
      requireOwnership(req, review)
      return review.updateOne(req.body.review)
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

router.delete('/reviews/:id', requireToken, (req, res, next) => {
  Review.findById(req.params.id)
    .then(handle404)
    .then(review => {
      requireOwnership(req, review)
      review.deleteOne()
    })
    .then(() => res.sendStatus(204))
    .catch(next)
})

module.exports = router
