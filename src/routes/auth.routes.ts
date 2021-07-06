import {getManager} from "typeorm"
import {User} from "../entity/User"
import {Profile} from "../entity/Profile";

const {Router} = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const {check, validationResult} = require('express-validator')
const router = Router()
const manager = getManager()
const config = require('config')

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Не коректный email').isEmail(),
        check('password', 'Пороль должен быть больше 6 символов')
            .isLength({min: 6})
    ],
    async (req, res) => {
        try {
            const {email, password} = req.body
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Не коректные данные для регистрации'
                });
            }

            const person = await manager.findOne(User, { where: { email} })
            if (person) {
                return res.status(400).json({ message: 'Такой пользователь уже существует' })
            }

            const hashedPassword = await bcrypt.hash(password, 10)

            const profile = new Profile()
            const user = new User()
            user.email = email
            user.password = hashedPassword
            user.role = 0
            await manager.save(user)
            const userDB = await manager.findOne(User, { where: { email} })

            profile.name = ''
            profile.surname = ''
            profile.full_name = ''
            profile.phone = ''
            profile.avatar = 'images/default-avatar.png'
            profile.birthday = new Date().getTime().toString()
            profile.user = userDB

            await manager.save(profile)

            return res.status(201).json({ message: 'пользователь создан' })
        } catch (e) {
            console.log(e)
            return res.status(500).json({ message: 'ошибка при попытке регистрации' })
        }
    });

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Введите корректный email').normalizeEmail().isEmail(),
        check('password', 'Введите пароль').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req)

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Неккоректные данные при входе в систему'
                })
            }

            const {email, password} = req.body
            const user = await manager.findOne(User, { where: { email} })
            if (!user) {
                return res.status(400).json({ message: 'Пользователь не найден' });
                
            }

            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Пароль не верный' });
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1d'}
            );

            return res.status(200).json({token, userId: user.id});

        } catch (e) {
            return res.status(500).json({ message: 'ошибка при попытке авторизации' });
        }
    });

module.exports = router;
