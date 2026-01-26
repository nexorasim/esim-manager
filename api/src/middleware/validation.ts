import { Request, Response, NextFunction } from 'express'
import Joi from 'joi'

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
})

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  name: Joi.string().min(2).max(50).required()
})

const activationCodeSchema = Joi.object({
  activationCode: Joi.string().pattern(/^LPA:/).required()
})

export const validateLogin = (req: Request, res: Response, next: NextFunction) => {
  const { error } = loginSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

export const validateRegister = (req: Request, res: Response, next: NextFunction) => {
  const { error } = registerSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: error.details[0].message })
  }
  next()
}

export const validateActivationCode = (req: Request, res: Response, next: NextFunction) => {
  const { error } = activationCodeSchema.validate(req.body)
  if (error) {
    return res.status(400).json({ error: 'Invalid activation code format' })
  }
  next()
}

export const validateProfile = (req: Request, res: Response, next: NextFunction) => {
  const { iccid } = req.params
  if (!iccid || iccid.length < 15) {
    return res.status(400).json({ error: 'Invalid ICCID' })
  }
  next()
}