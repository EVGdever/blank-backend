import {getManager} from "typeorm"
import {Profile} from "../entity/Profile";
import {User} from "../entity/User";

const authMiddleware = require('../middleware/auth.middleware')
const {Router} = require('express')
const bcrypt = require('bcryptjs')

const router = Router()

// /api/profile
router.get('/:id', async(req, res) => {
    const profile = await getManager().findOne(Profile, {
        relations: ['user'],
        where: {user: req.params.id}
    })
    if (profile) {
        return res.status(200).json(profile)
    }
})

// /api/profile/update
router.put('/update', authMiddleware, async (req, res) => {
    const newData = req.body

    const profile = await getManager().findOne(Profile, {where: {user: newData.id}})
    const user = await getManager().findOne(User,{where: {id: newData.id}})

    await getManager().update(User, user, {...user, email: newData.email})

    delete newData.email
    delete newData.id
    newData.full_name = newData.name+' '+newData.surname
    await getManager().update(Profile, profile, newData)

    res.status(200).json(profile)
})

// /api/profile/avatar
router.put('/avatar', authMiddleware, async (req, res) => {
    if (!req.file) {
        res.status(500).json({'message': 'Файл не загружен'})
    }

    const newData = req.body

    const profile = await getManager().findOne(Profile, {where: {user: newData.id}})
    await getManager().update(Profile, profile, {...profile, avatar: req.file.path})

    res.status(200).json({avatar: req.file.path})
})

// /api/profile/password
router.put('/password', authMiddleware, async (req, res) => {
    try {
        const {id, password} = req.body

        const user = await getManager().findOne(User, { where: {id} })
        const hashedPassword = await bcrypt.hash(password, 10)
        await getManager().update(User, user, {...user, password: hashedPassword})

        return res.status(200).json({message: 'Пароль успешно обнавлен'})
    } catch (e) {
        return res.status(500).json({error: 'Ошибка при изменении пароля'});
    }
});

module.exports = router;