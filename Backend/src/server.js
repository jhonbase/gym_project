const express = require('express')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')
const axios = require('axios')
require('dotenv').config()

const app = express()

const prisma = new PrismaClient({});

app.use(cors())
app.use(express.json())

const CSHARP_URL = 'http://localhost:5000'

//         USUARIOS
// ==========================

app.post('/api/users', async (req, res) => {
    try {
        const { nombre, documento, email } = req.body

        const user = await prisma.user.create({
            data: { nombre, documento, email }
        })

        res.json({ success: true, user })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
})

app.get('/api/users', async (req, res) => {
    const users = await prisma.user.findMany({
        include: { fingerprints: true }
    })
    res.json({ success: true, users })
})

//          HUELLAS
// ==========================

app.post('/api/fingerprint/enroll', async (req, res) => {
    try {
        const { userId } = req.body

        let template, quality, source

        try{
            const response = await axios.post(`${CSHARP_URL}/api/capture`, {}, { timeout: 3000 })
            template = response.data.template
            quality = response.data.quality

            source = 'scharp'
            console.log('Huella desde C#')
        } catch (error) {
            template = generateTemplate()
            quality = 90
            source = 'local'
            console.log('Huella simulada localmente')
        }

        const fingerprint = await prismafingerprint.create({
            data: { userId, template }
        })

        res.json({ success: true, fingerprint, quality, source })
    } catch (error) {
        res.status(400).json({ success: false, error: error.message })
    }
})

app.post('/api/fingerprint/login', async (req, res) => {
    try {
        const { userId } = req-body

        const fingerprint = await prisma.fingerprint.findFirst({
            where: { userId },
            include: { user: true }
        })

        if (!fingerprint) {
            return res.json({ access: false, error: 'Sin huella registrada' })
        }

        let mutated
        try {
            const response = await axios.post(`${CSHARP_URL}/api/mutate`, {
                template: fingerprint.template
            }, {timeout: 3000 })
            mutated = response.data.muatedFull
        } catch (error) {
            mutated = mutateTemplate(fingerprint.template)
        }

        const allFingerprints = await prisma.fingerprint.finMany({
            include: { user: true }
        })

        let bestMatch = null
        let bestSimilarity = 0

        for (const stored of allFingerprints) {
            const similarity = calculateSimilariy(mutated, stored.template)
            if (similarity > bestSimilarity) {
                bestSimilarity = similarity
                bestMatch = stored
            }
        }

        if (bestSimilarity >= 90) {
            res.json({
                access: true,
                user: bestMatch.user,
                similarity: bestSimilarity
            })
        } else {
            res.json({
                access: false,
                similarity: bestSimilarity
            })
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message })
    }
})


//       AUXILIARES
// ==========================

function generateTemplate() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let template = ''
    for (let i = 0; i < 64; i++){
        template += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return template
}

function mutateTemplate(template) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let mutated = template.split('')
    const mutations = 3

    for (let i = 0; i < mutations; i++) {
        const pos = Math.floor(Math.random() * mutated.length)
        mutated[pos] = chars.charAt(Math.floor(Math.random() * chars.length))
    }

    return mutated.join('')
}

function calculateSimilariy(t1, t2) {
    if (!t1 || !t2 || t1.length !== t2.length) return 0
    let matches = 0
    for (let i = 0; i < t1.length; i++) {
        if (t1[i] === t2[i]) matches++
    }
    return (matches / t1.length) * 100
}


//         SERVIDOR
// ==========================

app.listen(3000, () => {
    console.log('El backend está corriendo en: http://localhost:3000')
})


