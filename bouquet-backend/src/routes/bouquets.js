import { Router } from 'express'
import { nanoid } from 'nanoid'
import { Bouquet } from '../models/Bouquet.js'

const router = Router()

function normalizePayload(payload) {
  return {
    title: payload.title?.trim() || 'Untitled Bouquet',
    palette: payload.palette || 'Soft Sunset',
    wrapStyle: payload.wrapStyle || 'Linen Wrap',
    flowers: Array.isArray(payload.flowers) ? payload.flowers : [],
    arrangement: {
      shape: payload.arrangement?.shape || 'Spiral',
      size: payload.arrangement?.size || 'Medium',
      density: Number(payload.arrangement?.density || 70),
      layers: Number(payload.arrangement?.layers || 3)
    },
    note: payload.note || '',
    signature: payload.signature || '',
    selected: Array.isArray(payload.selected) ? payload.selected : [],
    arrangementIndex: Number(payload.arrangementIndex || 0),
    greeneryStyle: Number(payload.greeneryStyle || 0),
    isMono: Boolean(payload.isMono)
  }
}

router.post('/', async (req, res, next) => {
  try {
    const shareId = nanoid(10)
    const data = normalizePayload(req.body || {})
    const bouquet = await Bouquet.create({ shareId, ...data })
    res.status(201).json({ shareId, bouquet })
  } catch (error) {
    next(error)
  }
})

router.get('/:shareId', async (req, res, next) => {
  try {
    const bouquet = await Bouquet.findOne({ shareId: req.params.shareId })
    if (!bouquet) {
      return res.status(404).json({ message: 'Bouquet not found' })
    }
    res.json({ bouquet })
  } catch (error) {
    next(error)
  }
})

router.put('/:shareId', async (req, res, next) => {
  try {
    const data = normalizePayload(req.body || {})
    const bouquet = await Bouquet.findOneAndUpdate(
      { shareId: req.params.shareId },
      data,
      { new: true }
    )
    if (!bouquet) {
      return res.status(404).json({ message: 'Bouquet not found' })
    }
    res.json({ bouquet })
  } catch (error) {
    next(error)
  }
})

export default router
